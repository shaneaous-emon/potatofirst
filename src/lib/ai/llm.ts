import "server-only";
import { PROVIDERS, providerById, type Provider, type ProviderKind } from "./providers";

/** Provider-neutral chat primitives with tool calling. Each adapter converts to/from its provider's wire format. */

export type ToolDef = { name: string; description: string; parameters: Record<string, unknown> };
export type ToolCall = { id: string; name: string; args: Record<string, unknown> };
export type ToolResult = { id: string; name: string; content: string };

/** Conversation turns kept for the tool loop. `raw` keeps provider-specific content (e.g. Gemini thought signatures) for replay. */
export type Turn =
  | { role: "user"; text: string }
  | { role: "assistant"; text: string; calls: ToolCall[]; raw?: { kind: ProviderKind; data: unknown } }
  | { role: "tool"; results: ToolResult[] };

export type ModelReply = { text: string; calls: ToolCall[]; raw?: { kind: ProviderKind; data: unknown } };

export class AiError extends Error {
  constructor(
    message: string,
    public status = 500,
    /** true when trying another provider might help (quota, overload, bad key for this provider) */
    public retryable = false,
  ) {
    super(message);
  }
}

type Cfg = { provider: Provider; model: string; apiKey: string; baseUrl?: string };

async function post(url: string, headers: Record<string, string>, body: unknown, provider: string) {
  let res: Response;
  try {
    res = await fetch(url, { method: "POST", headers: { "content-type": "application/json", ...headers }, body: JSON.stringify(body), signal: AbortSignal.timeout(55_000) });
  } catch (e) {
    throw new AiError(`${provider}: could not reach the service (${e instanceof Error ? e.message : "network error"})`, 502, true);
  }
  const text = await res.text();
  let json: unknown = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* non-JSON error body */
  }
  if (!res.ok) {
    const j = json as { error?: { message?: string } | string; message?: string } | null;
    const detail = (typeof j?.error === "string" ? j.error : j?.error?.message) ?? j?.message ?? text.slice(0, 200);
    const msg =
      res.status === 429 ? `${provider}: free quota / rate limit reached. ${detail}` : res.status === 401 || res.status === 403 ? `${provider}: the API key was rejected. ${detail}` : `${provider}: ${detail}`;
    throw new AiError(msg, res.status, res.status === 429 || res.status >= 500 || res.status === 401 || res.status === 403 || res.status === 404);
  }
  return json as Record<string, unknown>;
}

/* ───────────── OpenAI-compatible (OpenAI, OpenRouter, Groq, DeepSeek, custom) ───────────── */

async function openai(cfg: Cfg, system: string, turns: Turn[], tools: ToolDef[]): Promise<ModelReply> {
  const messages: unknown[] = [{ role: "system", content: system }];
  for (const t of turns) {
    if (t.role === "user") messages.push({ role: "user", content: t.text });
    else if (t.role === "assistant")
      messages.push({
        role: "assistant",
        content: t.text || null,
        ...(t.calls.length ? { tool_calls: t.calls.map((c) => ({ id: c.id, type: "function", function: { name: c.name, arguments: JSON.stringify(c.args) } })) } : {}),
      });
    else for (const r of t.results) messages.push({ role: "tool", tool_call_id: r.id, content: r.content });
  }
  const base = (cfg.baseUrl ?? cfg.provider.baseUrl ?? "").replace(/\/+$/, "");
  if (!base) throw new AiError("Set a base URL for the custom provider in AI Assistant settings.", 400);
  const json = await post(
    `${base}/chat/completions`,
    { authorization: `Bearer ${cfg.apiKey}` },
    { model: cfg.model, messages, ...(tools.length ? { tools: tools.map((t) => ({ type: "function", function: { name: t.name, description: t.description, parameters: t.parameters } })), tool_choice: "auto" } : {}), temperature: 0.2 },
    cfg.provider.name,
  );
  const msg = (json.choices as { message?: { content?: string | null; tool_calls?: { id: string; function: { name: string; arguments: string } }[] } }[] | undefined)?.[0]?.message;
  if (!msg) throw new AiError(`${cfg.provider.name}: empty response`, 502, true);
  const calls: ToolCall[] = (msg.tool_calls ?? []).map((c, i) => {
    let args: Record<string, unknown> = {};
    try {
      args = JSON.parse(c.function.arguments || "{}");
    } catch {
      /* model produced invalid JSON — run with no args and let validation explain */
    }
    return { id: c.id || `call_${i}`, name: c.function.name, args };
  });
  // some free models wrap reasoning in <think> tags — hide it
  const text = (msg.content ?? "").replace(/<think>[\s\S]*?<\/think>/g, "").trim();
  return { text, calls };
}

