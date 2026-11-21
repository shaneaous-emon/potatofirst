"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";

type Suggestion = { slug: string; name: string; subtitle: string; category: string; image: string; price: number };

/**
 * Figma: Header › Search — with live search.
 * Results appear while typing (debounced); Enter / button → full results page.
 */
export function SearchBox({ className, compact, onNavigate }: { className?: string; compact?: boolean; onNavigate?: () => void }) {
  const router = useRouter();
  const id = useId();
  const listId = `${id}-list`;
  const [q, setQ] = useState("");
  const [items, setItems] = useState<Suggestion[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const wrap = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) return;
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`, { signal: ctrl.signal });
        const data = (await res.json()) as { items: Suggestion[]; total: number };
        setItems(data.items);
        setTotal(data.total);
        setActive(-1);
      } catch {
        /* aborted or offline — keep previous results */
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const go = (href: string) => {
    setOpen(false);
    onNavigate?.();
    router.push(href);
  };
  const showPanel = open && q.trim().length >= 2;

  return (
    <form
      ref={wrap}
      action="/search"
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        if (active >= 0 && items[active]) return go(`/product/${items[active].slug}`);
        if (q.trim()) go(`/search?q=${encodeURIComponent(q.trim())}`);
      }}
      className={cn("relative", className)}
    >
      <div className={cn("flex items-center gap-3 rounded-full border border-line bg-cream-100 focus-within:border-orange-500", compact ? "py-1 pl-4 pr-1" : "py-1.5 pl-5 pr-1.5")}>
        {compact && <Search className="size-[18px] shrink-0 text-ink-muted" aria-hidden />}
        <label htmlFor={`${id}-q`} className="sr-only">
          Search products
        </label>
        <input
          id={`${id}-q`}
          name="q"
          type="search"
          autoComplete="off"
          role="combobox"
          aria-expanded={showPanel}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
            if (e.target.value.trim().length < 2) {
              setItems([]);
              setTotal(0);
            }
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((a) => Math.min(items.length - 1, a + 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((a) => Math.max(-1, a - 1));
            } else if (e.key === "Escape") setOpen(false);
          }}
          placeholder={compact ? "Search snacks…" : "Search for chips, dates, peanuts…"}
          className="min-w-0 flex-1 bg-transparent t-body text-ink outline-none placeholder:text-ink-muted max-sm:text-sm [&::-webkit-search-cancel-button]:hidden"
        />
        <button type="submit" aria-label="Search" className={cn("grid shrink-0 cursor-pointer place-items-center rounded-full bg-orange-500 text-brown-900 transition-colors hover:bg-orange-600 hover:text-white", compact ? "size-9" : "size-11")}>
          {loading ? <Loader2 className="size-5 animate-spin" /> : <Search className="size-5" />}
        </button>
      </div>

      {showPanel && (
        <div className="absolute inset-x-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-md border border-line bg-white shadow-pop animate-in fade-in-0 slide-in-from-top-1">
          {items.length > 0 ? (
            <>
              <ul id={listId} role="listbox" aria-label="Search suggestions" className="max-h-[60vh] overflow-y-auto py-1.5">
                {items.map((it, i) => (
                  <li key={it.slug} id={`${listId}-${i}`} role="option" aria-selected={i === active}>
                    <Link
                      href={`/product/${it.slug}`}
                      onClick={() => setOpen(false)}
                      onMouseEnter={() => setActive(i)}
                      className={cn("flex items-center gap-3 px-4 py-2.5", i === active && "bg-cream-100")}
                    >
                      <span className="relative size-12 shrink-0 overflow-hidden rounded-sm bg-cream-100">
                        <Image src={it.image} alt="" fill sizes="48px" className="object-cover" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate t-label text-ink">{it.name}</span>
                        <span className="block truncate t-caption text-ink-muted">
                          {it.category} · {it.subtitle}
                        </span>
                      </span>
                      <span className="shrink-0 t-label text-brown-700">{formatPrice(it.price)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <button type="submit" className="flex w-full cursor-pointer items-center justify-between border-t border-line bg-cream-50 px-4 py-3 t-label text-brown-700 hover:bg-cream-100">
                See all {total} result{total === 1 ? "" : "s"} for “{q.trim()}”
                <Search className="size-4" aria-hidden />
              </button>
            </>
          ) : (
            <p className="px-4 py-5 text-center t-body-s text-ink-muted">{loading ? "Searching…" : `No snacks found for “${q.trim()}”`}</p>
          )}
        </div>
      )}
    </form>
  );
}
