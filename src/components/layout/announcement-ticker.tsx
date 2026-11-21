"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Truck } from "lucide-react";
import { cn } from "@/lib/utils";

type Message = { text: string; href?: string };

/** Rotates announcement messages; pauses on hover; respects reduced motion. */
export function AnnouncementTicker({ messages, intervalMs = 4000 }: { messages: Message[]; intervalMs?: number }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (messages.length < 2 || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI((n) => (n + 1) % messages.length), intervalMs);
    return () => clearInterval(t);
  }, [messages.length, intervalMs, paused]);

  return (
    <div
      className="relative flex h-6 min-w-0 flex-1 items-center justify-center overflow-hidden lg:max-w-[560px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-live="polite"
    >
      {messages.map((m, n) => {
        const body = (
          <>
            <Truck className="size-4 shrink-0 text-orange-500" aria-hidden />
            <span className="truncate">{m.text}</span>
          </>
        );
        const cls = cn(
          "absolute inset-0 flex items-center justify-center gap-2 t-body-s transition-all duration-500 max-sm:text-xs",
          n === i ? "translate-y-0 opacity-100" : n < i ? "pointer-events-none -translate-y-full opacity-0" : "pointer-events-none translate-y-full opacity-0",
        );
        return m.href ? (
          <Link key={m.text} href={m.href} className={cn(cls, "hover:text-orange-500")} aria-hidden={n !== i} tabIndex={n === i ? 0 : -1}>
            {body}
          </Link>
        ) : (
          <p key={m.text} className={cls} aria-hidden={n !== i}>
            {body}
          </p>
        );
      })}
    </div>
  );
}
