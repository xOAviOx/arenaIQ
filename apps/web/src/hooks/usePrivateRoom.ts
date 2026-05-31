'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBattleStore } from '@/store/battleStore';
import { connectSocket, getSocket } from '@/lib/socket';
import {
  RoomLobbyPayload,
  RoomErrorPayload,
  RoomClosedPayload,
  MatchFoundPayload,
} from '@arenaiq/types';

/**
 * Drives the "play with a friend" lobby: create/join a room by code, watch the
 * lobby fill, and start the (casual) battle. Reuses the same `match_found` →
 * `/battle/[roomId]` handoff as ranked matchmaking.
 */
export function usePrivateRoom(userId: string) {
  const router = useRouter();
  const initBattle = useBattleStore((s) => s.initBattle);

  const [lobby, setLobby] = useState<RoomLobbyPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  const create = useCallback(() => {
    setError(null);
    connectSocket().emit('create_room', { userId });
  }, [userId]);

  const join = useCallback(
    (code: string) => {
      setError(null);
      connectSocket().emit('join_room', { userId, code });
    },
    [userId],
  );

  const start = useCallback(() => {
    if (!lobby) return;
    setError(null);
    getSocket().emit('start_room', { code: lobby.code });
  }, [lobby]);

  const leave = useCallback(() => {
    if (lobby) getSocket().emit('leave_room', { code: lobby.code });
    setLobby(null);
    setError(null);
  }, [lobby]);

  useEffect(() => {
    const socket = getSocket();

    const onRoomUpdate = (payload: RoomLobbyPayload) => {
      setLobby(payload);
      setError(null);
    };

    const onRoomError = (payload: RoomErrorPayload) => {
      setError(payload.message);
    };

    const onRoomClosed = (payload: RoomClosedPayload) => {
      setLobby(null);
      setStarting(false);
      setError(payload.message);
    };

    const onMatchFound = (payload: MatchFoundPayload) => {
      setStarting(true);
      initBattle(payload.roomId, payload.opponent, payload.ranked ?? false);
      setTimeout(() => router.push(`/battle/${payload.roomId}`), 1500);
    };

    socket.on('room_update', onRoomUpdate);
    socket.on('room_error', onRoomError);
    socket.on('room_closed', onRoomClosed);
    socket.on('match_found', onMatchFound);

    return () => {
      socket.off('room_update', onRoomUpdate);
      socket.off('room_error', onRoomError);
      socket.off('room_closed', onRoomClosed);
      socket.off('match_found', onMatchFound);
    };
  }, [initBattle, router]);

  return { lobby, error, starting, create, join, start, leave };
}
