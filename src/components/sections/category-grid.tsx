import { SectionHeader } from "@/components/common/section-header";
import { getCategories } from "@/lib/repositories";
import { CategoryCard } from "./category-card";
import { SectionShell } from "./section-shell";
import { headerProps } from "./visibility";
import type { CategoryGridSection } from "./types";

/** Figma: 05 Shop by Category */
export async function CategoryGrid({ header, hide, categorySlugs, spacingTop, spacingBottom, background }: CategoryGridSection) {
  const all = await getCategories();
  const list = categorySlugs ? categorySlugs.map((s) => all.find((c) => c.slug === s)).filter((c) => !!c) : all;
  return (
    <SectionShell spacingTop={spacingTop} spacingBottom={spacingBottom} background={background}>
      <div className="flex flex-col gap-6 lg:gap-8">
        <SectionHeader {...headerProps(header, hide)} />
        <ul className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4 lg:gap-8">
          {list.map((c) => (
            <li key={c.slug}>
              <CategoryCard category={c} />
            </li>
          ))}
        </ul>
      </div>
    </SectionShell>
  );
}
