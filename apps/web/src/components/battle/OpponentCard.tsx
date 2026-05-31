'use client';

import { PublicUser } from '@arenaiq/types';
import { RatingBadge } from '../shared/RatingBadge';
import { cn } from '@/lib/utils';
import { Wifi, WifiOff } from 'lucide-react';

interface OpponentCardProps {
  opponent: PublicUser;
  isConnected: boolean;
  hasAnswered: boolean;
  className?: string;
}

export function OpponentCard({ opponent, isConnected, hasAnswered, className }: OpponentCardProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-2xl border p-3.5 transition-all',
        isConnected ? 'border-arena-line bg-arena-panel' : 'border-arena-red/40 bg-arena-red/5',
        hasAnswered && 'border-arena-gold/40 shadow-[0_0_24px_-10px_rgba(255,206,77,0.6)]',
        className,
      )}
    >
      <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-500 to-arena-blue text-lg font-extrabold text-white">
        {opponent.username[0]?.toUpperCase()}
        {hasAnswered && (
          <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-arena-gold opacity-75" />
            <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-arena-gold" />
          </span>
        )}
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="flex items-center gap-2">
          <span className="truncate font-semibold text-arena-text">{opponent.username}</span>
          {isConnected ? (
            <Wifi className="h-3.5 w-3.5 shrink-0 text-arena-green" />
          ) : (
            <WifiOff className="h-3.5 w-3.5 shrink-0 text-arena-red" />
          )}
        </div>
        <RatingBadge rating={opponent.rating} size="sm" className="mt-1" />
      </div>

      {hasAnswered && (
        <span className="font-mono text-[11px] font-medium uppercase tracking-wider text-arena-gold">
          Locked in
        </span>
      )}
    </div>
  );
}
