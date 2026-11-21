import Image from "next/image";
import Link from "next/link";
import { SectionShell } from "./section-shell";
import type { HeroSection } from "./types";

/**
 * Figma: 03 Hero Banner — two CMS image slots (main + side), image only.
 * Main banner is the LCP element → priority + eager load.
 */
export function HeroBanner({ hide, main, side, spacingTop = "sm", spacingBottom, background }: HeroSection) {
  return (
    <SectionShell spacingTop={spacingTop} spacingBottom={spacingBottom} background={background} label="Featured">
      <div className={`grid grid-cols-1 gap-4 lg:gap-6 ${side && !hide?.includes("side") ? "lg:grid-cols-[860fr_396fr]" : ""}`}>
        <Link href={main.href} className="group relative block overflow-hidden rounded-lg">
          {main.mobileImage && (
            <Image
              src={main.mobileImage.src}
              alt={main.mobileImage.alt}
              width={main.mobileImage.width}
              height={main.mobileImage.height}
              priority
              sizes="100vw"
              className="h-auto w-full sm:hidden"
            />
          )}
          <Image
            src={main.image.src}
            alt={main.image.alt}
            width={main.image.width}
            height={main.image.height}
            priority
            fetchPriority="high"
            sizes="(min-width:1280px) 860px, (min-width:1024px) 66vw, 100vw"
            className={`aspect-[860/440] h-auto w-full object-cover transition-transform duration-700 group-hover:scale-[1.02] ${main.mobileImage ? "max-sm:hidden" : ""}`}
          />
        </Link>
        {side && !hide?.includes("side") && (
          <Link href={side.href} className="group relative hidden overflow-hidden rounded-lg lg:block">
            <Image
              src={side.image.src}
              alt={side.image.alt}
              fill
              sizes="396px"
              className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            />
          </Link>
        )}
      </div>
    </SectionShell>
  );
}
