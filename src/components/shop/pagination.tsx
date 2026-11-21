import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toSearchString, type SearchParams } from "@/lib/listing-params";
import { cn } from "@/lib/utils";

export function Pagination({ basePath, sp, page, totalPages }: { basePath: string; sp: SearchParams; page: number; totalPages: number }) {
  if (totalPages <= 1) return null;
  const href = (p: number) => `${basePath}${toSearchString(sp, { page: p > 1 ? String(p) : undefined })}`;
  const box = "grid size-10 place-items-center rounded-sm border t-label transition-colors";
  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-2 pt-4">
      {page > 1 ? (
        <Link href={href(page - 1)} aria-label="Previous page" className={cn(box, "border-line bg-white hover:border-brown-700")}>
          <ChevronLeft className="size-4" />
        </Link>
      ) : (
        <span className={cn(box, "border-line bg-white opacity-40")} aria-hidden>
          <ChevronLeft className="size-4" />
        </span>
      )}
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <Link
          key={p}
          href={href(p)}
          aria-current={p === page ? "page" : undefined}
          className={cn(box, p === page ? "border-brown-700 bg-brown-700 text-cream-100" : "border-line bg-white text-ink hover:border-brown-700")}
        >
          {p}
        </Link>
      ))}
      {page < totalPages ? (
        <Link href={href(page + 1)} aria-label="Next page" className={cn(box, "border-line bg-white hover:border-brown-700")}>
          <ChevronRight className="size-4" />
        </Link>
      ) : (
        <span className={cn(box, "border-line bg-white opacity-40")} aria-hidden>
          <ChevronRight className="size-4" />
        </span>
      )}
    </nav>
  );
}
