"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { newsletterSchema } from "@/lib/validation/schemas";

export function NewsletterForm() {
  const { register, handleSubmit, reset, formState } = useForm({ resolver: zodResolver(newsletterSchema), defaultValues: { email: "" } });
  return (
    <form
      noValidate
      onSubmit={handleSubmit(async () => {
        // Phase 2: POST /api/newsletter
        await new Promise((r) => setTimeout(r, 400));
        toast.success("Thanks for subscribing!", { description: "You'll hear about new snacks and offers first." });
        reset();
      })}
      className="flex flex-col gap-2"
    >
      <div className="flex items-center gap-2 rounded-full border border-line bg-white py-1.5 pl-5 pr-1.5 focus-within:border-orange-500">
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          type="email"
          autoComplete="email"
          placeholder="Enter your email address"
          aria-invalid={!!formState.errors.email}
          className="min-w-0 flex-1 bg-transparent t-body text-ink outline-none placeholder:text-ink-muted"
          {...register("email")}
        />
        <Button type="submit" className="rounded-full max-xs:px-4" disabled={formState.isSubmitting}>
          {formState.isSubmitting ? "…" : "Subscribe"}
        </Button>
      </div>
      {formState.errors.email ? (
        <p role="alert" className="t-caption text-sale">{formState.errors.email.message}</p>
      ) : (
        <p className="t-caption text-ink-muted">No spam. Unsubscribe anytime.</p>
      )}
    </form>
  );
}
