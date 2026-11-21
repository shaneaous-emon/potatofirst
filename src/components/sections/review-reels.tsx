import Link from "next/link";
import { Quote } from "lucide-react";
import { Carousel } from "@/components/common/carousel";
import { IconCircle } from "@/components/common/icon-circle";
import { SectionHeader } from "@/components/common/section-header";
import { buttonVariants } from "@/components/ui/button";
import { getProducts, getReelReviews } from "@/lib/repositories";
import { ReviewReelCard } from "./review-reel-card";
import { SectionShell } from "./section-shell";
import type { ReviewReelsSection } from "./types";

/** Figma: 12 Customer Reviews (reel cards + share bar). */
export async function ReviewReels({ header, share, spacingTop = "lg", spacingBottom = "lg", background }: ReviewReelsSection) {
  const [reviews, products] = await Promise.all([getReelReviews(), getProducts()]);
  return (
    <SectionShell spacingTop={spacingTop} spacingBottom={spacingBottom} background={background}>
      <div className="flex flex-col gap-6 lg:gap-8">
        <SectionHeader {...header} />
        <Carousel label="Customer reviews" controls={false} itemClassName="w-[68%] xs:w-[58%] sm:w-[calc((100%-48px)/3)] lg:w-[calc((100%-72px)/4)]">
          {reviews.map((r) => {
            const p = products.find((x) => x.id === r.productId);
            return (
              <ReviewReelCard
                key={r.id}
                image={r.image!}
                quote={r.body}
                videoUrl={r.videoUrl}
                product={p ? { name: p.name, href: `/product/${p.slug}`, thumb: p.images[0] } : undefined}
              />
            );
          })}
        </Carousel>
        {share && (
          <div className="flex flex-col items-start gap-4 rounded-lg bg-orange-100 p-4 sm:flex-row sm:items-center sm:rounded-full sm:py-3 sm:pl-6 sm:pr-3">
            <div className="flex flex-1 items-center gap-4">
              <IconCircle tone="orange-solid" size={40}>
                <Quote />
              </IconCircle>
              <p className="t-h4 text-ink">{share.text}</p>
            </div>
            <Link href={share.cta.href} className={buttonVariants({ className: "max-sm:w-full" })}>
              {share.cta.label}
            </Link>
          </div>
        )}
      </div>
    </SectionShell>
  );
}
