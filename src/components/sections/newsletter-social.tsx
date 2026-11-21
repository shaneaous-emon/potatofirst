import Image from "next/image";
import { Mail } from "lucide-react";
import { IconCircle } from "@/components/common/icon-circle";
import { site } from "@/content/site";
import { NewsletterForm } from "./newsletter-form";
import { SectionShell } from "./section-shell";
import type { NewsletterSection } from "./types";

function SocialButton({ label, href, children }: { label: string; href: string | null; children: React.ReactNode }) {
  const cls = "inline-flex items-center gap-2 rounded-sm border-[1.5px] border-brown-700 px-5 py-3 t-button text-brown-700 transition-colors hover:bg-brown-700 hover:text-cream-100";
  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
      {children} {label}
    </a>
  ) : (
    <span className={`${cls} cursor-not-allowed opacity-60`} aria-disabled title="Link will be added once the account is confirmed">
      {children} {label}
    </span>
  );
}

/** Figma: 13 Newsletter & Social */
export function NewsletterSocial({ newsletter, social, spacingTop = "none", spacingBottom = "lg", background }: NewsletterSection) {
  return (
    <SectionShell spacingTop={spacingTop} spacingBottom={spacingBottom} background={background} className="lg:pb-24">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-4 rounded-lg bg-orange-100 p-6 sm:p-12">
          <IconCircle tone="orange-solid" size={52}>
            <Mail />
          </IconCircle>
          <h2 className="t-h2 text-ink">{newsletter.title}</h2>
          <p className="t-bn text-ink-soft">{newsletter.subtitle}</p>
          <NewsletterForm />
        </div>
        <div className="flex flex-col gap-4 rounded-lg border border-line bg-white p-6 sm:p-12">
          <h2 className="t-h2 text-ink">{social.title}</h2>
          <p className="t-bn text-ink-soft">{social.subtitle}</p>
          <ul className="grid grid-cols-4 gap-2 sm:gap-3">
            {social.images.map((img, i) => (
              <li key={i} className="relative aspect-square overflow-hidden rounded-[12px]">
                <Image src={img.src} alt={img.alt} fill sizes="(min-width:1024px) 130px, 22vw" className="object-cover" />
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-3">
            <SocialButton label="Instagram" href={site.social.instagram}>
              <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4" /><path d="M17.5 6.5h.01" /></svg>
            </SocialButton>
            <SocialButton label="Facebook" href={site.social.facebook}>
              <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
            </SocialButton>
          </div>
          <p className="t-caption text-ink-muted">Social links will be added once accounts are confirmed.</p>
        </div>
      </div>
    </SectionShell>
  );
}
