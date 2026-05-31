import { io } from 'socket.io-client';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const SERVER = 'http://localhost:4000';
const HARD_TIMEOUT_MS = 150000;

function log(...a) {
  console.log(`[${((Date.now() - START) / 1000).toFixed(1)}s]`, ...a);
}
const START = Date.now();

const fail = (msg) => {
  console.error('❌ FAIL:', msg);
  process.exit(1);
};
const timer = setTimeout(() => fail('hard timeout — no match_end received'), HARD_TIMEOUT_MS);

// 1) Ensure a real human user exists to queue with.
const human = await prisma.user.upsert({
  where: { clerkId: 'e2e_human' },
  update: { isBot: false },
  create: {
    clerkId: 'e2e_human',
    username: 'E2E_Human',
    email: 'e2e_human@test.local',
    rating: 1200,
    isBot: false,
  },
});
log(`human ready: ${human.username} (${human.rating})`);

const socket = io(SERVER, { transports: ['websocket'] });
let matched = false;
let questionsSeen = 0;

socket.on('connect', () => {
  log('socket connected, joining queue (expect bot after ~8s alone)…');
  socket.emit('join_queue', { userId: human.id, rating: human.rating });
});

socket.on('match_found', (p) => {
  matched = true;
  log(`match_found vs "${p.opponent.username}" rating=${p.opponent.rating} isBot=${p.opponent.isBot}`);
  if (!p.opponent.isBot) fail('opponent is not a bot — expected bot fallback');
});

socket.on('question_start', (p) => {
  questionsSeen++;
  const answer = Math.floor(Math.random() * (p.question.options?.length ?? 4));
  log(`Q${p.index + 1}/${p.totalQuestions} → answering option ${answer}`);
  socket.emit('submit_answer', {
    roomId: p.roomId ?? CURRENT_ROOM,
    questionIndex: p.index,
    answer,
    timestamp: Date.now(),
  });
});

socket.on('answer_result', (p) => {
  log(`  result: you ${p.scores.you} – ${p.scores.opponent} opp (firstCorrect=${p.firstCorrect})`);
});

socket.on('match_end', async (p) => {
  log(`match_end: winnerId=${p.winnerId} isDraw=${p.isDraw} yourΔ=${p.yourRating.delta.toFixed(1)} questionsSeen=${questionsSeen}`);
  clearTimeout(timer);
  const ok = matched && questionsSeen >= 1;
  console.log(ok ? '✅ PASS — lonely human played a full bot match' : '❌ FAIL — incomplete');
  socket.disconnect();
  await prisma.$disconnect();
  process.exit(ok ? 0 : 1);
});

socket.on('error', (m) => log('server error event:', m));

// match_found carries roomId; capture it for submit_answer.
let CURRENT_ROOM = null;
socket.on('match_found', (p) => { CURRENT_ROOM = p.roomId; });
