import { Breadcrumb, type Crumb } from "./breadcrumb";

/** Inner-page title band (cream background, breadcrumb + H1 + Bangla subtitle). */
export function PageTitle({ crumbs, title, subtitle, children }: { crumbs: Crumb[]; title: string; subtitle?: string; children?: React.ReactNode }) {
  return (
    <section className="bg-cream-100 pb-9 pt-7">
      <div className="container-site flex flex-col gap-3">
        <Breadcrumb items={crumbs} />
        <h1 className="t-h1 text-ink">{title}</h1>
        {subtitle && <p className="t-bn text-ink-soft">{subtitle}</p>}
        {children}
      </div>
    </section>
  );
}
