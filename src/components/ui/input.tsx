import * as React from "react";
import { cn } from "@/lib/utils";

/** Figma: Input Field › Field (Default / Focus / Error) */
export const fieldClass =
  "w-full rounded-sm border-[1.25px] border-line bg-white px-4 py-3 t-body text-ink placeholder:text-ink-muted outline-none transition-[border-color,box-shadow] focus-visible:border-orange-500 focus-visible:border-2 focus-visible:shadow-[0_0_0_4px_rgb(232_150_24/0.18)] focus-visible:outline-none aria-[invalid=true]:border-sale aria-[invalid=true]:border-[1.5px] disabled:opacity-50";

export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return <input data-slot="input" className={cn(fieldClass, "h-12", className)} {...props} />;
}

export function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return <textarea data-slot="textarea" className={cn(fieldClass, "min-h-28 resize-y", className)} {...props} />;
}
