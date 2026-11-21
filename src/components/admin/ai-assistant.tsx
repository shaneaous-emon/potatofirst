"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fragment, useEffect, useRef, useState } from "react";
import { Check, Loader2, RotateCcw, Send, Settings, Sparkles, X, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

type Proposal = { id: string; tool: string; args: Record<string, unknown>; summary: string };
type Performed = { tool: string; summary: string; ok: boolean; error?: string };
type Msg = { id: string; role: "user" | "assistant"; text: string; proposals?: Proposal[]; performed?: Performed[]; model?: string; error?: boolean };
type PState = "idle" | "running" | "done" | "failed" | "dismissed";

const KEY = "pf:ai-chat";
const SUGGESTIONS = ["আজকের সেল আর অর্ডার কত?", "Pending অর্ডারগুলো দেখাও", "Low stock products কোনগুলো?", "এই মাসের top 5 product", "Pending সব অর্ডার confirm করে দাও"];

/* ───────────── tiny markdown renderer (bold, code, lists, tables) ───────────── */

function inline(s: string, k: string) {
  return s.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((p, i) =>
    p.startsWith("**") && p.endsWith("**") && p.length > 4 ? <b key={`${k}${i}`}>{p.slice(2, -2)}</b> : p.startsWith("`") && p.endsWith("`") && p.length > 2 ? <code key={`${k}${i}`} className="rounded bg-black/5 px-1 py-0.5 font-mono text-[12px]">{p.slice(1, -1)}</code> : <Fragment key={`${k}${i}`}>{p}</Fragment>,
  );
}

function Markdown({ text }: { text: string }) {
  const lines = text.split("\n");
  const out: React.ReactNode[] = [];
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (l.trim().startsWith("|") && lines[i + 1]?.includes("---")) {
      const rows: string[][] = [];
      let j = i;
      while (j < lines.length && lines[j].trim().startsWith("|")) {
        if (!/^\s*\|?[\s:|-]+\|?\s*$/.test(lines[j])) rows.push(lines[j].trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim()));
        j++;
      }
      out.push(
        <div key={i} className="my-2 overflow-x-auto">
          <table className="w-full text-left text-[12px]">
            <thead>
              <tr>{rows[0].map((c, ci) => <th key={ci} className="border-b border-line px-2 py-1 font-semibold">{inline(c, `h${i}${ci}`)}</th>)}</tr>
            </thead>
            <tbody>
              {rows.slice(1).map((r, ri) => (
                <tr key={ri}>{r.map((c, ci) => <td key={ci} className="border-b border-line/60 px-2 py-1">{inline(c, `c${i}${ri}${ci}`)}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      i = j - 1;
    } else if (/^\s*[-*•]\s+/.test(l)) {
      const items: string[] = [];
      let j = i;
      while (j < lines.length && /^\s*[-*•]\s+/.test(lines[j])) items.push(lines[j++].replace(/^\s*[-*•]\s+/, ""));
      out.push(<ul key={i} className="my-1 list-disc pl-5">{items.map((it, ii) => <li key={ii}>{inline(it, `l${i}${ii}`)}</li>)}</ul>);
      i = j - 1;
    } else if (/^#{1,4}\s/.test(l)) out.push(<p key={i} className="mt-2 font-semibold">{inline(l.replace(/^#+\s/, ""), `p${i}`)}</p>);
    else if (!l.trim()) out.push(<div key={i} className="h-1.5" />);
    else out.push(<p key={i}>{inline(l, `p${i}`)}</p>);
  }
  return <div className="flex flex-col gap-0.5 break-words text-[13.5px] leading-relaxed">{out}</div>;
}

/* ───────────── component ───────────── */

export function AiAssistant({ model, auto, ready, canConfigure }: { model: string; auto: boolean; ready: boolean; canConfigure: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [pstate, setPstate] = useState<Record<string, PState>>({});
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(KEY);
      if (raw) setMsgs(JSON.parse(raw));
    } catch {
      /* storage unavailable */
    }
  }, []);
  useEffect(() => {
    try {
      sessionStorage.setItem(KEY, JSON.stringify(msgs.slice(-40)));
    } catch {
      /* storage unavailable */
    }
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [msgs, busy, open]);
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "j") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const uid = () => Math.random().toString(36).slice(2);

  async function send(text: string) {
    const t = text.trim();
    if (!t || busy) return;
    const next: Msg[] = [...msgs, { id: uid(), role: "user", text: t }];
    setMsgs(next);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/admin/ai/chat", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ messages: next.filter((m) => !m.error).map((m) => ({ role: m.role, text: m.text })) }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
      setMsgs((m) => [...m, { id: uid(), role: "assistant", text: data.reply, proposals: data.proposals?.length ? data.proposals : undefined, performed: data.performed?.length ? data.performed : undefined, model: data.model }]);
      if (data.changed) router.refresh();
    } catch (e) {
      setMsgs((m) => [...m, { id: uid(), role: "assistant", text: e instanceof Error ? e.message : "Something went wrong", error: true }]);
    } finally {
      setBusy(false);
    }
  }

  async function confirm(p: Proposal) {
    setPstate((s) => ({ ...s, [p.id]: "running" }));
    try {
      const res = await fetch("/api/admin/ai/execute", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ tool: p.tool, args: p.args }) });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Failed");
      setPstate((s) => ({ ...s, [p.id]: "done" }));
      const failed = (data.result as { results?: { ok: boolean; order: string; error?: string }[] } | undefined)?.results?.filter((r) => !r.ok);
      if (failed?.length) setMsgs((m) => [...m, { id: uid(), role: "assistant", error: true, text: `Some items could not be changed:\n${failed.map((f) => `- ${f.order}: ${f.error}`).join("\n")}` }]);
      router.refresh();
    } catch (e) {
      setPstate((s) => ({ ...s, [p.id]: "failed" }));
      setMsgs((m) => [...m, { id: uid(), role: "assistant", error: true, text: `Could not run “${p.summary}”: ${e instanceof Error ? e.message : "failed"}` }]);
    }
  }

  const reset = () => {
    setMsgs([]);
    setPstate({});
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close AI assistant" : "Open AI assistant"}
        title="AI Assistant (Ctrl+J)"
        className={cn("fixed bottom-5 right-5 z-40 grid size-14 cursor-pointer place-items-center rounded-full bg-orange-500 text-brown-900 shadow-lg ring-4 ring-orange-500/20 transition-transform hover:scale-105", open && "max-sm:hidden")}
      >
        {open ? <X className="size-6" /> : <Sparkles className="size-6" />}
      </button>

      {open && (
        <section role="dialog" aria-label="AI Assistant" className="fixed inset-0 z-50 flex flex-col bg-white shadow-2xl sm:inset-auto sm:bottom-24 sm:right-5 sm:h-[640px] sm:max-h-[calc(100dvh-7rem)] sm:w-[420px] sm:rounded-lg sm:border sm:border-line">
          <header className="flex items-center gap-3 border-b border-line bg-brown-900 px-4 py-3 text-white sm:rounded-t-lg">
            <span className="grid size-8 place-items-center rounded-full bg-orange-500 text-brown-900"><Sparkles className="size-4" /></span>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="text-[14px] font-semibold">Store Assistant</p>
              <p className="truncate text-[11px] text-cream-100/60">{ready ? model : "Not set up yet"} · {auto ? "auto-run" : "asks before changing"}</p>
            </div>
            <button type="button" onClick={reset} title="New chat" aria-label="New chat" className="grid size-8 cursor-pointer place-items-center rounded-full text-cream-100/70 hover:bg-white/10"><RotateCcw className="size-4" /></button>
            {canConfigure && <Link href="/admin/ai" onClick={() => setOpen(false)} title="AI settings" aria-label="AI settings" className="grid size-8 place-items-center rounded-full text-cream-100/70 hover:bg-white/10"><Settings className="size-4" /></Link>}
            <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="grid size-8 cursor-pointer place-items-center rounded-full text-cream-100/70 hover:bg-white/10"><X className="size-4" /></button>
          </header>

          <div className="flex-1 overflow-y-auto px-4 py-4">
            {!ready && (
              <div className="rounded-md border border-orange-500/40 bg-orange-100 p-3 text-[13px]">
                No API key yet. {canConfigure ? <Link href="/admin/ai" onClick={() => setOpen(false)} className="font-semibold underline">Add a free Gemini key</Link> : "Ask a Super Admin to add one."} to start.
              </div>
            )}
            {msgs.length === 0 && (
              <div className="flex flex-col gap-3">
                <p className="text-[13.5px] text-ink-soft">আমাকে বাংলা বা English-এ বলুন — রিপোর্ট দেখা, অর্ডার আপডেট, স্টক, প্রাইস, কুপন সব করে দেব।</p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button key={s} type="button" onClick={() => send(s)} disabled={!ready} className="cursor-pointer rounded-full border border-line bg-cream-50 px-3 py-1.5 text-left text-[12.5px] transition-colors hover:border-brown-700 disabled:opacity-50">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="flex flex-col gap-3">
              {msgs.map((m) => (
                <div key={m.id} className={cn("flex flex-col gap-2", m.role === "user" ? "items-end" : "items-start")}>
                  <div className={cn("max-w-[92%] rounded-lg px-3 py-2", m.role === "user" ? "whitespace-pre-wrap bg-brown-700 text-[13.5px] text-cream-100" : m.error ? "bg-sale/10 text-[13.5px] text-sale" : "bg-cream-100 text-ink")}>
                    {m.role === "user" || m.error ? m.text : <Markdown text={m.text} />}
                  </div>
                  {m.performed?.map((p, i) => (
                    <div key={i} className={cn("flex max-w-[92%] items-start gap-2 rounded-md border px-3 py-2 text-[12.5px]", p.ok ? "border-green-500/40 bg-green-100 text-green-600" : "border-sale/40 bg-sale/10 text-sale")}>
                      {p.ok ? <Check className="mt-0.5 size-3.5 shrink-0" /> : <X className="mt-0.5 size-3.5 shrink-0" />}
                      <span>{p.summary}{p.error ? ` — ${p.error}` : ""}</span>
                    </div>
                  ))}
                  {m.proposals && m.proposals.length > 0 && (
                    <div className="flex w-full max-w-[92%] flex-col gap-2">
                      {m.proposals.map((p) => {
                        const st = pstate[p.id] ?? "idle";
                        return (
                          <div key={p.id} className="rounded-md border border-orange-500/50 bg-white p-3">
                            <p className="flex items-start gap-2 text-[13px] font-medium"><Zap className="mt-0.5 size-3.5 shrink-0 text-orange-600" />{p.summary}</p>
                            <div className="mt-2 flex items-center gap-2">
                              {st === "idle" || st === "failed" ? (
                                <>
                                  <button type="button" onClick={() => confirm(p)} className="h-8 cursor-pointer rounded-sm bg-brown-700 px-3 text-[12.5px] font-medium text-cream-100 hover:bg-brown-900">{st === "failed" ? "Retry" : "Confirm"}</button>
                                  <button type="button" onClick={() => setPstate((s) => ({ ...s, [p.id]: "dismissed" }))} className="h-8 cursor-pointer rounded-sm border border-line px-3 text-[12.5px] hover:bg-cream-100">Dismiss</button>
                                </>
                              ) : st === "running" ? (
                                <span className="flex items-center gap-1.5 text-[12.5px] text-ink-muted"><Loader2 className="size-3.5 animate-spin" /> Running…</span>
                              ) : st === "done" ? (
                                <span className="flex items-center gap-1.5 text-[12.5px] text-green-600"><Check className="size-3.5" /> Done</span>
                              ) : (
                                <span className="text-[12.5px] text-ink-muted">Dismissed</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      {m.proposals.filter((p) => (pstate[p.id] ?? "idle") === "idle").length > 1 && (
                        <button type="button" onClick={async () => { for (const p of m.proposals!) if ((pstate[p.id] ?? "idle") === "idle") await confirm(p); }} className="h-8 cursor-pointer self-start rounded-sm bg-orange-500 px-3 text-[12.5px] font-semibold text-brown-900 hover:bg-orange-600">Confirm all</button>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {busy && (
                <div className="flex items-center gap-2 text-[13px] text-ink-muted"><Loader2 className="size-4 animate-spin" /> Thinking…</div>
              )}
              <div ref={endRef} />
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-end gap-2 border-t border-line p-3"
          >
            <textarea
              ref={inputRef}
              value={input}
              rows={1}
              disabled={!ready}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  send(input);
                }
              }}
              placeholder={ready ? "কী করতে হবে বলুন…" : "Set up an API key first"}
              className="max-h-32 min-h-10 flex-1 resize-none rounded-sm border border-line px-3 py-2 text-[14px] outline-none focus:border-orange-500 disabled:bg-cream-50"
            />
            <button type="submit" disabled={!ready || busy || !input.trim()} aria-label="Send" className="grid size-10 shrink-0 cursor-pointer place-items-center rounded-sm bg-brown-700 text-cream-100 hover:bg-brown-900 disabled:opacity-50">
              <Send className="size-4" />
            </button>
          </form>
        </section>
      )}
    </>
  );
}
