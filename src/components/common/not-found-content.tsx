import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Bn } from "@/components/common/bn";

export function NotFoundContent() {
  return (
    <div className="container-site flex flex-col items-center gap-4 py-24 text-center">
      <p className="t-display text-orange-500">404</p>
      <h1 className="t-h2 text-ink">This page went missing</h1>
      <Bn className="t-bn text-ink-soft">দুঃখিত, পেজটি খুঁজে পাওয়া যায়নি।</Bn>
      <div className="flex gap-3">
        <Link href="/" className={buttonVariants()}>
          Go Home
        </Link>
        <Link href="/shop" className={buttonVariants({ variant: "outline" })}>
          Shop Snacks
        </Link>
      </div>
    </div>
  );
}
