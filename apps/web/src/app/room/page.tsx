'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { usePrivateRoom } from '@/hooks/usePrivateRoom';
import { getSocket } from '@/lib/socket';
import { BrandMark } from '@/components/shared/BrandMark';
import { cn, TIER_COLORS } from '@/lib/utils';
import {
  Users,
  Copy,
  Check,
  Swords,
  ArrowLeft,
  Loader2,
  DoorOpen,
} from 'lucide-react';

export default function RoomPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId') ?? '';

  const { lobby, error, starting, create, join, start, leave } = usePrivateRoom(userId);

  const [codeInput, setCodeInput] = useState('');
  const [copied, setCopied] = useState(false);
  const startingRef = useRef(false);
  startingRef.current = starting;

  useEffect(() => {
    if (!userId) router.replace('/dashboard');
  }, [userId, router]);

  // Best-effort: release the server-side lobby if we navigate away mid-wait.
  // (No-op once the match has started — the lobby is already gone.)
  useEffect(() => {
    return () => {
      const socket = getSocket();
      if (!startingRef.current && socket.connected) {
        socket.emit('leave_room', { code: '' });
      }
    };
  }, []);

  const handleCopy = async () => {
    if (!lobby) return;
    try {
      await navigator.clipboard.writeText(lobby.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked — the code is shown on screen anyway */
    }
  };

  const handleLeave = () => {
    leave();
    setCodeInput('');
  };

  const me = lobby?.players.find((p) => p.userId === userId);
  const opponent = lobby?.players.find((p) => p.userId !== userId);
  const isHost = me?.isHost ?? false;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <div className="stagger mb-8" style={{ ['--i' as string]: 0 }}>
        <BrandMark size="lg" />
      </div>

      <div className="w-full max-w-md">
        {!lobby ? (
          <ChoosePanel
            codeInput={codeInput}
            setCodeInput={setCodeInput}
            onCreate={create}
            onJoin={() => join(codeInput)}
            error={error}
          />
        ) : (
          <LobbyPanel
            code={lobby.code}
            isHost={isHost}
            canStart={lobby.canStart}
            starting={starting}
            copied={copied}
            onCopy={handleCopy}
            onStart={start}
            onLeave={handleLeave}
            meName={me?.username ?? 'You'}
            opponentName={opponent?.username ?? null}
            opponentRating={opponent?.rating ?? null}
            opponentTier={opponent?.tier ?? null}
            error={error}
          />
        )}

        <button
          onClick={() => router.push('/dashboard')}
          className="mt-6 flex w-full items-center justify-center gap-1.5 font-mono text-xs uppercase tracking-widest text-arena-faint transition-colors hover:text-arena-dim"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to dashboard
        </button>
      </div>
    </main>
  );
}

function ChoosePanel({
  codeInput,
  setCodeInput,
  onCreate,
  onJoin,
  error,
}: {
  codeInput: string;
  setCodeInput: (v: string) => void;
  onCreate: () => void;
  onJoin: () => void;
  error: string | null;
}) {
  return (
    <div className="panel stagger space-y-6 p-7" style={{ ['--i' as string]: 1 }}>
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-arena-volt/40 bg-arena-volt/10">
          <Users className="h-6 w-6 text-arena-volt" />
        </div>
        <h1 className="mt-4 font-display text-2xl font-extrabold tracking-tight text-arena-text">
          Play a Friend
        </h1>
        <p className="mt-1 text-sm text-arena-dim">
          Casual 1v1 — no rating on the line.
        </p>
      </div>

      <button
        onClick={onCreate}
        className="group relative w-full overflow-hidden rounded-2xl bg-arena-volt px-6 py-4 text-[#0b0d14] shadow-volt-sm transition-transform hover:-translate-y-0.5"
      >
        <span className="sheen-layer" aria-hidden />
        <span className="relative flex items-center justify-center gap-2 font-display text-base font-extrabold tracking-tight">
          <Swords className="h-5 w-5 transition-transform group-hover:rotate-12" />
          Create Room
        </span>
      </button>

      <div className="flex items-center gap-3">
        <span className="hairline flex-1" />
        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-arena-faint">or</span>
        <span className="hairline flex-1" />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (codeInput.trim()) onJoin();
        }}
        className="space-y-3"
      >
        <input
          value={codeInput}
          onChange={(e) => setCodeInput(e.target.value.toUpperCase().slice(0, 6))}
          placeholder="ENTER CODE"
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
          className="w-full rounded-2xl border border-arena-line bg-arena-ink/60 px-4 py-3.5 text-center font-mono text-xl font-bold uppercase tracking-[0.4em] text-arena-text placeholder:tracking-[0.2em] placeholder:text-arena-faint focus:border-arena-volt/50 focus:outline-none"
        />
        <button
          type="submit"
          disabled={!codeInput.trim()}
          className="w-full rounded-2xl border border-arena-line py-3.5 font-semibold text-arena-text transition-colors hover:border-arena-volt/40 hover:bg-white/[0.02] disabled:opacity-40 disabled:hover:border-arena-line disabled:hover:bg-transparent"
        >
          Join Room
        </button>
      </form>

      {error && (
        <p className="animate-pop-in text-center text-sm text-arena-red">{error}</p>
      )}
    </div>
  );
}

