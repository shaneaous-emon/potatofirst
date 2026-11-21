"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, LogOut, MapPin, Package, ShoppingBag, Truck, User } from "lucide-react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { site } from "@/content/site";
import { loginCustomer, logoutCustomer, registerCustomer, socialLogin } from "@/lib/services/auth";
import { parseOrder, readLastOrderRaw } from "@/lib/services/orders";
import { cn, formatPrice } from "@/lib/utils";
import { loginSchema, registerSchema, type LoginValues, type RegisterValues } from "@/lib/validation/schemas";
import { useAuth, type Customer } from "@/stores/auth";
import { useHydrated } from "@/stores/use-hydrated";

/** My Account: login / sign up (incl. Google & Facebook) or the customer dashboard. */
export function AccountView() {
  const hydrated = useHydrated();
  const user = useAuth((s) => s.user);
  if (!hydrated) return <Skeleton className="h-[520px] w-full rounded-lg" />;
  return user ? <Dashboard user={user} /> : <AuthPanel />;
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
      <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.7z" />
      <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1A12 12 0 0 0 12 24z" />
      <path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6h-4a12 12 0 0 0 0 10.8l4-3.1z" />
      <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1c.9-2.8 3.6-4.9 6.7-4.9z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
      <path fill="#1877F2" d="M24 12a12 12 0 1 0-13.9 11.9v-8.4h-3V12h3V9.4c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 .9-2 1.9V12h3.4l-.5 3.5h-2.9v8.4A12 12 0 0 0 24 12z" />
    </svg>
  );
}

function PasswordInput({ id, invalid, ...props }: React.ComponentProps<"input"> & { invalid?: boolean }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input id={id} type={show ? "text" : "password"} aria-invalid={invalid} className="pr-12" {...props} />
      <button
        type="button"
        onClick={() => setShow(!show)}
        aria-label={show ? "Hide password" : "Show password"}
        className="absolute right-2 top-1/2 grid size-9 -translate-y-1/2 cursor-pointer place-items-center rounded-full text-ink-muted transition-colors hover:bg-cream-100 hover:text-ink"
      >
        {show ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
      </button>
    </div>
  );
}

function AuthPanel() {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [social, setSocial] = useState<"google" | "facebook" | null>(null);
  const setUser = useAuth((s) => s.setUser);
  const providers = site.features.accounts.social;

  const done = (u: Customer, msg: string) => {
    setUser(u);
    toast.success(msg, { description: `Welcome, ${u.name.split(" ")[0]}!` });
  };

  return (
    <div className="mx-auto grid w-full max-w-[960px] grid-cols-1 overflow-hidden rounded-lg border border-line bg-white lg:grid-cols-[1fr_380px]">
      <div className="flex flex-col gap-6 p-6 sm:p-10">
        <div role="tablist" aria-label="Account" className="grid grid-cols-2 rounded-full bg-cream-100 p-1">
          {(["login", "register"] as const).map((t) => (
            <button
              key={t}
              role="tab"
              type="button"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={cn(
                "h-11 cursor-pointer rounded-full t-button transition-colors",
                tab === t ? "bg-white text-brown-700 shadow-card" : "text-ink-soft hover:text-brown-700",
              )}
            >
              {t === "login" ? "Log In" : "Sign Up"}
            </button>
          ))}
        </div>

        {(providers.google || providers.facebook) && (
          <div className="flex flex-col gap-3">
            {providers.google && (
              <Button
                variant="outline"
                size="lg"
                className="border-line text-ink hover:border-ink hover:bg-cream-50 hover:text-ink"
                disabled={!!social}
                onClick={async () => {
                  setSocial("google");
                  done(await socialLogin("google"), "Signed in with Google");
                  setSocial(null);
                }}
              >
                {social === "google" ? <Loader2 className="animate-spin" /> : <GoogleIcon />} Continue with Google
              </Button>
            )}
            {providers.facebook && (
              <Button
                variant="outline"
                size="lg"
                className="border-line text-ink hover:border-[#1877F2] hover:bg-[#1877F2] hover:text-white"
                disabled={!!social}
                onClick={async () => {
                  setSocial("facebook");
                  done(await socialLogin("facebook"), "Signed in with Facebook");
                  setSocial(null);
                }}
              >
                {social === "facebook" ? <Loader2 className="animate-spin" /> : <FacebookIcon />} Continue with Facebook
              </Button>
            )}
            <div className="flex items-center gap-3 pt-1 t-caption text-ink-muted">
              <span className="h-px flex-1 bg-line" /> or with your phone / email <span className="h-px flex-1 bg-line" />
            </div>
          </div>
        )}

        {tab === "login" ? <LoginForm onDone={(u) => done(u, "Logged in")} onSwitch={() => setTab("register")} /> : <RegisterForm onDone={(u) => done(u, "Account created")} onSwitch={() => setTab("login")} />}
      </div>

      <aside className="flex flex-col justify-center gap-5 bg-brown-900 p-8 text-cream-100 sm:p-10">
        <h2 className="t-h3">Why create an account?</h2>
        <ul className="flex flex-col gap-4">
          {[
            { I: Package, t: "Track every order", d: "See all your orders and their status in one place." },
            { I: MapPin, t: "Faster checkout", d: "Your name, phone and address are filled in for you." },
            { I: ShoppingBag, t: "Offers for members", d: "Get early access to new flavours and deals." },
          ].map(({ I, t, d }) => (
            <li key={t} className="flex gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-orange-500 text-brown-900">
                <I className="size-5" aria-hidden />
              </span>
              <span>
                <span className="block t-label">{t}</span>
                <span className="block t-body-s text-cream-100/70">{d}</span>
              </span>
            </li>
          ))}
        </ul>
        <p className="border-t border-cream-100/15 pt-5 t-body-s text-cream-100/70">
          No account needed to order —{" "}
          <Link href="/shop" className="text-orange-500 underline transition-colors hover:text-cream-100">
            continue as guest
          </Link>
          .
        </p>
      </aside>
    </div>
  );
}

