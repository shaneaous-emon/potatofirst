import "server-only";
import { inArray } from "drizzle-orm";
import { db, hasDatabase, t } from "@/db";
import { SETTINGS_DEFAULTS, type SettingKey, type Settings } from "./defaults";

/** Deep-merge stored JSON over defaults so new fields get sensible values. */
function merge<T>(def: T, val: unknown): T {
  if (Array.isArray(def) || typeof def !== "object" || def === null) return (val ?? def) as T;
  const out: Record<string, unknown> = { ...(def as Record<string, unknown>) };
  if (val && typeof val === "object") for (const [k, v] of Object.entries(val)) out[k] = k in out ? merge(out[k], v) : v;
  return out as T;
}

export async function getSettings<K extends SettingKey>(...keys: K[]): Promise<Pick<Settings, K>> {
  const out = {} as Pick<Settings, K>;
  for (const k of keys) out[k] = SETTINGS_DEFAULTS[k];
  if (!hasDatabase) return out;
  try {
    const rows = await db().select().from(t.settings).where(inArray(t.settings.key, keys));
    for (const r of rows) out[r.key as K] = merge(SETTINGS_DEFAULTS[r.key as K], r.value);
  } catch {
    /* DB unreachable — fall back to defaults */
  }
  return out;
}

export async function getSetting<K extends SettingKey>(key: K): Promise<Settings[K]> {
  return (await getSettings(key))[key];
}

export async function saveSetting<K extends SettingKey | "home">(key: K, value: unknown) {
  await db().insert(t.settings).values({ key, value }).onDuplicateKeyUpdate({ set: { value } });
}

export { SETTINGS_DEFAULTS };
