import { prisma } from '@arenaiq/db';
import { Question, Subject } from '@arenaiq/types';
import { config } from '../config';

export async function getQuestionsForMatch(
  subject?: Subject,
): Promise<Question[]> {
  const where = {
    isActive: true,
    ...(subject ? { subject } : {}),
  };

  // Fetch more than needed and shuffle for randomness
  const pool = await prisma.question.findMany({
    where,
    take: 50,
    orderBy: { createdAt: 'asc' },
  });

  const shuffled = pool.sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, config.battle.totalQuestions);

  return selected.map((q) => ({
    id: q.id,
    latexQuestion: q.latexQuestion,
    options: q.options,
    correctOption: q.correctOption,
    subject: q.subject as Subject,
    topic: q.topic,
    difficulty: q.difficulty as any,
    year: q.year ?? undefined,
    source: q.source as any,
    explanation: q.explanation ?? undefined,
  }));
}
