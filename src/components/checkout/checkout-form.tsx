"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Banknote, CreditCard, Loader2, Lock, Plus, ShoppingBag, Smartphone, User } from "lucide-react";
import { toast } from "sonner";
import { CartLineItem } from "@/components/cart/cart-line-item";
import { PromoCode } from "@/components/cart/promo-code";
import { Button, buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FormField } from "@/components/ui/form-field";
import { Input, Textarea } from "@/components/ui/input";
import { RadioCard, RadioGroup } from "@/components/ui/radio-card";
import { Skeleton } from "@/components/ui/skeleton";
import { site } from "@/content/site";
import { deliveryChargeFor, placeOrder } from "@/lib/services/orders";
import { formatPrice } from "@/lib/utils";
import { checkoutSchema, type CheckoutValues } from "@/lib/validation/schemas";
import { selectSubtotal, useCart } from "@/stores/cart";
import { useHydrated } from "@/stores/use-hydrated";

function Step({ n, title, subtitle }: { n: number; title: string; subtitle: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brown-700 t-label text-cream-100">{n}</span>
      <div>
        <h2 className="t-h3 text-ink">{title}</h2>
        <p className="t-bn-s text-ink-soft">{subtitle}</p>
      </div>
    </div>
  );
}

/** Figma: Checkout (guest) — one page, no login required, COD default. */
export function CheckoutForm() {
  const router = useRouter();
  const ready = useHydrated();
  const lines = useCart((s) => s.lines);
  const clear = useCart((s) => s.clear);
  const subtotal = useCart(selectSubtotal);
  const [discount, setDiscount] = useState(0);
  const [showNote, setShowNote] = useState(false);

  const form = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    mode: "onTouched",
    defaultValues: { name: "", phone: "", email: "", address: "", deliveryArea: "inside-dhaka", paymentMethod: "cod", note: "", agree: true },
  });
  const { register, control, handleSubmit, formState } = form;
  const errors = formState.errors;
  const area = useWatch({ control, name: "deliveryArea" });
  const delivery = deliveryChargeFor(area);
  const total = Math.max(0, subtotal + delivery - discount);

  if (!ready) return <Skeleton className="h-[640px]" />;

  if (lines.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-lg border border-line bg-white px-6 py-16 text-center">
        <ShoppingBag className="size-12 text-brown-700" aria-hidden />
        <h2 className="t-h3 text-ink">Your cart is empty</h2>
        <p className="t-bn text-ink-soft">চেকআউট করার আগে কার্টে পণ্য যোগ করুন।</p>
        <Link href="/shop" className={buttonVariants()}>
          Start Shopping
        </Link>
      </div>
    );
  }

  const onSubmit = handleSubmit(async (raw) => {
    const v = checkoutSchema.parse(raw);
    try {
      const order = await placeOrder({
        customer: { name: v.name, phone: v.phone, email: v.email || undefined, address: v.address },
        deliveryArea: v.deliveryArea,
        paymentMethod: v.paymentMethod,
        note: v.note || undefined,
        lines,
        discount,
      });
      clear();
      router.push(`/order-confirmed?id=${order.id}`);
    } catch {
      toast.error("Could not place your order. Please try again.");
    }
  });

  const invalid = (k: keyof CheckoutValues) => ({ "aria-invalid": !!errors[k], "aria-describedby": errors[k] ? `${k}-error` : undefined });

  return (
    <form noValidate onSubmit={onSubmit} className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1fr_440px] lg:gap-8">
      <div className="flex flex-col gap-6">
        <section className="flex flex-col gap-5 rounded-md border border-line bg-white p-5 sm:p-8">
          <Step n={1} title="Delivery Details" subtitle="আপনার নাম, ফোন ও ঠিকানা দিন" />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField id="name" label="Full Name" required error={errors.name?.message}>
              <Input id="name" autoComplete="name" placeholder="e.g. Rahim Uddin" {...register("name")} {...invalid("name")} />
            </FormField>
            <FormField id="phone" label="Phone Number" required error={errors.phone?.message}>
              <Input id="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="01XXX-XXXXXX" {...register("phone")} {...invalid("phone")} />
            </FormField>
          </div>
          <FormField id="email" label="Email" optional error={errors.email?.message}>
            <Input id="email" type="email" autoComplete="email" placeholder="you@example.com" {...register("email")} {...invalid("email")} />
          </FormField>
          <FormField id="address" label="Full Address" required error={errors.address?.message}>
            <Textarea id="address" rows={3} autoComplete="street-address" placeholder="House, road, area, thana, district" {...register("address")} {...invalid("address")} />
          </FormField>
          <fieldset className="flex flex-col gap-3">
            <legend className="mb-3 t-label text-ink">
              Delivery Area <span className="text-sale" aria-hidden>*</span>
            </legend>
            <Controller
              control={control}
              name="deliveryArea"
              render={({ field }) => (
                <RadioGroup value={field.value} onValueChange={field.onChange} className="grid grid-cols-1 gap-3 sm:grid-cols-2" aria-label="Delivery area">
                  {(["inside-dhaka", "outside-dhaka"] as const).map((k) => (
                    <RadioCard key={k} value={k} title={site.delivery[k].label} description={`${site.delivery[k].labelBn} · ${site.delivery[k].eta}`} trailing={formatPrice(site.delivery[k].charge)} />
                  ))}
                </RadioGroup>
              )}
            />
          </fieldset>
          {showNote ? (
            <FormField id="note" label="Order note" optional error={errors.note?.message}>
              <Textarea id="note" rows={2} placeholder="Any instruction for delivery" {...register("note")} />
            </FormField>
          ) : (
            <button type="button" onClick={() => setShowNote(true)} className="inline-flex cursor-pointer items-center gap-2 self-start t-label text-brown-700 hover:underline">
              <Plus className="size-4" /> Add order note (optional)
            </button>
          )}
        </section>

        <section className="flex flex-col gap-4 rounded-md border border-line bg-white p-5 sm:p-8">
          <Step n={2} title="Payment Method" subtitle="পেমেন্ট পদ্ধতি বেছে নিন" />
          <Controller
            control={control}
            name="paymentMethod"
            render={({ field }) => (
              <RadioGroup value={field.value} onValueChange={field.onChange} className="flex flex-col gap-3" aria-label="Payment method">
                <RadioCard value="cod" title="Cash on Delivery" description="পণ্য হাতে পেয়ে টাকা পরিশোধ করুন" icon={<Banknote className="size-5 text-green-600" aria-hidden />} />
                <RadioCard value="bkash" title="bKash" description="বিকাশে পেমেন্ট করুন" icon={<Smartphone className="size-5 text-[#e2136e]" aria-hidden />} />
                <RadioCard value="online" title="Online Payment / Card" description="Card, Nagad, Rocket & more (secure gateway)" icon={<CreditCard className="size-5 text-brown-700" aria-hidden />} />
              </RadioGroup>
            )}
          />
        </section>
      </div>

      <aside className="flex flex-col gap-4 rounded-md border border-line bg-white p-5 sm:p-7 lg:sticky lg:top-6">
        <div className="flex items-center justify-between">
          <h2 className="t-h3 text-ink">Your Order</h2>
          <Link href="/cart" className="t-label text-brown-700 hover:underline">
            Edit cart
          </Link>
        </div>
        <ul>
          {lines.map((l) => (
            <CartLineItem key={l.key} line={l} variant="summary" />
          ))}
        </ul>
        <PromoCode subtotal={subtotal} defaultOpen onApplied={(d) => setDiscount(d)} />
        <div className="h-px bg-line" />
        <dl className="flex flex-col gap-2.5">
          <div className="flex justify-between t-body text-ink-soft">
            <dt>Subtotal</dt>
            <dd className="t-label text-ink">{formatPrice(subtotal)}</dd>
          </div>
          <div className="flex justify-between t-body text-ink-soft">
            <dt>Delivery ({site.delivery[area].label})</dt>
            <dd className="t-label text-ink">{formatPrice(delivery)}</dd>
          </div>
          <div className="flex justify-between t-body text-ink-soft">
            <dt>Discount</dt>
            <dd className="t-label text-green-600">− {formatPrice(discount)}</dd>
          </div>
        </dl>
        <div className="h-px bg-line" />
        <div className="flex items-center justify-between">
          <span className="t-h4 text-ink">Total</span>
          <span className="t-h2 text-brown-700" aria-live="polite">
            {formatPrice(total)}
          </span>
        </div>
        <Controller
          control={control}
          name="agree"
          render={({ field }) => (
            <label className="flex cursor-pointer items-start gap-2.5">
              <Checkbox checked={field.value === true} onCheckedChange={(c) => field.onChange(c === true)} aria-invalid={!!errors.agree} className="mt-0.5" />
              <span className="t-body-s text-ink-soft">
                I agree to the{" "}
                <Link href="/policies/terms" className="text-brown-700 underline">
                  Terms &amp; Conditions
                </Link>{" "}
                and{" "}
                <Link href="/policies/returns" className="text-brown-700 underline">
                  Return Policy
                </Link>
              </span>
            </label>
          )}
        />
        {errors.agree && <p role="alert" className="-mt-2 t-caption text-sale">{errors.agree.message}</p>}
        <Button type="submit" size="lg" className="h-14 w-full" disabled={formState.isSubmitting}>
          {formState.isSubmitting ? (
            <>
              <Loader2 className="animate-spin" /> Placing order…
            </>
          ) : (
            "Confirm Order"
          )}
        </Button>
        <p className="flex items-center justify-center gap-2 t-caption text-ink-soft">
          <Lock className="size-3.5 text-green-600" aria-hidden /> Your details are safe with us
        </p>
      </aside>
    </form>
  );
}

export function GuestBanner() {
  return (
    <div className="flex flex-wrap items-center gap-2.5 rounded-sm bg-green-100 px-4 py-3">
      <User className="size-[18px] text-green-600" aria-hidden />
      <p className="t-body-s text-ink">No account needed — order as a guest. Have an account?</p>
      <Link href="/account" className="t-label text-green-600 hover:underline">
        Log in (optional)
      </Link>
    </div>
  );
}
