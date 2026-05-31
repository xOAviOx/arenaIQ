'use client';

import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { QuestionForBattle } from '@arenaiq/types';
import { cn } from '@/lib/utils';
import { SubjectTag } from '../shared/SubjectTag';
import { Check, X } from 'lucide-react';

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
      return <InlineMath key={i} math={part.slice(1, -1)} />;
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
  const revealed = correctAnswer !== undefined;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <SubjectTag subject={question.subject} />
        <span className="font-mono text-xs text-arena-faint">{question.topic}</span>
        {question.year && (
          <span className="ml-auto font-mono text-xs text-arena-faint">{question.year}</span>
        )}
      </div>

      {/* Question */}
      <div className="relative rounded-2xl border border-arena-line bg-arena-ink/60 p-5">
        <span
          className="absolute left-0 top-4 h-[calc(100%-2rem)] w-1 rounded-full bg-volt-grad"
          aria-hidden
        />
        <div className="pl-3 text-lg leading-relaxed text-arena-text">
          {renderLatex(question.latexQuestion)}
        </div>
      </div>

      {/* Options */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {question.options.map((option, index) => {
          const isSelected = selectedAnswer === index;
          const isCorrect = revealed && index === correctAnswer;
          const isWrong = revealed && isSelected && index !== correctAnswer;

          return (
            <button
              key={index}
              onClick={() => !locked && onSelect(index)}
              disabled={locked}
              className={cn(
                'group relative flex items-center gap-3.5 rounded-2xl border p-4 text-left transition-all duration-200',
                'disabled:cursor-not-allowed',
                !revealed && !isSelected &&
                  'border-arena-line bg-arena-panel hover:-translate-y-0.5 hover:border-arena-volt/50 hover:bg-arena-volt/[0.04]',
                !revealed && isSelected &&
                  'border-arena-volt bg-arena-volt/10 shadow-volt-sm',
                isCorrect && 'border-arena-green bg-arena-green/10 shadow-[0_0_24px_-10px_rgba(47,230,160,0.7)]',
                isWrong && 'border-arena-red bg-arena-red/10',
              )}
            >
              <span
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border font-mono text-sm font-bold transition-colors',
                  !isSelected && !isCorrect && 'border-arena-line bg-arena-ink text-arena-dim',
                  !revealed && isSelected && 'border-arena-volt bg-arena-volt text-[#0b0d14]',
                  isCorrect && 'border-arena-green bg-arena-green text-[#0b0d14]',
                  isWrong && 'border-arena-red bg-arena-red text-white',
                )}
              >
                {isCorrect ? (
                  <Check className="h-4 w-4" strokeWidth={3} />
                ) : isWrong ? (
                  <X className="h-4 w-4" strokeWidth={3} />
                ) : (
                  OPTION_LABELS[index]
                )}
              </span>
              <span className="text-sm leading-relaxed text-arena-text">
                {renderLatex(option)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
