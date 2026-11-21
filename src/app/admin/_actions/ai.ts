"use server";

import { revalidatePath } from "next/cache";
import { logActivity, requirePermission } from "@/lib/admin/auth";
import { PROVIDERS } from "@/lib/ai/providers";
import { callModel } from "@/lib/ai/llm";
import { getSetting, saveSetting } from "@/lib/settings";
import type { ActionResult } from "@/components/admin/action-form";

export async function saveAiSettingsAction(_: ActionResult, f: FormData): Promise<ActionResult> {
  try {
    const admin = await requirePermission("ai.configure");
    const cur = await getSetting("ai");
    const provider = String(f.get("provider") || "gemini");
    if (!PROVIDERS.some((p) => p.id === provider)) return { ok: false, message: "Unknown provider" };
    const keys = { ...cur.keys };
    for (const p of PROVIDERS) {
      const v = String(f.get(`key_${p.id}`) || "").trim();
      if (f.get(`clear_${p.id}`) === "on") delete keys[p.id];
      else if (v) keys[p.id] = v; // blank = keep the saved key
    }
    const customModel = String(f.get("customModel") || "").trim();
    let model = customModel || String(f.get("model") || "").trim() || PROVIDERS.find((p) => p.id === provider)?.models[0]?.id || "";
    // a listed model that belongs to another provider can't work with this one — fall back to this provider's default
    const owner = PROVIDERS.find((p) => p.models.some((m) => m.id === model));
    if (owner && owner.id !== provider) model = PROVIDERS.find((p) => p.id === provider)?.models[0]?.id ?? model;
    const customBaseUrl = String(f.get("customBaseUrl") || "").trim();
    if (customBaseUrl && !/^https?:\/\//.test(customBaseUrl)) return { ok: false, message: "Base URL must start with http:// or https://" };
    await saveSetting("ai", { enabled: f.get("enabled") === "on", provider, model, autoExecute: f.get("autoExecute") === "on", keys, customBaseUrl });
    await logActivity(admin, "ai.settings", "settings", null, `AI assistant: ${provider} / ${model}, auto-run ${f.get("autoExecute") === "on" ? "on" : "off"}`);
    revalidatePath("/admin", "layout");
    return { ok: true, message: "AI settings saved" };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Something went wrong" };
  }
}

/** Sends a tiny test prompt using the saved settings so the admin can see whether the key works. */
export async function testAiAction(): Promise<{ ok: boolean; message: string }> {
  try {
    await requirePermission("ai.configure");
    const ai = await getSetting("ai");
    const { reply, used } = await callModel(ai, "Reply with the single word: ready", [{ role: "user", text: "ping" }], []);
    return { ok: true, message: `Connected to ${used}: “${reply.text.slice(0, 60) || "ok"}”` };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Test failed" };
  }
}
