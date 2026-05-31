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
  ChatMessagePayload,
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
    addChatMessage,
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

  const resign = useCallback(() => {
    getSocket().emit('resign', { roomId });
  }, [roomId]);

  const sendChat = useCallback(
    (message: string) => {
      const trimmed = message.trim();
      if (!trimmed) return;
      getSocket().emit('send_chat', { roomId, message: trimmed });
    },
    [roomId],
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

    const onChatMessage = (payload: ChatMessagePayload) => {
      // Only two participants — if it isn't the opponent, it's me.
      const opponentId = useBattleStore.getState().opponent?.id;
      addChatMessage({
        id:
          typeof crypto !== 'undefined' && 'randomUUID' in crypto
            ? crypto.randomUUID()
            : `${payload.timestamp}-${Math.random()}`,
        mine: payload.senderId !== opponentId,
        username: payload.username,
        message: payload.message,
        timestamp: payload.timestamp,
      });
    };

    socket.on('question_start', onQuestionStart);
    socket.on('answer_result', onAnswerResult);
    socket.on('match_end', onMatchEnd);
    socket.on('opponent_answered', onOpponentAnswered);
    socket.on('opponent_left', onOpponentLeft);
    socket.on('opponent_reconnected', onOpponentReconnected);
    socket.on('chat_message', onChatMessage);

    return () => {
      socket.off('question_start', onQuestionStart);
      socket.off('answer_result', onAnswerResult);
      socket.off('match_end', onMatchEnd);
      socket.off('opponent_answered', onOpponentAnswered);
      socket.off('opponent_left', onOpponentLeft);
      socket.off('opponent_reconnected', onOpponentReconnected);
      socket.off('chat_message', onChatMessage);
    };
  }, [
    setQuestion,
    setAnswerResult,
    setMatchResult,
    setOpponentAnswered,
    setOpponentDisconnected,
    addChatMessage,
    router,
  ]);

  return { submitAnswer, resign, sendChat };
}
