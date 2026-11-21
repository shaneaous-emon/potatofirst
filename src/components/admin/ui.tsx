import Link from "next/link";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export function PageHeader({ title, description, actions, back }: { title: string; description?: string; actions?: React.ReactNode; back?: { href: string; label: string } }) {
  return (
    <div className="flex flex-col gap-3 pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {back && (
          <Link href={back.href} className="mb-1.5 inline-flex items-center gap-1 text-[13px] text-ink-muted transition-colors hover:text-brown-700">
            <ChevronLeft className="size-4" /> {back.label}
          </Link>
        )}
        <h1 className="font-display text-[22px] font-semibold leading-tight text-ink sm:text-[26px]">{title}</h1>
        {description && <p className="mt-1 text-[14px] text-ink-soft">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ title, actions, children, className, bodyClassName }: { title?: React.ReactNode; actions?: React.ReactNode; children: React.ReactNode; className?: string; bodyClassName?: string }) {
  return (
    <section className={cn("rounded-md border border-line bg-white", className)}>
      {(title || actions) && (
        <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
          {typeof title === "string" ? <h2 className="font-display text-[15px] font-semibold text-ink">{title}</h2> : title}
          {actions}
        </header>
      )}
      <div className={cn("p-4 sm:p-5", bodyClassName)}>{children}</div>
    </section>
  );
}

export function StatCard({ label, value, hint, href, tone = "default", icon }: { label: string; value: string | number; hint?: string; href?: string; tone?: "default" | "warn" | "danger" | "good"; icon?: React.ReactNode }) {
  const body = (
    <div
      className={cn(
        "flex h-full flex-col gap-1 rounded-md border bg-white p-4 transition-colors",
        tone === "warn" && "border-orange-500/40",
        tone === "danger" && "border-sale/40",
        tone === "good" && "border-green-500/40",
        tone === "default" && "border-line",
        href && "hover:border-brown-700",
      )}
    >
      <span className="flex items-center justify-between text-[12px] font-medium uppercase tracking-wide text-ink-muted">
        {label}
        {icon && <span className="text-ink-muted [&_svg]:size-4">{icon}</span>}
      </span>
      <span className={cn("font-display text-[22px] font-semibold text-ink", tone === "danger" && "text-sale")}>{value}</span>
      {hint && <span className="text-[12px] text-ink-soft">{hint}</span>}
    </div>
  );
  return href ? (
    <Link href={href} className="block">
      {body}
    </Link>
  ) : (
    body
  );
}

const TONES: Record<string, string> = {
  gray: "bg-cream-200 text-ink-soft",
  orange: "bg-orange-100 text-orange-600",
  green: "bg-green-100 text-green-600",
  red: "bg-sale/10 text-sale",
  blue: "bg-[#e6f0fb] text-[#1d5fa8]",
  brown: "bg-brown-100 text-brown-700",
  purple: "bg-[#efe8fb] text-[#6a3fb5]",
};

export function Badge({ tone = "gray", children, className }: { tone?: keyof typeof TONES | string; children: React.ReactNode; className?: string }) {
  return <span className={cn("inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-[12px] font-medium", TONES[tone] ?? TONES.gray, className)}>{children}</span>;
}

export const ORDER_STATUS_META: Record<string, { label: string; tone: string }> = {
  pending: { label: "Pending", tone: "orange" },
  confirmed: { label: "Confirmed", tone: "blue" },
  processing: { label: "Processing", tone: "blue" },
  packed: { label: "Packed", tone: "purple" },
  shipped: { label: "Shipped", tone: "purple" },
  out_for_delivery: { label: "Out for Delivery", tone: "purple" },
  delivered: { label: "Delivered", tone: "green" },
  cancelled: { label: "Cancelled", tone: "gray" },
  returned: { label: "Returned", tone: "red" },
  refunded: { label: "Refunded", tone: "red" },
  failed: { label: "Failed", tone: "red" },
};

export function OrderStatusBadge({ status }: { status: string }) {
  const m = ORDER_STATUS_META[status] ?? { label: status, tone: "gray" };
  return <Badge tone={m.tone}>{m.label}</Badge>;
}

export function RiskBadge({ level }: { level: string }) {
  if (level === "low") return <Badge tone="green">Low risk</Badge>;
  if (level === "medium") return <Badge tone="orange">Medium risk</Badge>;
  return <Badge tone="red">High risk</Badge>;
}

