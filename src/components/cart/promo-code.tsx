"use client";

import { useState } from "react";
import { Minus, Plus, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { validatePromo } from "@/lib/services/orders";
import { cn } from "@/lib/utils";

/** Figma: Promo Code (collapsed / expanded accordion). */
export function PromoCode({ subtotal, onApplied, defaultOpen = false }: { subtotal: number; onApplied?: (discount: number, code: string) => void; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const [code, setCode] = useState("");
  const [state, setState] = useState<{ status: "idle" | "loading" | "error" | "ok"; message?: string }>({ status: "idle" });

  return (
    <div className={cn("rounded-sm", open ? "bg-cream-100 p-4" : "border border-dashed border-line px-4 py-3.5")}>
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className="flex w-full cursor-pointer items-center justify-between gap-3 transition-colors hover:text-brown-700">
        <span className="flex items-center gap-2.5 t-label text-ink">
          <Tag className="size-[18px] text-orange-600" aria-hidden /> Have a promo code?
        </span>
        {open ? <Minus className="size-[18px]" aria-hidden /> : <Plus className="size-[18px]" aria-hidden />}
      </button>
      {open && (
        <form
          className="mt-3 flex flex-col gap-2"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!code.trim()) return setState({ status: "error", message: "Please enter a code." });
            setState({ status: "loading" });
            const res = await validatePromo(code, subtotal);
            setState({ status: res.ok ? "ok" : "error", message: res.message });
            if (res.ok) onApplied?.(res.discount, code);
          }}
        >
          <div className="flex gap-2">
            <label htmlFor="promo" className="sr-only">
              Promo code
            </label>
            <input
              id="promo"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter code"
              aria-invalid={state.status === "error"}
              className="h-11 min-w-0 flex-1 rounded-sm border-[1.25px] border-line bg-white px-3.5 t-body uppercase outline-none placeholder:normal-case focus:border-orange-500 aria-[invalid=true]:border-sale"
            />
            <Button type="submit" variant="light" size="sm" className="h-11" disabled={state.status === "loading"}>
              {state.status === "loading" ? "Checking…" : "Apply"}
            </Button>
          </div>
          {state.message && <p role="status" className={cn("t-caption", state.status === "ok" ? "text-green-600" : "text-sale")}>{state.message}</p>}
        </form>
      )}
    </div>
  );
}
