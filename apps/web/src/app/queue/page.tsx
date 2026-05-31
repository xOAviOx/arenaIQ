'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQueue } from '@/hooks/useQueue';
import { useQueueStore } from '@/store/queueStore';
import { QueueStatus } from '@/components/queue/QueueStatus';
import { MatchFoundModal } from '@/components/queue/MatchFoundModal';
import { BrandMark } from '@/components/shared/BrandMark';

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
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="stagger mb-10" style={{ ['--i' as string]: 0 }}>
        <BrandMark size="lg" />
      </div>

      <div className="w-full max-w-md">
        {status === 'queuing' && <QueueStatus onCancel={handleCancel} />}
        {status === 'idle' && (
          <p className="shimmer-text text-center font-mono text-sm">Initializing matchmaking…</p>
        )}
      </div>

      {status === 'matched' && opponent && (
        <MatchFoundModal opponent={opponent} startsIn={matchStartsIn} />
      )}
    </main>
  );
}
