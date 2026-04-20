'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useQueueStore } from '@/store/queueStore';
import { useBattleStore } from '@/store/battleStore';
import { connectSocket, getSocket } from '@/lib/socket';

export function useQueue(userId: string, rating: number) {
  const router = useRouter();
  const { setQueuing, setQueueStatus, setMatched, reset } = useQueueStore();
  const { initBattle } = useBattleStore();

  const joinQueue = useCallback(() => {
    const socket = connectSocket();
    setQueuing();
    socket.emit('join_queue', { userId, rating });
  }, [userId, rating, setQueuing]);

  const leaveQueue = useCallback(() => {
    const socket = getSocket();
    socket.emit('leave_queue', { userId });
    reset();
  }, [userId, reset]);

  useEffect(() => {
    const socket = getSocket();

    const onQueueStatus = (payload: { position: number; estimatedWait: number; playersOnline: number }) => {
      setQueueStatus(payload.position, payload.estimatedWait, payload.playersOnline);
    };

    const onMatchFound = (payload: { roomId: string; opponent: any; startsIn: number }) => {
      setMatched(payload.roomId, payload.opponent, payload.startsIn);
      initBattle(payload.roomId, payload.opponent);
      setTimeout(() => {
        router.push(`/battle/${payload.roomId}`);
      }, 2000); // show match found modal briefly
    };

    socket.on('queue_status', onQueueStatus);
    socket.on('match_found', onMatchFound);

    return () => {
      socket.off('queue_status', onQueueStatus);
      socket.off('match_found', onMatchFound);
    };
  }, [setQueueStatus, setMatched, initBattle, router]);

  return { joinQueue, leaveQueue };
}
