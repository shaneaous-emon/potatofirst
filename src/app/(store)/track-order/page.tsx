import type { Metadata } from "next";
import { Suspense } from "react";
import { PageTitle } from "@/components/common/page-title";
import { TrackOrderForm } from "@/components/forms/track-order-form";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = { title: "Track Your Order", description: "Check the status of your Potato First order." };

export default function TrackOrderPage() {
  return (
    <>
      <PageTitle crumbs={[{ label: "Track Order" }]} title="Track Your Order" subtitle="অর্ডার আইডি ও ফোন নম্বর দিয়ে অর্ডারের অবস্থা দেখুন" />
      <div className="container-site max-w-[912px] pt-10 lg:pt-12">
        <Suspense fallback={<Skeleton className="h-40" />}>
          <TrackOrderForm />
        </Suspense>
      </div>
    </>
  );
}
