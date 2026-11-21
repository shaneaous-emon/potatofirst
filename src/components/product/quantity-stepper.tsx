"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

/** Figma: Quantity Stepper */
export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  size = "md",
  label = "Quantity",
  className,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "md";
  label?: string;
  className?: string;
}) {
  const btn = cn("grid place-items-center text-ink transition-colors hover:bg-cream-100 disabled:opacity-30 cursor-pointer", size === "sm" ? "size-9" : "h-[46px] w-11");
  return (
    <div className={cn("inline-flex items-center rounded-sm border-[1.25px] border-line bg-white", className)} role="group" aria-label={label}>
      <button type="button" className={btn} onClick={() => onChange(value - 1)} disabled={value <= min} aria-label="Decrease quantity">
        <Minus className="size-4" />
      </button>
      <output aria-live="polite" className={cn("grid place-items-center font-display font-semibold text-ink tabular-nums", size === "sm" ? "w-8 text-sm" : "w-11 text-lg")}>
        {value}
      </output>
      <button type="button" className={btn} onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Increase quantity">
        <Plus className="size-4" />
      </button>
    </div>
  );
}
