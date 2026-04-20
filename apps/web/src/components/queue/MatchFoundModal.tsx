'use client';

import { PublicUser } from '@arenaiq/types';
import { RatingBadge } from '../shared/RatingBadge';
import { Swords } from 'lucide-react';

interface MatchFoundModalProps {
  opponent: PublicUser;
  startsIn: number;
}

export function MatchFoundModal({ opponent, startsIn }: MatchFoundModalProps) {
  const countdown = Math.ceil(startsIn / 1000);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-arena-bg/80 backdrop-blur-sm">
      <div className="animate-slide-up flex flex-col items-center gap-6 rounded-2xl border border-arena-accent/50 bg-arena-surface p-8 text-center shadow-2xl shadow-arena-accent/20">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-arena-accent/20">
          <Swords className="h-8 w-8 text-arena-accent-light" />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-white">Match Found!</h2>
          <p className="mt-1 text-slate-400">Battle starts in {countdown}s</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-arena-accent to-purple-800 text-xl font-bold text-white">
              Y
            </div>
            <span className="text-sm font-medium text-white">You</span>
          </div>

          <span className="text-2xl font-bold text-slate-500">VS</span>

          <div className="flex flex-col items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-blue-800 text-xl font-bold text-white">
              {opponent.username[0]?.toUpperCase()}
            </div>
            <span className="text-sm font-medium text-white">{opponent.username}</span>
          </div>
        </div>

        <RatingBadge rating={opponent.rating} />
      </div>
    </div>
  );
}
