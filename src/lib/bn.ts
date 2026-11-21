import { site } from "@/content/site";

const BANGLA = /[ঀ-৿]/;

/** Site-wide switch for Bangla secondary text (site.features.bangla). */
export const showBangla: boolean = site.features.bangla;

export const isBangla = (text: string) => BANGLA.test(text);

/**
 * Returns the text if it may be shown. With Bangla switched off, Bangla
 * segments of "English · বাংলা" strings are dropped and fully-Bangla
 * strings return undefined.
 */
export function bn(text?: string | null): string | undefined {
  if (!text) return undefined;
  if (showBangla) return text;
  const parts = text.split(" · ").filter((p) => !isBangla(p));
  return parts.length ? parts.join(" · ") : undefined;
}
