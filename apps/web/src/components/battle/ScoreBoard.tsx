'use client';

import { PublicUser } from '@arenaiq/types';
import { cn } from '@/lib/utils';

interface ScoreBoardProps {
  you: { username: string; rating: number };
  opponent: PublicUser;
  scores: { you: number; opponent: number };
  currentQuestion: number;
  totalQuestions: number;
}

export function ScoreBoard({
  you,
  opponent,
  scores,
  currentQuestion,
  totalQuestions,
}: ScoreBoardProps) {
  const youLeading = scores.you > scores.opponent;
  const oppLeading = scores.opponent > scores.you;

  return (
    <div className="flex items-center gap-4">
      {/* You */}
      <div className="flex flex-1 flex-col items-start">
        <span className="font-mono text-[11px] font-semibold uppercase tracking-widest text-arena-volt">
          You
        </span>
        <span className="max-w-full truncate text-sm font-semibold text-arena-text">
          {you.username}
        </span>
      </div>

      {/* Score */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              'font-mono text-3xl font-bold tabular-nums transition-colors',
              youLeading ? 'text-arena-volt' : 'text-arena-text',
            )}
          >
            {scores.you}
          </span>
          <span className="text-lg text-arena-faint">:</span>
          <span
            className={cn(
              'font-mono text-3xl font-bold tabular-nums transition-colors',
              oppLeading ? 'text-fuchsia-400' : 'text-arena-text',
            )}
          >
            {scores.opponent}
          </span>
        </div>

        <div className="flex gap-1.5">
          {Array.from({ length: totalQuestions }, (_, i) => (
            <div
              key={i}
              className={cn(
                'h-1.5 rounded-full transition-all duration-300',
                i === currentQuestion
                  ? 'w-5 animate-pulse bg-arena-volt'
                  : i < currentQuestion
                    ? 'w-1.5 bg-arena-volt/60'
                    : 'w-1.5 bg-arena-line-2',
              )}
            />
          ))}
        </div>

        <span className="font-mono text-[11px] text-arena-faint">
          Q{currentQuestion + 1} / {totalQuestions}
        </span>
      </div>

      {/* Opponent */}
      <div className="flex flex-1 flex-col items-end">
        <span className="font-mono text-[11px] font-semibold uppercase tracking-widest text-fuchsia-400">
          Opp
        </span>
        <span className="max-w-full truncate text-right text-sm font-semibold text-arena-text">
          {opponent.username}
        </span>
      </div>
    </div>
  );
}
