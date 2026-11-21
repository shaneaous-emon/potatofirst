"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Home, Loader2, Package, Phone, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { site } from "@/content/site";
import { trackOrder, type TrackingStep } from "@/lib/services/orders";
import { cn } from "@/lib/utils";
import { trackSchema, type TrackValues } from "@/lib/validation/schemas";

const ICONS = { placed: CheckCircle2, confirmed: Phone, packed: Package, shipped: Truck, delivered: Home };

/** Figma: Track Order (form + timeline result). */
export function TrackOrderForm() {
  const presetId = useSearchParams().get("id") ?? "";
  const [result, setResult] = useState<{ orderId: string; steps: TrackingStep[] } | null>(null);
  const { register, handleSubmit, formState } = useForm<TrackValues>({ resolver: zodResolver(trackSchema), defaultValues: { orderId: presetId, phone: "" } });
  const e = formState.errors;

  return (
    <div className="flex flex-col gap-8">
      <form
        noValidate
        onSubmit={handleSubmit(async (v) => setResult(await trackOrder(v.orderId.replace("#", "").toUpperCase())))}
        className="grid grid-cols-1 items-start gap-4 rounded-md border border-line bg-white p-5 sm:grid-cols-[1fr_1fr_auto] sm:p-6"
      >
        <FormField id="orderId" label="Order ID" required error={e.orderId?.message}>
          <Input id="orderId" placeholder="#PF-000000" aria-invalid={!!e.orderId} {...register("orderId")} />
        </FormField>
        <FormField id="track-phone" label="Phone Number" required error={e.phone?.message}>
          <Input id="track-phone" type="tel" inputMode="tel" placeholder="01XXX-XXXXXX" aria-invalid={!!e.phone} {...register("phone")} />
        </FormField>
        <Button type="submit" size="lg" className="h-12 sm:mt-7" disabled={formState.isSubmitting}>
          {formState.isSubmitting ? <Loader2 className="animate-spin" /> : null} Track
        </Button>
      </form>

      {result ? (
        <section aria-live="polite" className="flex flex-col gap-7 rounded-md border border-line bg-white p-5 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="t-h3 text-ink">Order #{result.orderId}</h2>
              <p className="t-body-s text-ink-muted">Demo status — live tracking connects to the backend in phase 2.</p>
            </div>
            <span className="rounded-full bg-orange-100 px-3.5 py-1.5 t-label text-orange-600">On the way</span>
          </div>
          <ol className="flex flex-col gap-0 sm:flex-row">
            {result.steps.map((s, i) => {
              const I = ICONS[s.status];
              const last = i === result.steps.length - 1;
              return (
                <li key={s.status} className="relative flex flex-1 gap-4 pb-6 sm:flex-col sm:items-center sm:gap-2.5 sm:pb-0 sm:text-center">
                  {!last && (
                    <span aria-hidden className={cn("absolute left-[21px] top-11 h-[calc(100%-44px)] w-[3px] sm:left-[calc(50%+22px)] sm:top-[20px] sm:h-[3px] sm:w-[calc(100%-44px)]", s.state === "done" ? "bg-green-500" : "bg-line")} />
                  )}
                  <span className={cn("relative z-10 grid size-11 shrink-0 place-items-center rounded-full", s.state === "done" ? "bg-green-500 text-white" : s.state === "current" ? "bg-orange-500 text-brown-900" : "bg-cream-200 text-ink-muted")}>
                    <I className="size-5" aria-hidden />
                  </span>
                  <span className="flex flex-col">
                    <span className={cn("t-label", s.state === "upcoming" ? "text-ink-muted" : "text-ink")}>{s.label}</span>
                    {s.time && <span className="t-caption text-ink-muted">{s.time}</span>}
                  </span>
                </li>
              );
            })}
          </ol>
          <div className="h-px bg-line" />
          <p className="t-body-s text-ink-soft">
            Need help? Call <a href={`tel:${site.hotline}`} className="text-brown-700 underline">{site.hotline}</a> or message us on WhatsApp.
          </p>
        </section>
      ) : (
        <p className="text-center t-body-s text-ink-soft">Can’t find your order ID? It’s in your SMS / email confirmation.</p>
      )}
    </div>
  );
}
