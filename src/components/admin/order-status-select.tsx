"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { quickStatusAction } from "@/app/admin/_actions/orders";
import { ORDER_STATUS_META } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

const TONE: Record<string, string> = {
  gray: "border-cream-200 bg-cream-200 text-ink-soft",
  orange: "border-orange-100 bg-orange-100 text-orange-600",
  green: "border-green-100 bg-green-100 text-green-600",
  red: "border-sale/20 bg-sale/10 text-sale",
  blue: "border-[#e6f0fb] bg-[#e6f0fb] text-[#1d5fa8]",
  purple: "border-[#efe8fb] bg-[#efe8fb] text-[#6a3fb5]",
  brown: "border-brown-100 bg-brown-100 text-brown-700",
};

/**
 * Status dropdown that lives directly in the order row.
 * Pick a status → the order moves there (intermediate steps such as confirm → pack → ship happen automatically).
 */
export function OrderStatusSelect({ orderId, status, options }: { orderId: number; status: string; options: string[] }) {
  const [value, setValue] = useState(status);
  const [pending, start] = useTransition();
  const meta = ORDER_STATUS_META[value] ?? { label: value, tone: "gray" };

  function change(to: string) {
    if (to === value) return;
    const opts: { cancelReason?: string; restock?: boolean } = {};
    if (to === "cancelled") {
      const reason = window.prompt("Cancel reason (optional):", "");
      if (reason === null) return;
      opts.cancelReason = reason;
    } else if (to === "returned") {
      opts.restock = window.confirm("Put the returned items back in stock?\n\nOK = yes, restock · Cancel = no");
    } else if (to === "refunded" || to === "failed") {
      if (!window.confirm(`Mark this order as ${ORDER_STATUS_META[to].label}?`)) return;
    }
    const prev = value;
    setValue(to);
    start(async () => {
      const r = await quickStatusAction(orderId, to, opts);
      if (r.ok) toast.success(r.message);
      else {
        setValue(prev);
        toast.error(r.message);
      }
    });
  }

  // terminal status (nothing to move to) → plain badge
  if (options.length === 0) return <span className={cn("inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-[12px] font-medium", TONE[meta.tone])}>{meta.label}</span>;

  return (
    <span className="relative inline-flex items-center">
      <select
        value={value}
        disabled={pending}
        onChange={(e) => change(e.target.value)}
        aria-label="Change order status"
        className={cn("h-8 cursor-pointer rounded-full border py-0 pl-3 pr-7 text-[12px] font-semibold outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-60", TONE[meta.tone])}
      >
        <option value={status}>{ORDER_STATUS_META[status]?.label ?? status}</option>
        {options.map((s) => (
          <option key={s} value={s}>
            → {ORDER_STATUS_META[s]?.label ?? s}
          </option>
        ))}
      </select>
      {pending && <Loader2 className="pointer-events-none absolute right-2 size-3.5 animate-spin" />}
    </span>
  );
}