/* ───────────── Google Gemini ───────────── */

type GPart = { text?: string; functionCall?: { name: string; args: Record<string, unknown> }; functionResponse?: { name: string; response: unknown }; thought?: boolean };

async function gemini(cfg: Cfg, system: string, turns: Turn[], tools: ToolDef[]): Promise<ModelReply> {
  const contents: { role: string; parts: GPart[] }[] = [];
  for (const t of turns) {
    if (t.role === "user") contents.push({ role: "user", parts: [{ text: t.text }] });
    else if (t.role === "assistant") {
      if (t.raw?.kind === "gemini") contents.push(t.raw.data as { role: string; parts: GPart[] });
      else contents.push({ role: "model", parts: [...(t.text || !t.calls.length ? [{ text: t.text || "…" }] : []), ...t.calls.map((c) => ({ functionCall: { name: c.name, args: c.args } }))] });
    } else contents.push({ role: "user", parts: t.results.map((r) => ({ functionResponse: { name: r.name, response: { result: safeJson(r.content) } } })) });
  }
  const json = await post(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(cfg.model)}:generateContent`,
    { "x-goog-api-key": cfg.apiKey },
    {
      systemInstruction: { parts: [{ text: system }] },
      contents,
      ...(tools.length ? { tools: [{ functionDeclarations: tools.map((t) => ({ name: t.name, description: t.description, parameters: geminiSchema(t.parameters) })) }] } : {}),
      generationConfig: { temperature: 0.2 },
    },
    cfg.provider.name,
  );
  const cand = (json.candidates as { content?: { role: string; parts?: GPart[] }; finishReason?: string }[] | undefined)?.[0];
  const parts = cand?.content?.parts ?? [];
  if (!cand || !parts.length) {
    const block = (json.promptFeedback as { blockReason?: string } | undefined)?.blockReason;
    throw new AiError(`Gemini returned no answer${block ? ` (blocked: ${block})` : cand?.finishReason ? ` (${cand.finishReason})` : ""}. Try rephrasing.`, 502, !block);
  }
  const text = parts.filter((p) => p.text && !p.thought).map((p) => p.text).join("").trim();
  const calls: ToolCall[] = parts.filter((p) => p.functionCall).map((p, i) => ({ id: `g${Date.now()}_${i}`, name: p.functionCall!.name, args: p.functionCall!.args ?? {} }));
  return { text, calls, raw: { kind: "gemini", data: { role: "model", parts } } };
}

const safeJson = (s: string) => {
  try {
    return JSON.parse(s);
  } catch {
    return s;
  }
};

/** Gemini accepts an OpenAPI subset: drop unsupported keywords and upper-case nothing (lower-case types are accepted). */
function geminiSchema(s: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(s)) {
    if (k === "additionalProperties" || k === "default" || k === "$schema") continue;
    if (k === "properties" && v && typeof v === "object") out[k] = Object.fromEntries(Object.entries(v as Record<string, Record<string, unknown>>).map(([n, p]) => [n, geminiSchema(p)]));
    else if (k === "items" && v && typeof v === "object") out[k] = geminiSchema(v as Record<string, unknown>);
    else out[k] = v;
  }
  return out;
}

/* ───────────── Anthropic ───────────── */

type ABlock = { type: string; text?: string; id?: string; name?: string; input?: Record<string, unknown> };

async function anthropic(cfg: Cfg, system: string, turns: Turn[], tools: ToolDef[]): Promise<ModelReply> {
  const messages: { role: string; content: unknown }[] = [];
  for (const t of turns) {
    if (t.role === "user") messages.push({ role: "user", content: t.text });
    else if (t.role === "assistant") messages.push({ role: "assistant", content: t.raw?.kind === "anthropic" ? (t.raw.data as ABlock[]) : t.calls.length ? [...(t.text ? [{ type: "text", text: t.text }] : []), ...t.calls.map((c) => ({ type: "tool_use", id: c.id, name: c.name, input: c.args }))] : t.text || "…" });
    else messages.push({ role: "user", content: t.results.map((r) => ({ type: "tool_result", tool_use_id: r.id, content: r.content })) });
  }
  const json = await post(
    "https://api.anthropic.com/v1/messages",
    { "x-api-key": cfg.apiKey, "anthropic-version": "2023-06-01" },
    { model: cfg.model, max_tokens: 2048, system, messages, ...(tools.length ? { tools: tools.map((t) => ({ name: t.name, description: t.description, input_schema: t.parameters })) } : {}) },
    cfg.provider.name,
  );
  const blocks = (json.content as ABlock[] | undefined) ?? [];
  const text = blocks.filter((b) => b.type === "text").map((b) => b.text).join("").trim();
  const calls: ToolCall[] = blocks.filter((b) => b.type === "tool_use").map((b) => ({ id: b.id!, name: b.name!, args: b.input ?? {} }));
  return { text, calls, raw: { kind: "anthropic", data: blocks } };
}

/* ───────────── Entry point ───────────── */

export async function callModel(
  settings: { provider: string; model: string; keys: Record<string, string>; customBaseUrl: string },
  system: string,
  turns: Turn[],
  tools: ToolDef[],
): Promise<{ reply: ModelReply; used: string }> {
  const keyFor = (p: Provider) => settings.keys[p.id]?.trim() || process.env[p.env]?.trim() || "";
  const primary = providerById(settings.provider);
  // selected provider first, then any other provider that has a key (automatic fallback when a free quota runs out)
  const order = [primary, ...PROVIDERS.filter((p) => p.id !== primary?.id)].filter((p): p is Provider => !!p && !!keyFor(p) && (p.id !== "custom" || !!settings.customBaseUrl));
  if (!order.length) throw new AiError("No API key is set yet. Open AI Assistant settings and add a free Gemini key.", 400);

  let lastErr: AiError | null = null;
  for (const provider of order) {
    const isPrimary = provider.id === settings.provider;
    const chosen = isPrimary && settings.model ? settings.model : provider.models[0]?.id;
    if (!chosen) continue;
    // same provider, other models next: a busy model (503) is often fine on a sibling model
    const models = [chosen, ...provider.models.map((m) => m.id).filter((m) => m !== chosen)].slice(0, 3);
    for (const model of models) {
      const cfg: Cfg = { provider, model, apiKey: keyFor(provider), baseUrl: provider.id === "custom" ? settings.customBaseUrl : undefined };
      try {
        const fn = provider.kind === "gemini" ? gemini : provider.kind === "anthropic" ? anthropic : openai;
        return { reply: await fn(cfg, system, turns, tools), used: `${provider.name} · ${model}` };
      } catch (e) {
        const err = e instanceof AiError ? e : new AiError(e instanceof Error ? e.message : "AI request failed", 500, false);
        lastErr = err;
        if (!err.retryable) throw err;
        if (err.status === 401 || err.status === 403) break; // bad key — other models of this provider won't help
      }
    }
  }
  throw lastErr ?? new AiError("AI request failed", 500);
}
