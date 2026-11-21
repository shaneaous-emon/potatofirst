import { bn, isBangla } from "@/lib/bn";

/**
 * Renders secondary text, respecting site.features.bangla:
 * Bangla-only text renders nothing when Bangla is off; English text always
 * renders, with the Bangla type style (t-bn / t-bn-s) swapped for the body style.
 */
export function Bn({ children, className, as: Tag = "p" }: { children?: string | null; className?: string; as?: "p" | "span" }) {
  const text = bn(children);
  if (!text) return null;
  const cls = isBangla(text) ? className : className?.replace(/\bt-bn(-s)?\b/g, (_, s) => (s ? "t-body-s" : "t-body"));
  return <Tag className={cls}>{text}</Tag>;
}
