"use client";

import { Button } from "@/components/ui/button";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="container-site flex flex-col items-center gap-4 py-24 text-center">
      <h1 className="t-h2 text-ink">Something went wrong</h1>
      <p className="t-body text-ink-soft">Please try again. If the problem continues, contact us.</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
