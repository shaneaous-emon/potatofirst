import type { Permission } from "@/lib/admin/permissions";

export type NavLink = { label: string; href: string; perm: Permission; icon: string; badgeKey?: "pendingOrders" | "stock" | "messages" };
export type NavGroup = { label: string; links: NavLink[] };

/** Admin sidebar — only modules that are actually built. */
export const ADMIN_NAV: NavGroup[] = [
  { label: "Overview", links: [{ label: "Dashboard", href: "/admin", perm: "dashboard.view", icon: "LayoutDashboard" }] },
  {
    label: "Sales",
    links: [
      { label: "Orders", href: "/admin/orders", perm: "orders.view", icon: "ShoppingBag", badgeKey: "pendingOrders" },
      { label: "Customers", href: "/admin/customers", perm: "customers.view", icon: "Users" },
      { label: "Messages", href: "/admin/messages", perm: "content.view", icon: "Mail", badgeKey: "messages" },
    ],
  },
  {
    label: "Catalog",
    links: [
      { label: "Products", href: "/admin/products", perm: "products.view", icon: "Package" },
      { label: "Categories", href: "/admin/categories", perm: "categories.view", icon: "FolderTree" },
      { label: "Stock", href: "/admin/inventory", perm: "inventory.view", icon: "Boxes", badgeKey: "stock" },
    ],
  },
  {
    label: "Marketing",
    links: [
      { label: "Coupons", href: "/admin/coupons", perm: "coupons.view", icon: "TicketPercent" },
      { label: "Tracking & Pixels", href: "/admin/marketing", perm: "marketing.view", icon: "Activity" },
    ],
  },
  {
    label: "Operations",
    links: [
      { label: "Delivery Charges", href: "/admin/shipping", perm: "shipping.view", icon: "Truck" },
      { label: "Couriers", href: "/admin/couriers", perm: "shipping.view", icon: "Send" },
      { label: "Block List", href: "/admin/blocklist", perm: "customers.view", icon: "ShieldBan" },
      { label: "Reports", href: "/admin/reports", perm: "reports.view", icon: "BarChart3" },
    ],
  },
  {
    label: "System",
    links: [
      { label: "AI Assistant", href: "/admin/ai", perm: "ai.configure", icon: "Sparkles" },
      { label: "Settings", href: "/admin/settings", perm: "settings.view", icon: "Settings" },
      { label: "Admin Users", href: "/admin/users", perm: "users.view", icon: "UserCog" },
      { label: "Activity Log", href: "/admin/logs", perm: "logs.view", icon: "History" },
    ],
  },
];
