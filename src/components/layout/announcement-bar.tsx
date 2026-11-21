import { Phone } from "lucide-react";
import Link from "next/link";
import { WhatsAppIcon } from "@/components/common/whatsapp-icon";
import { site } from "@/content/site";
import { whatsappLink } from "@/lib/utils";
import { AnnouncementTicker } from "./announcement-ticker";

/** Figma: 01 Announcement Bar — rotating admin-editable messages. */
export function AnnouncementBar() {
  return (
    <div className="bg-brown-900 text-cream-100">
      <div className="container-site flex min-h-10 items-center justify-center gap-6 py-2 lg:justify-between">
        <a href={`tel:${site.hotline}`} className="hidden items-center gap-2 t-caption transition-colors hover:text-orange-500 lg:flex">
          <Phone className="size-3.5 text-orange-500" aria-hidden /> Hotline: {site.hotline}
        </a>
        <AnnouncementTicker messages={[...site.announcement.messages]} intervalMs={site.announcement.intervalMs} />
        <div className="hidden items-center gap-5 t-caption lg:flex">
          <Link href="/contact" className="transition-colors hover:text-orange-500">
            Help
          </Link>
          <a
            href={whatsappLink(site.whatsapp, "Hello Potato First! I'd like to order.")}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 transition-colors hover:text-orange-500"
          >
            <WhatsAppIcon className="size-3.5 text-whatsapp" /> Order on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
