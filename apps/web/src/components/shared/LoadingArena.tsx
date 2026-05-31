import { cn } from '@/lib/utils';

interface LoadingArenaProps {
  message?: string;
  className?: string;
}

export function LoadingArena({ message = 'Loading...', className }: LoadingArenaProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-5', className)}>
      <div className="relative h-16 w-16">
        {/* outer ping */}
        <span className="absolute inset-0 animate-ping-slow rounded-full border border-arena-volt/40" />
        {/* spinning ring */}
        <span className="absolute inset-0 animate-spin-slow rounded-full border-2 border-arena-line border-t-arena-volt border-r-arena-volt/40" />
        {/* counter ring */}
        <span
          className="absolute inset-2 rounded-full border-2 border-arena-line border-b-arena-cyan"
          style={{ animation: 'spin 1.8s linear infinite reverse' }}
        />
        {/* pulsing core */}
        <span className="absolute inset-[1.4rem] animate-pulse-glow rounded-full bg-arena-volt/80" />
      </div>
      <p className="shimmer-text font-mono text-sm tracking-wide">{message}</p>
    </div>
  );
}
