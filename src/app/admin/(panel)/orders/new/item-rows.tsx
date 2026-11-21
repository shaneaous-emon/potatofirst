"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

export function ItemRows({ variants }: { variants: { sku: string; label: string }[] }) {
  const [rows, setRows] = useState([0]);
  return (
    <div className="flex flex-col gap-2">
      {rows.map((r, i) => (
        <div key={r} className="flex gap-2">
          <select name="sku" required className="h-10 min-w-0 flex-1 cursor-pointer rounded-sm border border-line bg-white px-3 text-[14px]">
            <option value="">Choose product…</option>
            {variants.map((v) => (
              <option key={v.sku} value={v.sku}>
                {v.label}
              </option>
            ))}
          </select>
          <input name="qty" type="number" min={1} defaultValue={1} aria-label="Quantity" className="h-10 w-20 rounded-sm border border-line px-3 text-[14px]" />
          <button type="button" aria-label="Remove line" disabled={rows.length === 1} onClick={() => setRows(rows.filter((_, j) => j !== i))} className="grid size-10 shrink-0 cursor-pointer place-items-center rounded-sm border border-line text-ink-muted hover:border-sale hover:text-sale disabled:opacity-30">
            <Trash2 className="size-4" />
          </button>
        </div>
      ))}
      <button type="button" onClick={() => setRows([...rows, Math.max(...rows) + 1])} className="inline-flex h-9 cursor-pointer items-center gap-1.5 self-start rounded-sm px-2 text-[13px] font-medium text-brown-700 hover:bg-cream-100">
        <Plus className="size-4" /> Add product
      </button>
      <p className="text-[12px] text-ink-muted">Prices, delivery charge, coupon and stock are calculated on save — exactly like website checkout.</p>
    </div>
  );
}
