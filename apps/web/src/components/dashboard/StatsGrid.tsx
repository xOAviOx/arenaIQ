import { UserProfile } from '@arenaiq/types';
import { Trophy, XCircle, Minus, Percent } from 'lucide-react';

interface StatsGridProps {
  profile: UserProfile;
}

export function StatsGrid({ profile }: StatsGridProps) {
  const total = profile.wins + profile.losses + profile.draws;
  const winRate = total > 0 ? Math.round((profile.wins / total) * 100) : 0;

  const stats = [
    { label: 'Wins', value: profile.wins, icon: Trophy, color: 'text-arena-green' },
    { label: 'Losses', value: profile.losses, icon: XCircle, color: 'text-arena-red' },
    { label: 'Draws', value: profile.draws, icon: Minus, color: 'text-arena-dim' },
    { label: 'Win Rate', value: `${winRate}%`, icon: Percent, color: 'text-arena-volt' },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map(({ label, value, icon: Icon, color }, i) => (
        <div
          key={label}
          className="panel panel-hover stagger flex flex-col gap-3 p-4"
          style={{ ['--i' as string]: i }}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-arena-line bg-arena-raised">
            <Icon className={`h-4 w-4 ${color}`} />
          </div>
          <div>
            <p className="font-mono text-2xl font-bold tabular-nums text-arena-text">{value}</p>
            <p className="mt-0.5 text-xs uppercase tracking-wider text-arena-faint">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
