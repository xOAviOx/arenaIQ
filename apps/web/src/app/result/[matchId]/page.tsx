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
  const resultColor = isDraw
    ? 'text-yellow-400'
    : youWon
      ? 'text-emerald-400'
      : 'text-red-400';

  return (
    <main className="min-h-screen bg-arena-bg">
      <div className="mx-auto max-w-2xl space-y-6 p-6">
        {/* Result header */}
        <div className="rounded-2xl border border-arena-border bg-arena-surface p-8 text-center">
          <div
            className={cn(
              'mb-2 text-5xl font-bold',
              resultColor,
            )}
          >
            {resultLabel}
          </div>
          <p className="text-slate-400">
            vs <span className="font-semibold text-white">{opponent.username}</span>
          </p>

          <div className="mt-6 flex justify-center gap-6">
            <div className="text-center">
              <p className="text-xs uppercase tracking-wider text-slate-500">Your Rating</p>
              <RatingBadge rating={you.rating} className="mt-1.5" />
            </div>
            <div className="text-center">
              <p className="text-xs uppercase tracking-wider text-slate-500">Rating Change</p>
              <p
                className={cn(
                  'mt-1.5 text-xl font-bold',
                  match.ratingDelta >= 0 && youWon ? 'text-emerald-400' : 'text-red-400',
                )}
              >
                {youWon
                  ? `+${match.ratingDelta}`
                  : isDraw
                    ? `±${match.ratingDelta}`
                    : `-${match.ratingDelta}`}
              </p>
            </div>
          </div>
        </div>

        {/* Question breakdown */}
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-400">
            Question Breakdown
          </h2>
          <div className="space-y-3">
            {match.matchQuestions.map((mq, i) => {
              const myAnswer = isPlayer1 ? mq.player1Answer : mq.player2Answer;
              const isCorrect = myAnswer === mq.question.correctOption;
              const iWasFirst =
                mq.firstCorrect === (isPlayer1 ? 'player1' : 'player2');

              return (
                <div
                  key={mq.id}
                  className="rounded-xl border border-arena-border bg-arena-surface p-4"
                >
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-slate-500">Q{i + 1}</span>
                      <SubjectTag subject={mq.question.subject as Subject} />
                    </div>
                    {isCorrect ? (
                      <span className="flex items-center gap-1 text-xs text-emerald-400">
                        <CheckCircle className="h-3.5 w-3.5" />
                        {iWasFirst ? 'First correct' : 'Correct'}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-red-400">
                        <XCircle className="h-3.5 w-3.5" />
                        {myAnswer === null ? 'No answer' : 'Incorrect'}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-slate-300 line-clamp-2">
                    {mq.question.latexQuestion.replace(/\$[^$]+\$/g, '[formula]')}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Link
            href="/queue"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-arena-accent py-3 font-semibold text-white transition-colors hover:bg-arena-accent/80"
          >
            <RotateCcw className="h-4 w-4" />
            Play Again
          </Link>
          <Link
            href="/dashboard"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-arena-border py-3 font-semibold text-slate-300 transition-colors hover:bg-arena-surface"
          >
            <Home className="h-4 w-4" />
            Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
