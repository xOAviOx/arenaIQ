'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useBattle } from '@/hooks/useBattle';
import { useBattleStore } from '@/store/battleStore';
import { useUserStore } from '@/store/userStore';
import { QuestionRenderer } from '@/components/battle/QuestionRenderer';
import { ScoreBoard } from '@/components/battle/ScoreBoard';
import { Timer } from '@/components/battle/Timer';
import { OpponentCard } from '@/components/battle/OpponentCard';
import { AnswerFeedback } from '@/components/battle/AnswerFeedback';
import { BattleChat } from '@/components/battle/BattleChat';
import { ResignButton } from '@/components/battle/ResignButton';
import { LoadingArena } from '@/components/shared/LoadingArena';
import { WifiOff } from 'lucide-react';

export default function BattlePage() {
  const params = useParams<{ roomId: string }>();
  const router = useRouter();
  const roomId = params.roomId;

  const { submitAnswer, resign, sendChat } = useBattle(roomId);

  const {
    phase,
    currentQuestion,
    questionIndex,
    totalQuestions,
    timeLimit,
    scores,
    submittedAnswer,
    opponentAnswered,
    lastResult,
    opponent,
    opponentDisconnected,
    messages,
  } = useBattleStore();

  const profile = useUserStore((s) => s.profile);

  useEffect(() => {
    if (phase === 'idle') {
      router.replace('/dashboard');
    }
  }, [phase, router]);

  if (!opponent || phase === 'idle') {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <LoadingArena message="Connecting to battle room…" />
      </main>
    );
  }

  const isLocked = submittedAnswer !== null || phase === 'answer_reveal';

  const matchOver = phase === 'completed';

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-2xl space-y-4 p-4 pt-6">
        {/* Header: live indicator + resign */}
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-arena-faint">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-arena-red opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-arena-red" />
            </span>
            Live · Ranked
          </span>
          {!matchOver && <ResignButton onResign={resign} />}
        </div>

        {/* Disconnection warning */}
        {opponentDisconnected && (
          <div className="flex animate-pop-in items-center gap-2 rounded-xl border border-arena-gold/40 bg-arena-gold/10 px-4 py-2.5 text-sm text-arena-gold">
            <WifiOff className="h-4 w-4 shrink-0" />
            Opponent disconnected — holding the arena for 30s…
          </div>
        )}

        {/* Scoreboard */}
        {currentQuestion && (
          <div className="panel p-4">
            <ScoreBoard
              you={{ username: profile?.username ?? 'You', rating: profile?.rating ?? 1200 }}
              opponent={opponent}
              scores={scores}
              currentQuestion={questionIndex}
              totalQuestions={totalQuestions}
            />
          </div>
        )}

        {/* Battle area */}
        {phase === 'starting' && (
          <div className="flex flex-col items-center justify-center gap-4 py-20">
            <LoadingArena message="Battle starting..." />
          </div>
        )}

        {(phase === 'question' || phase === 'answer_reveal') && currentQuestion && (
          <div className="space-y-4">
            {/* Timer + Opponent row */}
            <div className="flex items-center gap-4">
              <Timer
                key={`timer-${questionIndex}`}
                totalSeconds={timeLimit}
                className="shrink-0"
              />
              <OpponentCard
                opponent={opponent}
                isConnected={!opponentDisconnected}
                hasAnswered={opponentAnswered}
                className="flex-1"
              />
            </div>

            {/* Question */}
            <div className="panel p-5">
              <QuestionRenderer
                question={currentQuestion}
                selectedAnswer={submittedAnswer}
                correctAnswer={lastResult?.questionResult.correctOption}
                locked={isLocked}
                onSelect={submitAnswer}
              />
            </div>

            {/* Feedback */}
            {phase === 'answer_reveal' && lastResult && (
              <AnswerFeedback
                correct={lastResult.correct}
                firstCorrect={lastResult.firstCorrect}
                nextIn={3000}
              />
            )}
          </div>
        )}
      </div>
    </main>
  );
}
