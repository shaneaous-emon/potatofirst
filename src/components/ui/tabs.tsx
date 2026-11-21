"use client";

import * as React from "react";
import { Tabs as TabsPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

export const Tabs = TabsPrimitive.Root;

export function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn("scrollbar-none flex gap-6 overflow-x-auto border-b border-line sm:gap-8", className)}
      {...props}
    />
  );
}

/** Figma: Product Tabs › tab (active = orange 3px underline, inactive = muted). */
export function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        "-mb-px shrink-0 cursor-pointer whitespace-nowrap border-b-[3px] border-transparent pb-3.5 t-h4 text-ink-muted transition-colors hover:text-ink data-[state=active]:border-orange-500 data-[state=active]:text-ink",
        className,
      )}
      {...props}
    />
  );
}

export function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return <TabsPrimitive.Content className={cn("pt-8 outline-none", className)} {...props} />;
}
