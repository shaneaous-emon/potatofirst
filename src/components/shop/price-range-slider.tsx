"use client";

import { formatPrice } from "@/lib/utils";

/** Two-handle price slider (drag left/right). Values are inclusive. */
export function PriceRangeSlider({
  min,
  max,
  step = 10,
  value,
  onChange,
}: {
  min: number;
  max: number;
  step?: number;
  value: [number, number];
  onChange: (v: [number, number]) => void;
}) {
  const [lo, hi] = value;
  const span = Math.max(1, max - min);
  const pct = (v: number) => ((v - min) / span) * 100;
  const thumb =
    "pointer-events-none absolute inset-0 h-5 w-full appearance-none bg-transparent outline-none [&::-webkit-slider-runnable-track]:bg-transparent " +
    "[&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-5 [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-[3px] [&::-webkit-slider-thumb]:border-brown-700 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-card [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110 active:[&::-webkit-slider-thumb]:cursor-grabbing " +
    "[&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:cursor-grab [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-[3px] [&::-moz-range-thumb]:border-brown-700 [&::-moz-range-thumb]:bg-white " +
    "focus-visible:[&::-webkit-slider-thumb]:ring-4 focus-visible:[&::-webkit-slider-thumb]:ring-orange-500/40";

  return (
    <div className="flex flex-col gap-3">
      <div className="relative h-5">
        <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-cream-200" />
        <div className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-orange-500" style={{ left: `${pct(lo)}%`, right: `${100 - pct(hi)}%` }} />
        <input
          type="range"
          aria-label="Minimum price"
          min={min}
          max={max}
          step={step}
          value={lo}
          onChange={(e) => onChange([Math.min(Number(e.target.value), hi - step), hi])}
          className={thumb}
          style={{ zIndex: lo > max - step * 2 ? 5 : 3 }}
        />
        <input
          type="range"
          aria-label="Maximum price"
          min={min}
          max={max}
          step={step}
          value={hi}
          onChange={(e) => onChange([lo, Math.max(Number(e.target.value), lo + step)])}
          className={thumb}
          style={{ zIndex: 4 }}
        />
      </div>
      <div className="flex items-center justify-between t-body-s">
        <span className="rounded-sm border border-line px-2.5 py-1 text-ink">{formatPrice(lo)}</span>
        <span className="text-ink-muted">to</span>
        <span className="rounded-sm border border-line px-2.5 py-1 text-ink">{formatPrice(hi)}</span>
      </div>
    </div>
  );
}
