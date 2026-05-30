const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
  const match = await prisma.match.findFirst({ where: { player1Id: { startsWith: 'mm_test_' } } });
  const q = await prisma.question.findFirst();
  console.log('match:', match && match.id, 'question:', q && q.id);
  try {
    const mq = await prisma.matchQuestion.create({
      data: {
        matchId: match.id,
        questionId: q.id,
        questionIndex: 0,
        player1Answer: 1,
        player2Answer: 2,
        firstCorrect: 'player1',
      },
    });
    console.log('CREATE OK:', mq.id);
    await prisma.matchQuestion.delete({ where: { id: mq.id } });
    console.log('(cleaned up)');
  } catch (e) {
    console.log('CREATE FAILED:', e.constructor.name);
    console.log(e.message);
  } finally {
    await prisma.$disconnect();
  }
})();
