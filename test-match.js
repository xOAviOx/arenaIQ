// Verbose end-to-end match test.
const fs = require('fs');
const path = require('path');
const { io } = require('socket.io-client');
const URL = 'http://localhost:4000';
const qmap = JSON.parse(fs.readFileSync(path.join(__dirname, 'qmap.json'), 'utf8'));
const t0 = Date.now();
const ts = () => `+${((Date.now() - t0) / 1000).toFixed(1)}s`;
const state = { A: {}, B: {} };

function mkClient(name, userId, answerCorrect) {
  let roomId = null;
  const s = io(URL, { transports: ['websocket', 'polling'], withCredentials: true });
  s.on('connect', () => { console.log(`${ts()} [${name}] connect ${s.id}`); s.emit('join_queue', { userId, rating: 1200 }); });
  s.on('queue_status', (p) => console.log(`${ts()} [${name}] queue_status players=${p.playersOnline}`));
  s.on('match_found', (p) => { roomId = p.roomId; console.log(`${ts()} [${name}] match_found room=${p.roomId}`); });
  s.on('question_start', (p) => {
    const correct = qmap[p.question.id];
    const answer = answerCorrect ? correct : (correct + 1) % p.question.options.length;
    console.log(`${ts()} [${name}] question_start idx=${p.index} -> answering ${answer} (correct=${correct})`);
    s.emit('submit_answer', { roomId, questionIndex: p.index, answer, timestamp: Date.now() });
  });
  s.on('answer_result', (p) => console.log(`${ts()} [${name}] answer_result correct=${p.correct} scores you=${p.scores.you} opp=${p.scores.opponent}`));
  s.on('opponent_answered', () => console.log(`${ts()} [${name}] opponent_answered`));
  s.on('opponent_left', () => console.log(`${ts()} [${name}] opponent_left`));
  s.on('match_end', (p) => { state[name].matchEnd = p; console.log(`${ts()} [${name}] MATCH_END winner=${p.winnerId} Δ${p.yourRating.delta}`); });
  s.on('error', (e) => console.log(`${ts()} [${name}] error: ${e}`));
  s.on('disconnect', (r) => console.log(`${ts()} [${name}] disconnect: ${r}`));
  return s;
}

const a = mkClient('A', 'mm_test_a', true);
const b = mkClient('B', 'mm_test_b', false);

setTimeout(() => {
  const done = state.A.matchEnd && state.B.matchEnd;
  console.log(`--- ${done ? 'COMPLETED' : 'TIMEOUT'} ---`);
  a.close(); b.close();
  process.exit(0);
}, 45000);
