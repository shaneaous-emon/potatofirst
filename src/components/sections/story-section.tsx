import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/common/icon";
import { IconCircle } from "@/components/common/icon-circle";
import { buttonVariants } from "@/components/ui/button";
import { SectionShell } from "./section-shell";
import type { StorySection as Props } from "./types";

/** Figma: 11 Why Potato First (brand story, dark brown). */
export function StorySection({ eyebrow, title, body, bodyBn, image, floatingCard, points, ctas, spacingTop = "lg", spacingBottom = "lg", background = "brown" }: Props) {
  return (
    <SectionShell spacingTop={spacingTop} spacingBottom={spacingBottom} background={background} className="lg:py-24">
      <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[540px_1fr] lg:gap-[72px]">
        <div className="relative aspect-[540/580] overflow-hidden rounded-lg max-lg:max-h-[520px] max-lg:w-full">
          <Image src={image.src} alt={image.alt} fill sizes="(min-width:1024px) 540px, 100vw" className="object-cover" />
          {floatingCard && (
            <div className="absolute bottom-5 left-5 flex items-center gap-3.5 rounded-md bg-white px-[18px] py-3.5 shadow-pop sm:bottom-6 sm:left-6">
              <IconCircle tone="orange" size={44}>
                <Icon name={floatingCard.icon} />
              </IconCircle>
              <div>
                <p className="t-h4 text-ink">{floatingCard.title}</p>
                <p className="t-bn-s text-ink-soft">{floatingCard.subtitle}</p>
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-5">
          {eyebrow && <p className="t-eyebrow text-orange-500">{eyebrow}</p>}
          <h2 className="t-h1 text-cream-100">{title}</h2>
          <p className="t-body-l text-cream-100/80">{body}</p>
          {bodyBn && <p className="t-bn text-[17px] text-orange-500">{bodyBn}</p>}
          <ul className="grid gap-4 sm:grid-cols-2">
            {points.map((pt) => (
              <li key={pt.title} className="flex items-center gap-3.5 rounded-md border border-cream-100/15 bg-cream-100/[0.08] p-4">
                <IconCircle tone="orange-solid" size={44}>
                  <Icon name={pt.icon} />
                </IconCircle>
                <div className="min-w-0">
                  <p className="t-h4 text-cream-100">{pt.title}</p>
                  <p className="t-bn-s text-cream-100/70">{pt.subtitle}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-3 pt-1">
            {ctas.map((c, i) => (
              <Link key={c.href} href={c.href} className={buttonVariants({ variant: i === 0 ? "accent" : "outline" })}>
                {c.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </SectionShell>
  );
}
