"use client";

import { Heart } from "lucide-react";
import { toast } from "sonner";
import { useWishlist } from "@/stores/wishlist";
import { site } from "@/content/site";
import { cn } from "@/lib/utils";

export function WishlistButton({ productId, productName, className, hoverReveal }: { productId: string; productName: string; className?: string; hoverReveal?: boolean }) {
  const active = useWishlist((s) => s.ids.includes(productId));
  const toggle = useWishlist((s) => s.toggle);
  if (!site.features.wishlist.enabled) return null;
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={active ? `Remove ${productName} from wishlist` : `Add ${productName} to wishlist`}
      onClick={() => {
        const added = toggle(productId);
        toast(added ? "Saved to wishlist" : "Removed from wishlist", { description: productName });
      }}
      className={cn(
        hoverReveal && site.features.wishlist.hoverOnly && "[@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover/card:opacity-100 focus-visible:!opacity-100",
        "z-10 grid size-9 cursor-pointer place-items-center rounded-full bg-white/90 text-ink shadow-sm backdrop-blur transition-colors hover:text-sale",
        className,
      )}
    >
      <Heart className={cn("size-[18px]", active && "fill-sale text-sale")} />
    </button>
  );
}
