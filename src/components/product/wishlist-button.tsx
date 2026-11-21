"use client";

import { Heart } from "lucide-react";
import { toast } from "sonner";
import { useWishlist } from "@/stores/wishlist";
import { cn } from "@/lib/utils";

export function WishlistButton({ productId, productName, className }: { productId: string; productName: string; className?: string }) {
  const active = useWishlist((s) => s.ids.includes(productId));
  const toggle = useWishlist((s) => s.toggle);
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
        "z-10 grid size-9 cursor-pointer place-items-center rounded-full bg-white/90 text-ink shadow-sm backdrop-blur transition-colors hover:text-sale",
        className,
      )}
    >
      <Heart className={cn("size-[18px]", active && "fill-sale text-sale")} />
    </button>
  );
}
