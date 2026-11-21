import { SectionHeader } from "@/components/common/section-header";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { getFaqs } from "@/lib/repositories";
import { SectionShell } from "./section-shell";
import type { FaqSection as Props } from "./types";

/** Reusable FAQ accordion section. */
export async function FaqSection({ header, items, spacingTop, spacingBottom, background }: Props) {
  const list = items ?? (await getFaqs());
  return (
    <SectionShell spacingTop={spacingTop} spacingBottom={spacingBottom} background={background}>
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <SectionHeader {...header} />
        <FaqList items={list} />
      </div>
    </SectionShell>
  );
}

export function FaqList({ items }: { items: { q: string; a: string }[] }) {
  return (
    <Accordion type="single" collapsible className="rounded-md border border-line bg-white px-5 sm:px-6">
      {items.map((f, i) => (
        <AccordionItem key={f.q} value={`faq-${i}`} className="last:border-b-0">
          <AccordionTrigger>{f.q}</AccordionTrigger>
          <AccordionContent>{f.a}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
