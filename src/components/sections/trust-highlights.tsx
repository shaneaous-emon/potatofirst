import { Icon } from "@/components/common/icon";
import { IconCircle } from "@/components/common/icon-circle";
import { SectionShell } from "./section-shell";
import { isOn } from "./visibility";
import type { TrustSection } from "./types";
import { Bn } from "@/components/common/bn";

/**
 * Figma: 04 Trust Highlights (Trust Item ×4).
 * hide keys: subtitle
 */
export function TrustHighlights({ hide, items, spacingTop = "sm", spacingBottom, background }: TrustSection) {
  return (
    <SectionShell spacingTop={spacingTop} spacingBottom={spacingBottom} background={background} label="Why shop with us">
      <ul className="grid grid-cols-2 gap-x-3 gap-y-4 rounded-lg border border-line bg-white px-4 py-4 sm:gap-6 sm:px-6 lg:grid-cols-4 lg:gap-0 lg:px-8 lg:py-5">
        {items.map((item, i) => (
          <li key={item.title} className={`flex min-w-0 items-center gap-2.5 sm:gap-3.5 ${i > 0 ? "lg:border-l lg:border-line lg:pl-6" : ""} ${i < items.length - 1 ? "lg:pr-6" : ""}`}>
            <IconCircle tone="green" size={44} className="max-sm:!size-9 max-sm:[&_svg]:!size-[18px]">
              <Icon name={item.icon} />
            </IconCircle>
            <div className="min-w-0">
              <p className="font-display text-[13px] font-semibold leading-tight text-ink sm:t-h4">{item.title}</p>
              {isOn(hide, "subtitle") && <Bn className="t-bn-s text-ink-soft">{item.subtitle}</Bn>}
            </div>
          </li>
        ))}
      </ul>
    </SectionShell>
  );
}
