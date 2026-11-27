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
          <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="break-all font-medium underline underline-offset-2">
            {part}
          </a>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

function Sparkle({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2c.6 4.8 2.2 8.2 5 9.9 1.5.9 3.2 1.5 5 1.9-1.8.4-3.5 1-5 1.9-2.8 1.7-4.4 5.1-5 9.9-.6-4.8-2.2-8.2-5-9.9-1.5-.900-3.2-1.5-5-1.9 1.8-.400 3.5-1 5-1.900C9.8 10.2 11.4 6.8 12 2Z" />
    </svg>
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
  const panelRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!open) return;
    const small = window.matchMedia("(max-width: 639px)");
    const prevOverflow = document.body.style.overflow;
    if (small.matches) document.body.style.overflow = "hidden";

    // On phones the panel is a bottom sheet pinned to the *visible* area, so the on-screen
    // keyboard never covers the input.
    const vv = window.visualViewport;
    const fit = () => {
      const el = panelRef.current;
      if (!el) return;
      if (!small.matches || !vv) {
        el.style.height = "";
        el.style.bottom = "";
        return;
      }
      const keyboard = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      el.style.bottom = `${keyboard}px`;
      el.style.height = `${Math.min(vv.height - 8, window.innerHeight * 0.86)}px`;
    };
    fit();
    vv?.addEventListener("resize", fit);
    vv?.addEventListener("scroll", fit);
    window.addEventListener("resize", fit);

    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    inputRef.current?.focus({ preventScroll: true });

    return () => {
      document.body.style.overflow = prevOverflow;
      vv?.removeEventListener("resize", fit);
      vv?.removeEventListener("scroll", fit);
      window.removeEventListener("resize", fit);
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
  const sans = "font-sans";

  return (
    <>
      {/* floating button */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={title}
          title={title}
          className="chat-pop fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-50 flex size-14 items-center justify-center rounded-full bg-rosegold text-ivory shadow-[0_8px_24px_-6px_rgba(59,42,34,0.45)] ring-2 ring-gold/70 transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold sm:bottom-6 sm:right-6"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="M20.5 11.5a8 8 0 0 1-11.6 7.1L4 20l1.4-4.600A8 8 0 1 1 20.5 11.500Z" strokeLinejoin="round" />
            <circle cx="9" cy="11.5" r=".9" fill="currentColor" stroke="none" />
            <circle cx="12.5" cy="11.5" r=".9" fill="currentColor" stroke="none" />
            <circle cx="16" cy="11.5" r=".9" fill="currentColor" stroke="none" />
          </svg>
        </button>
      )}

      {open && (
        <>
          {/* dim backdrop on phones */}
          <div className="fixed inset-0 z-40 bg-black/30 sm:hidden" onClick={() => setOpen(false)} aria-hidden="true" />

          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className={`chat-pop ${sans} fixed inset-x-0 bottom-0 z-50 flex h-[86dvh] flex-col overflow-hidden rounded-t-3xl bg-ivory shadow-[0_-12px_40px_-8px_rgba(0,0,0,0.35)] sm:inset-x-auto sm:bottom-6 sm:right-6 sm:h-[min(32rem,calc(100dvh-3rem))] sm:w-[22rem] sm:rounded-2xl sm:shadow-[0_24px_60px_-12px_rgba(59,42,34,0.40)] sm:ring-1 sm:ring-gold/50`}
          >
            {/* header */}
            <div className="flex shrink-0 items-center gap-3 border-b border-gold/30 px-4 py-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-rosegold text-gold-light">
                <Sparkle size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-semibold leading-tight text-ink">{title}</p>
                <p className="text-xs leading-tight text-muted">AI assistant · usually replies instantly</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="-mr-1.5 flex size-10 shrink-0 items-center justify-center rounded-full text-muted hover:bg-paper hover:text-ink"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            {/* messages */}
            <div ref={listRef} className="min-h-0 flex-1 space-y-2.5 overflow-y-auto overscroll-contain px-4 py-4" aria-live="polite">
              <div className="max-w-[88%] whitespace-pre-wrap rounded-2xl rounded-bl-md bg-paper px-3.5 py-2.5 text-[15px] leading-relaxed text-ink">
                {greeting}
              </div>

              {showChips && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => void send(s)}
                      className="rounded-full border border-gold/70 bg-ivory px-3.5 py-1.5 text-[13.5px] font-medium text-rosegold transition-colors hover:bg-rosegold hover:text-ivory"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {messages.map((m, i) =>
                m.role === "user" ? (
                  <div
                    key={i}
                    className="ml-auto w-fit max-w-[88%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-rosegold px-3.5 py-2.5 text-[15px] leading-relaxed text-ivory"
                  >
                    {m.content}
                  </div>
                ) : (
                  <div
                    key={i}
                    className="max-w-[88%] whitespace-pre-wrap rounded-2xl rounded-bl-md bg-paper px-3.5 py-2.5 text-[15px] leading-relaxed text-ink"
                  >
                    {m.content ? (
                      <Linkified text={m.content} />
                    ) : (
                      <span className="inline-flex items-center gap-1 py-1.5" aria-label="Typing">
                        <span className="size-1.5 animate-bounce rounded-full bg-gold-deep [animation-delay:-0.3s]" />
                        <span className="size-1.5 animate-bounce rounded-full bg-gold-deep [animation-delay:-0.15s]" />
                        <span className="size-1.5 animate-bounce rounded-full bg-gold-deep" />
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
              className="shrink-0 px-3 pb-[max(0.625rem,env(safe-area-inset-bottom))] pt-2"
            >
              <div className="flex items-end gap-2 rounded-3xl border border-gold/50 bg-paper py-1.5 pl-4 pr-1.5 focus-within:border-rosegold">
                <textarea
                  ref={inputRef}
                  value={input}
                  rows={1}
                  maxLength={500}
                  placeholder="Ask a question…"
                  aria-label="Your question"
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void send(input);
                    }
                  }}
                  // 16px text stops iPhones zooming the page when the box is focused
                  className="max-h-24 min-h-9 flex-1 resize-none bg-transparent py-1.5 text-[16px] leading-snug text-ink outline-none placeholder:text-muted/70"
                />
                <button
                  type="submit"
                  disabled={busy || !input.trim()}
                  aria-label="Send"
                  className="flex size-9 shrink-0 items-center justify-center rounded-full bg-rosegold text-ivory transition-opacity disabled:opacity-35"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 19V5M5 12l7-7 7 7" />
                  </svg>
                </button>
              </div>
              <p className="mt-1.5 text-center text-[11px] leading-tight text-muted">
                AI answers from this site. For anything important, contact the family.
              </p>
            </form>
          </div>
        </>
      )}
    </>
  );
}
