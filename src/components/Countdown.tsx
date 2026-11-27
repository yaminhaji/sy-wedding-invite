"use client";

import { useEffect, useState } from "react";

function diff(target: number, now: number) {
  const ms = Math.max(0, target - now);
  return {
    Days: Math.floor(ms / 86_400_000),
    Hours: Math.floor((ms / 3_600_000) % 24),
    Mins: Math.floor((ms / 60_000) % 60),
    Secs: Math.floor((ms / 1000) % 60),
  };
}

export function Countdown({ to, label }: { to: string; label?: string }) {
  const target = new Date(to).getTime();
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, []);

  if (now !== null && now >= target) return null;
  const parts = now === null ? null : diff(target, now);

  return (
    <div className="text-center">
      {label && <p className="eyebrow">{label}</p>}
      <div className="mt-4 flex justify-center gap-2 sm:gap-3">
        {(["Days", "Hours", "Mins", "Secs"] as const).map((k) => (
          <div
            key={k}
            className="flex w-16 flex-col items-center border border-gold/60 bg-ivory py-2.5 sm:w-20 sm:py-3"
          >
            <span className="font-serif text-3xl font-semibold leading-none tabular-nums text-rosegold sm:text-4xl">
              {parts ? String(parts[k]).padStart(2, "0") : "--"}
            </span>
            <span className="caps mt-1.5 text-xs text-gold-deep">{k}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
