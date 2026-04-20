import { SignIn } from '@clerk/nextjs';

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-arena-bg">
      <SignIn
        path="/login"
        appearance={{
          elements: {
            rootBox: 'w-full max-w-md',
            card: 'bg-arena-surface border border-arena-border shadow-2xl',
            headerTitle: 'text-white',
            headerSubtitle: 'text-slate-400',
            formButtonPrimary: 'bg-arena-accent hover:bg-arena-accent/80',
            formFieldInput:
              'bg-arena-bg border-arena-border text-white placeholder:text-slate-500 focus:border-arena-accent',
            formFieldLabel: 'text-slate-300',
            footerActionLink: 'text-arena-accent-light',
          },
        }}
      />
    </main>
  );
}
