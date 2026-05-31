import { prisma } from '@arenaiq/db';
import { notFound } from 'next/navigation';
import { currentUser } from '@clerk/nextjs/server';
import Link from 'next/link';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { formatRatingDelta } from '@/lib/utils';
import { RatingBadge } from '@/components/shared/RatingBadge';
import { SubjectTag } from '@/components/shared/SubjectTag';
import { Subject } from '@arenaiq/types';
import { Trophy, RotateCcw, Home, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// Always render fresh so the result/breakdown reflects the just-completed match.
export const dynamic = 'force-dynamic';

export default async function ResultPage({ params }: { params: { matchId: string } }) {
  const clerkUser = await currentUser();
  const match = await prisma.match.findUnique({
    where: { id: params.matchId },
    include: {
      player1: true,
      player2: true,
      matchQuestions: {
        include: { question: true },
        orderBy: { questionIndex: 'asc' },
      },
    },
  });

  if (!match) notFound();

  const dbUser = clerkUser
    ? await prisma.user.findUnique({ where: { clerkId: clerkUser.id } })
    : null;

  const isPlayer1 = dbUser?.id === match.player1Id;
  const you = isPlayer1 ? match.player1 : match.player2;
  const opponent = isPlayer1 ? match.player2 : match.player1;
  const youWon = match.winnerId === you.id;
  const isDraw = match.winnerId === null;

  const resultLabel = isDraw ? 'Draw' : youWon ? 'Victory' : 'Defeat';
  const resultGradient = isDraw
    ? 'text-gradient-gold'
    : youWon
      ? 'text-gradient-volt'
      : 'text-arena-red';
  const deltaUp = youWon;

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-2xl space-y-6 px-6 py-10">
        {/* Result header */}
        <div className="panel stagger relative overflow-hidden p-8 text-center" style={{ ['--i' as string]: 0 }}>
          {youWon && <span className="sheen-layer" aria-hidden />}
          <p className="relative font-mono text-xs uppercase tracking-[0.4em] text-arena-faint">
            {isDraw ? 'Stalemate' : youWon ? 'You won the duel' : 'You were outpaced'}
          </p>
          <div className={cn('relative mt-2 font-display text-6xl font-extrabold tracking-tight', resultGradient)}>
            {resultLabel}
          </div>
          <p className="relative mt-2 text-arena-dim">
            vs <span className="font-semibold text-arena-text">{opponent.username}</span>
          </p>

          <div className="relative mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-arena-line bg-arena-line">
            <div className="bg-arena-panel px-4 py-5">
              <p className="text-xs uppercase tracking-wider text-arena-faint">Your Rating</p>
              <div className="mt-2 flex justify-center">
                <RatingBadge rating={you.rating} size="md" />
              </div>
            </div>
            <div className="bg-arena-panel px-4 py-5">
              <p className="text-xs uppercase tracking-wider text-arena-faint">Rating Change</p>
              <p
                className={cn(
                  'mt-2 font-mono text-2xl font-bold',
                  isDraw ? 'text-arena-gold' : deltaUp ? 'text-arena-green' : 'text-arena-red',
                )}
              >
                {youWon ? `+${match.ratingDelta}` : isDraw ? `±${match.ratingDelta}` : `−${match.ratingDelta}`}
              </p>
            </div>
          </div>
        </div>

        {/* Question breakdown */}
        <div className="stagger" style={{ ['--i' as string]: 1 }}>
          <h2 className="mb-3 font-mono text-xs font-semibold uppercase tracking-[0.3em] text-arena-faint">
            Round Breakdown
          </h2>
          <div className="space-y-3">
            {match.matchQuestions.map((mq, i) => {
              const myAnswer = isPlayer1 ? mq.player1Answer : mq.player2Answer;
              const isCorrect = myAnswer === mq.question.correctOption;
              const iWasFirst = mq.firstCorrect === (isPlayer1 ? 'player1' : 'player2');

              return (
                <div
                  key={mq.id}
                  className={cn(
                    'panel border-l-2 p-4',
                    isCorrect ? 'border-l-arena-green' : 'border-l-arena-red',
                  )}
                >
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-arena-faint">Q{i + 1}</span>
                      <SubjectTag subject={mq.question.subject as Subject} />
                    </div>
                    {isCorrect ? (
                      <span className="flex items-center gap-1 font-mono text-xs text-arena-green">
                        <CheckCircle className="h-3.5 w-3.5" />
                        {iWasFirst ? 'First correct' : 'Correct'}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 font-mono text-xs text-arena-red">
                        <XCircle className="h-3.5 w-3.5" />
                        {myAnswer === null ? 'No answer' : 'Incorrect'}
                      </span>
                    )}
                  </div>

                  <p className="line-clamp-2 text-sm text-arena-dim">
                    {mq.question.latexQuestion.replace(/\$[^$]+\$/g, '[formula]')}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="stagger flex gap-3" style={{ ['--i' as string]: 2 }}>
          <Link
            href="/queue"
            className="group relative flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-2xl bg-arena-volt py-3.5 font-bold text-[#0b0d14] shadow-volt-sm transition-transform hover:-translate-y-0.5"
          >
            <span className="sheen-layer" aria-hidden />
            <RotateCcw className="h-4 w-4" />
            Rematch
          </Link>
          <Link
            href="/dashboard"
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-arena-line py-3.5 font-semibold text-arena-text transition-colors hover:border-arena-volt/40 hover:bg-white/[0.02]"
          >
            <Home className="h-4 w-4" />
            Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
