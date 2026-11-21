import Link from "next/link";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "@/components/common/logo";
import { footerColumns, site } from "@/content/site";

/** Figma: Site Footer / Desktop (responsive). */
export function SiteFooter() {
  return (
    <footer className="bg-brown-900 text-cream-100">
      <div className="container-site flex flex-col gap-10 pb-7 pt-14 lg:pt-[72px]">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[300px_1fr_1fr_1fr_auto] lg:gap-10">
          <div className="flex flex-col gap-3.5 sm:col-span-2 lg:col-span-1">
            <Logo variant="light" className="w-[130px]" />
            <p className="t-h4 text-orange-500">{site.tagline}</p>
            <p className="t-body-s text-cream-100/70">Convenient, tasty, quality dry foods made from familiar ingredients — delivered across Bangladesh.</p>
          </div>
          {footerColumns.map((col) => (
            <div key={col.title} className="flex flex-col gap-3">
              <p className="t-h4 text-cream-100">{col.title}</p>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((l) => (
                  <li key={l.href + l.label}>
                    <Link href={l.href} className="t-body-s text-cream-100/70 transition-colors hover:text-orange-500 hover:underline">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="flex flex-col gap-3.5">
            <p className="t-h4 text-cream-100">Contact</p>
            <a href={`tel:${site.hotline}`} className="flex items-center gap-2.5 t-body-s text-cream-100/70 hover:text-orange-500">
              <Phone className="size-4 text-orange-500" aria-hidden /> {site.hotline}
            </a>
            <a href={`mailto:${site.email}`} className="flex items-center gap-2.5 t-body-s text-cream-100/70 hover:text-orange-500">
              <Mail className="size-4 text-orange-500" aria-hidden /> {site.email}
            </a>
            <p className="flex items-center gap-2.5 t-body-s text-cream-100/70">
              <MapPin className="size-4 text-orange-500" aria-hidden /> {site.address}
            </p>
            <p className="flex items-center gap-2.5 t-body-s text-cream-100/70">
              <Clock className="size-4 text-orange-500" aria-hidden /> {site.hours}
            </p>
          </div>
        </div>
        <div className="h-px bg-cream-100/15" />
        <div className="flex flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
          <p className="t-body-s text-cream-100/60">© 2026 Potato First. All rights reserved.</p>
          <p className="t-body-s text-cream-100/70">
            Made with <span aria-label="love">❤️</span>{" "}
            <a href={site.credit.href} target="_blank" rel="noopener noreferrer" className="font-semibold text-orange-500 underline underline-offset-2 hover:text-orange-100">
              {site.credit.name}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
