import Form from "next/form";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

/** Figma: Header › Search. Uses next/form → client-side navigation to /search?q=… */
export function SearchBox({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <Form action="/search" role="search" className={cn("flex items-center gap-3 rounded-full border border-line bg-cream-100 focus-within:border-orange-500", compact ? "py-1 pl-4 pr-1" : "py-1.5 pl-5 pr-1.5", className)}>
      {compact && <Search className="size-[18px] shrink-0 text-ink-muted" aria-hidden />}
      <label htmlFor={compact ? "q-mobile" : "q"} className="sr-only">
        Search products
      </label>
      <input
        id={compact ? "q-mobile" : "q"}
        name="q"
        type="search"
        autoComplete="off"
        placeholder={compact ? "Search snacks / স্ন্যাকস খুঁজুন" : "Search for chips, dates, peanuts…  /  স্ন্যাকস খুঁজুন"}
        className="min-w-0 flex-1 bg-transparent t-body text-ink outline-none placeholder:text-ink-muted max-sm:text-sm"
      />
      <button type="submit" aria-label="Search" className={cn("grid shrink-0 cursor-pointer place-items-center rounded-full bg-orange-500 text-brown-900 transition-colors hover:bg-orange-600 hover:text-white", compact ? "size-9" : "size-11")}>
        <Search className="size-5" />
      </button>
    </Form>
  );
}
