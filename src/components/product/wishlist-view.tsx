"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useWishlist } from "@/stores/wishlist";
import { useHydrated } from "@/stores/use-hydrated";
import { Bn } from "@/components/common/bn";

/** Client filter over server-rendered cards: shows only wishlisted products. */
export function WishlistView({ items }: { items: { id: string; node: React.ReactNode }[] }) {
  const ready = useHydrated();
  const ids = useWishlist((s) => s.ids);
  if (!ready)
    return (
      <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="aspect-[3/4.4]" />
        ))}
      </div>
    );
  const visible = items.filter((i) => ids.includes(i.id));
  if (!visible.length)
    return (
      <div className="flex flex-col items-center gap-4 rounded-lg border border-line bg-white px-6 py-16 text-center">
        <span className="grid size-20 place-items-center rounded-full bg-cream-100 text-sale">
          <Heart className="size-9" />
        </span>
        <h2 className="t-h3 text-ink">Your wishlist is empty</h2>
        <Bn className="t-bn text-ink-soft">পছন্দের স্ন্যাকসে ♡ চাপুন — এখানে সেভ থাকবে।</Bn>
        <Link href="/shop" className={buttonVariants()}>
          Browse Snacks
        </Link>
      </div>
    );
  return (
    <>
      <p className="t-body-s text-ink-soft">{visible.length} saved item{visible.length > 1 ? "s" : ""}</p>
      <ul className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 lg:gap-8">
        {visible.map((i) => (
          <li key={i.id}>{i.node}</li>
        ))}
      </ul>
    </>
  );
}