function LoginForm({ onDone, onSwitch }: { onDone: (u: Customer) => void; onSwitch: () => void }) {
  const { register, handleSubmit, formState } = useForm<LoginValues>({ resolver: zodResolver(loginSchema), defaultValues: { identifier: "", password: "" } });
  const e = formState.errors;
  return (
    <form noValidate onSubmit={handleSubmit(async (v) => onDone(await loginCustomer(v)))} className="flex flex-col gap-4">
      <FormField id="login-id" label="Phone or email" required error={e.identifier?.message}>
        <Input id="login-id" autoComplete="username" placeholder="01XXXXXXXXX or you@email.com" aria-invalid={!!e.identifier} {...register("identifier")} />
      </FormField>
      <FormField id="login-pass" label="Password" required error={e.password?.message}>
        <PasswordInput id="login-pass" autoComplete="current-password" placeholder="Your password" invalid={!!e.password} {...register("password")} />
      </FormField>
      <button
        type="button"
        onClick={() => toast("Password reset", { description: "We’ll send a reset code to your phone once the backend is connected." })}
        className="-mt-1 cursor-pointer self-end t-body-s text-brown-700 transition-colors hover:text-orange-600 hover:underline"
      >
        Forgot password?
      </button>
      <Button type="submit" size="lg" disabled={formState.isSubmitting}>
        {formState.isSubmitting && <Loader2 className="animate-spin" />} Log In
      </Button>
      <p className="text-center t-body-s text-ink-soft">
        New here?{" "}
        <button type="button" onClick={onSwitch} className="cursor-pointer t-label text-brown-700 transition-colors hover:text-orange-600 hover:underline">
          Create an account
        </button>
      </p>
    </form>
  );
}

