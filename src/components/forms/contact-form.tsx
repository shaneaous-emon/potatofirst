"use client";

import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input, Textarea } from "@/components/ui/input";
import { contactSchema, type ContactValues } from "@/lib/validation/schemas";

/** Figma: Contact Form. Phase 2 → POST /api/contact */
export function ContactForm() {
  const subject = useSearchParams().get("subject") === "review" ? "Customer review" : "";
  const { register, handleSubmit, reset, formState } = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    mode: "onTouched",
    defaultValues: { name: "", phone: "", email: "", subject, message: "" },
  });
  const e = formState.errors;
  return (
    <form
      noValidate
      onSubmit={handleSubmit(async () => {
        await new Promise((r) => setTimeout(r, 500));
        toast.success("Message sent!", { description: "We usually reply within 24 hours." });
        reset();
      })}
      className="flex flex-col gap-5"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField id="c-name" label="Your Name" required error={e.name?.message}>
          <Input id="c-name" autoComplete="name" placeholder="Full name" aria-invalid={!!e.name} {...register("name")} />
        </FormField>
        <FormField id="c-phone" label="Phone Number" required error={e.phone?.message}>
          <Input id="c-phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="01XXX-XXXXXX" aria-invalid={!!e.phone} {...register("phone")} />
        </FormField>
      </div>
      <FormField id="c-email" label="Email" optional error={e.email?.message}>
        <Input id="c-email" type="email" autoComplete="email" placeholder="you@example.com" aria-invalid={!!e.email} {...register("email")} />
      </FormField>
      <FormField id="c-subject" label="Subject" optional>
        <Input id="c-subject" placeholder="Order question, feedback, wholesale…" {...register("subject")} />
      </FormField>
      <FormField id="c-message" label="Message" required error={e.message?.message}>
        <Textarea id="c-message" rows={5} placeholder="Write your message" aria-invalid={!!e.message} {...register("message")} />
      </FormField>
      <Button type="submit" className="self-start" disabled={formState.isSubmitting}>
        {formState.isSubmitting && <Loader2 className="animate-spin" />} Send Message
      </Button>
    </form>
  );
}
