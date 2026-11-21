import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { sectionRegistry } from "./registry";
import type { Section } from "./types";

function SectionFallback() {
  return (
    <div className="container-site py-12">
      <Skeleton className="mb-6 h-8 w-64" />
      <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="aspect-[3/4]" />
        ))}
      </div>
    </div>
  );
}

/** Renders an ordered list of section content objects via the registry. */
export function SectionRenderer({ sections }: { sections: Section[] }) {
  return (
    <>
      {sections.map((section, i) => {
        const Component = sectionRegistry[section.type] as React.ComponentType<Section>;
        if (!Component) {
          if (process.env.NODE_ENV !== "production") console.warn(`Unknown section type: ${section.type}`);
          return null;
        }
        // First two sections render eagerly (above the fold); the rest stream in.
        return i < 2 ? (
          <Component key={section.id} {...section} />
        ) : (
          <Suspense key={section.id} fallback={<SectionFallback />}>
            <Component {...section} />
          </Suspense>
        );
      })}
    </>
  );
}
