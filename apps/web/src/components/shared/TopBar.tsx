import Link from 'next/link';
import { ReactNode } from 'react';
import { BrandMark } from './BrandMark';

interface TopBarProps {
  children?: ReactNode;
  /** When false, the brand is not a link (e.g. already on landing). */
  brandHref?: string | null;
}

export function TopBar({ children, brandHref = '/' }: TopBarProps) {
  return (
    <nav className="sticky top-0 z-40 border-b border-arena-line/70 bg-arena-ink/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5 sm:px-6">
        {brandHref ? (
          <Link href={brandHref} className="transition-opacity hover:opacity-80">
            <BrandMark size="md" />
          </Link>
        ) : (
          <BrandMark size="md" />
        )}
        <div className="flex items-center gap-2 sm:gap-3">{children}</div>
      </div>
    </nav>
  );
}
