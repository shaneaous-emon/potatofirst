import { Icon } from "@/components/common/icon";
import { IconCircle } from "@/components/common/icon-circle";
import { SectionShell } from "./section-shell";
import type { TrustSection } from "./types";

/** Figma: 04 Trust Highlights (Trust Item ×4). */
export function TrustHighlights({ items, spacingTop = "sm", spacingBottom, background }: TrustSection) {
  return (
    <SectionShell spacingTop={spacingTop} spacingBottom={spacingBottom} background={background} label="Why shop with us">
      <ul className="grid grid-cols-1 gap-4 rounded-lg border border-line bg-white p-5 xs:grid-cols-2 sm:gap-6 lg:grid-cols-4 lg:gap-0 lg:px-8 lg:py-6">
        {items.map((item, i) => (
          <li key={item.title} className={`flex items-center gap-3.5 ${i > 0 ? "lg:border-l lg:border-line lg:pl-6" : ""} ${i < items.length - 1 ? "lg:pr-6" : ""}`}>
            <IconCircle tone="green" size={52}>
              <Icon name={item.icon} />
            </IconCircle>
            <div className="min-w-0">
              <p className="t-h4 text-ink">{item.title}</p>
              <p className="t-bn-s text-ink-soft">{item.subtitle}</p>
            </div>
          </li>
        ))}
      </ul>
    </SectionShell>
  );
}
