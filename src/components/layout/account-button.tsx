"use client";

import Link from "next/link";
import { User } from "lucide-react";
import { useAuth } from "@/stores/auth";

/** Header "Account" action — shows the customer's first name when signed in. */
export function AccountButton() {
  const user = useAuth((s) => s.user);
  return (
    <Link href="/account" className="group flex flex-col items-center gap-1 text-ink">
      <User className="size-6 transition-colors group-hover:text-brown-700" aria-hidden />
      <span className="max-w-[72px] truncate t-caption text-ink-soft group-hover:text-brown-700">{user ? user.name.split(" ")[0] : "Account"}</span>
    </Link>
  );
}
