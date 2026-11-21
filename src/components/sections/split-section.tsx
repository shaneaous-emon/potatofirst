import Image from "next/image";
import Link from "next/link";
import { Breadcrumb } from "@/components/common/breadcrumb";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SectionShell } from "./section-shell";
import { isOn } from "./visibility";
import type { SplitSection as Props } from "./types";
import { Bn } from "@/components/common/bn";

/** Generic image + text split section (About hero, story blocks, landing pages). */
export function SplitSection({ id, hide, eyebrow, title, titleSize = "h2", body, bodyBn, image, imageSide = "right", cta, breadcrumb, spacingTop, spacingBottom, background }: Props) {
  const Heading = breadcrumb ? "h1" : "h2";
  return (
    <SectionShell id={id} spacingTop={spacingTop} spacingBottom={spacingBottom} background={background}>
      <div className={cn("grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-16")}>
        <div className={cn("flex flex-col gap-4", imageSide === "left" && "lg:order-2")}>
          {breadcrumb && <Breadcrumb items={[{ label: breadcrumb }]} />}
          {eyebrow && isOn(hide, "eyebrow") && <p className="t-eyebrow text-green-600">{eyebrow}</p>}
          <Heading className={cn(titleSize === "display" ? "t-display" : "t-h2", "text-ink")}>{title}</Heading>
          {body && <p className="t-body-l text-ink-soft">{body}</p>}
          {bodyBn && isOn(hide, "bodyBn") && <Bn className="t-bn text-brown-700">{bodyBn}</Bn>}
          {cta && isOn(hide, "cta") && (
            <Link href={cta.href} className={buttonVariants({ className: "mt-1 self-start" })}>
              {cta.label}
            </Link>
          )}
        </div>
        <div className="relative aspect-[600/460] overflow-hidden rounded-lg">
          <Image src={image.src} alt={image.alt} fill sizes="(min-width:1024px) 600px, 100vw" className="object-cover" priority={!!breadcrumb} />
        </div>
      </div>
    </SectionShell>
  );
}
