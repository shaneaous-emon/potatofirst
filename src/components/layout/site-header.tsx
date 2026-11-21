import Link from "next/link";
import { Truck } from "lucide-react";
import { Logo } from "@/components/common/logo";
import { mainNav } from "@/content/site";
import { AnnouncementBar } from "./announcement-bar";
import { AccountButton } from "./account-button";
import { CartButton } from "./cart-button";
import { CategoryNav } from "./category-nav";
import { MobileMenu } from "./mobile-menu";
import { SearchBox } from "./search-box";

function Action({ href, icon: I, label }: { href: string; icon: typeof Truck; label: string }) {
  return (
    <Link href={href} className="group flex flex-col items-center gap-1 text-ink">
      <I className="size-6 transition-colors group-hover:text-brown-700" aria-hidden />
      <span className="t-caption text-ink-soft group-hover:text-brown-700">{label}</span>
    </Link>
  );
}

/** Figma: Site Header / Desktop + Site Header / Mobile (responsive, one component). */
export function SiteHeader() {
  return (
    <>
      <AnnouncementBar />
      {/* Desktop */}
      <header className="hidden bg-white lg:block">
        <div className="container-site flex items-center gap-10 py-[18px]">
          <Logo className="w-24" priority />
          <SearchBox className="flex-1" />
          <div className="flex items-center gap-7">
            <Action href="/track-order" icon={Truck} label="Track Order" />
            <AccountButton />
            <CartButton withLabel />
            <MobileMenu trigger="more" />
          </div>
        </div>
      </header>
      <CategoryNav />
      {/* Mobile / tablet — sticky bar */}
      <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur lg:hidden">
        <div className="container-site grid grid-cols-[40px_1fr_40px] items-center py-2.5">
          <MobileMenu />
          <Logo className="mx-auto w-[72px]" priority />
          <CartButton />
        </div>
      </header>
      <div className="bg-white lg:hidden">
        <div className="container-site pb-2.5 pt-2.5">
          <SearchBox compact />
        </div>
      </div>
      <nav aria-label="Categories" className="scrollbar-none flex gap-2 overflow-x-auto bg-cream-50 px-4 py-3 lg:hidden">
        {mainNav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={item.highlight ? "shrink-0 rounded-full bg-orange-500 px-3.5 py-[7px] t-label text-brown-900" : "shrink-0 rounded-full border border-line bg-white px-3.5 py-[7px] t-label text-ink-soft hover:border-brown-700"}
          >
            {item.highlight ? `🔥 ${item.label}` : item.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
