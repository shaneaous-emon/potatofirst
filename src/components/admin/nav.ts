import type { Permission } from "@/lib/admin/permissions";

export type NavLink = { label: string; href: string; perm: Permission; icon: string; badgeKey?: "pendingOrders" | "fraud" | "reviews" | "stock" };
export type NavGroup = { label: string; links: NavLink[] };

/** Admin sidebar (spec §4), trimmed to the modules this store uses. */
export const ADMIN_NAV: NavGroup[] = [
  { label: "Overview", links: [{ label: "Dashboard", href: "/admin", perm: "dashboard.view", icon: "LayoutDashboard" }] },
  {
    label: "Sales",
    links: [
      { label: "Orders", href: "/admin/orders", perm: "orders.view", icon: "ShoppingBag", badgeKey: "pendingOrders" },
      { label: "Fraud Review", href: "/admin/fraud", perm: "fraud.view", icon: "ShieldAlert", badgeKey: "fraud" },
      { label: "Customers", href: "/admin/customers", perm: "customers.view", icon: "Users" },
    ],
  },
  {
    label: "Catalog",
    links: [
      { label: "Products", href: "/admin/products", perm: "products.view", icon: "Package" },
      { label: "Categories", href: "/admin/categories", perm: "categories.view", icon: "FolderTree" },
      { label: "Inventory", href: "/admin/inventory", perm: "inventory.view", icon: "Boxes", badgeKey: "stock" },
      { label: "Reviews", href: "/admin/reviews", perm: "reviews.view", icon: "Star", badgeKey: "reviews" },
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
    label: "Website",
    links: [
      { label: "Homepage", href: "/admin/content/homepage", perm: "content.view", icon: "Home" },
      { label: "Banners", href: "/admin/content/banners", perm: "content.view", icon: "Image" },
      { label: "Pages & FAQ", href: "/admin/content/pages", perm: "content.view", icon: "FileText" },
      { label: "Messages", href: "/admin/content/messages", perm: "content.view", icon: "Mail" },
    ],
  },
  {
    label: "Operations",
    links: [
      { label: "Delivery Zones", href: "/admin/shipping", perm: "shipping.view", icon: "Truck" },
      { label: "Couriers", href: "/admin/couriers", perm: "shipping.view", icon: "Send" },
      { label: "Reports", href: "/admin/reports", perm: "reports.view", icon: "BarChart3" },
    ],
  },
  {
    label: "System",
    links: [
      { label: "Settings", href: "/admin/settings", perm: "settings.view", icon: "Settings" },
      { label: "Admin Users", href: "/admin/users", perm: "users.view", icon: "UserCog" },
      { label: "Activity Log", href: "/admin/logs", perm: "logs.view", icon: "History" },
    ],
  },
];
