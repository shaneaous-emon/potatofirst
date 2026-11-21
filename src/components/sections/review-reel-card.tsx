"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ChevronRight, Play } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/sheet";
import { Dialog as DialogPrimitive } from "radix-ui";
import type { ImageAsset } from "@/types";

/** Figma: Review Reel Card — photo/video UGC, quote and product tag only. */
export function ReviewReelCard({
  image,
  quote,
  product,
  videoUrl,
}: {
  image: ImageAsset;
  quote: string;
  product?: { name: string; href: string; thumb: ImageAsset };
  videoUrl?: string;
}) {
  const isVideo = videoUrl !== undefined;
  const [open, setOpen] = useState(false);
  return (
    <div className="relative isolate flex aspect-[296/500] flex-col justify-end gap-3 overflow-hidden rounded-lg p-[18px]">
      <Image src={image.src} alt={image.alt} fill sizes="(min-width:1024px) 296px, 70vw" className="-z-10 object-cover" />
      <span className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent from-45% to-brown-900/80" aria-hidden />
      {isVideo && (
        <Dialog open={open} onOpenChange={setOpen}>
          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Play customer video review"
            className="absolute left-1/2 top-1/2 grid size-14 -translate-x-1/2 -translate-y-1/2 cursor-pointer place-items-center rounded-full border-[1.5px] border-white/70 bg-white/30 text-white backdrop-blur-sm transition-transform hover:scale-110"
          >
            <Play className="ml-0.5 size-[22px] fill-white" />
          </button>
          <DialogContent className="max-w-sm bg-black">
            <DialogPrimitive.Title className="sr-only">Customer video review</DialogPrimitive.Title>
            {videoUrl ? (
              <video src={videoUrl} controls autoPlay playsInline className="aspect-[9/16] w-full" />
            ) : (
              <div className="relative aspect-[4/5] w-full">
                <Image src={image.src} alt={image.alt} fill sizes="384px" className="object-cover" />
                <p className="absolute inset-x-0 bottom-0 bg-black/60 p-4 text-center t-body-s text-white">Video will play here once uploaded from the admin panel.</p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
      <p className="t-bn text-[15px] text-white">{quote}</p>
      {product && (
        <Link href={product.href} className="flex max-w-full items-center gap-2 self-start rounded-full bg-white/95 py-1 pl-1 pr-3 transition-colors hover:bg-white">
          <span className="relative size-[26px] shrink-0 overflow-hidden rounded-full">
            <Image src={product.thumb.src} alt="" fill sizes="26px" className="object-cover" />
          </span>
          <span className="truncate t-caption text-ink">{product.name}</span>
          <ChevronRight className="size-3 shrink-0 text-ink-muted" aria-hidden />
        </Link>
      )}
    </div>
  );
}
