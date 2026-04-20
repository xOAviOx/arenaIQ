import { cn } from '@/lib/utils';

interface LoadingArenaProps {
  message?: string;
  className?: string;
}

export function LoadingArena({ message = 'Loading...', className }: LoadingArenaProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-4', className)}>
      <div className="relative h-12 w-12">
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-arena-accent/20 border-t-arena-accent" />
        <div className="absolute inset-2 animate-ping rounded-full bg-arena-accent/20" />
      </div>
      <p className="text-sm text-slate-400">{message}</p>
    </div>
  );
}
