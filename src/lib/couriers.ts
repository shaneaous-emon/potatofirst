/**
 * Courier providers (Bangladesh). Phase 1: manual booking — the admin pastes the
 * consignment ID. Phase 2: API adapters (create parcel, status webhook) per provider,
 * enabled in Admin › Couriers once merchant API credentials are added.
 */
export const COURIERS = [
  { slug: "steadfast", name: "Steadfast", panel: "https://steadfast.com.bd/login", track: (id: string) => `https://steadfast.com.bd/t/${encodeURIComponent(id)}` },
  { slug: "pathao", name: "Pathao", panel: "https://merchant.pathao.com/", track: (id: string) => `https://merchant.pathao.com/tracking?consignment_id=${encodeURIComponent(id)}` },
  { slug: "redx", name: "RedX", panel: "https://redx.com.bd/", track: (id: string) => `https://redx.com.bd/track-parcel/?trackingId=${encodeURIComponent(id)}` },
] as const;

export type CourierSlug = (typeof COURIERS)[number]["slug"];

export function courierTrackingUrl(courier: string, id: string) {
  return COURIERS.find((c) => c.slug === courier)?.track(id) ?? null;
}
