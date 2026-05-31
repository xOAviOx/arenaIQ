import Link from 'next/link';
import { SignIn } from '@clerk/nextjs';
import { BrandMark } from '@/components/shared/BrandMark';
import { ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <Link
        href="/"
        className="stagger mb-8 inline-flex items-center gap-1.5 text-sm text-arena-faint transition-colors hover:text-arena-text"
        style={{ ['--i' as string]: 0 }}
      >
        <ArrowLeft className="h-4 w-4" />
        Back home
      </Link>

      <div className="stagger mb-8 text-center" style={{ ['--i' as string]: 1 }}>
        <BrandMark size="lg" />
        <p className="mt-4 font-display text-2xl font-bold text-arena-text">Welcome back, challenger</p>
        <p className="mt-1 text-sm text-arena-dim">Sign in to reclaim your rank.</p>
      </div>

      <div className="stagger" style={{ ['--i' as string]: 2 }}>
        <SignIn
          path="/login"
          appearance={{
            elements: {
              rootBox: 'w-full max-w-md',
              card: 'bg-arena-panel border border-arena-line shadow-panel',
              headerTitle: 'text-arena-text font-display',
              headerSubtitle: 'text-arena-dim',
              formButtonPrimary: 'bg-arena-volt text-[#0b0d14] font-semibold hover:opacity-90',
              formFieldInput:
                'bg-arena-ink border-arena-line text-arena-text placeholder:text-arena-faint focus:border-arena-volt',
              formFieldLabel: 'text-arena-dim',
              footerActionLink: 'text-arena-volt hover:text-arena-volt',
              socialButtonsBlockButton: 'border-arena-line text-arena-text hover:bg-arena-raised',
              dividerLine: 'bg-arena-line',
              dividerText: 'text-arena-faint',
            },
          }}
        />
      </div>
    </main>
  );
}
