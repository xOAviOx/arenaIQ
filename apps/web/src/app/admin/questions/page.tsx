import { prisma } from '@arenaiq/db';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { Subject } from '@arenaiq/types';
import { SubjectTag } from '@/components/shared/SubjectTag';
import { Plus, Settings } from 'lucide-react';

export default async function AdminQuestionsPage() {
  const clerkUser = await currentUser();
  if (!clerkUser) redirect('/login');

  const questions = await prisma.question.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
  });

  return (
    <main className="min-h-screen bg-arena-bg">
      <div className="mx-auto max-w-5xl p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-arena-accent" />
            <h1 className="text-xl font-bold text-white">Question Bank</h1>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span className="font-semibold text-white">{questions.length}</span> questions
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-arena-border">
          <table className="w-full">
            <thead>
              <tr className="border-b border-arena-border bg-arena-surface/80">
                <th className="p-4 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Question
                </th>
                <th className="p-4 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Subject
                </th>
                <th className="p-4 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Difficulty
                </th>
                <th className="p-4 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-arena-border">
              {questions.map((q) => (
                <tr key={q.id} className="hover:bg-arena-surface/50">
                  <td className="max-w-xs p-4">
                    <p className="truncate text-sm text-slate-200">{q.topic}</p>
                    <p className="mt-0.5 truncate text-xs text-slate-500">
                      {q.latexQuestion.slice(0, 80)}...
                    </p>
                  </td>
                  <td className="p-4">
                    <SubjectTag subject={q.subject as Subject} />
                  </td>
                  <td className="p-4">
                    <span
                      className={
                        q.difficulty === 'EASY'
                          ? 'text-emerald-400'
                          : q.difficulty === 'MEDIUM'
                            ? 'text-yellow-400'
                            : 'text-red-400'
                      }
                    >
                      {q.difficulty}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={
                        q.isActive
                          ? 'text-xs text-emerald-400'
                          : 'text-xs text-slate-500'
                      }
                    >
                      {q.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
