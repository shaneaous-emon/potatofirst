import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Info } from "lucide-react";
import { PageTitle } from "@/components/common/page-title";
import { FaqList } from "@/components/sections/faq-section";
import { getFaqs, getPolicies, getPolicy } from "@/lib/repositories";
import { cn } from "@/lib/utils";

export async function generateStaticParams() {
  return (await getPolicies()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/policies/[slug]">): Promise<Metadata> {
  const p = await getPolicy((await params).slug);
  return p ? { title: p.title, description: p.intro.slice(0, 150) } : {};
}

/** Figma: Policy Template (Privacy / Terms / Returns / Delivery / FAQ). */
export default async function PolicyPage({ params }: PageProps<"/policies/[slug]">) {
  const { slug } = await params;
  const [policy, all] = await Promise.all([getPolicy(slug), getPolicies()]);
  if (!policy) notFound();
  const faqs = slug === "faq" ? await getFaqs() : [];

  return (
    <>
      <PageTitle crumbs={[{ label: policy.title }]} title={policy.title} subtitle={`Last updated: ${policy.updated}`} />
      <div className="container-site grid grid-cols-1 items-start gap-8 pt-10 lg:grid-cols-[280px_760px] lg:gap-12 lg:pt-12">
        <nav aria-label="Policies" className="scrollbar-none -mx-4 flex gap-1 overflow-x-auto px-4 lg:sticky lg:top-6 lg:mx-0 lg:flex-col lg:rounded-md lg:border lg:border-line lg:bg-white lg:p-3">
          {all.map((p) => (
            <Link
              key={p.slug}
              href={`/policies/${p.slug}`}
              aria-current={p.slug === slug ? "page" : undefined}
              className={cn(
                "flex shrink-0 items-center justify-between gap-3 rounded-sm px-3.5 py-3 t-label transition-colors",
                p.slug === slug ? "bg-orange-100 text-brown-700" : "text-ink-soft hover:bg-cream-100 max-lg:border max-lg:border-line max-lg:bg-white",
              )}
            >
              {p.title}
              {p.slug === slug && <ChevronRight className="hidden size-4 lg:block" aria-hidden />}
            </Link>
          ))}
        </nav>
        <article className="flex min-w-0 flex-col gap-7">
          <p className="t-body-l text-ink-soft">{policy.intro}</p>
          {policy.sections.map((s) => (
            <section key={s.heading} className="flex flex-col gap-2.5">
              <h2 className="t-h3 text-ink">{s.heading}</h2>
              <p className="t-body text-ink-soft">{s.body}</p>
            </section>
          ))}
          {faqs.length > 0 && <FaqList items={faqs} />}
          <p className="flex items-center gap-3 rounded-md bg-cream-100 p-4 t-body-s text-ink">
            <Info className="size-5 shrink-0 text-orange-600" aria-hidden /> Content is managed from the admin panel. Final policy text must be reviewed by the business.
          </p>
        </article>
      </div>
    </>
  );
}
