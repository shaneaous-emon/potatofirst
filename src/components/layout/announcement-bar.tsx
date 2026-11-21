import { Phone, Truck } from "lucide-react";
import Link from "next/link";
import { site } from "@/content/site";

/** Figma: 01 Announcement Bar (editable copy from settings). */
export function AnnouncementBar() {
  return (
    <div className="bg-brown-900 text-cream-100">
      <div className="container-site flex min-h-10 items-center justify-center gap-6 py-2 lg:justify-between">
        <a href={`tel:${site.hotline}`} className="hidden items-center gap-2 t-caption hover:text-orange-500 lg:flex">
          <Phone className="size-3.5 text-orange-500" aria-hidden /> Hotline: {site.hotline}
        </a>
        <p className="flex items-center gap-2 text-center t-body-s max-sm:text-xs">
          <Truck className="size-4 shrink-0 text-orange-500" aria-hidden />
          <span>
            {site.announcement.text}
            <span className="hidden md:inline"> · {site.announcement.textBn}</span>
          </span>
        </p>
        <div className="hidden items-center gap-5 t-caption lg:flex">
          <Link href="/contact" className="hover:text-orange-500">Help</Link>
          <span aria-label="Language (coming soon)">বাংলা / EN</span>
        </div>
      </div>
    </div>
  );
}
