import { Server } from 'socket.io';
import http from 'http';
import {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
} from '@arenaiq/types';
import { config } from '../config';
import { registerMatchmakingHandlers } from './matchmaking';
import { registerBattleHandlers } from './battle';
import { registerPrivateRoomHandlers } from './privateRoom';
import { startMatchmaking } from '../services/matchmaking.service';
import { ensureBots } from '../services/bot.service';

export function createSocketServer(httpServer: http.Server) {
  const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(
    httpServer,
    {
      cors: {
        origin: config.clientUrl,
        methods: ['GET', 'POST'],
        credentials: true,
      },
      pingTimeout: 20000,
      pingInterval: 10000,
    },
  );

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    registerMatchmakingHandlers(io, socket);
    registerBattleHandlers(io, socket);
    registerPrivateRoomHandlers(io, socket);

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  // Seed the bot pool, then begin matchmaking (bots are reserved on demand).
  void ensureBots();
  startMatchmaking(io);

  return io;
}
