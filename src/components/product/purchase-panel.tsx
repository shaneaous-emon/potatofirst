"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Phone, ShieldCheck, ShoppingCart, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/common/whatsapp-icon";
import { site } from "@/content/site";
import { cn, discountPercent, formatPrice, whatsappLink } from "@/lib/utils";
import { useCart } from "@/stores/cart";
import type { ImageAsset, ProductVariant } from "@/types";
import { Price } from "./price";
import { QuantityStepper } from "./quantity-stepper";

type Props = {
  product: { id: string; slug: string; name: string; image: ImageAsset; variants: ProductVariant[]; categoryName: string; categorySlug: string };
};

/** Figma: Product Details › pack size, quantity, Add to Cart / Order Now / Order via WhatsApp. */
export function PurchasePanel({ product }: Props) {
  const router = useRouter();
  const add = useCart((s) => s.add);
  const [variantId, setVariantId] = useState(product.variants[0].id);
  const [qty, setQty] = useState(1);
  const variant = product.variants.find((v) => v.id === variantId)!;
  const off = discountPercent(variant.price, variant.compareAtPrice);

  const item = {
    productId: product.id,
    variantId: variant.id,
    slug: product.slug,
    name: product.name,
    variantLabel: variant.label,
    image: product.image,
    price: variant.price,
    quantity: qty,
  };

  const waMessage = `Hello Potato First! I'd like to order:\n• ${product.name} (${variant.label}) × ${qty} — ${formatPrice(variant.price * qty)}\n\nName:\nAddress:`;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <Price price={variant.price} compareAt={variant.compareAtPrice} size="lg" />
        {off > 0 && <Badge tone="red">Save {off}%</Badge>}
      </div>

      {product.variants.length > 1 && (
        <fieldset className="flex flex-col gap-3">
          <legend className="mb-3 t-label text-ink">Pack Size</legend>
          <div className="flex flex-wrap gap-2.5" role="radiogroup">
            {product.variants.map((v) => (
              <button
                key={v.id}
                type="button"
                role="radio"
                aria-checked={v.id === variantId}
                disabled={!v.inStock}
                onClick={() => setVariantId(v.id)}
                className={cn(
                  "flex min-w-[96px] cursor-pointer flex-col items-center gap-0.5 rounded-sm border-[1.25px] px-5 py-2.5 transition-colors disabled:cursor-not-allowed disabled:opacity-40",
                  v.id === variantId ? "border-[1.75px] border-orange-500 bg-orange-100" : "border-line bg-white hover:border-orange-500/60",
                )}
              >
                <span className="t-label text-ink">{v.label}</span>
                <span className="t-caption text-ink-muted">{formatPrice(v.price)}</span>
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <div className="flex flex-col gap-3">
        <span className="t-label text-ink">Quantity</span>
        <div className="flex gap-3">
          <QuantityStepper value={qty} onChange={setQty} />
          <Button
            variant="outline"
            className="h-[49px] flex-1"
            disabled={!variant.inStock}
            onClick={() => {
              add(item, { openDrawer: true });
              setQty(1);
            }}
          >
            <ShoppingCart /> Add to Cart
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Button
          size="lg"
          disabled={!variant.inStock}
          onClick={() => {
            add(item);
            router.push("/checkout");
          }}
        >
          Order Now
        </Button>
        <a href={whatsappLink(site.whatsapp, waMessage)} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: "whatsapp", size: "lg" })}>
          <WhatsAppIcon /> Order via WhatsApp
        </a>
      </div>

      <ul className="flex flex-col gap-3.5 rounded-md bg-cream-100 p-5">
        {[
          { I: Truck, a: `Inside Dhaka: ${formatPrice(site.delivery["inside-dhaka"].charge)} · ${site.delivery["inside-dhaka"].eta}`, b: `ঢাকার বাইরে: ${formatPrice(site.delivery["outside-dhaka"].charge)} · ${site.delivery["outside-dhaka"].eta}` },
          { I: ShieldCheck, a: "Cash on Delivery available", b: "পণ্য হাতে পেয়ে টাকা পরিশোধ করুন" },
          { I: Phone, a: `Need help? ${site.hotline}`, b: "অর্ডারে সাহায্যের জন্য কল করুন" },
        ].map(({ I, a, b }) => (
          <li key={a} className="flex items-center gap-3">
            <I className="size-5 shrink-0 text-green-600" aria-hidden />
            <span>
              <span className="block t-label text-ink">{a}</span>
              <span className="block t-bn-s text-ink-soft">{b}</span>
            </span>
          </li>
        ))}
      </ul>
      <div className="flex flex-col gap-1.5 t-body-s text-ink-muted">
        <p>
          SKU: <span className="text-ink">{variant.sku}</span>
        </p>
        <p>
          Category:{" "}
          <Link href={`/category/${product.categorySlug}`} className="text-ink hover:text-brown-700 hover:underline">
            {product.categoryName}
          </Link>
        </p>
      </div>
    </div>
  );
}
