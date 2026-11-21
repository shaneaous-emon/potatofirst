import type { ImageAsset } from "@/types";

const sq = (src: string, alt: string): ImageAsset => ({ src, alt, width: 800, height: 800 });

/** Central image registry for mock content (exported from Figma → /public/images). */
export const IMG = {
  chipsClassic: sq("/images/products/chips-classic.webp", "Potato First Classic Salted potato chips pouch with a bowl of chips"),
  chipsMasala: sq("/images/products/chips-masala.webp", "Potato First Masala potato chips pouch with a bowl of chips"),
  chipsFry: sq("/images/products/chips-fry.webp", "Potato First Ready to Fry potato crisps pouch"),
  dateBites: sq("/images/products/date-bites.webp", "Potato First Date Bites pouch with a plate of dates"),
  dateMedjool: sq("/images/products/date-medjool.webp", "Potato First Medjool Dates pouch with a plate of dates"),
  peanutRoasted: sq("/images/products/peanut-roasted.webp", "Potato First Lightly Salted roasted peanuts pouch"),
  peanutMasala: sq("/images/products/peanut-masala.webp", "Potato First Masala Peanuts pouch"),
  comboBox: sq("/images/products/combo-box.webp", "Potato First snack combo gift box with dates, peanuts and chips"),
  signatureMix: sq("/images/products/signature-mix.webp", "Potato First Signature Mix pouch with bowls of dates, peanuts and chips"),
  catDates: sq("/images/categories/dates.webp", "A bowl of glossy dates"),
  catPeanuts: sq("/images/categories/peanuts.webp", "A bowl of roasted peanuts"),
  catPotato: sq("/images/categories/potato.webp", "A bowl of crispy potato chips"),
  heroMain: { src: "/images/banners/hero-main.webp", alt: "Snacks you'll reach for first — Potato First snacks with dates, peanuts and chips", width: 1720, height: 880 },
  heroSide: { src: "/images/banners/hero-side.webp", alt: "Delivered to your doorstep — Potato First delivery", width: 792, height: 880 },
  brandScene: { src: "/images/banners/brand-scene.webp", alt: "Potato First pouches with dates, peanuts and chips on a wooden table", width: 1792, height: 768 },
  promoCombo: { src: "/images/banners/promo-combo.webp", alt: "Potato First combo packs on display", width: 1920, height: 640 },
  packing: { src: "/images/story/packing.webp", alt: "Snack pouches being packed carefully into kraft boxes", width: 720, height: 900 },
  review1: { src: "/images/reviews/review-1.webp", alt: "Customer holding a Potato First pouch", width: 640, height: 800 },
  review2: { src: "/images/reviews/review-2.webp", alt: "Customer enjoying Potato First peanuts at the office", width: 640, height: 800 },
  review3: { src: "/images/reviews/review-3.webp", alt: "A family sharing chips and dates", width: 640, height: 800 },
  review4: { src: "/images/reviews/review-4.webp", alt: "A Potato First box being delivered", width: 640, height: 800 },
} satisfies Record<string, ImageAsset>;
