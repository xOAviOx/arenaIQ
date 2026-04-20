import { Server, Socket } from 'socket.io';
import {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
} from '@arenaiq/types';
import {
  handleAnswer,
  handleDisconnect,
  handleReconnect,
  getRoom,
} from '../services/battle.service';

type IoType = Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
type SocketType = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

export function registerBattleHandlers(io: IoType, socket: SocketType): void {
  socket.on('submit_answer', ({ roomId, questionIndex, answer }) => {
    const userId = socket.data.userId;
    if (!userId) {
      socket.emit('error', 'Not authenticated');
      return;
    }

    const room = getRoom(roomId);
    if (!room) {
      socket.emit('error', 'Room not found');
      return;
    }

    if (room.player1.userId !== userId && room.player2.userId !== userId) {
      socket.emit('error', 'Not a participant of this room');
      return;
    }

    handleAnswer(io, roomId, userId, questionIndex, answer);
  });

  socket.on('reconnect_battle', ({ roomId, userId }) => {
    const room = getRoom(roomId);
    if (!room) {
      socket.emit('error', 'Room no longer exists');
      return;
    }

    socket.data.userId = userId;
    socket.data.roomId = roomId;
    socket.join(roomId);

    handleReconnect(io, roomId, userId, socket.id);
  });

  socket.on('disconnect', () => {
    const roomId = socket.data.roomId;
    const userId = socket.data.userId;
    if (roomId && userId) {
      handleDisconnect(io, roomId, userId);
    }
  });
}
