import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';

export const metadata: Metadata = {
  title: 'ArenaIQ — Competitive Math Battles',
  description: 'Real-time 1v1 JEE/NEET math battles. Compete, rank up, dominate.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
