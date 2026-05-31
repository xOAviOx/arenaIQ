import { Server, Socket } from 'socket.io';
import {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
  RoomLobbyPlayer,
} from '@arenaiq/types';
import { prisma } from '@arenaiq/db';
import {
  createPrivateRoom,
  getPrivateRoom,
  joinPrivateRoom,
  removePrivateRoom,
  PrivateRoom,
} from '../services/privateRoom.service';
import { launchMatch } from '../services/battle.service';
import { getRatingTier } from '../lib/tier';

type IoType = Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
type SocketType = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

const roomChannel = (code: string): string => `lobby:${code}`;

/** Broadcast the current lobby state to everyone sitting in it. */
function emitRoomUpdate(io: IoType, room: PrivateRoom): void {
  const players: RoomLobbyPlayer[] = [
    {
      userId: room.host.userId,
      username: room.host.username,
      rating: room.host.rating,
      tier: getRatingTier(room.host.rating),
      isHost: true,
    },
  ];
  if (room.guest) {
    players.push({
      userId: room.guest.userId,
      username: room.guest.username,
      rating: room.guest.rating,
      tier: getRatingTier(room.guest.rating),
      isHost: false,
    });
  }

  io.to(roomChannel(room.code)).emit('room_update', {
    code: room.code,
    players,
    canStart: room.guest !== null,
  });
}

/** Remove this socket from whatever lobby it's in, notifying the other side. */
function detachFromRoom(io: IoType, socket: SocketType): void {
  const code = socket.data.roomCode;
  const userId = socket.data.userId;
  if (!code) return;

  socket.data.roomCode = undefined;
  void socket.leave(roomChannel(code));

  const room = getPrivateRoom(code);
  if (!room) return;

  if (room.host.userId === userId) {
    // Host leaving dissolves the room; the guest (if any) is kicked back out.
    removePrivateRoom(code);
    socket.to(roomChannel(code)).emit('room_closed', {
      message: 'The host left, so the room was closed.',
    });
  } else if (room.guest && room.guest.userId === userId) {
    room.guest = null;
    emitRoomUpdate(io, room);
  }
}

export function registerPrivateRoomHandlers(io: IoType, socket: SocketType): void {
  socket.on('create_room', async ({ userId }) => {
    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        socket.emit('room_error', { message: 'We could not find your account.' });
        return;
      }

      socket.data.userId = userId;
      detachFromRoom(io, socket); // abandon any previous lobby first

      const room = createPrivateRoom({
        userId: user.id,
        socketId: socket.id,
        username: user.username,
        rating: user.rating,
      });

      socket.data.roomCode = room.code;
      void socket.join(roomChannel(room.code));
      emitRoomUpdate(io, room);
      console.log(`Private room ${room.code} created by ${user.username}`);
    } catch (err) {
      console.error('create_room failed:', err);
      socket.emit('room_error', { message: 'Could not create a room. Please try again.' });
    }
  });

  socket.on('join_room', async ({ userId, code }) => {
    try {
      const normalized = (code ?? '').trim().toUpperCase();
      if (!normalized) {
        socket.emit('room_error', { message: 'Enter a room code to join.' });
        return;
      }

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        socket.emit('room_error', { message: 'We could not find your account.' });
        return;
      }

      socket.data.userId = userId;
      detachFromRoom(io, socket); // leave any prior lobby before joining the new one

      const result = joinPrivateRoom(normalized, {
        userId: user.id,
        socketId: socket.id,
        username: user.username,
        rating: user.rating,
      });

      if (!result.ok) {
        socket.emit('room_error', { message: result.error });
        return;
      }

      socket.data.roomCode = normalized;
      void socket.join(roomChannel(normalized));
      emitRoomUpdate(io, result.room);
      console.log(`${user.username} joined private room ${normalized}`);
    } catch (err) {
      console.error('join_room failed:', err);
      socket.emit('room_error', { message: 'Could not join the room. Please try again.' });
    }
  });

  socket.on('start_room', async ({ code }) => {
    try {
      const normalized = (code ?? '').trim().toUpperCase();
      const room = getPrivateRoom(normalized);

      if (!room) {
        socket.emit('room_error', { message: 'This room no longer exists.' });
        return;
      }
      if (room.host.userId !== socket.data.userId) {
        socket.emit('room_error', { message: 'Only the host can start the match.' });
        return;
      }
      if (!room.guest) {
        socket.emit('room_error', { message: 'Waiting for your friend to join.' });
        return;
      }

      const { host, guest } = room;
      removePrivateRoom(normalized); // the lobby's job is done

      const [hostUser, guestUser] = await Promise.all([
        prisma.user.findUnique({ where: { id: host.userId } }),
        prisma.user.findUnique({ where: { id: guest.userId } }),
      ]);
      if (!hostUser || !guestUser) {
        io.to(roomChannel(normalized)).emit('room_closed', {
          message: 'A player could not be found. Please try again.',
        });
        return;
      }

      // Friend matches are casual — ranked:false means no rating/W-L changes.
      const roomId = await launchMatch(
        io,
        {
          userId: hostUser.id,
          socketId: host.socketId,
          username: hostUser.username,
          rating: hostUser.rating,
          wins: hostUser.wins,
          losses: hostUser.losses,
        },
        {
          userId: guestUser.id,
          socketId: guest.socketId,
          username: guestUser.username,
          rating: guestUser.rating,
          wins: guestUser.wins,
          losses: guestUser.losses,
        },
        { ranked: false },
      );

      if (!roomId) {
        io.to(roomChannel(normalized)).emit('room_closed', {
          message: 'Could not start — a player disconnected.',
        });
      }
    } catch (err) {
      console.error('start_room failed:', err);
      socket.emit('room_error', { message: 'Could not start the match. Please try again.' });
    }
  });

  socket.on('leave_room', () => {
    detachFromRoom(io, socket);
  });

  socket.on('disconnect', () => {
    if (socket.data.roomCode) detachFromRoom(io, socket);
  });
}
