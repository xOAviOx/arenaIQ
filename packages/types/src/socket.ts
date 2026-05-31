import { PublicUser, QuestionForBattle, QuestionResult, RatingChange } from './models';
import { RatingTier } from './enums';

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

export interface ResignPayload {
  roomId: string;
}

export interface SendChatPayload {
  roomId: string;
  message: string;
}

// ── Private rooms (play with a friend) ─────────────────────────

export interface CreateRoomPayload {
  userId: string;
}

export interface JoinRoomPayload {
  userId: string;
  code: string;
}

/** Used by both start_room and leave_room — only the room code is needed. */
export interface RoomActionPayload {
  code: string;
}

// ── Server → Client ────────────────────────────────────────────

export interface MatchFoundPayload {
  roomId: string;
  opponent: PublicUser;
  startsIn: number; // ms countdown before first question
  /** False for casual friend matches (no rating change). Defaults to ranked. */
  ranked?: boolean;
}

export interface RoomLobbyPlayer {
  userId: string;
  username: string;
  rating: number;
  tier: RatingTier;
  isHost: boolean;
}

/** Snapshot of a private-room lobby, sent to everyone in it on every change. */
export interface RoomLobbyPayload {
  code: string;
  players: RoomLobbyPlayer[];
  /** True once a guest has joined — the host may begin the battle. */
  canStart: boolean;
}

/** A non-fatal lobby message (bad code, not host, friend not joined yet). */
export interface RoomErrorPayload {
  message: string;
}

/** The lobby was dissolved (host left/disconnected) — clients should exit it. */
export interface RoomClosedPayload {
  message: string;
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

export interface ChatMessagePayload {
  senderId: string;
  username: string;
  message: string;
  timestamp: number;
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
  chat_message: (payload: ChatMessagePayload) => void;
  room_update: (payload: RoomLobbyPayload) => void;
  room_error: (payload: RoomErrorPayload) => void;
  room_closed: (payload: RoomClosedPayload) => void;
  error: (message: string) => void;
}

export interface ClientToServerEvents {
  join_queue: (payload: JoinQueuePayload) => void;
  leave_queue: (payload: LeaveQueuePayload) => void;
  submit_answer: (payload: SubmitAnswerPayload) => void;
  reconnect_battle: (payload: ReconnectPayload) => void;
  resign: (payload: ResignPayload) => void;
  send_chat: (payload: SendChatPayload) => void;
  create_room: (payload: CreateRoomPayload) => void;
  join_room: (payload: JoinRoomPayload) => void;
  start_room: (payload: RoomActionPayload) => void;
  leave_room: (payload: RoomActionPayload) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  userId: string;
  roomId?: string;
  /** Code of the private-room lobby this socket is currently sitting in. */
  roomCode?: string;
}
