'use client';

import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { QuestionForBattle } from '@arenaiq/types';
import { cn } from '@/lib/utils';
import { SubjectTag } from '../shared/SubjectTag';

const OPTION_LABELS = ['A', 'B', 'C', 'D'] as const;

interface QuestionRendererProps {
  question: QuestionForBattle;
  selectedAnswer: number | null;
  correctAnswer?: number;
  locked: boolean;
  onSelect: (index: number) => void;
}

function renderLatex(text: string) {
  const parts = text.split(/(\$[^$]+\$)/g);
  return parts.map((part, i) => {
    if (part.startsWith('$') && part.endsWith('$')) {
      const expr = part.slice(1, -1);
      return <InlineMath key={i} math={expr} />;
    }
    return <span key={i}>{part}</span>;
  });
}

export function QuestionRenderer({
  question,
  selectedAnswer,
  correctAnswer,
  locked,
  onSelect,
}: QuestionRendererProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <SubjectTag subject={question.subject} />
        <span className="text-xs text-slate-500">{question.topic}</span>
        {question.year && (
          <span className="ml-auto text-xs text-slate-500">{question.year}</span>
        )}
      </div>

      {/* Question */}
      <div className="rounded-xl border border-arena-border bg-arena-surface/60 p-5">
        <div className="text-base leading-relaxed text-slate-100">
          {renderLatex(question.latexQuestion)}
        </div>
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {question.options.map((option, index) => {
          const isSelected = selectedAnswer === index;
          const isCorrect = correctAnswer !== undefined && index === correctAnswer;
          const isWrong = correctAnswer !== undefined && isSelected && index !== correctAnswer;

          return (
            <button
              key={index}
              onClick={() => !locked && onSelect(index)}
              disabled={locked}
              className={cn(
                'group relative flex items-start gap-3 rounded-xl border p-4 text-left transition-all duration-200',
                'disabled:cursor-not-allowed',
                !locked && !isSelected &&
                  'border-arena-border bg-arena-surface hover:border-arena-accent/50 hover:bg-arena-accent/5',
                isSelected && !correctAnswer !== undefined &&
                  'border-arena-accent bg-arena-accent/10',
                isCorrect &&
                  'border-emerald-500 bg-emerald-500/10',
                isWrong &&
                  'border-red-500 bg-red-500/10',
                isSelected && correctAnswer === undefined &&
                  'border-arena-accent bg-arena-accent/10',
              )}
            >
              <span
                className={cn(
                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-sm font-bold transition-colors',
                  !isSelected && 'border-arena-border bg-arena-bg text-slate-400',
                  isSelected && !isCorrect && !isWrong && 'border-arena-accent bg-arena-accent text-white',
                  isCorrect && 'border-emerald-500 bg-emerald-500 text-white',
                  isWrong && 'border-red-500 bg-red-500 text-white',
                )}
              >
                {OPTION_LABELS[index]}
              </span>
              <span className="text-sm leading-relaxed text-slate-200">
                {renderLatex(option)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
