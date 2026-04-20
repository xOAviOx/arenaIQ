'use client';

import { useRouter } from 'next/navigation';
import { Swords } from 'lucide-react';

interface FindMatchButtonProps {
  userId: string;
  rating: number;
}

export function FindMatchButton({ userId, rating }: FindMatchButtonProps) {
  const router = useRouter();

  const handleFindMatch = () => {
    router.push(`/queue?userId=${userId}&rating=${rating}`);
  };

  return (
    <button
      onClick={handleFindMatch}
      className="group relative w-full overflow-hidden rounded-2xl bg-gradient-to-r from-arena-accent to-purple-700 p-px shadow-lg shadow-arena-accent/30 transition-all hover:shadow-arena-accent/50"
    >
      <div className="flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-arena-accent to-purple-700 px-6 py-5 transition-all group-hover:from-arena-accent/90 group-hover:to-purple-700/90">
        <Swords className="h-6 w-6 text-white" />
        <span className="text-lg font-bold text-white">Find a Match</span>
      </div>
    </button>
  );
}
