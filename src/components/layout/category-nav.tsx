import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { mainNav, site } from "@/content/site";

/** Figma: 02b Category Navigation (desktop). Dropdowns open on hover / keyboard focus. */
export function CategoryNav() {
  return (
    <nav aria-label="Main" className="hidden bg-brown-700 lg:block">
      <div className="container-site flex items-center gap-1">
        <ul className="flex items-center gap-1">
          {mainNav.map((item) => (
            <li key={item.href} className="group relative">
              <Link
                href={item.href}
                className={item.highlight ? "my-2.5 mr-2 inline-flex items-center rounded-full bg-orange-500 px-3 py-1 t-label text-brown-900 hover:bg-orange-100" : "inline-flex items-center gap-1.5 px-4 py-3.5 t-label text-cream-100 transition-colors hover:text-orange-500"}
              >
                {item.highlight ? `🔥 ${item.label}` : item.label}
                {item.children && <ChevronDown className="size-4 transition-transform group-hover:rotate-180" aria-hidden />}
              </Link>
              {item.children && (
                <div className="invisible absolute left-0 top-full z-40 min-w-52 translate-y-1 pt-1 opacity-0 transition-all duration-150 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                  <ul className="rounded-md border border-line bg-white p-2 shadow-pop">
                    {item.children.map((c) => (
                      <li key={c.href}>
                        <Link href={c.href} className="block rounded-sm px-3 py-2 t-body-s text-ink hover:bg-cream-100 hover:text-brown-700">
                          {c.label}
                        </Link>
                      </li>
                    ))}
                    <li className="mt-1 border-t border-line pt-1">
                      <Link href={item.href} className="block rounded-sm px-3 py-2 t-label text-brown-700 hover:bg-cream-100">
                        View all {item.label}
                      </Link>
                    </li>
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>
        <p className="ml-auto t-label text-orange-500">{site.tagline}</p>
      </div>
    </nav>
  );
}
