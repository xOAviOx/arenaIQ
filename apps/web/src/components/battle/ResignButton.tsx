'use client';

import { useState } from 'react';
import { Flag } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ResignButtonProps {
  onResign: () => void;
  className?: string;
}

export function ResignButton({ onResign, className }: ResignButtonProps) {
  const [confirming, setConfirming] = useState(false);
  const [done, setDone] = useState(false);

  const handleConfirm = () => {
    setDone(true);
    onResign();
  };

  if (done) {
    return (
      <span className={cn('font-mono text-xs text-arena-red', className)}>Forfeiting…</span>
    );
  }

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className={cn(
          'flex items-center gap-1.5 rounded-xl border border-arena-line px-3 py-1.5 text-xs font-medium text-arena-dim transition-colors hover:border-arena-red/50 hover:text-arena-red',
          className,
        )}
      >
        <Flag className="h-3.5 w-3.5" />
        Resign
      </button>
    );
  }

  return (
    <div className={cn('flex animate-pop-in items-center gap-2', className)}>
      <span className="font-mono text-xs text-arena-dim">Forfeit match?</span>
      <button
        onClick={handleConfirm}
        className="rounded-lg bg-arena-red px-2.5 py-1 text-xs font-bold text-white transition-opacity hover:opacity-90"
      >
        Resign
      </button>
      <button
        onClick={() => setConfirming(false)}
        className="rounded-lg border border-arena-line px-2.5 py-1 text-xs text-arena-dim transition-colors hover:text-arena-text"
      >
        Stay
      </button>
    </div>
  );
}
