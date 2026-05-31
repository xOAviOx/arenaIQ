'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Swords, Loader2 } from 'lucide-react';

interface FindMatchButtonProps {
  userId: string;
  rating: number;
}

export function FindMatchButton({ userId, rating }: FindMatchButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleFindMatch = () => {
    setLoading(true);
    router.push(`/queue?userId=${userId}&rating=${rating}`);
  };

  return (
    <button
      onClick={handleFindMatch}
      disabled={loading}
      className="group relative w-full overflow-hidden rounded-2xl bg-arena-volt px-6 py-5 text-[#0b0d14] shadow-volt transition-transform hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-80"
    >
      <span className="sheen-layer" aria-hidden />
      <span className="relative flex items-center justify-center gap-3">
        {loading ? (
          <Loader2 className="h-6 w-6 animate-spin" />
        ) : (
          <Swords className="h-6 w-6 transition-transform group-hover:rotate-12" />
        )}
        <span className="font-display text-lg font-extrabold tracking-tight">
          {loading ? 'Entering Arena…' : 'Find a Match'}
        </span>
      </span>
    </button>
  );
}
