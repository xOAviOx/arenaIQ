'use client';

import { useQueueStore } from '@/store/queueStore';
import { Users, Clock, Hash, X } from 'lucide-react';

interface QueueStatusProps {
  onCancel: () => void;
}

export function QueueStatus({ onCancel }: QueueStatusProps) {
  const { position, estimatedWait, playersOnline } = useQueueStore();

  const rows = [
    { icon: Users, label: 'Players online', value: playersOnline },
    { icon: Clock, label: 'Estimated wait', value: `${estimatedWait}s` },
    ...(position > 0 ? [{ icon: Hash, label: 'Queue position', value: `#${position}` }] : []),
  ];

  return (
    <div className="flex flex-col items-center gap-9">
      {/* Radar sweep */}
      <div className="relative flex h-44 w-44 items-center justify-center">
        {[0, 1, 2].map((r) => (
          <span
            key={r}
            className="absolute rounded-full border border-arena-volt/30"
            style={{
              inset: `${r * 26}px`,
              animation: `pingSlow 2.4s cubic-bezier(0,0,0.2,1) ${r * 0.5}s infinite`,
            }}
          />
        ))}
        <span className="absolute inset-0 rounded-full border border-arena-line" />
        <span className="absolute inset-9 rounded-full border border-arena-line/70" />
        {/* sweeping wedge */}
        <span
          className="absolute inset-0 origin-center rounded-full"
          style={{
            background:
              'conic-gradient(from 0deg, transparent 0deg, rgba(200,255,61,0.0) 300deg, rgba(200,255,61,0.35) 360deg)',
            animation: 'spin 2.6s linear infinite',
            WebkitMask: 'radial-gradient(circle, transparent 12px, black 13px)',
            mask: 'radial-gradient(circle, transparent 12px, black 13px)',
          }}
        />
        <span className="relative flex h-7 w-7 items-center justify-center">
          <span className="absolute h-3 w-3 animate-pulse-glow rounded-full bg-arena-volt" />
        </span>
      </div>

      <div className="text-center">
        <h2 className="font-display text-2xl font-bold text-arena-text">Scanning the arena</h2>
        <p className="shimmer-text mt-1 font-mono text-sm">Finding a worthy opponent…</p>
      </div>

      <div className="panel w-full divide-y divide-arena-line/70 p-1.5">
        {rows.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center justify-between px-4 py-3 text-sm">
            <span className="flex items-center gap-2.5 text-arena-dim">
              <Icon className="h-4 w-4 text-arena-faint" />
              {label}
            </span>
            <span className="font-mono font-semibold text-arena-text">{value}</span>
          </div>
        ))}
      </div>

      <button
        onClick={onCancel}
        className="flex items-center gap-2 rounded-xl border border-arena-red/30 bg-arena-red/10 px-5 py-2.5 text-sm font-medium text-arena-red transition-colors hover:bg-arena-red/20"
      >
        <X className="h-4 w-4" />
        Cancel Matchmaking
      </button>
    </div>
  );
}
