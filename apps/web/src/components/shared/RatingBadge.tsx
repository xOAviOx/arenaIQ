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
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-semibold',
        TIER_COLORS[tier],
        TIER_BG[tier],
        sizeClasses[size],
        className,
      )}
    >
      <span>{tier}</span>
      {showRating && <span className="opacity-70">#{rating}</span>}
    </span>
  );
}
