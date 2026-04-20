'use client';

import { cn } from '@/lib/utils';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface AnswerFeedbackProps {
  correct: boolean;
  firstCorrect: 'you' | 'opponent' | null;
  nextIn: number;
  className?: string;
}

export function AnswerFeedback({ correct, firstCorrect, nextIn, className }: AnswerFeedbackProps) {
  const isFirst = firstCorrect === 'you';
  const opponentFirst = firstCorrect === 'opponent';

  return (
    <div
      className={cn(
        'animate-slide-up flex items-center gap-3 rounded-xl border p-4',
        correct && isFirst && 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400',
        correct && !isFirst && 'border-yellow-500/50 bg-yellow-500/10 text-yellow-400',
        !correct && opponentFirst && 'border-red-500/50 bg-red-500/10 text-red-400',
        !correct && !firstCorrect && 'border-slate-500/50 bg-slate-500/10 text-slate-400',
        className,
      )}
    >
      {correct ? (
        <CheckCircle className="h-5 w-5 shrink-0" />
      ) : (
        <XCircle className="h-5 w-5 shrink-0" />
      )}

      <div className="flex-1">
        <p className="font-semibold">
          {correct && isFirst && 'First correct! +1 point'}
          {correct && !isFirst && 'Correct — opponent was first'}
          {!correct && opponentFirst && 'Incorrect — opponent scored'}
          {!correct && !firstCorrect && 'Time up — no points awarded'}
        </p>
      </div>

      <div className="flex items-center gap-1.5 text-xs opacity-70">
        <Clock className="h-3 w-3" />
        <span>Next in {Math.ceil(nextIn / 1000)}s</span>
      </div>
    </div>
  );
}
