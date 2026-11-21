import type { Metadata } from "next";

/** Admin pages read the session on every request; they are allowed to block. */
export const instant = false;

export const metadata: Metadata = { title: { default: "Admin", template: "%s · Admin · Potato First" }, robots: { index: false, follow: false } };

export default function AdminRoot({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh bg-[#faf6ef] font-sans text-ink">{children}</div>;
}
