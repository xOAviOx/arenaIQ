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
        'flex items-center gap-3 rounded-xl border p-4 transition-all',
        isConnected ? 'border-arena-border bg-arena-surface' : 'border-red-500/30 bg-red-500/5',
        className,
      )}
    >
      <div
        className={cn(
          'flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold',
          'bg-gradient-to-br from-arena-accent to-purple-800 text-white',
        )}
      >
        {opponent.username[0]?.toUpperCase()}
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="flex items-center gap-2">
          <span className="truncate font-semibold text-white">{opponent.username}</span>
          {isConnected ? (
            <Wifi className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
          ) : (
            <WifiOff className="h-3.5 w-3.5 shrink-0 text-red-400" />
          )}
        </div>
        <RatingBadge rating={opponent.rating} size="sm" />
      </div>

      {hasAnswered && (
        <div className="flex items-center gap-1.5 text-xs text-yellow-400">
          <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-yellow-400" />
          Answered
        </div>
      )}
    </div>
  );
}
