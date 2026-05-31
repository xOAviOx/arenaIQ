'use client';

import { cn } from '@/lib/utils';
import { CheckCircle2, XCircle, Clock, Zap } from 'lucide-react';

interface AnswerFeedbackProps {
  correct: boolean;
  firstCorrect: 'you' | 'opponent' | null;
  nextIn: number;
  className?: string;
}

export function AnswerFeedback({ correct, firstCorrect, nextIn, className }: AnswerFeedbackProps) {
  const isFirst = firstCorrect === 'you';
  const opponentFirst = firstCorrect === 'opponent';

  const tone = correct && isFirst
    ? 'border-arena-volt/50 bg-arena-volt/10 text-arena-volt'
    : correct && !isFirst
      ? 'border-arena-gold/50 bg-arena-gold/10 text-arena-gold'
      : !correct && opponentFirst
        ? 'border-arena-red/50 bg-arena-red/10 text-arena-red'
        : 'border-arena-line bg-arena-panel text-arena-dim';

  return (
    <div className={cn('animate-pop-in flex items-center gap-3 rounded-2xl border p-4', tone, className)}>
      {correct && isFirst ? (
        <Zap className="h-5 w-5 shrink-0" />
      ) : correct ? (
        <CheckCircle2 className="h-5 w-5 shrink-0" />
      ) : (
        <XCircle className="h-5 w-5 shrink-0" />
      )}

      <p className="flex-1 font-semibold">
        {correct && isFirst && 'First correct! +1 point'}
        {correct && !isFirst && 'Correct — but opponent was faster'}
        {!correct && opponentFirst && 'Incorrect — opponent scored'}
        {!correct && !firstCorrect && 'Time up — no points'}
      </p>

      <span className="flex items-center gap-1.5 font-mono text-xs opacity-70">
        <Clock className="h-3.5 w-3.5" />
        Next in {Math.ceil(nextIn / 1000)}s
      </span>
    </div>
  );
}
