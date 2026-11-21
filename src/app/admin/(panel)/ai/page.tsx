import { Sparkles } from "lucide-react";
import { ActionForm, SubmitButton } from "@/components/admin/action-form";
import { AiTestButton } from "@/components/admin/ai-test-button";
import { Badge, Card, Forbidden, PageHeader, Toggle, inputCls } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/auth";
import { can } from "@/lib/admin/permissions";
import { PROVIDERS } from "@/lib/ai/providers";
import { getSetting } from "@/lib/settings";
import { saveAiSettingsAction } from "../../_actions/ai";

export const metadata = { title: "AI Assistant" };

const mask = (k?: string) => (k ? `••••••${k.slice(-4)}` : "");

export default async function AiSettingsPage() {
  const admin = await requireAdmin();
  if (!can(admin.permissions, "ai.configure")) return <Forbidden perm="ai.configure" />;
  const ai = await getSetting("ai");
  const current = PROVIDERS.find((p) => p.id === ai.provider) ?? PROVIDERS[0];
  const allModels = PROVIDERS.flatMap((p) => p.models.map((m) => ({ ...m, provider: p.id })));
  const isListed = allModels.some((m) => m.provider === ai.provider && m.id === ai.model);

  return (
    <>
      <PageHeader
        title="AI Assistant"
        description="Chat with your store in plain Bangla or English. The assistant can read reports and change orders, stock, prices, coupons and more for you."
      />
      <ActionForm action={saveAiSettingsAction}>
        <div className="grid max-w-5xl grid-cols-1 gap-5 xl:grid-cols-[1fr_320px]">
          <div className="flex flex-col gap-5">
            <Card title={<span className="flex items-center gap-2"><Sparkles className="size-4 text-orange-600" /> Model</span>}>
              <div className="flex flex-col gap-4">
                <Toggle name="enabled" defaultChecked={ai.enabled} label="Assistant enabled" hint="Shows the ✨ chat button on every admin page." />
                <label className="flex flex-col gap-1.5 text-[13px] font-medium">
                  Provider
                  <select name="provider" defaultValue={ai.provider} className={inputCls}>
                    {PROVIDERS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                        {p.free ? " — free tier" : ""}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1.5 text-[13px] font-medium">
                  Model
                  <select name="model" defaultValue={isListed ? ai.model : ""} className={inputCls}>
                    <option value="">(use the custom model ID below)</option>
                    {PROVIDERS.map((p) => (
                      <optgroup key={p.id} label={p.name}>
                        {p.models.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.label}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  <span className="text-[12px] font-normal text-ink-muted">Pick a model that belongs to the provider selected above.</span>
                </label>
                <label className="flex flex-col gap-1.5 text-[13px] font-medium">
                  Custom model ID <span className="font-normal text-ink-muted">(optional — overrides the list; use for new models)</span>
                  <input name="customModel" defaultValue={isListed ? "" : ai.model} placeholder="e.g. gemini-3-flash" className={inputCls} />
                </label>
                <label className="flex flex-col gap-1.5 text-[13px] font-medium">
                  Custom provider base URL <span className="font-normal text-ink-muted">(only for “Custom (OpenAI-compatible)”)</span>
                  <input name="customBaseUrl" defaultValue={ai.customBaseUrl} placeholder="https://your-server/v1" className={inputCls} />
                </label>
              </div>
            </Card>

            <Card title="API keys">
              <p className="mb-4 text-[13px] text-ink-soft">
                Add a key for each provider you want. If the selected provider runs out of its free quota, the assistant automatically falls back to the next provider that has a key. Keys are stored on your server and never shown in the browser. You can also set them as environment variables.
              </p>
              <div className="flex flex-col gap-4">
                {PROVIDERS.map((p) => (
                  <div key={p.id} className="rounded-sm border border-line p-3">
                    <div className="mb-1.5 flex flex-wrap items-center gap-2">
                      <b className="text-[14px]">{p.name}</b>
                      {p.free ? <Badge tone="green">free tier</Badge> : <Badge tone="gray">paid API</Badge>}
                      {ai.keys[p.id] && <Badge tone="blue">key saved</Badge>}
                    </div>
                    <p className="mb-2 text-[12px] text-ink-muted">
                      {p.note}{" "}
                      {p.keyUrl && (
                        <a href={p.keyUrl} target="_blank" rel="noreferrer" className="text-brown-700 underline">
                          Get a key
                        </a>
                      )}
                    </p>
                    <div className="flex items-center gap-3">
                      <input name={`key_${p.id}`} type="password" autoComplete="off" placeholder={mask(ai.keys[p.id]) || `${p.env} (paste key)`} className={inputCls} />
                      {ai.keys[p.id] && (
                        <label className="flex shrink-0 items-center gap-1.5 text-[12px] text-ink-muted">
                          <input type="checkbox" name={`clear_${p.id}`} className="accent-brown-700" /> remove
                        </label>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="flex flex-col gap-5">
            <Card title="Safety">
              <Toggle name="autoExecute" defaultChecked={ai.autoExecute} label="Run actions automatically" hint="Off (recommended): the assistant prepares each change and you click Confirm. On: it just does it." />
              <p className="mt-3 text-[12px] text-ink-muted">Whatever the mode, the assistant can only do what the signed-in admin’s role allows, and every change appears in the Activity Log.</p>
            </Card>
            <Card title="Selected">
              <p className="text-[14px]">
                <b>{current.name}</b>
                <span className="block text-ink-muted">{ai.model}</span>
              </p>
              <div className="mt-3">
                <SubmitButton className="w-full">Save settings</SubmitButton>
              </div>
            </Card>
          </div>
        </div>
      </ActionForm>
      <div className="mt-5 max-w-5xl">
        <Card title="Check connection">
          <p className="mb-3 text-[13px] text-ink-soft">Save first, then test — this sends one tiny message using the saved provider.</p>
          <AiTestButton />
        </Card>
      </div>
    </>
  );
}
