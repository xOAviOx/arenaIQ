import { Server } from 'socket.io';
import { prisma } from '@arenaiq/db';
import {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
  Question,
  QuestionResult,
  RatingChange,
} from '@arenaiq/types';
import { config } from '../config';
import { updateRatings } from './rating.service';
import { getQuestionsForMatch } from './question.service';
import { pickBotAnswer, botAnswerDelayMs } from './bot.service';
import { getRatingTier } from '../lib/tier';

export interface RoomState {
  roomId: string;
  matchId: string;
  player1: { userId: string; socketId: string; username: string; rating: number };
  player2: { userId: string; socketId: string; username: string; rating: number };
  questions: Question[];
  currentIndex: number;
  scores: { player1: number; player2: number };
  answers: Map<number, { player1?: number; player2?: number; firstCorrect?: string }>;
  timer: NodeJS.Timeout | null;
  status: 'waiting' | 'in_progress' | 'completed';
  disconnectedPlayers: Map<string, NodeJS.Timeout>;
  /** Present when player2 is a CPU bot — the bot auto-answers each question. */
  bot?: { userId: string; rating: number };
  /** False for casual friend matches — ratings and W/L are left untouched. */
  ranked: boolean;
  /** Fired exactly once when the match ends (e.g. to free a reserved bot). */
  onEnd?: () => void;
}

const activeRooms = new Map<string, RoomState>();

type IoType = Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

export function getRoom(roomId: string): RoomState | undefined {
  return activeRooms.get(roomId);
}

