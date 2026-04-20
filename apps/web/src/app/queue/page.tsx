'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQueue } from '@/hooks/useQueue';
import { useQueueStore } from '@/store/queueStore';
import { QueueStatus } from '@/components/queue/QueueStatus';
import { MatchFoundModal } from '@/components/queue/MatchFoundModal';
import { Swords } from 'lucide-react';

export default function QueuePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const userId = searchParams.get('userId') ?? '';
  const rating = parseInt(searchParams.get('rating') ?? '1200', 10);

  const { status, opponent, matchStartsIn } = useQueueStore();
  const { joinQueue, leaveQueue } = useQueue(userId, rating);

  useEffect(() => {
    if (!userId) {
      router.replace('/dashboard');
      return;
    }
    joinQueue();
    return () => {
      if (status === 'queuing') leaveQueue();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCancel = () => {
    leaveQueue();
    router.push('/dashboard');
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-arena-bg p-6">
      <div className="mb-8 flex items-center gap-2">
        <Swords className="h-7 w-7 text-arena-accent" />
        <span className="text-xl font-bold text-white">ArenaIQ</span>
      </div>

      <div className="w-full max-w-md">
        {status === 'queuing' && <QueueStatus onCancel={handleCancel} />}
        {status === 'idle' && (
          <div className="text-center text-slate-400">Initializing matchmaking...</div>
        )}
      </div>

      {status === 'matched' && opponent && (
        <MatchFoundModal opponent={opponent} startsIn={matchStartsIn} />
      )}
    </main>
  );
}
