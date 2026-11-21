import { connection } from "next/server";
import { LoginForm } from "./login-form";

export default async function AdminLoginPage(props: { searchParams?: Promise<{ next?: string }> }) {
  await connection();
  const sp = props.searchParams ? await props.searchParams : undefined;
  const next = sp?.next && sp.next.startsWith("/admin") ? sp.next : "/admin";

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
        <LoginForm next={next} />
      </div>
    </div>
  );
}
