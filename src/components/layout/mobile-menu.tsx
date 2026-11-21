"use client";

import Link from "next/link";
import { ChevronRight, Heart, Leaf, Menu, Phone, Truck, User } from "lucide-react";
import { Logo } from "@/components/common/logo";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { mainNav } from "@/content/site";
import { cn } from "@/lib/utils";

const QUICK = [
  { icon: Truck, label: "Track Order", href: "/track-order" },
  { icon: Heart, label: "Wishlist", href: "/wishlist" },
  { icon: User, label: "My Account", href: "/account" },
  { icon: Phone, label: "Help & Support", href: "/contact" },
  { icon: Leaf, label: "About Potato First", href: "/about" },
];

/** Figma: Mobile Menu Drawer — 390. Also used as the desktop "More" menu. */
export function MobileMenu({ trigger = "icon" }: { trigger?: "icon" | "more" }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        {trigger === "icon" ? (
          <button type="button" aria-label="Open menu" className="grid size-10 cursor-pointer place-items-center rounded-full text-ink hover:bg-cream-100">
            <Menu className="size-6" />
          </button>
        ) : (
          <button type="button" className="group flex cursor-pointer flex-col items-center gap-1 text-ink">
            <Menu className="size-6 group-hover:text-brown-700" aria-hidden />
            <span className="t-caption text-ink-soft group-hover:text-brown-700">More</span>
          </button>
        )}
      </SheetTrigger>
      <SheetContent side={trigger === "icon" ? "left" : "right"} className="overflow-y-auto">
        <SheetTitle className="sr-only">Menu</SheetTitle>
        <SheetDescription className="sr-only">Browse categories and quick links</SheetDescription>
        <div className="px-4 py-3.5">
          <SheetClose asChild>
            <Logo className="w-16" />
          </SheetClose>
        </div>
        <div className="px-4 pb-3">
          <SheetClose asChild>
            <Link href="/account" className="flex items-center gap-3 rounded-md bg-orange-500 px-4 py-3.5 text-brown-900">
              <span className="grid size-10 place-items-center rounded-full bg-white text-orange-600">
                <User className="size-[22px]" />
              </span>
              <span>
                <span className="block t-h4">Hello there!</span>
                <span className="block t-body-s">Sign in / Register</span>
              </span>
            </Link>
          </SheetClose>
        </div>
        <nav aria-label="Categories">
          <ul>
            {mainNav.map((item) => (
              <li key={item.href}>
                <SheetClose asChild>
                  <Link
                    href={item.href}
                    className={cn("flex items-center justify-between border-b border-line px-5 py-3.5 t-label text-ink hover:bg-cream-50", item.highlight && "text-orange-600")}
                  >
                    {item.highlight ? `🔥 ${item.label}` : item.label}
                    {item.children && <ChevronRight className="size-[18px] text-ink-muted" aria-hidden />}
                  </Link>
                </SheetClose>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex flex-col gap-1 px-5 pb-8 pt-6">
          <p className="t-h4 text-ink">Quick Links</p>
          <span className="mb-1 h-[3px] w-8 rounded-full bg-orange-500" aria-hidden />
          {QUICK.map(({ icon: I, label, href }) => (
            <SheetClose asChild key={href}>
              <Link href={href} className="flex items-center gap-3 py-2.5 t-body-s text-ink-soft hover:text-brown-700">
                <I className="size-5 text-brown-700" aria-hidden /> {label}
              </Link>
            </SheetClose>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