/** Responsive table: horizontal scroll with sticky header; rows stay readable on mobile. */
export function Table({ head, children, empty }: { head: React.ReactNode[]; children: React.ReactNode; empty?: React.ReactNode }) {
  const hasRows = Array.isArray(children) ? children.length > 0 : !!children;
  return (
    <div className="overflow-x-auto rounded-md border border-line bg-white">
      <table className="w-full min-w-[640px] text-left text-[14px]">
        <thead className="border-b border-line bg-cream-50 text-[12px] uppercase tracking-wide text-ink-muted">
          <tr>
            {head.map((h, i) => (
              <th key={i} scope="col" className="whitespace-nowrap px-4 py-3 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">{children}</tbody>
      </table>
      {!hasRows && <div className="px-4 py-12 text-center text-[14px] text-ink-muted">{empty ?? "Nothing here yet."}</div>}
    </div>
  );
}

export function Td({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <td className={cn("px-4 py-3 align-middle text-ink", className)}>{children}</td>;
}

export function SearchFilter({ placeholder = "Search…", defaultValue, children }: { placeholder?: string; defaultValue?: string; children?: React.ReactNode }) {
  return (
    <form className="mb-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center" role="search">
      <label className="relative min-w-0 flex-1 sm:max-w-sm">
        <span className="sr-only">Search</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
        <input name="q" defaultValue={defaultValue} placeholder={placeholder} className="h-10 w-full rounded-sm border border-line bg-white pl-9 pr-3 text-[14px] outline-none focus:border-orange-500" />
      </label>
      {children}
      <button type="submit" className="h-10 cursor-pointer rounded-sm bg-brown-700 px-4 text-[14px] font-medium text-cream-100 transition-colors hover:bg-brown-900">
        Filter
      </button>
    </form>
  );
}

export function Select({ name, defaultValue, options, className, ...rest }: { name: string; defaultValue?: string; options: { value: string; label: string }[]; className?: string } & Omit<React.ComponentProps<"select">, "name" | "defaultValue">) {
  return (
    <select name={name} defaultValue={defaultValue} className={cn("h-10 cursor-pointer rounded-sm border border-line bg-white px-3 text-[14px] text-ink outline-none focus:border-orange-500", className)} {...rest}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function Pagination({ page, pages, total, makeHref }: { page: number; pages: number; total: number; makeHref: (p: number) => string }) {
  if (pages <= 1) return <p className="mt-3 text-[13px] text-ink-muted">{total} total</p>;
  return (
    <div className="mt-4 flex items-center justify-between gap-3 text-[13px] text-ink-muted">
      <span>
        Page {page} of {pages} · {total} total
      </span>
      <div className="flex gap-2">
        <Link aria-disabled={page <= 1} href={makeHref(Math.max(1, page - 1))} className={cn("grid size-9 place-items-center rounded-sm border border-line bg-white transition-colors hover:border-brown-700", page <= 1 && "pointer-events-none opacity-40")}>
          <ChevronLeft className="size-4" />
        </Link>
        <Link aria-disabled={page >= pages} href={makeHref(Math.min(pages, page + 1))} className={cn("grid size-9 place-items-center rounded-sm border border-line bg-white transition-colors hover:border-brown-700", page >= pages && "pointer-events-none opacity-40")}>
          <ChevronRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}

export function Label({ children, htmlFor, hint }: { children: React.ReactNode; htmlFor?: string; hint?: string }) {
  return (
    <label htmlFor={htmlFor} className="flex flex-col gap-0.5 text-[13px] font-medium text-ink">
      {children}
      {hint && <span className="text-[12px] font-normal text-ink-muted">{hint}</span>}
    </label>
  );
}

export const inputCls = "h-10 w-full rounded-sm border border-line bg-white px-3 text-[14px] text-ink outline-none transition-colors placeholder:text-ink-muted focus:border-orange-500 disabled:bg-cream-50";
export const textareaCls = "w-full rounded-sm border border-line bg-white px-3 py-2 text-[14px] text-ink outline-none transition-colors placeholder:text-ink-muted focus:border-orange-500";

export function Field({ label, hint, children, className }: { label: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label hint={hint}>{label}</Label>
      {children}
    </div>
  );
}

export function Toggle({ name, defaultChecked, label, hint }: { name: string; defaultChecked?: boolean; label: string; hint?: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-sm border border-line bg-white px-3 py-2.5 transition-colors hover:border-brown-700">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="peer sr-only" />
      <span className="relative mt-0.5 h-5 w-9 shrink-0 rounded-full bg-cream-200 transition-colors after:absolute after:left-0.5 after:top-0.5 after:size-4 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:bg-green-500 peer-checked:after:translate-x-4 peer-focus-visible:ring-2 peer-focus-visible:ring-orange-500" />
      <span className="flex flex-col">
        <span className="text-[14px] font-medium text-ink">{label}</span>
        {hint && <span className="text-[12px] text-ink-muted">{hint}</span>}
      </span>
    </label>
  );
}

export const btn = {
  primary: "inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-sm bg-brown-700 px-4 text-[14px] font-medium text-cream-100 transition-colors hover:bg-brown-900 disabled:opacity-50 [&_svg]:size-4",
  accent: "inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-sm bg-orange-500 px-4 text-[14px] font-semibold text-brown-900 transition-colors hover:bg-orange-600 hover:text-white disabled:opacity-50 [&_svg]:size-4",
  outline: "inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-sm border border-line bg-white px-4 text-[14px] font-medium text-ink transition-colors hover:border-brown-700 hover:text-brown-700 disabled:opacity-50 [&_svg]:size-4",
  danger: "inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-sm border border-sale/40 bg-white px-4 text-[14px] font-medium text-sale transition-colors hover:bg-sale hover:text-white disabled:opacity-50 [&_svg]:size-4",
  ghost: "inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-sm px-3 text-[13px] font-medium text-brown-700 transition-colors hover:bg-cream-100 [&_svg]:size-4",
};

export function fmtDate(d: Date | string | null | undefined, withTime = true) {
  if (!d) return "—";
  return new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Dhaka", day: "numeric", month: "short", year: "numeric", ...(withTime ? { hour: "numeric", minute: "2-digit" } : {}) }).format(new Date(d));
}

export function taka(n: number | null | undefined) {
  return `৳ ${Math.round(n ?? 0).toLocaleString("en-IN")}`;
}

export function Forbidden({ perm }: { perm: string }) {
  return (
    <div className="rounded-md border border-line bg-white px-6 py-16 text-center">
      <p className="font-display text-lg font-semibold text-ink">You don’t have access to this page</p>
      <p className="mt-1 text-[14px] text-ink-muted">Your role needs the “{perm}” permission. Ask a Super Admin.</p>
    </div>
  );
}
