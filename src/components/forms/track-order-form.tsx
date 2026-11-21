"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, ExternalLink, Home, Loader2, Package, Phone, Truck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { site } from "@/content/site";
import { trackOrder } from "@/lib/services/orders";
import { cn } from "@/lib/utils";
import { trackSchema, type TrackValues } from "@/lib/validation/schemas";

const ICONS = {
  placed: CheckCircle2,
  confirmed: Phone,
  packed: Package,
  shipped: Truck,
  delivered: Home,
};

/** Figma: Track Order (form + live timeline result). */
export function TrackOrderForm() {
  const searchParams = useSearchParams();
  const presetId = searchParams.get("id") ?? "";
  const [result, setResult] = useState<Awaited<ReturnType<typeof trackOrder>> | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  const { register, handleSubmit, formState, setValue } = useForm<TrackValues>({
    resolver: zodResolver(trackSchema),
    defaultValues: { orderId: presetId, phone: "" },
  });
  const e = formState.errors;

  const performSearch = async (v: TrackValues) => {
    setSearchError(null);
    try {
      const data = await trackOrder({
        orderId: v.orderId ? v.orderId.replace("#", "").toUpperCase() : undefined,
        phone: v.phone || undefined,
      });
      setResult(data);
    } catch (err) {
      setResult(null);
      const msg = err instanceof Error ? err.message : "Order not found";
      setSearchError(msg);
      toast.error(msg);
    }
  };

  useEffect(() => {
    if (presetId) {
      setValue("orderId", presetId);
      performSearch({ orderId: presetId, phone: "" });
    }
  }, [presetId]);

  return (
    <div className="flex flex-col gap-8">
      <form
        noValidate
        onSubmit={handleSubmit(performSearch)}
        className="grid grid-cols-1 items-start gap-4 rounded-md border border-line bg-white p-5 sm:grid-cols-[1fr_auto_1fr_auto] sm:p-6"
      >
        <FormField id="orderId" label="Order ID" error={e.orderId?.message}>
          <Input id="orderId" placeholder="#PF-000000" aria-invalid={!!e.orderId} {...register("orderId")} />
        </FormField>
        <span className="self-center text-center t-label text-ink-muted sm:mt-7">or</span>
        <FormField id="track-phone" label="Phone Number" error={e.phone?.message}>
          <Input id="track-phone" type="tel" inputMode="tel" placeholder="01XXXXXXXXX" aria-invalid={!!e.phone} {...register("phone")} />
        </FormField>
        <Button type="submit" size="lg" className="h-12 sm:mt-7" disabled={formState.isSubmitting}>
          {formState.isSubmitting ? <Loader2 className="animate-spin" /> : null} Track
        </Button>
      </form>

      {searchError && (
        <div className="rounded-md border border-sale/30 bg-sale/5 p-4 text-center t-body-s text-sale">
          {searchError}
        </div>
      )}

      {result ? (
        <section aria-live="polite" className="flex flex-col gap-7 rounded-md border border-line bg-white p-5 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="t-h3 text-ink">Order #{result.orderId}</h2>
              {result.lookup === "phone" && <p className="t-body-s text-ink-soft">Latest order for {result.phone}</p>}
              <p className="t-body-s text-ink-muted">Live order tracking from Potato First operations</p>
            </div>
            <span
              className={cn(
                "rounded-full px-3.5 py-1.5 t-label capitalize",
                result.statusLabel === "Delivered"
                  ? "bg-green-100 text-green-700"
                  : result.statusLabel === "Cancelled"
                    ? "bg-sale/10 text-sale"
                    : "bg-orange-100 text-orange-600",
              )}
            >
              {result.statusLabel ?? "In Progress"}
            </span>
          </div>

          {result.courier && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-cream-50 p-4">
              <div>
                <span className="text-[12px] font-medium uppercase tracking-wide text-ink-muted">Delivery Courier</span>
                <p className="font-display font-semibold capitalize text-ink">
                  {result.courier} {result.trackingId ? `· Consignment: ${result.trackingId}` : ""}
                </p>
              </div>
              {result.courierUrl && (
                <a
                  href={result.courierUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3.5 py-1.5 text-[13px] font-medium text-brown-700 shadow-sm transition-colors hover:bg-cream-100 hover:text-orange-600"
                >
                  Courier Portal <ExternalLink className="size-3.5" />
                </a>
              )}
            </div>
          )}

          <ol className="flex flex-col gap-0 sm:flex-row">
            {result.steps.map((s, i) => {
              const I = ICONS[s.status] || Package;
              const last = i === result.steps.length - 1;
              return (
                <li
                  key={s.status}
                  className="relative flex flex-1 gap-4 pb-6 sm:flex-col sm:items-center sm:gap-2.5 sm:pb-0 sm:text-center"
                >
                  {!last && (
                    <span
                      aria-hidden
                      className={cn(
                        "absolute left-[21px] top-11 h-[calc(100%-44px)] w-[3px] sm:left-[calc(50%+22px)] sm:top-[20px] sm:h-[3px] sm:w-[calc(100%-44px)]",
                        s.state === "done" ? "bg-green-500" : "bg-line",
                      )}
                    />
                  )}
                  <span
                    className={cn(
                      "relative z-10 grid size-11 shrink-0 place-items-center rounded-full",
                      s.state === "done"
                        ? "bg-green-500 text-white"
                        : s.state === "current"
                          ? "bg-orange-500 text-brown-900 ring-4 ring-orange-200"
                          : "bg-cream-200 text-ink-muted",
                    )}
                  >
                    <I className="size-5" aria-hidden />
                  </span>
                  <span className="flex flex-col">
                    <span className={cn("t-label", s.state === "upcoming" ? "text-ink-muted" : "text-ink")}>
                      {s.label}
                    </span>
                    {s.time && <span className="t-caption text-ink-muted">{s.time}</span>}
                  </span>
                </li>
              );
            })}
          </ol>

          <div className="h-px bg-line" />
          <p className="t-body-s text-ink-soft">
            Need help? Call{" "}
            <a href={`tel:${site.hotline}`} className="text-brown-700 underline">
              {site.hotline}
            </a>{" "}
            or message us on WhatsApp.
          </p>
        </section>
      ) : (
        <p className="text-center t-body-s text-ink-soft">
          Can’t find your order ID? It’s in your SMS / email confirmation or your My Account dashboard.
        </p>
      )}
    </div>
  );
}
