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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-arena-ink/85 p-6 backdrop-blur-md">
      <div className="panel animate-pop-in relative w-full max-w-md overflow-hidden p-8 text-center shadow-volt">
        <span className="sheen-layer" aria-hidden />

        <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-arena-volt/40 bg-arena-volt/10">
          <span className="absolute inset-0 animate-pulse-glow rounded-2xl" />
          <Swords className="h-8 w-8 text-arena-volt" />
        </div>

        <h2 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-arena-text">
          Match Found
        </h2>
        <p className="mt-1 font-mono text-sm text-arena-dim">
          Battle starts in <span className="text-arena-volt">{countdown}s</span>
        </p>

        <div className="mt-7 flex items-center justify-center gap-5">
          <Fighter initial="Y" label="You" gradient="from-arena-volt to-arena-cyan" dark />
          <span className="font-display text-2xl font-extrabold text-arena-faint">VS</span>
          <Fighter
            initial={opponent.username[0]?.toUpperCase() ?? '?'}
            label={opponent.username}
            gradient="from-fuchsia-500 to-arena-blue"
          />
        </div>

        <div className="mt-6 flex justify-center">
          <RatingBadge rating={opponent.rating} size="md" />
        </div>
      </div>
    </div>
  );
}

function Fighter({
  initial,
  label,
  gradient,
  dark,
}: {
  initial: string;
  label: string;
  gradient: string;
  dark?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-2xl font-extrabold ${gradient} ${
          dark ? 'text-[#0b0d14]' : 'text-white'
        }`}
      >
        {initial}
      </div>
      <span className="max-w-[6rem] truncate text-sm font-semibold text-arena-text">{label}</span>
    </div>
  );
}
