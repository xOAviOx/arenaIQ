'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface TimerProps {
  totalSeconds: number;
  onExpire?: () => void;
  className?: string;
}

export function Timer({ totalSeconds, onExpire, className }: TimerProps) {
  const [remaining, setRemaining] = useState(totalSeconds);

  useEffect(() => {
    setRemaining(totalSeconds);
    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onExpire?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [totalSeconds, onExpire]);

  const fraction = remaining / totalSeconds;
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - fraction);
  const urgent = fraction <= 0.25;

  const strokeColor = fraction > 0.5 ? '#c8ff3d' : fraction > 0.25 ? '#ffce4d' : '#ff5468';
  const textColor =
    fraction > 0.5 ? 'text-arena-volt' : fraction > 0.25 ? 'text-arena-gold' : 'text-arena-red';

  return (
    <div
      className={cn('relative flex items-center justify-center', urgent && 'animate-pulse', className)}
    >
      <svg width="80" height="80" className="-rotate-90">
        <circle cx="40" cy="40" r={radius} fill="none" stroke="#222739" strokeWidth="5" />
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth="5"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 1s linear, stroke 0.4s',
            filter: `drop-shadow(0 0 6px ${strokeColor}80)`,
          }}
        />
      </svg>
      <span className={cn('absolute font-mono text-2xl font-bold tabular-nums', textColor)}>
        {remaining}
      </span>
    </div>
  );
}
