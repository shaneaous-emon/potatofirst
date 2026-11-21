/**
 * HOMEPAGE CONTENT — ordered list of sections.
 * Reorder, duplicate or remove entries here to change the page.
 * Phase 2: this exact JSON comes from the Laravel admin (page builder).
 */
import { IMG } from "@/data/mock/images";
import type { PageContent } from "@/components/sections/types";

export const homePage: PageContent = {
  slug: "home",
  title: "Potato First — Good Food. First Choice.",
  description:
    "Shop potato snacks, date snacks, peanut snacks and snack combos from Potato First. Easy guest checkout, Cash on Delivery across Bangladesh.",
  sections: [
    {
      id: "hero",
      type: "hero",
      main: { image: IMG.heroMain, href: "/shop" },
      side: { image: IMG.heroSide, href: "/track-order" },
    },
    {
      id: "trust",
      type: "trust",
      items: [
        { icon: "leaf", title: "Quality Ingredients", subtitle: "দেশি ও পরিচিত উপাদান" },
        { icon: "package", title: "Careful Packaging", subtitle: "যত্নের সাথে প্যাকেজিং" },
        { icon: "bag", title: "Simple Ordering", subtitle: "সহজে অর্ডার, সহজে কেনাকাটা" },
        { icon: "truck", title: "Home Delivery", subtitle: "চার্জ চেকআউটে নিশ্চিত হবে" },
      ],
    },
    {
      id: "categories",
      type: "categoryGrid",
      header: { eyebrow: "Our Categories", title: "Shop by Category", subtitle: "পছন্দের স্ন্যাকস খুঁজে নিন — ক্যাটাগরি অনুযায়ী", viewAll: { href: "/shop" } },
      categorySlugs: ["date-snacks", "peanut-snacks", "potato-snacks", "snack-combos"],
    },
    {
      id: "bestsellers",
      type: "productShowcase",
      header: { eyebrow: "Customer Favourites", title: "Bestselling Products", subtitle: "সবচেয়ে জনপ্রিয় স্ন্যাকসগুলো এক জায়গায়", viewAll: { href: "/shop?sort=popular" } },
      query: { sort: "popular", limit: 8 },
      filterTabs: true,
      cta: { label: "View All Products", href: "/shop" },
    },
    {
      id: "promo-combo",
      type: "promoBanner",
      eyebrow: "COMBO PACKS · কম্বো প্যাক",
      title: "More Snacks,\nMore Happiness!",
      subtitle: "এক প্যাকেই পছন্দের সব স্ন্যাকস — পরিবার ও বন্ধুদের সাথে উপভোগ করুন।",
      cta: { label: "Explore Combo Packs", href: "/category/snack-combos" },
      offerChip: "Save up to [X]%",
      image: IMG.promoCombo,
    },
    {
      id: "date-collection",
      type: "productCollection",
      background: "cream",
      header: { eyebrow: "Date Snacks Collection", title: "Date Snacks", subtitle: "প্রকৃতির মিষ্টি স্বাদ, প্রতিদিনের এনার্জি", viewAll: { href: "/category/date-snacks" } },
      query: { category: "date-snacks" },
      feature: { image: IMG.catDates, title: "Naturally sweet,\nnaturally familiar.", subtitle: "খেজুর দিয়ে তৈরি স্বাস্থ্যকর ও সুস্বাদু স্ন্যাকস", cta: { label: "Shop Date Snacks", href: "/category/date-snacks" } },
    },
    {
      id: "peanut-collection",
      type: "productCollection",
      background: "white",
      header: { eyebrow: "Peanut Snacks Collection", title: "Peanut Snacks", subtitle: "চায়ের সাথে মুচমুচে বাদাম", viewAll: { href: "/category/peanut-snacks" } },
      query: { category: "peanut-snacks" },
      feature: { image: IMG.catPeanuts, title: "Roasted to a\nperfect crunch.", subtitle: "হালকা লবণ বা মশলাদার — যেভাবে পছন্দ", cta: { label: "Shop Peanut Snacks", href: "/category/peanut-snacks" } },
    },
    {
      id: "potato-collection",
      type: "productCollection",
      background: "cream",
      header: { eyebrow: "Potato Snacks Collection", title: "Potato Snacks", subtitle: "মুচমুচে আলুর স্ন্যাকস সবার জন্য", viewAll: { href: "/category/potato-snacks" } },
      query: { category: "potato-snacks" },
      feature: { image: IMG.catPotato, title: "Golden, crispy,\nirresistible.", subtitle: "ক্লাসিক থেকে মশলাদার — নানা ফ্লেভারে", cta: { label: "Shop Potato Snacks", href: "/category/potato-snacks" } },
    },
    {
      id: "why-potato-first",
      type: "story",
      eyebrow: "Why Potato First",
      title: "Good food should be simple to find — and easy to love.",
      body: "Our mission is to make delicious, convenient and quality snacks accessible to everyone in Bangladesh through a simple and trusted online shopping experience — made from ingredients you already know.",
      bodyBn: "পরিচিত উপাদান, যত্নের প্যাকেজিং আর সহজ অনলাইন কেনাকাটা — সব মিলিয়েই Potato First।",
      image: IMG.packing,
      floatingCard: { icon: "heart", title: "Packed with care", subtitle: "প্রতিটি প্যাক যত্নের সাথে" },
      points: [
        { icon: "leaf", title: "Familiar ingredients", subtitle: "দেশি ও পরিচিত উপাদানে তৈরি" },
        { icon: "package", title: "Careful packaging", subtitle: "প্রতিটি প্যাক যত্নে প্যাক করা" },
        { icon: "bag", title: "Easy online ordering", subtitle: "কয়েক ক্লিকেই অর্ডার সম্পন্ন" },
        { icon: "phone", title: "Friendly support", subtitle: "যেকোনো প্রশ্নে আমরা পাশে আছি" },
      ],
      ctas: [
        { label: "Shop Our Snacks", href: "/shop" },
        { label: "Our Story", href: "/about" },
      ],
    },
    {
      id: "reviews",
      type: "reviewReels",
      header: { eyebrow: "Customer Stories", title: "Loved by Snack Lovers", subtitle: "Little bites. Future stories.", viewAll: { href: "/shop" } },
      share: { text: "Share your snack moment · আপনার রিভিউ শেয়ার করুন", cta: { label: "Upload Review", href: "/contact?subject=review" } },
    },
    {
      id: "newsletter",
      type: "newsletter",
      newsletter: { title: "Get snack updates first", subtitle: "নতুন প্রোডাক্ট ও অফারের খবর সবার আগে পেতে সাবস্ক্রাইব করুন।" },
      social: {
        title: "Follow our snack stories",
        subtitle: "Instagram ও Facebook-এ আমাদের সাথে থাকুন — রেসিপি, নতুন ফ্লেভার আর অফার।",
        images: [IMG.catDates, IMG.signatureMix, IMG.catPotato, IMG.review1],
      },
    },
  ],
};
