"use client";

import { useSearchParams } from "next/navigation";
import { ActionForm, SubmitButton } from "@/components/admin/action-form";
import { Field, inputCls } from "@/components/admin/ui";
import { loginAction } from "../_actions/auth";

export function LoginForm() {
  const next = useSearchParams().get("next") ?? "/admin";
  return (
    <ActionForm action={loginAction} className="flex flex-col gap-4">
      <input type="hidden" name="next" value={next.startsWith("/admin") ? next : "/admin"} />
      <Field label="Email">
        <input name="email" type="email" autoComplete="username" required className={inputCls + " h-11"} placeholder="you@potatofirst.com" />
      </Field>
      <Field label="Password">
        <input name="password" type="password" autoComplete="current-password" required className={inputCls + " h-11"} placeholder="••••••••" />
      </Field>
      <SubmitButton className="h-11 w-full">Sign in</SubmitButton>
      <p className="text-center text-[12px] text-ink-muted">After 5 wrong attempts the account is locked for 15 minutes.</p>
    </ActionForm>
  );
}
