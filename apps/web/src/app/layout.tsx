import type { Metadata } from 'next';
import { Syne, Hanken_Grotesk, JetBrains_Mono } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

const display = Syne({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
});

const sans = Hanken_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ArenaIQ — Competitive Math Battles',
  description: 'Real-time 1v1 JEE/NEET math battles. Compete, rank up, dominate.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: '#c8ff3d',
          colorBackground: '#0f111a',
          colorInputBackground: '#0b0d14',
          colorText: '#e9ebf3',
          colorTextSecondary: '#979db2',
          colorInputText: '#e9ebf3',
          borderRadius: '0.85rem',
          fontFamily: 'var(--font-sans)',
        },
        elements: {
          formButtonPrimary:
            'bg-arena-volt text-[#0b0d14] font-semibold hover:opacity-90',
          card: 'bg-arena-panel border border-arena-line shadow-2xl',
          socialButtonsBlockButton: 'border-arena-line hover:bg-arena-raised',
          footerActionLink: 'text-arena-volt hover:text-arena-volt',
        },
      }}
    >
      <html
        lang="en"
        className={`dark ${display.variable} ${sans.variable} ${mono.variable}`}
      >
        <body className="arena-grain">
          <div className="arena-atmosphere" aria-hidden />
          <div className="arena-grid" aria-hidden />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
