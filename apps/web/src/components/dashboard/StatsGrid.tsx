import { UserProfile } from '@arenaiq/types';
import { Trophy, XCircle, Minus, BarChart3 } from 'lucide-react';

interface StatsGridProps {
  profile: UserProfile;
}

export function StatsGrid({ profile }: StatsGridProps) {
  const total = profile.wins + profile.losses + profile.draws;
  const winRate = total > 0 ? Math.round((profile.wins / total) * 100) : 0;

  const stats = [
    { label: 'Wins', value: profile.wins, icon: Trophy, color: 'text-emerald-400' },
    { label: 'Losses', value: profile.losses, icon: XCircle, color: 'text-red-400' },
    { label: 'Draws', value: profile.draws, icon: Minus, color: 'text-slate-400' },
    { label: 'Win Rate', value: `${winRate}%`, icon: BarChart3, color: 'text-arena-accent-light' },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map(({ label, value, icon: Icon, color }) => (
        <div
          key={label}
          className="flex flex-col gap-2 rounded-xl border border-arena-border bg-arena-surface p-4"
        >
          <Icon className={`h-4 w-4 ${color}`} />
          <p className="text-2xl font-bold text-white">{value}</p>
          <p className="text-xs text-slate-400">{label}</p>
        </div>
      ))}
    </div>
  );
}
