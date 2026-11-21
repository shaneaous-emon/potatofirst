import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { StoreHydrator } from "@/components/providers/store-hydrator";

/** Storefront chrome (header, footer, cart drawer). The admin panel has its own layout. */
export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <a
        href="#main"
        className="sr-only z-50 rounded bg-brown-700 px-4 py-2 text-cream-100 focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      <SiteHeader />
      <main id="main" className="flex-1 pb-16 lg:pb-20">
        {children}
      </main>
      <SiteFooter />
      <CartDrawer />
      <StoreHydrator />
    </>
  );
}
