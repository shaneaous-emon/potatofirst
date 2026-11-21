"use client";

import { useState, useTransition } from "react";
import { Loader2, Zap } from "lucide-react";
import { toast } from "sonner";
import { testAiAction } from "@/app/admin/_actions/ai";
import { btn } from "@/components/admin/ui";

export function AiTestButton() {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        disabled={pending}
        className={btn.outline}
        onClick={() =>
          start(async () => {
            const r = await testAiAction();
            setMsg({ ok: r.ok, text: r.message });
            (r.ok ? toast.success : toast.error)(r.ok ? "Connection works" : "Connection failed");
          })
        }
      >
        {pending ? <Loader2 className="animate-spin" /> : <Zap />} Test saved settings
      </button>
      {msg && <p className={`text-[13px] ${msg.ok ? "text-green-600" : "text-sale"}`}>{msg.text}</p>}
    </div>
  );
}
