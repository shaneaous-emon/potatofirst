import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/admin/auth";
import { can } from "@/lib/admin/permissions";
import { runTool, toolByName } from "@/lib/ai/tools";


/** Runs a write action the admin confirmed in the assistant popup. Same permission checks as the panel itself. */
export async function POST(req: Request) {
  const admin = await getAdmin();
  if (!admin) return NextResponse.json({ ok: false, error: "Please sign in again." }, { status: 401 });
  if (!can(admin.permissions, "ai.use")) return NextResponse.json({ ok: false, error: "Not allowed." }, { status: 403 });
  let body: { tool?: string; args?: Record<string, unknown> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Bad request" }, { status: 400 });
  }
  const tool = body.tool ? toolByName(body.tool) : undefined;
  if (!tool || !tool.write) return NextResponse.json({ ok: false, error: "Unknown action." }, { status: 400 });
  try {
    const result = await runTool(admin, tool.name, body.args ?? {});
    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true, result });
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : "Failed" }, { status: 400 });
  }
}
