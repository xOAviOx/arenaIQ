// Temporary end-to-end test: play a full match, A answers correctly, B answers wrong.
const fs = require('fs');
const { io } = require('socket.io-client');
const URL = 'http://localhost:4000';
const qmap = JSON.parse(fs.readFileSync(require('path').join(__dirname, 'qmap.json'), 'utf8'));

const state = { A: {}, B: {} };

function mkClient(name, userId, answerCorrect) {
  let roomId = null;
  const s = io(URL, { transports: ['websocket', 'polling'], withCredentials: true });
  s.on('connect', () => { s.emit('join_queue', { userId, rating: 1200 }); });
  s.on('match_found', (p) => { roomId = p.roomId; console.log(`[${name}] match_found room=${p.roomId} vs ${p.opponent.username}`); });
  s.on('question_start', (p) => {
    const correct = qmap[p.question.id];
    const answer = answerCorrect ? correct : (correct + 1) % p.question.options.length;
    s.emit('submit_answer', { roomId, questionIndex: p.index, answer, timestamp: Date.now() });
  });
  s.on('match_end', (p) => {
    state[name].matchEnd = { winnerId: p.winnerId, isDraw: p.isDraw, your: p.yourRating, opp: p.opponentRating, matchId: p.matchId };
    console.log(`[${name}] MATCH_END winner=${p.winnerId} yourRating ${p.yourRating.before}->${p.yourRating.after} (Δ${p.yourRating.delta})`);
  });
  s.on('error', (e) => console.log(`[${name}] error: ${e}`));
  return s;
}

const a = mkClient('A', 'mm_test_a', true);   // answers correctly -> should win
const b = mkClient('B', 'mm_test_b', false);  // answers wrong -> should lose

setTimeout(() => {
  const done = state.A.matchEnd && state.B.matchEnd;
  console.log('--- RESULT ---');
  console.log(JSON.stringify(state, null, 2));
  console.log(done ? 'MATCH COMPLETED' : 'TIMEOUT: match did not finish');
  a.close(); b.close();
  process.exit(done ? 0 : 1);
}, 60000);
