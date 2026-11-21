import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Package, Truck } from "lucide-react";
import { IconCircle } from "@/components/common/icon-circle";
import { Stars } from "@/components/common/stars";
import { site } from "@/content/site";
import { formatPrice } from "@/lib/utils";
import type { Product, Review } from "@/types";

export function DescriptionPanel({ product }: { product: Product }) {
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_400px] lg:gap-14">
      {/* Rich text from CMS */}
      <div className="flex flex-col gap-3.5">
        {product.description.map((p) => (
          <p key={p} className={/[\u0980-\u09FF]/.test(p) ? "t-bn text-ink-soft" : "t-body-l text-ink-soft"}>
            {p}
          </p>
        ))}
        <ul className="flex flex-col gap-2.5 pt-1">
          {product.highlights.map((h) => (
            <li key={h} className="flex items-center gap-2.5 t-body text-ink">
              <Check className="size-[18px] shrink-0 text-green-600" aria-hidden /> {h}
            </li>
          ))}
        </ul>
      </div>
      <dl className="flex flex-col gap-3 self-start rounded-md border border-line bg-white p-6">
        <p className="t-h4 text-ink">Quick Facts</p>
        <div className="flex justify-between gap-4">
          <dt className="t-body-s text-ink-muted">Pack size</dt>
          <dd className="t-label text-ink">{product.variants.map((v) => v.label).join(" / ")}</dd>
        </div>
        {product.facts.map((f) => (
          <div key={f.label} className="flex justify-between gap-4">
            <dt className="t-body-s text-ink-muted">{f.label}</dt>
            <dd className="text-right t-label text-ink">{f.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function ReviewsPanel({ product, reviews }: { product: Product; reviews: Review[] }) {
  const dist = [5, 4, 3, 2, 1].map((n) => ({ n, pct: reviews.length ? reviews.filter((r) => r.rating === n).length / reviews.length : 0 }));
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="t-h3 text-ink">What customers say</h2>
        <Link href="/contact?subject=review" className="inline-flex h-10 items-center rounded-sm border-[1.5px] border-brown-700 px-4 t-button text-brown-700 hover:bg-brown-700 hover:text-cream-100">
          Write a Review
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[360px_1fr]">
        <div className="flex flex-col gap-3.5 self-start rounded-md border border-line bg-white p-7">
          <div className="flex items-center gap-3">
            <span className="t-display text-ink">{product.rating.average.toFixed(1)}</span>
            <span className="flex flex-col gap-1">
              <Stars value={product.rating.average} size={18} />
              <span className="t-body-s text-ink-muted">Based on {product.rating.count} reviews</span>
            </span>
          </div>
          {dist.map(({ n, pct }) => (
            <div key={n} className="flex items-center gap-2.5">
              <span className="w-7 t-body-s text-ink-soft">{n}★</span>
              <span className="h-2 flex-1 overflow-hidden rounded-full bg-cream-200">
                <span className="block h-full rounded-full bg-orange-500" style={{ width: `${Math.max(2, pct * 100)}%` }} />
              </span>
            </div>
          ))}
        </div>
        <ul className="flex flex-col">
          {reviews.map((r) => (
            <li key={r.id} className="flex flex-col gap-2.5 border-b border-line py-5 first:pt-0">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="grid size-9 place-items-center rounded-full bg-orange-100 t-label text-orange-600" aria-hidden>
                    {r.author[0]}
                  </span>
                  <span>
                    <span className="block t-label text-ink">
                      {r.author}
                      {r.location && <span className="t-body-s font-sans text-ink-muted"> · {r.location}</span>}
                    </span>
                    <Stars value={r.rating} size={12} />
                  </span>
                </div>
                <span className="t-caption text-ink-muted">{r.date}</span>
              </div>
              <p className="t-bn text-ink-soft">{r.body}</p>
              {r.image && (
                <span className="relative size-[88px] overflow-hidden rounded-sm">
                  <Image src={r.image.src} alt="Customer photo" fill sizes="88px" className="object-cover" />
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function DeliveryPanel() {
  const rows = Object.values(site.delivery);
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
      <div className="flex flex-col gap-4 rounded-md border border-line bg-white p-6 sm:p-7">
        <div className="flex items-center gap-3">
          <IconCircle size={44}>
            <Truck />
          </IconCircle>
          <div>
            <h3 className="t-h4 text-ink">Delivery</h3>
            <p className="t-bn-s text-ink-soft">ডেলিভারি চার্জ ও সময়</p>
          </div>
        </div>
        <table className="w-full overflow-hidden rounded-sm text-left outline outline-1 outline-line">
          <thead className="bg-cream-100">
            <tr>
              {["Area", "Charge", "Time"].map((h) => (
                <th key={h} scope="col" className="px-4 py-3 t-caption font-medium text-ink-muted">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label} className="border-t border-line">
                <td className="px-4 py-3 t-body-s text-ink">{r.label}</td>
                <td className="px-4 py-3 t-body-s text-ink">{formatPrice(r.charge)}</td>
                <td className="px-4 py-3 t-body-s text-ink">{r.eta}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {["Cash on Delivery available everywhere", "We call to confirm before dispatch", "Delivery offers (if any) shown at checkout"].map((l) => (
          <p key={l} className="flex items-center gap-2.5 t-body-s text-ink-soft">
            <Check className="size-4 text-green-600" aria-hidden /> {l}
          </p>
        ))}
      </div>
      <div className="flex flex-col gap-4 rounded-md border border-line bg-white p-6 sm:p-7">
        <div className="flex items-center gap-3">
          <IconCircle size={44}>
            <Package />
          </IconCircle>
          <div>
            <h3 className="t-h4 text-ink">Returns &amp; Refunds</h3>
            <p className="t-bn-s text-ink-soft">রিটার্ন ও রিফান্ড নীতি</p>
          </div>
        </div>
        {[
          ["Check at delivery", "Please check the pack in front of the delivery person."],
          ["Damaged or wrong item?", "Tell us within [X] hours with a photo — we will replace or refund."],
          ["Food safety", "Opened food packs can’t be returned unless faulty."],
        ].map(([a, b]) => (
          <div key={a}>
            <p className="t-label text-ink">{a}</p>
            <p className="t-body-s text-ink-soft">{b}</p>
          </div>
        ))}
        <Link href="/policies/returns" className="mt-auto inline-flex items-center gap-1.5 t-label text-brown-700 hover:underline">
          Read full Return &amp; Refund Policy <ArrowRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}
