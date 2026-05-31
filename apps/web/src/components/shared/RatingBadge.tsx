import { getTier, TIER_COLORS, TIER_BG } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface RatingBadgeProps {
  rating: number;
  showRating?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function RatingBadge({ rating, showRating = true, size = 'md', className }: RatingBadgeProps) {
  const tier = getTier(rating);

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-semibold uppercase tracking-wide',
        TIER_COLORS[tier],
        TIER_BG[tier],
        sizeClasses[size],
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      <span>{tier}</span>
      {showRating && <span className="font-mono normal-case opacity-60">{rating}</span>}
    </span>
  );
}
