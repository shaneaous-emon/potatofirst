import { Skeleton } from "@/components/ui/skeleton";

export function ListingSkeleton() {
  return (
    <div className="flex gap-8" aria-busy="true" aria-label="Loading products">
      <Skeleton className="hidden h-[640px] w-[280px] shrink-0 lg:block" />
      <div className="flex flex-1 flex-col gap-6">
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <Skeleton key={i} className="aspect-[3/4.4]" />
          ))}
        </div>
      </div>
    </div>
  );
}
