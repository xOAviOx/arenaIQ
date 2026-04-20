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
  const circumference = 2 * Math.PI * 28;
  const strokeDashoffset = circumference * (1 - fraction);

  const colorClass =
    fraction > 0.5 ? 'text-emerald-400' : fraction > 0.25 ? 'text-yellow-400' : 'text-red-400';
  const strokeColor =
    fraction > 0.5 ? '#10b981' : fraction > 0.25 ? '#f59e0b' : '#ef4444';

  return (
    <div className={cn('relative flex items-center justify-center', className)}>
      <svg width="72" height="72" className="-rotate-90">
        <circle
          cx="36"
          cy="36"
          r="28"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          className="text-arena-border"
        />
        <circle
          cx="36"
          cy="36"
          r="28"
          fill="none"
          stroke={strokeColor}
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
        />
      </svg>
      <span className={cn('absolute text-xl font-bold tabular-nums', colorClass)}>
        {remaining}
      </span>
    </div>
  );
}
