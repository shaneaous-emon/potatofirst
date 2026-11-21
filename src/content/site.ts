/**
 * Global site settings. In phase 2 these come from the Laravel
 * "settings" endpoint (admin-editable). Placeholders are marked [..].
 */
export const site = {
  name: "Potato First",
  tagline: "Good Food. First Choice.",
  description:
    "Potato First — convenient, tasty, quality snacks made from familiar ingredients. Potato snacks, date snacks, peanut snacks and snack combos delivered across Bangladesh.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://potatofirst.example",
  hotline: "01701891988",
  /** International format without "+", used for wa.me links */
  whatsapp: "8801701891988",
  email: "info@potatofirst.com",
  address: "Address goes here, Dhaka",
  hours: "Sat – Thu, 10am – 8pm",
  announcement: {
    text: "[Delivery / offer message goes here]",
    textBn: "ডেলিভারি বা অফারের তথ্য এখানে লিখুন",
  },
  /** Mock delivery charges (BDT). Admin-editable later. */
  delivery: {
    "inside-dhaka": { label: "Inside Dhaka", labelBn: "ঢাকার ভিতরে", charge: 70, eta: "1–2 days" },
    "outside-dhaka": { label: "Outside Dhaka", labelBn: "ঢাকার বাইরে", charge: 130, eta: "2–4 days" },
  },
  social: {
    instagram: "https://www.instagram.com/" as string | null,
    facebook: "https://www.facebook.com/shaneaous.emon" as string | null,
  },
  credit: { name: "Shaneaous Emon", href: "https://www.facebook.com/shaneaous.emon" },
  /**
   * Feature switches (admin-controlled in phase 2).
   * wishlist.enabled=false: no heart buttons, no /wishlist page, no menu link.
   * wishlist.hoverOnly=true: when enabled, the heart appears on card hover
   * (always visible on touch devices, which have no hover).
   */
  features: {
    wishlist: { enabled: false, hoverOnly: true },
  },
} as const;

export type NavItem = { label: string; href: string; highlight?: boolean; children?: { label: string; href: string }[] };

export const mainNav: NavItem[] = [
  { label: "Offer Zone", href: "/shop?tag=offer", highlight: true },
  {
    label: "Potato Snacks",
    href: "/category/potato-snacks",
    children: [
      { label: "Chips", href: "/category/potato-snacks?sub=chips" },
      { label: "Flavoured", href: "/category/potato-snacks?sub=flavoured" },
      { label: "Ready to Fry", href: "/category/potato-snacks?sub=ready-to-fry" },
    ],
  },
  {
    label: "Date Snacks",
    href: "/category/date-snacks",
    children: [
      { label: "Dates", href: "/category/date-snacks?sub=dates" },
      { label: "Date Bites", href: "/category/date-snacks?sub=date-bites" },
      { label: "Date Combos", href: "/category/date-snacks?sub=date-combos" },
    ],
  },
  {
    label: "Peanut Snacks",
    href: "/category/peanut-snacks",
    children: [
      { label: "Roasted", href: "/category/peanut-snacks?sub=roasted" },
      { label: "Masala", href: "/category/peanut-snacks?sub=masala" },
      { label: "Mixes", href: "/category/peanut-snacks?sub=mixes" },
    ],
  },
  { label: "Snack Combos", href: "/category/snack-combos" },
  { label: "Shop All", href: "/shop" },
];

export const footerColumns = [
  {
    title: "Shop",
    links: [
      { label: "Offer Zone", href: "/shop?tag=offer" },
      { label: "Potato Snacks", href: "/category/potato-snacks" },
      { label: "Date Snacks", href: "/category/date-snacks" },
      { label: "Peanut Snacks", href: "/category/peanut-snacks" },
      { label: "Snack Combos", href: "/category/snack-combos" },
      { label: "Shop All", href: "/shop" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Track Order", href: "/track-order" },
      { label: "Delivery Information", href: "/policies/delivery" },
      { label: "Return & Refund Policy", href: "/policies/returns" },
      { label: "FAQs", href: "/policies/faq" },
      { label: "Contact Us", href: "/contact" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Potato First", href: "/about" },
      { label: "Our Story", href: "/about#story" },
      { label: "Privacy Policy", href: "/policies/privacy" },
      { label: "Terms & Conditions", href: "/policies/terms" },
    ],
  },
];
