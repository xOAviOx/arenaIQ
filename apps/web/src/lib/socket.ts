import { io, Socket } from 'socket.io-client';
import { ServerToClientEvents, ClientToServerEvents } from '@arenaiq/types';

type AppSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

let socket: AppSocket | null = null;

export function getSocket(): AppSocket {
  if (!socket) {
    socket = io(process.env['NEXT_PUBLIC_WS_URL'] ?? 'http://localhost:4000', {
      autoConnect: false,
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });
  }
  return socket;
}

export function connectSocket(): AppSocket {
  const s = getSocket();
  if (!s.connected) s.connect();
  return s;
}

export function disconnectSocket(): void {
  if (socket?.connected) {
    socket.disconnect();
  }
}