function LobbyPanel({
  code,
  isHost,
  canStart,
  starting,
  copied,
  onCopy,
  onStart,
  onLeave,
  meName,
  opponentName,
  opponentRating,
  opponentTier,
  error,
}: {
  code: string;
  isHost: boolean;
  canStart: boolean;
  starting: boolean;
  copied: boolean;
  onCopy: () => void;
  onStart: () => void;
  onLeave: () => void;
  meName: string;
  opponentName: string | null;
  opponentRating: number | null;
  opponentTier: string | null;
  error: string | null;
}) {
  return (
    <div className="panel stagger space-y-6 p-7" style={{ ['--i' as string]: 1 }}>
      <div className="text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-arena-faint">
          Room Code
        </p>
        <button
          onClick={onCopy}
          className="group mt-2 inline-flex items-center gap-3 rounded-2xl border border-arena-line bg-arena-ink/60 px-5 py-3 transition-colors hover:border-arena-volt/40"
        >
          <span className="font-mono text-3xl font-extrabold tracking-[0.35em] text-gradient-volt">
            {code}
          </span>
          {copied ? (
            <Check className="h-5 w-5 text-arena-green" />
          ) : (
            <Copy className="h-5 w-5 text-arena-faint transition-colors group-hover:text-arena-volt" />
          )}
        </button>
        <p className="mt-2 text-xs text-arena-dim">
          {copied ? 'Copied to clipboard!' : 'Share this code with your friend.'}
        </p>
      </div>

      {/* Players */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <PlayerSlot name={meName} sub="You" filled />
        <span className="font-display text-lg font-extrabold text-arena-faint">VS</span>
        {opponentName ? (
          <PlayerSlot
            name={opponentName}
            sub={
              opponentTier && opponentRating
                ? `${opponentTier} · ${opponentRating}`
                : 'Ready'
            }
            tierClass={opponentTier ? TIER_COLORS[opponentTier as keyof typeof TIER_COLORS] : undefined}
            filled
          />
        ) : (
          <PlayerSlot name="Waiting…" sub="Open slot" filled={false} />
        )}
      </div>

      {/* Action */}
      {starting ? (
        <p className="shimmer-text text-center font-mono text-sm">Launching battle…</p>
      ) : isHost ? (
        <button
          onClick={onStart}
          disabled={!canStart}
          className="group relative w-full overflow-hidden rounded-2xl bg-arena-volt px-6 py-4 text-[#0b0d14] shadow-volt-sm transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
        >
          {canStart && <span className="sheen-layer" aria-hidden />}
          <span className="relative flex items-center justify-center gap-2 font-display text-base font-extrabold tracking-tight">
            <Swords className="h-5 w-5" />
            {canStart ? 'Start Battle' : 'Waiting for opponent…'}
          </span>
        </button>
      ) : (
        <p className="shimmer-text text-center font-mono text-sm">
          Waiting for the host to start…
        </p>
      )}

      {error && (
        <p className="animate-pop-in text-center text-sm text-arena-red">{error}</p>
      )}

      <button
        onClick={onLeave}
        className="flex w-full items-center justify-center gap-1.5 text-sm text-arena-faint transition-colors hover:text-arena-red"
      >
        <DoorOpen className="h-4 w-4" />
        Leave room
      </button>
    </div>
  );
}

function PlayerSlot({
  name,
  sub,
  filled,
  tierClass,
}: {
  name: string;
  sub: string;
  filled: boolean;
  tierClass?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-1.5 rounded-2xl border px-3 py-4 text-center',
        filled ? 'border-arena-line bg-arena-ink/40' : 'border-dashed border-arena-line/60',
      )}
    >
      <div
        className={cn(
          'flex h-11 w-11 items-center justify-center rounded-xl text-lg font-extrabold',
          filled
            ? 'bg-gradient-to-br from-arena-volt to-arena-cyan text-[#0b0d14]'
            : 'bg-arena-ink text-arena-faint',
        )}
      >
        {filled ? (name[0]?.toUpperCase() ?? '?') : <Loader2 className="h-5 w-5 animate-spin" />}
      </div>
      <span className="max-w-[7rem] truncate text-sm font-semibold text-arena-text">{name}</span>
      <span className={cn('font-mono text-[10px] uppercase tracking-wider', tierClass ?? 'text-arena-faint')}>
        {sub}
      </span>
    </div>
  );
}
