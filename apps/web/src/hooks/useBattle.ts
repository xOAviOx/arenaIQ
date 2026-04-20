'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useBattleStore } from '@/store/battleStore';
import { getSocket } from '@/lib/socket';
import {
  QuestionStartPayload,
  AnswerResultPayload,
  MatchEndPayload,
  SubmitAnswerPayload,
} from '@arenaiq/types';

export function useBattle(roomId: string) {
  const router = useRouter();
  const {
    setQuestion,
    submitAnswer: storeSubmitAnswer,
    setOpponentAnswered,
    setAnswerResult,
    setMatchResult,
    setOpponentDisconnected,
    submittedAnswer,
    questionIndex,
  } = useBattleStore();

  const submitAnswer = useCallback(
    (answer: number) => {
      if (submittedAnswer !== null) return;

      storeSubmitAnswer(answer);

      const payload: SubmitAnswerPayload = {
        roomId,
        questionIndex,
        answer,
        timestamp: Date.now(),
      };

      getSocket().emit('submit_answer', payload);
    },
    [roomId, questionIndex, submittedAnswer, storeSubmitAnswer],
  );

  useEffect(() => {
    const socket = getSocket();

    const onQuestionStart = (payload: QuestionStartPayload) => {
      setQuestion(payload.question, payload.index, payload.totalQuestions, payload.timeLimit);
    };

    const onAnswerResult = (payload: AnswerResultPayload) => {
      setAnswerResult(
        {
          correct: payload.correct,
          firstCorrect: payload.firstCorrect,
          questionResult: payload.questionResult,
        },
        payload.scores,
      );
    };

    const onMatchEnd = (payload: MatchEndPayload) => {
      setMatchResult(payload);
      setTimeout(() => {
        router.push(`/result/${payload.matchId}`);
      }, 3000);
    };

    const onOpponentAnswered = () => setOpponentAnswered();
    const onOpponentLeft = () => setOpponentDisconnected(true);
    const onOpponentReconnected = () => setOpponentDisconnected(false);

    socket.on('question_start', onQuestionStart);
    socket.on('answer_result', onAnswerResult);
    socket.on('match_end', onMatchEnd);
    socket.on('opponent_answered', onOpponentAnswered);
    socket.on('opponent_left', onOpponentLeft);
    socket.on('opponent_reconnected', onOpponentReconnected);

    return () => {
      socket.off('question_start', onQuestionStart);
      socket.off('answer_result', onAnswerResult);
      socket.off('match_end', onMatchEnd);
      socket.off('opponent_answered', onOpponentAnswered);
      socket.off('opponent_left', onOpponentLeft);
      socket.off('opponent_reconnected', onOpponentReconnected);
    };
  }, [setQuestion, setAnswerResult, setMatchResult, setOpponentAnswered, setOpponentDisconnected, router]);

  return { submitAnswer };
}
