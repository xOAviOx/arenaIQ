import { create } from 'zustand';
import { PublicUser } from '@arenaiq/types';

type QueueStatus = 'idle' | 'queuing' | 'matched';

interface QueueState {
  status: QueueStatus;
  position: number;
  estimatedWait: number;
  playersOnline: number;
  opponent: PublicUser | null;
  roomId: string | null;
  matchStartsIn: number;
  setQueuing: () => void;
  setQueueStatus: (position: number, estimatedWait: number, playersOnline: number) => void;
  setMatched: (roomId: string, opponent: PublicUser, startsIn: number) => void;
  reset: () => void;
}

export const useQueueStore = create<QueueState>()((set) => ({
  status: 'idle',
  position: 0,
  estimatedWait: 0,
  playersOnline: 0,
  opponent: null,
  roomId: null,
  matchStartsIn: 0,
  setQueuing: () => set({ status: 'queuing' }),
  setQueueStatus: (position, estimatedWait, playersOnline) =>
    set({ position, estimatedWait, playersOnline }),
  setMatched: (roomId, opponent, startsIn) =>
    set({ status: 'matched', roomId, opponent, matchStartsIn: startsIn }),
  reset: () =>
    set({
      status: 'idle',
      position: 0,
      estimatedWait: 0,
      playersOnline: 0,
      opponent: null,
      roomId: null,
      matchStartsIn: 0,
    }),
}));
