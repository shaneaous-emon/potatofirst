import { cn } from "@/lib/utils";
import type { Background, Spacing } from "./types";

const TOP: Record<Spacing, string> = { none: "", sm: "pt-6", md: "pt-12 lg:pt-16", lg: "pt-12 lg:pt-20" };
const BOTTOM: Record<Spacing, string> = { none: "", sm: "pb-6", md: "pb-12 lg:pb-16", lg: "pb-12 lg:pb-20" };
const BG: Record<Background, string> = {
  none: "",
  cream: "bg-cream-100",
  "cream-soft": "bg-cream-50",
  white: "bg-white",
  brown: "bg-brown-700",
};

/** Consistent outer wrapper for every section: background + vertical rhythm + container. */
export function SectionShell({
  id,
  spacingTop = "lg",
  spacingBottom = "none",
  background = "none",
  className,
  containerClassName,
  children,
  label,
}: {
  id?: string;
  spacingTop?: Spacing;
  spacingBottom?: Spacing;
  background?: Background;
  className?: string;
  containerClassName?: string;
  children: React.ReactNode;
  label?: string;
}) {
  return (
    <section id={id} aria-label={label} className={cn(BG[background], TOP[spacingTop], BOTTOM[spacingBottom], className)}>
      <div className={cn("container-site", containerClassName)}>{children}</div>
    </section>
  );
}
