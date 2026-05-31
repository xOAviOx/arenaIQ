'use client';

import { LeaderboardEntry } from '@arenaiq/types';
import { RatingBadge } from '../shared/RatingBadge';
import { cn } from '@/lib/utils';
import { Crown } from 'lucide-react';

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
}

const MEDALS: Record<number, { ring: string; text: string; glyph: string }> = {
  1: { ring: 'ring-arena-gold/60', text: 'text-arena-gold', glyph: '①' },
  2: { ring: 'ring-slate-300/50', text: 'text-slate-300', glyph: '②' },
  3: { ring: 'ring-amber-600/50', text: 'text-amber-600', glyph: '③' },
};

export function LeaderboardTable({ entries, currentUserId }: LeaderboardTableProps) {
  return (
    <div className="panel overflow-hidden">
      <div className="grid grid-cols-[3rem_1fr_auto] items-center gap-3 border-b border-arena-line px-4 py-3 font-mono text-[11px] uppercase tracking-widest text-arena-faint sm:grid-cols-[3.5rem_1fr_auto_auto]">
        <span>Rank</span>
        <span>Player</span>
        <span className="text-right">Rating</span>
        <span className="hidden text-right sm:block">W / L</span>
      </div>

      <div className="divide-y divide-arena-line/60">
        {entries.map(({ rank, user }) => {
          const isMe = user.id === currentUserId;
          const medal = MEDALS[rank];
          return (
            <div
              key={user.id}
              className={cn(
                'grid grid-cols-[3rem_1fr_auto] items-center gap-3 px-4 py-3 transition-colors hover:bg-white/[0.02] sm:grid-cols-[3.5rem_1fr_auto_auto]',
                isMe && 'bg-arena-volt/[0.06] ring-1 ring-inset ring-arena-volt/25',
              )}
            >
              {/* Rank */}
              <span
                className={cn(
                  'font-mono text-sm font-bold',
                  medal ? medal.text : 'text-arena-faint',
                )}
              >
                {medal ? medal.glyph : `#${rank}`}
              </span>

              {/* Player */}
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-arena-raised to-arena-panel text-sm font-extrabold text-arena-text ring-1',
                    medal ? medal.ring : 'ring-arena-line',
                  )}
                >
                  {user.username[0]?.toUpperCase()}
                </div>
                <div className="flex min-w-0 items-center gap-1.5">
                  <span className="truncate font-semibold text-arena-text">{user.username}</span>
                  {rank === 1 && <Crown className="h-4 w-4 shrink-0 text-arena-gold" />}
                  {isMe && (
                    <span className="shrink-0 rounded-md bg-arena-volt/15 px-1.5 py-0.5 font-mono text-[10px] uppercase text-arena-volt">
                      you
                    </span>
                  )}
                </div>
              </div>

              {/* Rating */}
              <div className="text-right">
                <RatingBadge rating={user.rating} size="sm" />
              </div>

              {/* W/L */}
              <div className="hidden text-right font-mono text-sm sm:block">
                <span className="text-arena-green">{user.wins}W</span>
                <span className="mx-1 text-arena-faint">·</span>
                <span className="text-arena-red">{user.losses}L</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
