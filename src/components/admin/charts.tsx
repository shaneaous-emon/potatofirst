import { cn } from "@/lib/utils";
import { taka } from "./ui";

/** Lightweight bar chart (no chart library): daily values with hover labels. */
export function BarTrend({ data }: { data: { day: string; value: number; n: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const showEvery = Math.ceil(data.length / 8);
  return (
    <div className="flex flex-col gap-2">
      <div className="flex h-44 items-end gap-[3px]" role="img" aria-label="Daily net sales">
        {data.map((d) => (
          <div key={d.day} className="group relative flex h-full flex-1 items-end">
            <div className="w-full rounded-t-[3px] bg-orange-500/80 transition-colors group-hover:bg-brown-700" style={{ height: `${Math.max(2, (d.value / max) * 100)}%` }} />
            <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded-sm bg-brown-900 px-2 py-1 text-[11px] text-white group-hover:block">
              {d.day.slice(5)} · {taka(d.value)} · {d.n} orders
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-[3px] text-[10px] text-ink-muted">
        {data.map((d, i) => (
          <span key={d.day} className="flex-1 text-center">
            {i % showEvery === 0 ? d.day.slice(8) + "/" + d.day.slice(5, 7) : ""}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Horizontal share bars (status / payment split). */
export function ShareBars({ rows }: { rows: { label: string; value: number; display?: string; tone?: string }[] }) {
  const total = Math.max(1, rows.reduce((a, r) => a + r.value, 0));
  return (
    <ul className="flex flex-col gap-3">
      {rows.map((r) => (
        <li key={r.label} className="flex flex-col gap-1">
          <div className="flex justify-between text-[13px]">
            <span className="text-ink">{r.label}</span>
            <span className="text-ink-muted">{r.display ?? r.value}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-cream-200">
            <div className={cn("h-full rounded-full", r.tone ?? "bg-brown-700")} style={{ width: `${(r.value / total) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
