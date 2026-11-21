import type { Metadata } from "next";
import { Breadcrumb } from "@/components/common/breadcrumb";
import { CheckoutForm, GuestBanner } from "@/components/checkout/checkout-form";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default function CheckoutPage() {
  return (
    <div className="container-site flex flex-col gap-6 pt-7">
      <div className="flex flex-col gap-3">
        <Breadcrumb items={[{ label: "Cart", href: "/cart" }, { label: "Checkout" }]} />
        <h1 className="t-h1 text-ink">Checkout</h1>
        <GuestBanner />
      </div>
      <CheckoutForm />
    </div>
  );
}