export async function createRoom(
  io: IoType,
  player1: RoomState['player1'],
  player2: RoomState['player2'],
): Promise<string> {
  const roomId = `room_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const dbMatch = await prisma.match.create({
    data: {
      player1Id: player1.userId,
      player2Id: player2.userId,
      status: 'IN_PROGRESS',
    },
  });

  const questions = await getQuestionsForMatch();

  const room: RoomState = {
    roomId,
    matchId: dbMatch.id,
    player1,
    player2,
    questions,
    currentIndex: 0,
    scores: { player1: 0, player2: 0 },
    answers: new Map(),
    timer: null,
    status: 'waiting',
    disconnectedPlayers: new Map(),
    ranked: true,
  };

  activeRooms.set(roomId, room);
  return roomId;
}

/** A player as needed to launch + announce a match (rating snapshot included). */
export interface LaunchPlayer {
  userId: string;
  socketId: string;
  username: string;
  rating: number;
  wins: number;
  losses: number;
}

interface LaunchOptions {
  /** Casual (friend) matches pass false so ratings/stats stay untouched. */
  ranked?: boolean;
  /** Mark player2 as a bot so it auto-answers. */
  bot?: { userId: string; rating: number };
  /** Cleanup fired once when the match ends (e.g. release a reserved bot). */
  onEnd?: () => void;
}

/**
 * Single entry point that both matchmaking and private rooms use to turn two
 * resolved players into a live battle: creates the room, joins the sockets,
 * emits `match_found` to each side, and schedules the first question.
 * Returns the room id, or null if a required human socket vanished.
 */
export async function launchMatch(
  io: IoType,
  p1: LaunchPlayer,
  p2: LaunchPlayer,
  opts: LaunchOptions = {},
): Promise<string | null> {
  const roomId = await createRoom(
    io,
    { userId: p1.userId, socketId: p1.socketId, username: p1.username, rating: p1.rating },
    { userId: p2.userId, socketId: p2.socketId, username: p2.username, rating: p2.rating },
  );

  const room = activeRooms.get(roomId);
  if (!room) return null;

  room.ranked = opts.ranked ?? true;
  if (opts.bot) room.bot = opts.bot;
  if (opts.onEnd) room.onEnd = opts.onEnd;

  const p1IsBot = opts.bot?.userId === p1.userId;
  const p2IsBot = opts.bot?.userId === p2.userId;
  const p1Socket = io.sockets.sockets.get(p1.socketId);
  const p2Socket = io.sockets.sockets.get(p2.socketId);

  // A human without a live socket can't battle (bots legitimately have none).
  if ((!p1Socket && !p1IsBot) || (!p2Socket && !p2IsBot)) {
    activeRooms.delete(roomId);
    opts.onEnd?.();
    return null;
  }

  if (p1Socket) {
    p1Socket.join(roomId);
    p1Socket.data.roomId = roomId;
    p1Socket.data.roomCode = undefined;
  }
  if (p2Socket) {
    p2Socket.join(roomId);
    p2Socket.data.roomId = roomId;
    p2Socket.data.roomCode = undefined;
  }

  emitMatchFound(io, p1.socketId, roomId, p2, p2IsBot, room.ranked);
  emitMatchFound(io, p2.socketId, roomId, p1, p1IsBot, room.ranked);

  setTimeout(() => startBattle(io, roomId), config.battle.matchStartDelay);
  return roomId;
}

function emitMatchFound(
  io: IoType,
  toSocketId: string,
  roomId: string,
  opponent: LaunchPlayer,
  opponentIsBot: boolean,
  ranked: boolean,
): void {
  io.to(toSocketId).emit('match_found', {
    roomId,
    opponent: {
      id: opponent.userId,
      username: opponent.username,
      rating: opponent.rating,
      tier: getRatingTier(opponent.rating),
      wins: opponent.wins,
      losses: opponent.losses,
      ...(opponentIsBot ? { isBot: true } : {}),
    },
    startsIn: config.battle.matchStartDelay,
    ranked,
  });
}

export function startBattle(io: IoType, roomId: string): void {
  const room = activeRooms.get(roomId);
  if (!room || room.status !== 'waiting') return;

  room.status = 'in_progress';
  sendNextQuestion(io, roomId);
}

function sendNextQuestion(io: IoType, roomId: string): void {
  const room = activeRooms.get(roomId);
  if (!room || room.status !== 'in_progress') return;

  if (room.currentIndex >= config.battle.totalQuestions) {
    endMatch(io, roomId, null);
    return;
  }

  const question = room.questions[room.currentIndex];
  if (!question) {
    endMatch(io, roomId, null);
    return;
  }

  // Strip answer before sending to clients
  const { correctOption, explanation, ...questionForBattle } = question;
  void correctOption; // used server-side only
  void explanation;

  io.to(roomId).emit('question_start', {
    question: questionForBattle,
    index: room.currentIndex,
    totalQuestions: config.battle.totalQuestions,
    timeLimit: config.battle.questionTimeLimit,
  });

  // Server-authoritative timer
  room.timer = setTimeout(() => {
    handleTimerExpiry(io, roomId);
  }, config.battle.questionTimeLimit * 1000);

  // If player2 is a bot, schedule its answer for this question.
  if (room.bot) scheduleBotAnswer(io, roomId, room.currentIndex, question);
}

/** Queue the bot's answer for a question after a human-like thinking delay. */
function scheduleBotAnswer(
  io: IoType,
  roomId: string,
  questionIndex: number,
  question: Question,
): void {
  const room = activeRooms.get(roomId);
  if (!room || !room.bot) return;

  const answer = pickBotAnswer(question, room.bot.rating);
  const delay = botAnswerDelayMs(config.battle.questionTimeLimit);

  setTimeout(() => {
    const current = activeRooms.get(roomId);
    if (!current || !current.bot) return;
    if (current.status !== 'in_progress' || current.currentIndex !== questionIndex) return;
    handleAnswer(io, roomId, current.bot.userId, questionIndex, answer);
  }, delay);
}

export function handleAnswer(
  io: IoType,
  roomId: string,
  userId: string,
  questionIndex: number,
  answer: number,
): void {
  const room = activeRooms.get(roomId);
  if (!room || room.status !== 'in_progress') return;
  if (questionIndex !== room.currentIndex) return;

  const question = room.questions[questionIndex];
  if (!question) return;

  const isPlayer1 = room.player1.userId === userId;
  const playerKey = isPlayer1 ? 'player1' : 'player2';
  const opponentSocketId = isPlayer1 ? room.player2.socketId : room.player1.socketId;

  const existing = room.answers.get(questionIndex) ?? {};

  // Prevent double-answering
  if (existing[playerKey] !== undefined) return;

  existing[playerKey] = answer;

  const isCorrect = answer === question.correctOption;

  if (isCorrect && !existing.firstCorrect) {
    existing.firstCorrect = playerKey;
    room.scores[playerKey] += 1;
  }

  room.answers.set(questionIndex, existing);

  // Notify opponent that player answered (without revealing answer)
  io.to(opponentSocketId).emit('opponent_answered', { questionIndex });

  const bothAnswered =
    existing.player1 !== undefined && existing.player2 !== undefined;

  if (bothAnswered || (isCorrect && existing.firstCorrect === playerKey)) {
    // If first correct, wait for opponent briefly or move on
    const bothDone = existing.player1 !== undefined && existing.player2 !== undefined;
    if (bothDone || existing.firstCorrect) {
      resolveQuestion(io, roomId, questionIndex);
    }
  }
}

function handleTimerExpiry(io: IoType, roomId: string): void {
  const room = activeRooms.get(roomId);
  if (!room) return;
  resolveQuestion(io, roomId, room.currentIndex);
}

function resolveQuestion(io: IoType, roomId: string, questionIndex: number): void {
  const room = activeRooms.get(roomId);
  if (!room || room.status !== 'in_progress') return;
  if (questionIndex !== room.currentIndex) return;

  if (room.timer) {
    clearTimeout(room.timer);
    room.timer = null;
  }

  const question = room.questions[questionIndex];
  if (!question) return;

  const existing = room.answers.get(questionIndex) ?? {};

  const questionResult: QuestionResult = {
    id: question.id,
    latexQuestion: question.latexQuestion,
    options: question.options,
    subject: question.subject,
    topic: question.topic,
    difficulty: question.difficulty,
    year: question.year,
    source: question.source,
    correctOption: question.correctOption,
    explanation: question.explanation,
    player1Answer: existing.player1 ?? null,
    player2Answer: existing.player2 ?? null,
    firstCorrect: existing.firstCorrect as 'player1' | 'player2' | null ?? null,
  };

  // Emit result to each player with their perspective
  const emitResult = (socketId: string, playerKey: 'player1' | 'player2') => {
    const opponentKey = playerKey === 'player1' ? 'player2' : 'player1';
    const myAnswer = existing[playerKey];
    const isCorrect = myAnswer !== undefined && myAnswer === question.correctOption;
    const firstCorrect = existing.firstCorrect
      ? existing.firstCorrect === playerKey
        ? 'you'
        : 'opponent'
      : null;

    io.to(socketId).emit('answer_result', {
      correct: isCorrect,
      firstCorrect: firstCorrect as 'you' | 'opponent' | null,
      scores: {
        you: room.scores[playerKey],
        opponent: room.scores[opponentKey],
      },
      questionResult,
      nextIn: config.battle.betweenQuestionsDelay,
    });
  };

  emitResult(room.player1.socketId, 'player1');
  emitResult(room.player2.socketId, 'player2');

  // Save to DB async. NOTE: a Prisma query is a lazy PrismaPromise — it only
  // runs when awaited or chained with .then/.catch. A bare `void prisma...` never
  // executes, so we chain .catch to fire the query and surface any error.
  prisma.matchQuestion
    .create({
      data: {
        matchId: room.matchId,
        questionId: question.id,
        questionIndex,
        player1Answer: existing.player1 ?? null,
        player2Answer: existing.player2 ?? null,
        firstCorrect: existing.firstCorrect ?? null,
      },
    })
    .catch((err) => console.error('Failed to save match question:', err));

  room.currentIndex++;

  // Check if match is over
  const maxPossibleRemaining = config.battle.totalQuestions - room.currentIndex;
  const p1Score = room.scores.player1;
  const p2Score = room.scores.player2;
  const neededToWin = Math.ceil(config.battle.totalQuestions / 2) + 1;

  if (p1Score >= neededToWin || p2Score >= neededToWin || room.currentIndex >= config.battle.totalQuestions) {
    setTimeout(() => endMatch(io, roomId, null), config.battle.betweenQuestionsDelay);
    return;
  }

  void maxPossibleRemaining;
  setTimeout(() => sendNextQuestion(io, roomId), config.battle.betweenQuestionsDelay);
}

async function endMatch(io: IoType, roomId: string, forcedWinnerId: string | null): Promise<void> {
  const room = activeRooms.get(roomId);
  if (!room || room.status === 'completed') return;

  room.status = 'completed';

  if (room.timer) {
    clearTimeout(room.timer);
    room.timer = null;
  }

  // Free any reserved bot exactly once — even if rating updates throw below.
  const onEnd = room.onEnd;
  room.onEnd = undefined;

  try {
  let winnerId: string | null = forcedWinnerId;

  if (!forcedWinnerId) {
    if (room.scores.player1 > room.scores.player2) {
      winnerId = room.player1.userId;
    } else if (room.scores.player2 > room.scores.player1) {
      winnerId = room.player2.userId;
    }
    // null = draw
  }

  let ratingResult: { player1Change: RatingChange; player2Change: RatingChange };

  if (room.ranked) {
    await prisma.match.update({
      where: { id: room.matchId },
      data: { winnerId },
    });

    ratingResult = await updateRatings(
      room.matchId,
      room.player1.userId,
      room.player2.userId,
      winnerId,
    );
  } else {
    // Casual friend match: record the result but leave ratings + W/L alone.
    await prisma.match.update({
      where: { id: room.matchId },
      data: { winnerId, status: 'COMPLETED', completedAt: new Date(), ratingDelta: 0 },
    });

    ratingResult = {
      player1Change: { before: room.player1.rating, after: room.player1.rating, delta: 0 },
      player2Change: { before: room.player2.rating, after: room.player2.rating, delta: 0 },
    };
  }

  const breakdown = Array.from({ length: room.currentIndex }, (_, i) => {
    const q = room.questions[i]!;
    const existing = room.answers.get(i) ?? {};
    return {
      id: q.id,
      latexQuestion: q.latexQuestion,
      options: q.options,
      subject: q.subject,
      topic: q.topic,
      difficulty: q.difficulty,
      year: q.year,
      source: q.source,
      correctOption: q.correctOption,
      explanation: q.explanation,
      player1Answer: existing.player1 ?? null,
      player2Answer: existing.player2 ?? null,
      firstCorrect: existing.firstCorrect as 'player1' | 'player2' | null ?? null,
    };
  });

  const emitMatchEnd = (socketId: string, playerKey: 'player1' | 'player2') => {
    const opponentKey = playerKey === 'player1' ? 'player2' : 'player1';
    io.to(socketId).emit('match_end', {
      winnerId,
      loserIdOrNull: winnerId
        ? winnerId === room[playerKey].userId
          ? room[opponentKey].userId
          : room[playerKey].userId
        : null,
      isDraw: winnerId === null,
      yourRating: playerKey === 'player1' ? ratingResult.player1Change : ratingResult.player2Change,
      opponentRating: playerKey === 'player1' ? ratingResult.player2Change : ratingResult.player1Change,
      breakdown,
      matchId: room.matchId,
    });
  };

  emitMatchEnd(room.player1.socketId, 'player1');
  emitMatchEnd(room.player2.socketId, 'player2');
  } finally {
    onEnd?.();
  }

  // Clean up room after a delay
  setTimeout(() => activeRooms.delete(roomId), 60000);
}

/** A player forfeits — their opponent is awarded the win immediately. */
export function handleResign(io: IoType, roomId: string, userId: string): void {
  const room = activeRooms.get(roomId);
  if (!room || room.status === 'completed') return;
  if (room.player1.userId !== userId && room.player2.userId !== userId) return;

  const opponentId =
    room.player1.userId === userId ? room.player2.userId : room.player1.userId;

  void endMatch(io, roomId, opponentId);
}

const MAX_CHAT_LENGTH = 240;
const CHAT_MIN_INTERVAL_MS = 350;
const lastChatAt = new Map<string, number>();

/** Relay an in-match chat message to both participants (sender included). */
export function handleChat(io: IoType, roomId: string, userId: string, raw: string): void {
  const room = activeRooms.get(roomId);
  if (!room) return;

  const isPlayer1 = room.player1.userId === userId;
  const isPlayer2 = room.player2.userId === userId;
  if (!isPlayer1 && !isPlayer2) return;

  const message = (raw ?? '').replace(/\s+/g, ' ').trim().slice(0, MAX_CHAT_LENGTH);
  if (!message) return;

  // Lightweight per-user spam throttle.
  const now = Date.now();
  const last = lastChatAt.get(userId) ?? 0;
  if (now - last < CHAT_MIN_INTERVAL_MS) return;
  lastChatAt.set(userId, now);

  const username = isPlayer1 ? room.player1.username : room.player2.username;

  io.to(roomId).emit('chat_message', {
    senderId: userId,
    username,
    message,
    timestamp: now,
  });
}

export function handleDisconnect(io: IoType, roomId: string, userId: string): void {
  const room = activeRooms.get(roomId);
  if (!room || room.status === 'completed') return;

  io.to(roomId).emit('opponent_left');

  const reconnectTimer = setTimeout(async () => {
    if (room.status !== 'completed') {
      const opponentId =
        room.player1.userId === userId ? room.player2.userId : room.player1.userId;
      await endMatch(io, roomId, opponentId);
    }
  }, config.battle.reconnectWindow);

  room.disconnectedPlayers.set(userId, reconnectTimer);
}

export function handleReconnect(io: IoType, roomId: string, userId: string, newSocketId: string): void {
  const room = activeRooms.get(roomId);
  if (!room) return;

  const reconnectTimer = room.disconnectedPlayers.get(userId);
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    room.disconnectedPlayers.delete(userId);
  }

  if (room.player1.userId === userId) {
    room.player1.socketId = newSocketId;
  } else if (room.player2.userId === userId) {
    room.player2.socketId = newSocketId;
  }

  io.to(roomId).emit('opponent_reconnected');

  // Re-send current question state
  if (room.status === 'in_progress' && room.currentIndex < room.questions.length) {
    const question = room.questions[room.currentIndex]!;
    const { correctOption, explanation, ...questionForBattle } = question;
    void correctOption;
    void explanation;

    io.to(newSocketId).emit('question_start', {
      question: questionForBattle,
      index: room.currentIndex,
      totalQuestions: config.battle.totalQuestions,
      timeLimit: config.battle.questionTimeLimit,
    });
  }
}
