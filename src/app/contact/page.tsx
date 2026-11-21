import type { Metadata } from "next";
import { Suspense } from "react";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { IconCircle } from "@/components/common/icon-circle";
import { PageTitle } from "@/components/common/page-title";
import { WhatsAppIcon } from "@/components/common/whatsapp-icon";
import { ContactForm } from "@/components/forms/contact-form";
import { site } from "@/content/site";
import { whatsappLink } from "@/lib/utils";

export const metadata: Metadata = { title: "Contact Us", description: "Call, WhatsApp or message Potato First — we're happy to help with your order." };

const channels = [
  { icon: <Phone />, label: "Call us", value: site.hotline, href: `tel:${site.hotline}`, tone: "orange" as const },
  { icon: <WhatsAppIcon />, label: "WhatsApp", value: `Chat with us · ${site.hotline}`, href: whatsappLink(site.whatsapp, "Hello Potato First!"), tone: "green" as const },
  { icon: <Mail />, label: "Email", value: site.email, href: `mailto:${site.email}`, tone: "orange" as const },
  { icon: <MapPin />, label: "Address", value: site.address, tone: "orange" as const },
  { icon: <Clock />, label: "Hours", value: site.hours, tone: "orange" as const },
];

export default function ContactPage() {
  return (
    <>
      <PageTitle crumbs={[{ label: "Contact Us" }]} title="Get in touch" subtitle="যেকোনো প্রশ্ন বা অর্ডারের জন্য আমাদের সাথে যোগাযোগ করুন" />
      <div className="container-site grid grid-cols-1 items-start gap-6 pt-10 lg:grid-cols-[420px_1fr] lg:gap-8 lg:pt-12">
        <ul className="flex flex-col gap-4">
          {channels.map((c) => {
            const inner = (
              <>
                <IconCircle tone={c.tone} size={48}>
                  {c.icon}
                </IconCircle>
                <span className="min-w-0">
                  <span className="block t-caption text-ink-muted">{c.label}</span>
                  <span className="block break-words t-h4 text-ink">{c.value}</span>
                </span>
              </>
            );
            return (
              <li key={c.label}>
                {c.href ? (
                  <a href={c.href} target={c.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="flex items-center gap-4 rounded-md border border-line bg-white p-5 transition-colors hover:border-orange-500">
                    {inner}
                  </a>
                ) : (
                  <div className="flex items-center gap-4 rounded-md border border-line bg-white p-5">{inner}</div>
                )}
              </li>
            );
          })}
        </ul>
        <section className="flex flex-col gap-5 rounded-md border border-line bg-white p-5 sm:p-8">
          <div>
            <h2 className="t-h3 text-ink">Send us a message</h2>
            <p className="t-bn-s text-ink-soft">আমরা সাধারণত ২৪ ঘণ্টার মধ্যে উত্তর দিই।</p>
          </div>
          <Suspense fallback={null}>
            <ContactForm />
          </Suspense>
        </section>
      </div>
      <div className="container-site pt-8">
        {/* Replace with Google Maps embed once the address is final */}
        <div className="grid h-[280px] place-items-center rounded-lg bg-cream-200 text-center">
          <p className="flex flex-col items-center gap-2 t-label text-ink-soft">
            <MapPin className="size-8 text-brown-700" aria-hidden /> Map will appear here
          </p>
        </div>
      </div>
    </>
  );
}
