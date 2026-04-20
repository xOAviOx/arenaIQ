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
  return (
    <div className="flex items-center gap-4">
      {/* You */}
      <div className="flex flex-1 flex-col items-start">
        <span className="text-xs font-medium text-arena-accent-light">YOU</span>
        <span className="truncate text-sm font-semibold text-white">{you.username}</span>
      </div>

      {/* Score + Progress */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold tabular-nums text-white">{scores.you}</span>
          <span className="text-lg text-slate-500">:</span>
          <span className="text-2xl font-bold tabular-nums text-white">{scores.opponent}</span>
        </div>

        {/* Round dots */}
        <div className="flex gap-1">
          {Array.from({ length: totalQuestions }, (_, i) => (
            <div
              key={i}
              className={cn(
                'h-1.5 w-1.5 rounded-full transition-colors',
                i < currentQuestion ? 'bg-arena-accent' : 'bg-arena-border',
                i === currentQuestion && 'animate-pulse bg-arena-accent-light',
              )}
            />
          ))}
        </div>

        <span className="text-xs text-slate-500">
          Q{currentQuestion + 1} / {totalQuestions}
        </span>
      </div>

      {/* Opponent */}
      <div className="flex flex-1 flex-col items-end">
        <span className="text-xs font-medium text-slate-400">OPP</span>
        <span className="truncate text-sm font-semibold text-white">{opponent.username}</span>
      </div>
    </div>
  );
}
