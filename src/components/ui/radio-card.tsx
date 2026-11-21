"use client";

import * as React from "react";
import { RadioGroup as RadioPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

export const RadioGroup = RadioPrimitive.Root;

/** Figma: Radio Option (Selected = Yes / No) — a selectable card. */
export function RadioCard({
  value,
  title,
  description,
  trailing,
  icon,
  className,
}: {
  value: string;
  title: string;
  description?: string;
  trailing?: string;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <RadioPrimitive.Item
      value={value}
      className={cn(
        "group flex w-full cursor-pointer items-center gap-3 rounded-md border-[1.25px] border-line bg-white px-4 py-3.5 text-left transition-colors hover:border-orange-500/60 data-[state=checked]:border-[1.75px] data-[state=checked]:border-orange-500 data-[state=checked]:bg-orange-100",
        className,
      )}
    >
      <span className="size-5 shrink-0 rounded-full border-[1.5px] border-line bg-white transition-all group-data-[state=checked]:border-[6px] group-data-[state=checked]:border-brown-700" />
      {icon}
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="t-label text-ink">{title}</span>
        {description && <span className="t-bn-s text-ink-soft">{description}</span>}
      </span>
      {trailing && <span className="t-label shrink-0 text-ink">{trailing}</span>}
    </RadioPrimitive.Item>
  );
}
