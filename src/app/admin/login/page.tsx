import { Suspense } from "react";
import { LoginForm } from "./login-form";

export default function AdminLoginPage() {
  return (
    <div className="grid min-h-dvh place-items-center bg-brown-900 px-4 py-10">
      <div className="w-full max-w-[400px] rounded-lg bg-white p-7 shadow-pop sm:p-9">
        <div className="mb-6 flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-sm bg-orange-500 font-display text-xl font-bold text-brown-900">P</span>
          <div>
            <h1 className="font-display text-xl font-semibold text-ink">Potato First Admin</h1>
            <p className="text-[13px] text-ink-muted">Sign in to manage your store</p>
          </div>
        </div>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
