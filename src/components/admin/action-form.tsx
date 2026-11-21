"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export type ActionResult = { ok: boolean; message: string; errors?: Record<string, string> } | null;
type Action = (prev: ActionResult, data: FormData) => Promise<ActionResult>;

/** Form bound to a server action; shows a toast with the result and inline field errors. */
export function ActionForm({
  action,
  children,
  className,
  confirm,
  resetOnSuccess,
}: {
  action: Action;
  children: React.ReactNode;
  className?: string;
  /** confirmation text for destructive/sensitive actions */
  confirm?: string;
  resetOnSuccess?: boolean;
}) {
  const [state, run] = useActionState(action, null);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      toast.success(state.message);
      if (resetOnSuccess) ref.current?.reset();
    } else toast.error(state.message);
  }, [state, resetOnSuccess]);
  return (
    <form
      ref={ref}
      action={run}
      className={className}
      onSubmit={(e) => {
        if (confirm && !window.confirm(confirm)) e.preventDefault();
      }}
    >
      {children}
      {state && !state.ok && state.errors && (
        <ul className="mt-3 flex flex-col gap-1 rounded-sm bg-sale/10 px-3 py-2 text-[13px] text-sale" role="alert">
          {Object.entries(state.errors).map(([k, v]) => (
            <li key={k}>{v}</li>
          ))}
        </ul>
      )}
    </form>
  );
}

export function SubmitButton({ children, className, name, value }: { children: React.ReactNode; className?: string; name?: string; value?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      name={name}
      value={value}
      disabled={pending}
      className={cn(
        "inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-sm bg-brown-700 px-4 text-[14px] font-medium text-cream-100 transition-colors hover:bg-brown-900 disabled:opacity-60 [&_svg]:size-4",
        className,
      )}
    >
      {pending && <Loader2 className="animate-spin" />}
      {children}
    </button>
  );
}
