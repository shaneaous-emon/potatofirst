import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/admin/auth";
import { can } from "@/lib/admin/permissions";
import { runAgent } from "@/lib/ai/agent";
import { AiError } from "@/lib/ai/llm";

export const maxDuration = 60;

/** Per-admin throttle so a stuck client (or stolen cookie) can't burn the API quota. */
const hits = new Map<number, number[]>();
function throttled(id: number) {
  const now = Date.now();
  const list = (hits.get(id) ?? []).filter((t) => now - t < 60_000);
  list.push(now);
  hits.set(id, list);
  return list.length > 20;
}

export async function POST(req: Request) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  if (!can(admin.permissions, "ai.use")) return NextResponse.json({ error: "Your role can’t use the AI assistant." }, { status: 403 });
  if (throttled(admin.id)) return NextResponse.json({ error: "Slow down a little — too many requests." }, { status: 429 });

  let body: { messages?: { role?: string; text?: string }[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
  const history = (body.messages ?? [])
    .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.text === "string" && m.text.trim())
    .slice(-12)
    .map((m) => ({ role: m.role as "user" | "assistant", text: String(m.text).slice(0, 4000) }));
  if (!history.length || history[history.length - 1].role !== "user") return NextResponse.json({ error: "Say something first." }, { status: 400 });

  try {
    const result = await runAgent(admin, history);
    if (result.changed) revalidatePath("/", "layout");
    return NextResponse.json(result);
  } catch (e) {
    const status = e instanceof AiError ? (e.status >= 400 && e.status < 600 ? e.status : 500) : 500;
    console.error("AI chat failed:", e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "AI request failed" }, { status: status === 401 || status === 403 ? 502 : status });
  }
}
