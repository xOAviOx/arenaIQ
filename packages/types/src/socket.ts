import { PublicUser, QuestionForBattle, QuestionResult, RatingChange } from './models';

// ── Client → Server ────────────────────────────────────────────

export interface JoinQueuePayload {
  userId: string;
  rating: number;
}

export interface LeaveQueuePayload {
  userId: string;
}

export interface SubmitAnswerPayload {
  roomId: string;
  questionIndex: number;
  answer: number;
  timestamp: number;
}

export interface ReconnectPayload {
  roomId: string;
  userId: string;
}

// ── Server → Client ────────────────────────────────────────────

export interface MatchFoundPayload {
  roomId: string;
  opponent: PublicUser;
  startsIn: number; // ms countdown before first question
}

export interface QueueStatusPayload {
  position: number;
  estimatedWait: number; // seconds
  playersOnline: number;
}

export interface QuestionStartPayload {
  question: QuestionForBattle;
  index: number;
  totalQuestions: number;
  timeLimit: number; // seconds
}

export interface AnswerResultPayload {
  correct: boolean;
  firstCorrect: 'you' | 'opponent' | null;
  scores: {
    you: number;
    opponent: number;
  };
  questionResult: QuestionResult;
  nextIn: number; // ms until next question
}

export interface MatchEndPayload {
  winnerId: string | null;
  loserIdOrNull: string | null;
  isDraw: boolean;
  yourRating: RatingChange;
  opponentRating: RatingChange;
  breakdown: QuestionResult[];
  matchId: string;
}

export interface OpponentAnsweredPayload {
  questionIndex: number;
  // we don't reveal which answer, only that they answered
}

export interface TimerSyncPayload {
  questionIndex: number;
  remainingMs: number;
}

// ── Typed event maps ───────────────────────────────────────────

export interface ServerToClientEvents {
  match_found: (payload: MatchFoundPayload) => void;
  queue_status: (payload: QueueStatusPayload) => void;
  question_start: (payload: QuestionStartPayload) => void;
  answer_result: (payload: AnswerResultPayload) => void;
  match_end: (payload: MatchEndPayload) => void;
  opponent_answered: (payload: OpponentAnsweredPayload) => void;
  opponent_left: () => void;
  opponent_reconnected: () => void;
  timer_sync: (payload: TimerSyncPayload) => void;
  error: (message: string) => void;
}

export interface ClientToServerEvents {
  join_queue: (payload: JoinQueuePayload) => void;
  leave_queue: (payload: LeaveQueuePayload) => void;
  submit_answer: (payload: SubmitAnswerPayload) => void;
  reconnect_battle: (payload: ReconnectPayload) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  userId: string;
  roomId?: string;
}
