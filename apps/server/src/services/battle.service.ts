import { Server } from 'socket.io';
import { prisma } from '@arenaiq/db';
import {
  ServerToClientEvents,
  ClientToServerEvents,
  InterServerEvents,
  SocketData,
  Question,
  QuestionResult,
} from '@arenaiq/types';
import { config } from '../config';
import { updateRatings } from './rating.service';
import { getQuestionsForMatch } from './question.service';

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
  };

  activeRooms.set(roomId, room);
  return roomId;
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

  // Save to DB async
  void prisma.matchQuestion.create({
    data: {
      matchId: room.matchId,
      questionId: question.id,
      questionIndex,
      player1Answer: existing.player1 ?? null,
      player2Answer: existing.player2 ?? null,
      firstCorrect: existing.firstCorrect ?? null,
    },
  });

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

  let winnerId: string | null = forcedWinnerId;

  if (!forcedWinnerId) {
    if (room.scores.player1 > room.scores.player2) {
      winnerId = room.player1.userId;
    } else if (room.scores.player2 > room.scores.player1) {
      winnerId = room.player2.userId;
    }
    // null = draw
  }

  await prisma.match.update({
    where: { id: room.matchId },
    data: { winnerId },
  });

  const ratingResult = await updateRatings(
    room.matchId,
    room.player1.userId,
    room.player2.userId,
    winnerId,
  );

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

  // Clean up room after a delay
  setTimeout(() => activeRooms.delete(roomId), 60000);
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
