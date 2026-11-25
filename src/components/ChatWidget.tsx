"use client";

import { useEffect, useRef, useState } from "react";

type Msg = { role: "user" | "assistant"; content: string };

const URL_RE = /(https?:\/\/[^\s)]+)/g;

/** Plain text with clickable links. */
function Linkified({ text }: { text: string }) {
  return (
    <>
      {text.split(URL_RE).map((part, i) =>
        /^https?:\/\//.test(part) ? (
          <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="break-all underline underline-offset-2">
            {part}
          </a>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

export function ChatWidget({
  title,
  greeting,
  suggestions,
}: {
  title: string;
  greeting: string;
  suggestions: string[];
}) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // On phones the panel is full screen: stop the page behind it from scrolling.
  useEffect(() => {
    if (!open) return;
    const small = window.matchMedia("(max-width: 639px)");
    const prev = document.body.style.overflow;
    if (small.matches) document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    inputRef.current?.focus({ preventScroll: true });
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Keep the newest text in view.
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, open]);

  useEffect(() => () => abortRef.current?.abort(), []);

  async function send(text: string) {
    const question = text.trim();
    if (!question || busy) return;
    setInput("");
    const history: Msg[] = [...messages, { role: "user", content: question }];
    setMessages([...history, { role: "assistant", content: "" }]);
    setBusy(true);

    const ctrl = new AbortController();
    abortRef.current = ctrl;
    const setReply = (content: string) =>
      setMessages((m) => m.map((x, i) => (i === m.length - 1 ? { ...x, content } : x)));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
        signal: ctrl.signal,
      });
      if (!res.ok || !res.body) {
        const err = (await res.json().catch(() => null)) as { error?: string } | null;
        setReply(err?.error ?? "Sorry, something went wrong. Please try again.");
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setReply(acc);
      }
      acc += decoder.decode();
      setReply(acc.trim() || "Sorry, I couldn't answer that. Please try again.");
    } catch (e) {
      if ((e as Error).name !== "AbortError") setReply("Sorry, I couldn't connect. Please check your internet and try again.");
    } finally {
      setBusy(false);
    }
  }

  const showChips = messages.length === 0 && suggestions.length > 0;

  return (
    <>
      {/* floating button */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={title}
          className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-50 flex h-14 items-center gap-2 rounded-full border-2 border-gold bg-burgundy px-4 text-ivory shadow-lg transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold sm:bottom-6 sm:right-6"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
            <path d="M21 12a8.5 8.5 0 0 1-12.4 7.5L3 21l1.6-5A8.5 8.5 0 1 1 21 12Z" strokeLinejoin="round" />
            <path d="M8.5 11.5h7M8.5 14.5h4" strokeLinecap="round" />
          </svg>
          <span className="caps text-sm font-semibold">Ask</span>
        </button>
      )}

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className="fixed inset-0 z-50 flex flex-col bg-ivory sm:inset-auto sm:bottom-6 sm:right-6 sm:h-[min(40rem,calc(100dvh-3rem))] sm:w-[25rem] sm:border-2 sm:border-gold sm:shadow-2xl"
        >
          {/* header */}
          <div className="flex shrink-0 items-center justify-between gap-3 bg-burgundy px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] text-ivory sm:pt-3">
            <div className="min-w-0">
              <p className="truncate font-serif text-xl font-semibold leading-tight">{title}</p>
              <p className="font-serif text-sm text-ivory/80">AI assistant</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="flex size-11 shrink-0 items-center justify-center rounded-full hover:bg-white/10"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M5 5l14 14M19 5L5 19" />
              </svg>
            </button>
          </div>

          {/* messages */}
          <div ref={listRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-4" aria-live="polite">
            <div className="max-w-[88%] whitespace-pre-wrap border border-gold/50 bg-blush/60 px-3.5 py-2.5 font-serif text-lg leading-snug text-ink">
              {greeting}
            </div>

            {showChips && (
              <div className="flex flex-wrap gap-2 pt-1">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => void send(s)}
                    className="border border-gold bg-ivory px-3 py-2 text-left font-serif text-base text-burgundy hover:bg-gold hover:text-ivory"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {messages.map((m, i) =>
              m.role === "user" ? (
                <div key={i} className="ml-auto max-w-[88%] whitespace-pre-wrap bg-burgundy px-3.5 py-2.5 font-serif text-lg leading-snug text-ivory">
                  {m.content}
                </div>
              ) : (
                <div key={i} className="max-w-[88%] whitespace-pre-wrap border border-gold/50 bg-blush/60 px-3.5 py-2.5 font-serif text-lg leading-snug text-ink">
                  {m.content ? (
                    <Linkified text={m.content} />
                  ) : (
                    <span className="inline-flex gap-1 py-1" aria-label="Typing">
                      <span className="size-2 animate-bounce rounded-full bg-gold-deep [animation-delay:-0.2s]" />
                      <span className="size-2 animate-bounce rounded-full bg-gold-deep [animation-delay:-0.1s]" />
                      <span className="size-2 animate-bounce rounded-full bg-gold-deep" />
                    </span>
                  )}
                </div>
              ),
            )}
          </div>

          {/* input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void send(input);
            }}
            className="shrink-0 border-t border-gold/50 bg-ivory px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2.5"
          >
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                rows={1}
                maxLength={500}
                placeholder="Type your question…"
                aria-label="Your question"
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void send(input);
                  }
                }}
                // 16px text stops iPhones zooming the page when the box is focused
                className="max-h-28 min-h-11 flex-1 resize-none border border-gold/60 bg-ivory px-3 py-2.5 font-serif text-[16px] text-ink outline-none focus:border-burgundy"
              />
              <button
                type="submit"
                disabled={busy || !input.trim()}
                aria-label="Send"
                className="flex size-11 shrink-0 items-center justify-center bg-burgundy text-ivory disabled:opacity-40"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M3.4 20.4 21 12 3.4 3.6l.1 6.5L15 12 3.5 13.9l-.1 6.5Z" />
                </svg>
              </button>
            </div>
            <p className="mt-2 text-center font-serif text-sm leading-tight text-muted">
              AI assistant. Answers come from this website. For anything important, please contact the family.
            </p>
          </form>
        </div>
      )}
    </>
  );
}
