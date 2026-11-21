import * as React from "react";
import { cn } from "@/lib/utils";

type Props = {
  id: string;
  label: string;
  required?: boolean;
  optional?: boolean;
  error?: string;
  className?: string;
  children: React.ReactNode;
};

/** Figma: Input Field — label row (required * / optional) + control + error message. */
export function FormField({ id, label, required, optional, error, className, children }: Props) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={id} className="t-label flex items-center gap-1 text-ink">
        {label}
        {required && <span className="text-sale" aria-hidden>*</span>}
        {optional && <span className="t-body-s font-sans text-ink-muted">(optional)</span>}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="t-caption text-sale">
          {error}
        </p>
      )}
    </div>
  );
}
