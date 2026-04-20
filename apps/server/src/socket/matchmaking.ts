import { Server, Socket } from 'socket.io';
import {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
} from '@arenaiq/types';
import { enqueuePlayer, dequeuePlayer } from '../services/matchmaking.service';
import { config } from '../config';

type IoType = Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
type SocketType = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

export function registerMatchmakingHandlers(io: IoType, socket: SocketType): void {
  socket.on('join_queue', async ({ userId, rating }) => {
    socket.data.userId = userId;

    await enqueuePlayer(io, {
      userId,
      socketId: socket.id,
      rating,
      joinedAt: Date.now(),
      ratingWindow: config.matchmaking.initialRatingWindow,
    });

    console.log(`Player ${userId} joined queue with rating ${rating}`);
  });

  socket.on('leave_queue', async ({ userId }) => {
    await dequeuePlayer(userId);
    console.log(`Player ${userId} left queue`);
  });

  socket.on('disconnect', async () => {
    const userId = socket.data.userId;
    if (userId && !socket.data.roomId) {
      await dequeuePlayer(userId);
    }
  });
}
