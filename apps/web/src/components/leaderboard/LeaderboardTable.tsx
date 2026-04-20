'use client';

import { LeaderboardEntry } from '@arenaiq/types';
import { RatingBadge } from '../shared/RatingBadge';
import { cn } from '@/lib/utils';
import { Crown } from 'lucide-react';

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  currentUserId?: string;
}

const RANK_ICONS: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

export function LeaderboardTable({ entries, currentUserId }: LeaderboardTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-arena-border">
      <table className="w-full">
        <thead>
          <tr className="border-b border-arena-border bg-arena-surface/80">
            <th className="p-4 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
              Rank
            </th>
            <th className="p-4 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
              Player
            </th>
            <th className="p-4 text-right text-xs font-medium uppercase tracking-wider text-slate-500">
              Rating
            </th>
            <th className="hidden p-4 text-right text-xs font-medium uppercase tracking-wider text-slate-500 sm:table-cell">
              W / L
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-arena-border">
          {entries.map(({ rank, user }) => (
            <tr
              key={user.id}
              className={cn(
                'transition-colors hover:bg-arena-surface/50',
                user.id === currentUserId && 'bg-arena-accent/5 ring-1 ring-inset ring-arena-accent/20',
              )}
            >
              <td className="p-4">
                <span className="text-lg">
                  {RANK_ICONS[rank] ?? (
                    <span className="font-mono text-sm text-slate-400">#{rank}</span>
                  )}
                </span>
              </td>
              <td className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-arena-accent to-purple-800 text-sm font-bold text-white">
                    {user.username[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-white">{user.username}</span>
                      {rank === 1 && <Crown className="h-3.5 w-3.5 text-yellow-400" />}
                    </div>
                  </div>
                </div>
              </td>
              <td className="p-4 text-right">
                <RatingBadge rating={user.rating} size="sm" />
              </td>
              <td className="hidden p-4 text-right sm:table-cell">
                <span className="text-sm text-emerald-400">{user.wins}W</span>
                <span className="mx-1 text-slate-600">/</span>
                <span className="text-sm text-red-400">{user.losses}L</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
