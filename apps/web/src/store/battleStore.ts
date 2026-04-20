import { create } from 'zustand';
import { QuestionForBattle, QuestionResult, PublicUser, MatchEndPayload } from '@arenaiq/types';

type BattlePhase = 'idle' | 'starting' | 'question' | 'answer_reveal' | 'completed';

interface BattleState {
  roomId: string | null;
  matchId: string | null;
  opponent: PublicUser | null;
  phase: BattlePhase;
  currentQuestion: QuestionForBattle | null;
  questionIndex: number;
  totalQuestions: number;
  timeLimit: number;
  scores: { you: number; opponent: number };
  submittedAnswer: number | null;
  opponentAnswered: boolean;
  lastResult: {
    correct: boolean;
    firstCorrect: 'you' | 'opponent' | null;
    questionResult: QuestionResult;
  } | null;
  matchResult: MatchEndPayload | null;
  opponentDisconnected: boolean;

  // Actions
  initBattle: (roomId: string, opponent: PublicUser) => void;
  setQuestion: (question: QuestionForBattle, index: number, total: number, timeLimit: number) => void;
  submitAnswer: (answer: number) => void;
  setOpponentAnswered: () => void;
  setAnswerResult: (result: BattleState['lastResult'], scores: { you: number; opponent: number }) => void;
  setMatchResult: (result: MatchEndPayload) => void;
  setOpponentDisconnected: (value: boolean) => void;
  reset: () => void;
}

const initialState = {
  roomId: null,
  matchId: null,
  opponent: null,
  phase: 'idle' as BattlePhase,
  currentQuestion: null,
  questionIndex: 0,
  totalQuestions: 7,
  timeLimit: 90,
  scores: { you: 0, opponent: 0 },
  submittedAnswer: null,
  opponentAnswered: false,
  lastResult: null,
  matchResult: null,
  opponentDisconnected: false,
};

export const useBattleStore = create<BattleState>()((set) => ({
  ...initialState,

  initBattle: (roomId, opponent) =>
    set({ ...initialState, roomId, opponent, phase: 'starting' }),

  setQuestion: (question, index, total, timeLimit) =>
    set({
      phase: 'question',
      currentQuestion: question,
      questionIndex: index,
      totalQuestions: total,
      timeLimit,
      submittedAnswer: null,
      opponentAnswered: false,
      lastResult: null,
    }),

  submitAnswer: (answer) => set({ submittedAnswer: answer }),

  setOpponentAnswered: () => set({ opponentAnswered: true }),

  setAnswerResult: (result, scores) =>
    set({ phase: 'answer_reveal', lastResult: result, scores }),

  setMatchResult: (result) =>
    set({ phase: 'completed', matchResult: result, matchId: result.matchId }),

  setOpponentDisconnected: (value) => set({ opponentDisconnected: value }),

  reset: () => set(initialState),
}));
