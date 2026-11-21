"use client";

import { useId, useState } from "react";
import { CheckCircle2, ImagePlus, Loader2, Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Dialog, DialogContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { REVIEW_LIMITS, submitReview } from "@/lib/services/reviews";
import { cn } from "@/lib/utils";

type ProductOption = { id: string; name: string };

/**
 * Review upload: rating, comment and photos/videos. Opens from
 * "Upload Review" (home) and "Write a Review" (product page).
 */
export function ReviewUploadDialog({
  products,
  defaultProductId,
  label = "Upload Review",
  triggerClassName,
}: {
  products: ProductOption[];
  defaultProductId?: string;
  label?: string;
  triggerClassName?: string;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [productId, setProductId] = useState(defaultProductId ?? "");
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [files, setFiles] = useState<{ file: File; url: string }[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");

  const reset = () => {
    setName("");
    setPhone("");
    setProductId(defaultProductId ?? "");
    setRating(0);
    setComment("");
    files.forEach((f) => URL.revokeObjectURL(f.url));
    setFiles([]);
    setErrors({});
    setState("idle");
  };

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const next = [...files];
    let err = "";
    for (const f of Array.from(list)) {
      const isVideo = f.type.startsWith("video/");
      const isImage = f.type.startsWith("image/");
      const maxMB = isVideo ? REVIEW_LIMITS.maxVideoMB : REVIEW_LIMITS.maxImageMB;
      if (!isVideo && !isImage) err = "Only photos and videos can be uploaded.";
      else if (f.size > maxMB * 1024 * 1024) err = `${f.name} is too large (max ${maxMB} MB).`;
      else if (next.length >= REVIEW_LIMITS.maxFiles) err = `You can add up to ${REVIEW_LIMITS.maxFiles} files.`;
      else next.push({ file: f, url: URL.createObjectURL(f) });
    }
    setFiles(next);
    setErrors((e) => ({ ...e, media: err }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const er: Record<string, string> = {};
    if (name.trim().length < 2) er.name = "Please enter your name";
    if (phone && !/^01[3-9]\d{8}$/.test(phone.replace(/\D/g, ""))) er.phone = "Please enter a valid phone number (01XXXXXXXXX)";
    if (!rating) er.rating = "Please choose a rating";
    if (comment.trim().length < 5) er.comment = "Please write a few words about the snack";
    setErrors(er);
    if (Object.keys(er).length) return;
    setState("sending");
    await submitReview({ name, phone: phone || undefined, productId: productId || undefined, rating, comment, media: files.map((f) => f.file) });
    setState("done");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setTimeout(reset, 200);
      }}
    >
      <button type="button" onClick={() => setOpen(true)} className={triggerClassName}>
        {label}
      </button>
      <DialogContent className="max-h-[calc(100dvh-2rem)] max-w-lg overflow-y-auto [&>button:last-child]:bg-cream-100 [&>button:last-child]:text-ink [&>button:last-child:hover]:bg-cream-200">
        {state === "done" ? (
          <div className="flex flex-col items-center gap-3 p-8 text-center">
            <CheckCircle2 className="size-14 text-green-600" aria-hidden />
            <SheetTitle className="t-h3 text-ink">Thank you for your review!</SheetTitle>
            <SheetDescription className="t-body text-ink-soft">It will appear on the site after a quick check by our team.</SheetDescription>
            <Button className="mt-2" onClick={() => setOpen(false)}>
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="flex flex-col gap-4 p-6 sm:p-7">
            <div className="pr-10">
              <SheetTitle className="t-h3 text-ink">Share your snack moment</SheetTitle>
              <SheetDescription className="t-body-s text-ink-soft">Rate the snack, write a few words and add photos or a video.</SheetDescription>
            </div>

            <fieldset className="flex flex-col gap-2">
              <legend className="mb-2 t-label text-ink">
                Your rating <span className="text-sale">*</span>
              </legend>
              <div className="flex gap-1" role="radiogroup" aria-label="Rating" onMouseLeave={() => setHover(0)}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    role="radio"
                    aria-checked={rating === n}
                    aria-label={`${n} star${n > 1 ? "s" : ""}`}
                    onMouseEnter={() => setHover(n)}
                    onClick={() => setRating(n)}
                    className="cursor-pointer p-0.5 transition-transform hover:scale-110"
                  >
                    <Star className={cn("size-8", (hover || rating) >= n ? "fill-orange-500 text-orange-500" : "text-line")} />
                  </button>
                ))}
              </div>
              {errors.rating && (
                <p role="alert" className="t-caption text-sale">
                  {errors.rating}
                </p>
              )}
            </fieldset>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField id={`${id}-name`} label="Your name" required error={errors.name}>
                <Input id={`${id}-name`} value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" aria-invalid={!!errors.name} />
              </FormField>
              <FormField id={`${id}-phone`} label="Phone" optional error={errors.phone}>
                <Input id={`${id}-phone`} type="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01XXXXXXXXX" aria-invalid={!!errors.phone} />
              </FormField>
            </div>

            {products.length > 1 && (
              <FormField id={`${id}-product`} label="Which snack?" optional>
                <select
                  id={`${id}-product`}
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  className="h-12 w-full cursor-pointer rounded-sm border border-line bg-white px-4 t-body text-ink outline-none focus:border-orange-500"
                >
                  <option value="">Select a product</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </FormField>
            )}

            <FormField id={`${id}-comment`} label="Your review" required error={errors.comment}>
              <Textarea id={`${id}-comment`} rows={4} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="How did you like it?" aria-invalid={!!errors.comment} />
            </FormField>

            <div className="flex flex-col gap-2">
              <span className="t-label text-ink">
                Photos / video <span className="t-body-s text-ink-muted">(optional, up to {REVIEW_LIMITS.maxFiles})</span>
              </span>
              <div className="flex flex-wrap gap-2.5">
                {files.map(({ file, url }, i) => (
                  <div key={url} className="relative size-20 overflow-hidden rounded-sm border border-line bg-cream-100">
                    {file.type.startsWith("video/") ? (
                      <video src={url} className="size-full object-cover" muted />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={url} alt="" className="size-full object-cover" />
                    )}
                    <button
                      type="button"
                      aria-label={`Remove ${file.name}`}
                      onClick={() => {
                        URL.revokeObjectURL(url);
                        setFiles(files.filter((_, j) => j !== i));
                      }}
                      className="absolute right-1 top-1 grid size-6 cursor-pointer place-items-center rounded-full bg-brown-900/70 text-white hover:bg-sale"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                ))}
                {files.length < REVIEW_LIMITS.maxFiles && (
                  <label className="flex size-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-sm border-[1.5px] border-dashed border-line text-ink-muted transition-colors hover:border-orange-500 hover:text-orange-600">
                    <ImagePlus className="size-6" aria-hidden />
                    <span className="t-caption">Add</span>
                    <input type="file" accept="image/*,video/*" multiple className="sr-only" onChange={(e) => addFiles(e.target.files)} />
                  </label>
                )}
              </div>
              <p className="t-caption text-ink-muted">
                Photos up to {REVIEW_LIMITS.maxImageMB} MB · videos up to {REVIEW_LIMITS.maxVideoMB} MB
              </p>
              {errors.media && (
                <p role="alert" className="t-caption text-sale">
                  {errors.media}
                </p>
              )}
            </div>

            <Button type="submit" size="lg" disabled={state === "sending"} className="mt-1">
              {state === "sending" && <Loader2 className="animate-spin" />} Submit Review
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
