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
import { LoadingArena } from '@/components/shared/LoadingArena';
import { WifiOff } from 'lucide-react';

export default function BattlePage() {
  const params = useParams<{ roomId: string }>();
  const router = useRouter();
  const roomId = params.roomId;

  const { submitAnswer } = useBattle(roomId);

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
  } = useBattleStore();

  const profile = useUserStore((s) => s.profile);

  useEffect(() => {
    if (phase === 'idle') {
      router.replace('/dashboard');
    }
  }, [phase, router]);

  if (!opponent || phase === 'idle') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-arena-bg">
        <LoadingArena message="Connecting to battle room..." />
      </main>
    );
  }

  const isLocked = submittedAnswer !== null || phase === 'answer_reveal';

  return (
    <main className="min-h-screen bg-arena-bg">
      <div className="mx-auto max-w-2xl p-4 pt-6 space-y-4">
        {/* Disconnection warning */}
        {opponentDisconnected && (
          <div className="flex items-center gap-2 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-2.5 text-sm text-yellow-400">
            <WifiOff className="h-4 w-4 shrink-0" />
            Opponent disconnected — waiting 30s for reconnection...
          </div>
        )}

        {/* Scoreboard */}
        {currentQuestion && (
          <div className="rounded-2xl border border-arena-border bg-arena-surface p-4">
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
            <div className="rounded-2xl border border-arena-border bg-arena-bg/50 p-5">
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
