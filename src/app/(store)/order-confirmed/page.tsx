import type { Metadata } from "next";
import { Suspense } from "react";
import { OrderConfirmation } from "@/components/checkout/order-confirmation";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "Order Confirmed", robots: { index: false } };

export default function OrderConfirmedPage() {
  return (
    <div className="container-site pt-12 lg:pt-14">
      <Suspense fallback={<Skeleton className="mx-auto h-[600px] max-w-3xl" />}>
        <OrderConfirmation />
      </Suspense>
    </div>
  );
}
