'use client';

import { useEffect, useRef, useState } from 'react';
import { MessageSquare, Send, X } from 'lucide-react';
import { ChatMessage } from '@/store/battleStore';
import { cn } from '@/lib/utils';

const QUICK = ['GG', 'Nice!', 'Good luck', '😅', '🔥'];
const MAX_LEN = 240;

interface BattleChatProps {
  messages: ChatMessage[];
  onSend: (message: string) => void;
  opponentName: string;
}

export function BattleChat({ messages, onSend, opponentName }: BattleChatProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [seen, setSeen] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const unread = open ? 0 : Math.max(0, messages.length - seen);

  useEffect(() => {
    if (open) {
      setSeen(messages.length);
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages.length, open]);

  const submit = (text: string) => {
    const value = text.trim();
    if (!value) return;
    onSend(value);
    setDraft('');
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="panel animate-pop-in flex h-[26rem] w-[min(22rem,calc(100vw-2.5rem))] flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-arena-line px-4 py-3">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-arena-volt" />
              <span className="font-display text-sm font-bold text-arena-text">Trash Talk</span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-lg p-1 text-arena-faint transition-colors hover:bg-arena-raised hover:text-arena-text"
              aria-label="Close chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto px-3 py-3">
            {messages.length === 0 ? (
              <p className="mt-6 text-center text-xs text-arena-faint">
                Say hi to {opponentName}. Keep it sporting. ⚔️
              </p>
            ) : (
              messages.map((m) => (
                <div key={m.id} className={cn('flex flex-col', m.mine ? 'items-end' : 'items-start')}>
                  <span className="mb-0.5 px-1 font-mono text-[10px] uppercase tracking-wider text-arena-faint">
                    {m.mine ? 'You' : m.username}
                  </span>
                  <span
                    className={cn(
                      'max-w-[82%] break-words rounded-2xl px-3 py-2 text-sm',
                      m.mine
                        ? 'rounded-br-sm bg-arena-volt text-[#0b0d14]'
                        : 'rounded-bl-sm border border-arena-line bg-arena-raised text-arena-text',
                    )}
                  >
                    {m.message}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Quick chips */}
          <div className="flex flex-wrap gap-1.5 px-3 pb-2">
            {QUICK.map((q) => (
              <button
                key={q}
                onClick={() => submit(q)}
                className="rounded-full border border-arena-line px-2.5 py-1 text-xs text-arena-dim transition-colors hover:border-arena-volt/50 hover:text-arena-text"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit(draft);
            }}
            className="flex items-center gap-2 border-t border-arena-line p-3"
          >
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value.slice(0, MAX_LEN))}
              placeholder="Message…"
              className="min-w-0 flex-1 rounded-xl border border-arena-line bg-arena-ink px-3 py-2 text-sm text-arena-text placeholder:text-arena-faint focus:border-arena-volt focus:outline-none"
            />
            <button
              type="submit"
              disabled={!draft.trim()}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-arena-volt text-[#0b0d14] transition-opacity disabled:opacity-40"
              aria-label="Send"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}

      {/* Toggle */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-13 w-13 items-center justify-center rounded-2xl border border-arena-line bg-arena-panel p-3.5 text-arena-text shadow-panel transition-all hover:-translate-y-0.5 hover:border-arena-volt/50"
        aria-label="Toggle chat"
      >
        <MessageSquare className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-arena-volt px-1 font-mono text-[11px] font-bold text-[#0b0d14]">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>
    </div>
  );
}
