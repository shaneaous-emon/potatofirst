"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ExternalLink, LogOut, Menu, X, type LucideIcon, LayoutDashboard, ShoppingBag, ShieldAlert, Users, Package, FolderTree, Boxes, Star, TicketPercent, Activity, Home, Image, FileText, Mail, Truck, Send, BarChart3, Settings, UserCog, History, Circle } from "lucide-react";
import { can } from "@/lib/admin/permissions";
import { cn } from "@/lib/utils";
import { ADMIN_NAV } from "./nav";

const ICONS: Record<string, LucideIcon> = { LayoutDashboard, ShoppingBag, ShieldAlert, Users, Package, FolderTree, Boxes, Star, TicketPercent, Activity, Home, Image, FileText, Mail, Truck, Send, BarChart3, Settings, UserCog, History };

type Badges = Partial<Record<"pendingOrders" | "fraud" | "reviews" | "stock", number>>;
type Props = { permissions: string[]; name: string; role: string; badges: Badges; logout: () => Promise<void> };

function NavBody({ permissions, badges, onNavigate }: { permissions: string[]; badges: Badges; onNavigate?: () => void }) {
  const path = usePathname();
  return (
    <nav className="flex flex-col gap-5 px-3 py-4" aria-label="Admin">
      {ADMIN_NAV.map((g) => {
        const links = g.links.filter((l) => can(permissions, l.perm));
        if (!links.length) return null;
        return (
          <div key={g.label} className="flex flex-col gap-0.5">
            <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-cream-100/40">{g.label}</p>
            {links.map((l) => {
              const active = l.href === "/admin" ? path === "/admin" : path.startsWith(l.href);
              const I = ICONS[l.icon] ?? Circle;
              const badge = l.badgeKey ? badges[l.badgeKey] : 0;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-sm px-3 py-2 text-[14px] font-medium transition-colors",
                    active ? "bg-orange-500 text-brown-900" : "text-cream-100/80 hover:bg-white/10 hover:text-white",
                  )}
                >
                  <I className="size-[18px] shrink-0" aria-hidden />
                  <span className="flex-1 truncate">{l.label}</span>
                  {!!badge && (
                    <span className={cn("min-w-5 rounded-full px-1.5 text-center text-[11px] font-semibold leading-5", active ? "bg-brown-900 text-cream-100" : "bg-sale text-white")}>
                      {badge > 99 ? "99+" : badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        );
      })}
    </nav>
  );
}

function Brand() {
  return (
    <Link href="/admin" className="flex items-center gap-2.5 px-5 py-5">
      <span className="grid size-9 place-items-center rounded-sm bg-orange-500 font-display text-lg font-bold text-brown-900">P</span>
      <span className="leading-tight">
        <span className="block font-display text-[15px] font-semibold text-white">Potato First</span>
        <span className="block text-[11px] text-cream-100/50">Admin Panel</span>
      </span>
    </Link>
  );
}

function Footer({ name, role, logout }: Pick<Props, "name" | "role" | "logout">) {
  return (
    <div className="mt-auto border-t border-white/10 p-3">
      <Link href="/" target="_blank" className="mb-1 flex items-center gap-3 rounded-sm px-3 py-2 text-[13px] text-cream-100/70 transition-colors hover:bg-white/10 hover:text-white">
        <ExternalLink className="size-4" /> View store
      </Link>
      <div className="flex items-center gap-3 rounded-sm px-3 py-2">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white/15 text-sm font-semibold text-white">{name.charAt(0)}</span>
        <span className="min-w-0 flex-1 leading-tight">
          <span className="block truncate text-[13px] font-medium text-white">{name}</span>
          <span className="block truncate text-[11px] text-cream-100/50">{role}</span>
        </span>
        <form action={logout}>
          <button type="submit" aria-label="Log out" title="Log out" className="grid size-8 cursor-pointer place-items-center rounded-full text-cream-100/70 transition-colors hover:bg-white/10 hover:text-white">
            <LogOut className="size-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

/** Desktop: persistent sidebar ≥1200px. Tablet/mobile: drawer. */
export function AdminSidebar(props: Props) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <aside className="sticky top-0 hidden h-dvh w-[248px] shrink-0 flex-col overflow-y-auto bg-brown-900 xl:flex">
        <Brand />
        <NavBody permissions={props.permissions} badges={props.badges} />
        <Footer {...props} />
      </aside>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open navigation"
        className="fixed left-3 top-3 z-40 grid size-10 cursor-pointer place-items-center rounded-sm bg-brown-900 text-white shadow-card xl:hidden"
      >
        <Menu className="size-5" />
      </button>
      {open && (
        <div className="fixed inset-0 z-50 xl:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
          <div className="absolute inset-0 bg-brown-900/60" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-[280px] max-w-[85vw] flex-col overflow-y-auto bg-brown-900 animate-in slide-in-from-left">
            <div className="flex items-center justify-between pr-3">
              <Brand />
              <button type="button" onClick={() => setOpen(false)} aria-label="Close navigation" className="grid size-10 cursor-pointer place-items-center rounded-full text-white hover:bg-white/10">
                <X className="size-5" />
              </button>
            </div>
            <NavBody permissions={props.permissions} badges={props.badges} onNavigate={() => setOpen(false)} />
            <Footer {...props} />
          </aside>
        </div>
      )}
    </>
  );
}
