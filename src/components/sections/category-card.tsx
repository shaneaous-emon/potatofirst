import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Category } from "@/types";
import { Bn } from "@/components/common/bn";

/** Figma: Category Card */
export function CategoryCard({ category, sizes = "(min-width:1024px) 296px, 50vw" }: { category: Category; sizes?: string }) {
  return (
    <Link
      href={`/category/${category.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-lg border border-line bg-white transition-shadow hover:shadow-lift"
    >
      <div className="relative aspect-[296/240] overflow-hidden">
        <Image src={category.image.src} alt={category.image.alt} fill sizes={sizes} className="object-cover transition-transform duration-500 group-hover:scale-[1.08]" />
      </div>
      <div className="flex flex-1 items-center gap-3 bg-cream-50 px-4 py-3.5 sm:px-5 sm:py-4">
        <div className="min-w-0 flex-1">
          <p className="font-display text-[15px] font-semibold text-ink sm:t-h4">{category.name}</p>
          <Bn className="t-bn-s text-ink-soft">{category.nameBn}</Bn>
        </div>
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-orange-500 text-brown-900 transition-colors group-hover:bg-brown-700 group-hover:text-cream-100 sm:size-10">
          <ArrowUpRight className="size-[18px]" aria-hidden />
        </span>
      </div>
    </Link>
  );
}
