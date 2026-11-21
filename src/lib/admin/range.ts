/** Date-range filter shared by dashboard and reports (Asia/Dhaka days). */
export type RangeKey = "today" | "yesterday" | "7d" | "30d" | "month" | "custom";
export const RANGES: { value: RangeKey; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "month", label: "This month" },
  { value: "custom", label: "Custom" },
];

const OFFSET = 6 * 3600000; // Asia/Dhaka, no DST

/** start of the Dhaka day containing `d`, as a UTC Date */
function dhakaDayStart(d: Date) {
  const local = new Date(d.getTime() + OFFSET);
  local.setUTCHours(0, 0, 0, 0);
  return new Date(local.getTime() - OFFSET);
}

export function resolveRange(sp: { range?: string; from?: string; to?: string }) {
  const key = (RANGES.some((r) => r.value === sp.range) ? sp.range : "30d") as RangeKey;
  const now = new Date();
  const today = dhakaDayStart(now);
  const day = 86400000;
  let from = new Date(today.getTime() - 29 * day);
  let to = new Date(today.getTime() + day);
  if (key === "today") from = today;
  if (key === "yesterday") {
    from = new Date(today.getTime() - day);
    to = today;
  }
  if (key === "7d") from = new Date(today.getTime() - 6 * day);
  if (key === "month") {
    const l = new Date(now.getTime() + OFFSET);
    from = new Date(Date.UTC(l.getUTCFullYear(), l.getUTCMonth(), 1) - OFFSET);
  }
  if (key === "custom" && sp.from && sp.to) {
    from = new Date(new Date(`${sp.from}T00:00:00Z`).getTime() - OFFSET);
    to = new Date(new Date(`${sp.to}T00:00:00Z`).getTime() - OFFSET + day);
  }
  const days = Math.max(1, Math.round((to.getTime() - from.getTime()) / day));
  const prevFrom = new Date(from.getTime() - days * day);
  return { key, from, to, prevFrom, days, fromStr: sp.from ?? "", toStr: sp.to ?? "" };
}
