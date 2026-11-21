import { ProductCard } from "./product-card";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

export function ProductGrid({ products, columns = 4, className, priorityCount = 0 }: { products: Product[]; columns?: 3 | 4; className?: string; priorityCount?: number }) {
  return (
    <ul
      className={cn(
        "grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3",
        columns === 4 ? "lg:grid-cols-4 lg:gap-8" : "lg:gap-6",
        className,
      )}
    >
      {products.map((p, i) => (
        <li key={p.id}>
          <ProductCard product={p} priority={i < priorityCount} />
        </li>
      ))}
    </ul>
  );
}
