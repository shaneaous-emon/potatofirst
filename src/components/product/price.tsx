import { cn, formatPrice } from "@/lib/utils";

export function Price({
  price,
  compareAt,
  size = "md",
  className,
}: {
  price: number;
  compareAt?: number;
  size?: "md" | "lg";
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-x-2 gap-y-0.5", className)}>
      <span className={cn("text-brown-700", size === "lg" ? "t-h1" : "t-h3")}>{formatPrice(price)}</span>
      {compareAt && compareAt > price && (
        <span className={cn("text-ink-muted line-through", size === "lg" ? "t-body-l" : "t-body-s")}>
          <span className="sr-only">Original price </span>
          {formatPrice(compareAt)}
        </span>
      )}
    </div>
  );
}
