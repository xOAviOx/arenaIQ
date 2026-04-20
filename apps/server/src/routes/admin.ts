import { Router, Request, Response } from 'express';
import { prisma } from '@arenaiq/db';
import { z } from 'zod';

const router = Router();

const QuestionSchema = z.object({
  latexQuestion: z.string().min(1),
  options: z.array(z.string()).length(4),
  correctOption: z.number().min(0).max(3),
  subject: z.enum(['PHYSICS', 'CHEMISTRY', 'MATHEMATICS', 'BIOLOGY']),
  topic: z.string().min(1),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
  year: z.number().optional(),
  source: z.enum(['JEE_MAINS', 'JEE_ADVANCED', 'NEET', 'CUSTOM']),
  explanation: z.string().optional(),
});

router.get('/questions', async (_req: Request, res: Response) => {
  const questions = await prisma.question.findMany({
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
  res.json(questions);
});

router.post('/questions', async (req: Request, res: Response) => {
  const parsed = QuestionSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const question = await prisma.question.create({ data: parsed.data });
  res.status(201).json(question);
});

router.patch('/questions/:id', async (req: Request, res: Response) => {
  const parsed = QuestionSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const question = await prisma.question.update({
    where: { id: req.params['id'] },
    data: parsed.data,
  });
  res.json(question);
});

router.delete('/questions/:id', async (req: Request, res: Response) => {
  await prisma.question.update({
    where: { id: req.params['id'] },
    data: { isActive: false },
  });
  res.status(204).send();
});

export default router;
