/** Admin modules and actions. Roles store a list of "module.action" keys; "*" = all. */
export const MODULES = {
  dashboard: ["view"],
  products: ["view", "create", "edit", "delete"],
  categories: ["view", "edit"],
  inventory: ["view", "adjust"],
  orders: ["view", "edit", "export"],
  customers: ["view", "edit"],
  coupons: ["view", "edit"],
  shipping: ["view", "edit"],
  payments: ["view", "refund"],
  content: ["view", "edit"],
  reports: ["view"],
  marketing: ["view", "edit"],
  settings: ["view", "edit"],
  users: ["view", "edit"],
  logs: ["view"],
  ai: ["use", "configure"],
} as const;

export type Module = keyof typeof MODULES;
export type Permission = { [M in Module]: `${M}.${(typeof MODULES)[M][number]}` }[Module];

export const ALL_PERMISSIONS = Object.entries(MODULES).flatMap(([m, acts]) => acts.map((a) => `${m}.${a}`)) as Permission[];

export function can(perms: readonly string[] | undefined, p: Permission) {
  if (!perms) return false;
  return perms.includes("*") || perms.includes(p);
}

const view = (...m: Module[]) => m.map((x) => `${x}.view`);

/** Default roles from the specification (editable later in Admin › Roles). */
export const DEFAULT_ROLES: { slug: string; name: string; permissions: string[] }[] = [
  { slug: "super-admin", name: "Super Admin", permissions: ["*"] },
  { slug: "administrator", name: "Administrator", permissions: ALL_PERMISSIONS.filter((p) => !p.startsWith("users.") && p !== "settings.edit") },
  { slug: "order-manager", name: "Order Manager", permissions: [...view("dashboard", "products", "inventory", "customers", "payments"), "orders.view", "orders.edit", "orders.export", "ai.use"] },
  { slug: "product-manager", name: "Product Manager", permissions: [...view("dashboard", "inventory"), "products.view", "products.create", "products.edit", "products.delete", "categories.view", "categories.edit"] },
  { slug: "inventory-manager", name: "Inventory Manager", permissions: [...view("dashboard", "products", "orders"), "inventory.view", "inventory.adjust"] },
  { slug: "marketing-manager", name: "Marketing Manager", permissions: [...view("dashboard", "products", "reports"), "coupons.view", "coupons.edit", "content.view", "content.edit", "marketing.view", "marketing.edit"] },
  { slug: "support", name: "Customer Support", permissions: [...view("dashboard", "orders", "products", "customers"), "customers.edit"] },
  { slug: "accountant", name: "Accountant", permissions: [...view("dashboard", "orders", "reports"), "payments.view", "payments.refund"] },
  { slug: "content-manager", name: "Content Manager", permissions: [...view("dashboard", "products"), "content.view", "content.edit"] },
];
