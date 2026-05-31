/* Temp e2e: verify in-match chat + resign over sockets. Deletes its own test data. */
require('dotenv').config(); // root .env -> DATABASE_URL
const { PrismaClient } = require('@prisma/client');
const { io } = require('socket.io-client');

const prisma = new PrismaClient();
const URL = 'http://localhost:4000';
const stamp = Date.now();

function connect() {
  return io(URL, { transports: ['websocket'], forceNew: true });
}
function once(sock, ev, timeout = 15000) {
  return new Promise((res, rej) => {
    const t = setTimeout(() => rej(new Error(`timeout waiting for ${ev}`)), timeout);
    sock.once(ev, (p) => { clearTimeout(t); res(p); });
  });
}

(async () => {
  let a, b, sa, sb, pass = true;
  const log = (ok, msg) => { if (!ok) pass = false; console.log(`${ok ? 'PASS' : 'FAIL'}  ${msg}`); };

  try {
    a = await prisma.user.create({ data: { clerkId: `t_a_${stamp}`, username: `tA_${stamp}`, email: `a_${stamp}@t.dev`, rating: 1200 } });
    b = await prisma.user.create({ data: { clerkId: `t_b_${stamp}`, username: `tB_${stamp}`, email: `b_${stamp}@t.dev`, rating: 1200 } });

    sa = connect(); sb = connect();
    await Promise.all([once(sa, 'connect'), once(sb, 'connect')]);

    const mfA = once(sa, 'match_found'), mfB = once(sb, 'match_found');
    sa.emit('join_queue', { userId: a.id, rating: 1200 });
    sb.emit('join_queue', { userId: b.id, rating: 1200 });
    const [foundA, foundB] = await Promise.all([mfA, mfB]);
    log(foundA.roomId === foundB.roomId, `matched into same room (${foundA.roomId})`);
    const roomId = foundA.roomId;

    // ---- CHAT ----
    const chatA = once(sa, 'chat_message'), chatB = once(sb, 'chat_message');
    sa.emit('send_chat', { roomId, message: '  GG   good   luck  ' }); // also tests whitespace squash
    const [cA, cB] = await Promise.all([chatA, chatB]);
    log(cA.message === 'GG good luck', `chat text normalized + delivered to sender ("${cA.message}")`);
    log(cB.message === 'GG good luck', `chat delivered to opponent ("${cB.message}")`);
    log(cB.senderId === a.id, 'chat senderId is the actual sender (A)');
    log(cB.username === a.username, `chat carries sender username (${cB.username})`);

    // ---- RESIGN ---- B forfeits, A must win
    const endA = once(sa, 'match_end'), endB = once(sb, 'match_end');
    sb.emit('resign', { roomId });
    const [eA, eB] = await Promise.all([endA, endB]);
    log(eA.winnerId === a.id, `resign: opponent (A) awarded the win`);
    log(eB.winnerId === a.id && eB.isDraw === false, 'resign: forfeiter (B) sees A as winner, not a draw');
  } catch (err) {
    log(false, `threw: ${err.message}`);
  } finally {
    try { sa && sa.close(); sb && sb.close(); } catch {}
    const ids = [a, b].filter(Boolean).map((u) => u.id);
    if (ids.length) {
      await prisma.match.deleteMany({ where: { OR: [{ player1Id: { in: ids } }, { player2Id: { in: ids } }] } });
      await prisma.user.deleteMany({ where: { id: { in: ids } } });
      console.log('cleanup: removed test users + matches');
    }
    await prisma.$disconnect();
    console.log(pass ? '\nALL PASS' : '\nSOME FAILED');
    process.exit(pass ? 0 : 1);
  }
})();
