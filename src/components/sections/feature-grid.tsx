import { Icon } from "@/components/common/icon";
import { IconCircle } from "@/components/common/icon-circle";
import { SectionHeader } from "@/components/common/section-header";
import { SectionShell } from "./section-shell";
import { headerProps, isOn } from "./visibility";
import type { FeatureGridSection } from "./types";
import { Bn } from "@/components/common/bn";

/** Generic icon feature grid (About › "What we stand for"). */
export function FeatureGrid({ header, hide, items, spacingTop, spacingBottom, background }: FeatureGridSection) {
  return (
    <SectionShell spacingTop={spacingTop} spacingBottom={spacingBottom} background={background}>
      <div className="flex flex-col gap-8">
        <SectionHeader {...headerProps(header, hide)} />
        <ul className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          {items.map((it) => (
            <li key={it.title} className="flex flex-col gap-3 rounded-md border border-line bg-white p-7">
              <IconCircle tone="green" size={52}>
                <Icon name={it.icon} />
              </IconCircle>
              <h3 className="t-h4 text-ink">{it.title}</h3>
              <p className="t-body-s text-ink-soft">{it.body}</p>
              {it.bodyBn && isOn(hide, "bodyBn") && <Bn className="t-bn-s text-orange-600">{it.bodyBn}</Bn>}
            </li>
          ))}
        </ul>
      </div>
    </SectionShell>
  );
}
