import type { Metadata } from "next";
import Link from "next/link";
import { ShoppingBag, Truck, User } from "lucide-react";
import { PageTitle } from "@/components/common/page-title";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = { title: "My Account", robots: { index: false } };

/** Placeholder: customer accounts are optional and arrive with the Laravel auth backend (phase 2). */
export default function AccountPage() {
  return (
    <>
      <PageTitle crumbs={[{ label: "My Account" }]} title="My Account" subtitle="লগইন ঐচ্ছিক — অ্যাকাউন্ট ছাড়াই অর্ডার করা যায়" />
      <div className="container-site max-w-2xl pt-10">
        <div className="flex flex-col items-center gap-4 rounded-lg border border-line bg-white px-6 py-12 text-center">
          <span className="grid size-16 place-items-center rounded-full bg-orange-100 text-orange-600">
            <User className="size-8" />
          </span>
          <h2 className="t-h3 text-ink">Customer accounts are coming soon</h2>
          <p className="max-w-md t-body text-ink-soft">You don’t need an account to order. Shop as a guest and track any order with your order ID and phone number.</p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link href="/shop" className={buttonVariants()}>
              <ShoppingBag /> Continue Shopping
            </Link>
            <Link href="/track-order" className={buttonVariants({ variant: "outline" })}>
              <Truck /> Track Order
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
