import type { Header } from "./types";

/**
 * Element-level visibility. Every section accepts `hide: string[]` — a list of
 * optional element keys to switch off (the content stays saved, it just isn't
 * rendered). In the admin panel this becomes a set of on/off toggles.
 *
 * Header keys (all sections with a header): "eyebrow" | "subtitle" | "viewAll"
 */
export const isOn = (hide: string[] | undefined, key: string) => !hide?.includes(key);

export function headerProps(header: Header, hide?: string[]): Header {
  return {
    title: header.title,
    eyebrow: isOn(hide, "eyebrow") ? header.eyebrow : undefined,
    subtitle: isOn(hide, "subtitle") ? header.subtitle : undefined,
    viewAll: isOn(hide, "viewAll") ? header.viewAll : undefined,
  };
}
