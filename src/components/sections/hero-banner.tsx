import { HeroSlider } from "./hero-slider";
import { SectionShell } from "./section-shell";
import { isOn } from "./visibility";
import type { HeroSection } from "./types";

/**
 * Figma: 03 Hero Banner — main banner slider + fixed side banner (image only).
 * hide keys: side
 */
export function HeroBanner({ hide, slides, side, intervalMs, spacingTop = "sm", spacingBottom, background }: HeroSection) {
  const showSide = !!side?.length && isOn(hide, "side");
  return (
    <SectionShell spacingTop={spacingTop} spacingBottom={spacingBottom} background={background} label="Featured">
      <div className={`grid grid-cols-1 gap-4 lg:gap-6 ${showSide ? "lg:grid-cols-[860fr_396fr]" : ""}`}>
        <HeroSlider
          slides={slides}
          intervalMs={intervalMs}
          priority
          sizes="(min-width:1280px) 860px, (min-width:1024px) 66vw, 100vw"
          className="aspect-[860/440]"
        />
        {showSide && (
          <HeroSlider slides={side!} intervalMs={intervalMs} sizes="396px" label="Side banner" className="hidden lg:block" />
        )}
      </div>
    </SectionShell>
  );
}