function RegisterForm({ onDone, onSwitch }: { onDone: (u: Customer) => void; onSwitch: () => void }) {
  const { register, handleSubmit, formState } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", phone: "", email: "", password: "", confirm: "" },
  });
  const e = formState.errors;
  return (
    <form
      noValidate
      onSubmit={handleSubmit(async (v) => onDone(await registerCustomer({ name: v.name, phone: v.phone, email: v.email || undefined, password: v.password })))}
      className="flex flex-col gap-4"
    >
      <FormField id="reg-name" label="Full name" required error={e.name?.message}>
        <Input id="reg-name" autoComplete="name" placeholder="Your name" aria-invalid={!!e.name} {...register("name")} />
      </FormField>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField id="reg-phone" label="Phone number" required error={e.phone?.message}>
          <Input id="reg-phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="01XXXXXXXXX" aria-invalid={!!e.phone} {...register("phone")} />
        </FormField>
        <FormField id="reg-email" label="Email" optional error={e.email?.message}>
          <Input id="reg-email" type="email" autoComplete="email" placeholder="you@email.com" aria-invalid={!!e.email} {...register("email")} />
        </FormField>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField id="reg-pass" label="Password" required error={e.password?.message}>
          <PasswordInput id="reg-pass" autoComplete="new-password" placeholder="At least 6 characters" invalid={!!e.password} {...register("password")} />
        </FormField>
        <FormField id="reg-confirm" label="Confirm password" required error={e.confirm?.message}>
          <PasswordInput id="reg-confirm" autoComplete="new-password" placeholder="Repeat password" invalid={!!e.confirm} {...register("confirm")} />
        </FormField>
      </div>
      <p className="t-caption text-ink-muted">
        By creating an account you agree to our{" "}
        <Link href="/policies/terms" className="text-brown-700 underline transition-colors hover:text-orange-600">
          Terms
        </Link>{" "}
        and{" "}
        <Link href="/policies/privacy" className="text-brown-700 underline transition-colors hover:text-orange-600">
          Privacy Policy
        </Link>
        .
      </p>
      <Button type="submit" size="lg" disabled={formState.isSubmitting}>
        {formState.isSubmitting && <Loader2 className="animate-spin" />} Create Account
      </Button>
      <p className="text-center t-body-s text-ink-soft">
        Already have an account?{" "}
        <button type="button" onClick={onSwitch} className="cursor-pointer t-label text-brown-700 transition-colors hover:text-orange-600 hover:underline">
          Log in
        </button>
      </p>
    </form>
  );
}

const noop = () => () => {};

function Dashboard({ user }: { user: Customer }) {
  const setUser = useAuth((s) => s.setUser);
  const raw = useSyncExternalStore(noop, readLastOrderRaw, () => null);
  const order = parseOrder(raw);
  const itemCount = order?.lines.reduce((n, l) => n + l.quantity, 0) ?? 0;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
      <aside className="flex flex-col gap-4 self-start rounded-lg border border-line bg-white p-6">
        <div className="flex items-center gap-3">
          <span className="grid size-14 shrink-0 place-items-center rounded-full bg-orange-500 t-h3 text-brown-900">{user.name.charAt(0).toUpperCase()}</span>
          <div className="min-w-0">
            <p className="truncate t-h4 text-ink">{user.name}</p>
            <p className="truncate t-body-s text-ink-muted">{user.phone ?? user.email ?? `Signed in with ${user.provider}`}</p>
          </div>
        </div>
        <div className="h-px bg-line" />
        <nav className="flex flex-col gap-1" aria-label="Account">
          {[
            { I: Package, l: "My Orders", h: "#orders" },
            { I: Truck, l: "Track Order", h: "/track-order" },
            { I: ShoppingBag, l: "Continue Shopping", h: "/shop" },
          ].map(({ I, l, h }) => (
            <Link key={l} href={h} className="flex items-center gap-3 rounded-sm px-3 py-2.5 t-body-s text-ink-soft transition-colors hover:bg-cream-100 hover:text-brown-700">
              <I className="size-[18px] text-brown-700" aria-hidden /> {l}
            </Link>
          ))}
          <button
            type="button"
            onClick={async () => {
              await logoutCustomer();
              setUser(null);
              toast("Logged out");
            }}
            className="flex cursor-pointer items-center gap-3 rounded-sm px-3 py-2.5 text-left t-body-s text-sale transition-colors hover:bg-sale/10"
          >
            <LogOut className="size-[18px]" aria-hidden /> Log out
          </button>
        </nav>
      </aside>

      <section id="orders" className="flex flex-col gap-4 rounded-lg border border-line bg-white p-6 sm:p-8">
        <h2 className="t-h3 text-ink">My Orders</h2>
        {order ? (
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-md border border-line p-4 sm:p-5">
            <div>
              <p className="t-label text-ink">Order #{order.id}</p>
              <p className="t-body-s text-ink-muted">
                {new Date(order.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })} · {itemCount} item{itemCount === 1 ? "" : "s"} · {formatPrice(order.total)}
              </p>
            </div>
            <Link href={`/track-order?id=${order.id}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
              <Truck /> Track
            </Link>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-md bg-cream-50 px-6 py-10 text-center">
            <User className="size-10 text-ink-muted" aria-hidden />
            <p className="t-body text-ink-soft">You haven’t placed any orders yet.</p>
            <Link href="/shop" className={buttonVariants()}>
              Start Shopping
            </Link>
          </div>
        )}
        <p className="t-caption text-ink-muted">Order history syncs from the backend in phase 2.</p>
      </section>
    </div>
  );
}
