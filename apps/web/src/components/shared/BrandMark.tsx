import { cn } from '@/lib/utils';

interface BrandMarkProps {
  size?: 'sm' | 'md' | 'lg';
  withWordmark?: boolean;
  className?: string;
}

const GLYPH_SIZE = { sm: 22, md: 28, lg: 40 } as const;
const TEXT_SIZE = {
  sm: 'text-base',
  md: 'text-lg',
  lg: 'text-3xl',
} as const;

/** Angular arena glyph: a faceted shard cut by a voltage bolt. */
export function BrandMark({ size = 'md', withWordmark = true, className }: BrandMarkProps) {
  const s = GLYPH_SIZE[size];
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <span className="relative inline-flex">
        <span className="absolute inset-0 -z-10 rounded-[7px] bg-arena-volt/30 blur-md" aria-hidden />
        <svg
          width={s}
          height={s}
          viewBox="0 0 32 32"
          fill="none"
          className="drop-shadow-[0_0_8px_rgba(200,255,61,0.45)]"
        >
          <path
            d="M16 1.5 30 9v14L16 30.5 2 23V9L16 1.5Z"
            stroke="#c8ff3d"
            strokeWidth="1.6"
            strokeLinejoin="round"
            className="opacity-80"
          />
          <path
            d="M17.5 7 10 17.4h5L14 25l8.5-11.2h-5L17.5 7Z"
            fill="#c8ff3d"
          />
        </svg>
      </span>
      {withWordmark && (
        <span
          className={cn(
            'font-display font-extrabold tracking-tight text-arena-text',
            TEXT_SIZE[size],
          )}
        >
          Arena<span className="text-gradient-volt">IQ</span>
        </span>
      )}
    </span>
  );
}
