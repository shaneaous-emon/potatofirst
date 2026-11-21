import Image from "next/image";
import Link from "next/link";
import { Package } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { SectionShell } from "./section-shell";
import type { PromoBannerSection } from "./types";

/** Figma: 07 Promotional Combo Banner — CMS image + editable copy. */
export function PromoBanner({ eyebrow, title, subtitle, cta, offerChip, image, spacingTop, spacingBottom = "lg", background }: PromoBannerSection) {
  return (
    <SectionShell spacingTop={spacingTop} spacingBottom={spacingBottom} background={background}>
      <div className="relative isolate overflow-hidden rounded-lg bg-cream-100">
        <Image
          src={image.src}
          alt=""
          fill
          sizes="(min-width:1280px) 1280px, 100vw"
          className="-z-10 object-cover object-[75%_center] max-md:opacity-40 md:object-right"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-cream-100/95 via-cream-100/60 to-transparent max-md:bg-cream-100/40" />
        <div className="flex min-h-[340px] max-w-[520px] flex-col justify-center gap-4 p-6 sm:p-10 md:min-h-[400px] lg:px-[72px]">
          {eyebrow && (
            <p className="flex items-center gap-2 t-caption text-orange-600">
              <Package className="size-[18px]" aria-hidden /> {eyebrow}
            </p>
          )}
          <h2 className="t-display-m whitespace-pre-line text-brown-900">{title}</h2>
          {subtitle && <p className="t-bn text-ink-soft">{subtitle}</p>}
          <div className="flex flex-wrap items-center gap-3 pt-1 sm:gap-4">
            <Link href={cta.href} className={buttonVariants()}>
              {cta.label}
            </Link>
            {offerChip && (
              <span className="rounded-full border-[1.5px] border-dashed border-orange-500 bg-white px-3.5 py-2 t-label text-orange-600">{offerChip}</span>
            )}
          </div>
        </div>
      </div>
    </SectionShell>
  );
}
