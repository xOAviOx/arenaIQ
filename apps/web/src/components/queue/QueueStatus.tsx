'use client';

import { useQueueStore } from '@/store/queueStore';
import { LoadingArena } from '../shared/LoadingArena';
import { Users, Clock, X } from 'lucide-react';

interface QueueStatusProps {
  onCancel: () => void;
}

export function QueueStatus({ onCancel }: QueueStatusProps) {
  const { position, estimatedWait, playersOnline } = useQueueStore();

  return (
    <div className="flex flex-col items-center gap-8">
      <LoadingArena message="Finding your opponent..." className="py-4" />

      <div className="flex w-full max-w-sm flex-col gap-3 rounded-xl border border-arena-border bg-arena-surface p-5">
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 text-slate-400">
            <Users className="h-4 w-4" />
            Players online
          </span>
          <span className="font-semibold text-white">{playersOnline}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 text-slate-400">
            <Clock className="h-4 w-4" />
            Estimated wait
          </span>
          <span className="font-semibold text-white">{estimatedWait}s</span>
        </div>
        {position > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Queue position</span>
            <span className="font-semibold text-white">#{position}</span>
          </div>
        )}
      </div>

      <button
        onClick={onCancel}
        className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20"
      >
        <X className="h-4 w-4" />
        Cancel Matchmaking
      </button>
    </div>
  );
}
