/**
 * Admin-editable settings (stored in the `settings` table as JSON, one row per key).
 * These defaults apply until an admin saves the key for the first time.
 */
export const SETTINGS_DEFAULTS = {
  store: {
    name: "Potato First",
    tagline: "Good Food. First Choice.",
    hotline: "01701891988",
    whatsapp: "8801701891988",
    email: "info@potatofirst.com",
    address: "Address goes here, Dhaka",
    hours: "Sat – Thu, 10am – 8pm",
    facebook: "https://www.facebook.com/shaneaous.emon",
    instagram: "https://www.instagram.com/",
  },
  features: {
    bangla: false,
    wishlist: false,
    accounts: true,
    googleLogin: true,
    facebookLogin: true,
    mobileHeaderSearch: false,
    mobileHeaderChips: false,
  },
  announcement: {
    intervalMs: 4000,
    messages: [
      { text: "Cash on Delivery all over Bangladesh", href: "/policies/delivery" },
      { text: "Inside Dhaka delivery in 1–2 days", href: "/policies/delivery" },
      { text: "Combo packs — save more on every order", href: "/category/snack-combos" },
    ] as { text: string; href?: string }[],
  },
  checkout: {
    guestCheckout: true,
    minOrder: 0,
    maxQtyPerItem: 20,
    orderPrefix: "PF-",
    bkashNumber: "01701891988",
    bkashType: "Personal" as "Personal" | "Merchant" | "Agent",
    codEnabled: true,
    bkashEnabled: true,
  },
  tracking: {
    ga4Id: "",
    gtmId: "",
    metaPixelId: "",
    /** Fire Purchase only when an order is confirmed (not on placement). */
    purchaseOn: "placed" as "placed" | "confirmed",
  },
  couriers: {
    steadfast: { enabled: false, mode: "manual" as "manual" | "api", apiKey: "", secretKey: "" },
    pathao: { enabled: false, mode: "manual" as "manual" | "api", clientId: "", clientSecret: "", username: "", password: "", storeId: "" },
    redx: { enabled: false, mode: "manual" as "manual" | "api", token: "" },
  },
  fraud: {
    /** same phone placing more than this many orders in the window → flag */
    maxOrdersPerPhone: 2,
    maxOrdersPerIp: 4,
    windowHours: 24,
    /** delivered / (delivered + returned + cancelled after confirm) below this → flag */
    minSuccessRatio: 60,
    minSampleSize: 3,
    blockedPhones: [] as string[],
    blockedIps: [] as string[],
    /** score ≥ this → hold for call verification */
    holdAt: 50,
  },
  inventory: {
    nearExpiryDays: 30,
    blockExpired: true,
    deductOn: "placed" as "placed" | "confirmed",
  },
};

export type Settings = typeof SETTINGS_DEFAULTS;
export type SettingKey = keyof Settings;
