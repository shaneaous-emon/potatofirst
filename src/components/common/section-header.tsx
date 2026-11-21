import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { bn, isBangla } from "@/lib/bn";
import { cn } from "@/lib/utils";

export type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  viewAll?: { label?: string; href: string };
  tone?: "default" | "light";
  className?: string;
  as?: "h1" | "h2";
};

/** Figma: Section Header (Eyebrow / Title / Subtitle / View All). */
export function SectionHeader({ eyebrow: eyebrowRaw, title, subtitle: subtitleRaw, viewAll, tone = "default", className, as: H = "h2" }: SectionHeaderProps) {
  const eyebrow = bn(eyebrowRaw);
  const subtitle = bn(subtitleRaw);
  return (
    <div className={cn("flex items-end justify-between gap-6", className)}>
      <div className="flex min-w-0 flex-col gap-1.5">
        {eyebrow && <p className={cn("t-eyebrow", tone === "light" ? "text-orange-500" : "text-green-600")}>{eyebrow}</p>}
        <H className={cn("t-h2", tone === "light" ? "text-cream-100" : "text-ink")}>{title}</H>
        {subtitle && <p className={cn(isBangla(subtitle) ? "t-bn" : "t-body", tone === "light" ? "text-cream-100/80" : "text-ink-soft")}>{subtitle}</p>}
      </div>
      {viewAll && (
        <Link
          href={viewAll.href}
          className="group hidden shrink-0 items-center gap-1.5 pb-1.5 t-label text-brown-700 hover:underline sm:inline-flex"
        >
          {viewAll.label ?? "View All"}
          <ArrowRight className="size-[18px] transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}

export function MobileViewAll({ href, label = "View All" }: { href: string; label?: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-1.5 self-center t-label text-brown-700 sm:hidden">
      {label} <ArrowRight className="size-4" />
    </Link>
  );
}
