import { IMG } from "@/data/mock/images";
import type { PageContent } from "@/components/sections/types";

/** About page — composed entirely from reusable sections. */
export const aboutPage: PageContent = {
  slug: "about",
  title: "About Us",
  description: "Potato First started with a simple idea: everyday snacks made from ingredients you already know.",
  sections: [
    {
      id: "about-hero",
      type: "split",
      background: "cream",
      spacingTop: "sm",
      spacingBottom: "lg",
      breadcrumb: "About Us",
      eyebrow: "Our Story",
      title: "Good food should be simple to find.",
      titleSize: "display",
      body: "Potato First started with a simple idea: everyday snacks made from ingredients you already know, packed with care and delivered easily across Bangladesh.",
      bodyBn: "পরিচিত উপাদানে তৈরি মানসম্মত স্ন্যাকস — সহজ অনলাইন কেনাকাটায় সবার কাছে পৌঁছে দেওয়াই আমাদের লক্ষ্য।",
      image: IMG.packing,
    },
    {
      id: "values",
      type: "featureGrid",
      header: { title: "What we stand for" },
      items: [
        { icon: "leaf", title: "Familiar ingredients", body: "We choose ingredients people already trust and enjoy.", bodyBn: "পরিচিত উপাদান" },
        { icon: "package", title: "Packed with care", body: "Every pack is sealed and checked before it leaves us.", bodyBn: "যত্নের প্যাকেজিং" },
        { icon: "bag", title: "Simple ordering", body: "No account needed. Order in under a minute.", bodyBn: "সহজ অর্ডার" },
        { icon: "heart", title: "Real support", body: "Call or WhatsApp us — a real person will reply.", bodyBn: "আন্তরিক সাপোর্ট" },
      ],
    },
    {
      id: "story",
      type: "split",
      imageSide: "left",
      eyebrow: "From our kitchen to yours",
      title: "Four categories, one promise.",
      body: "Potato snacks, date snacks, peanut snacks and snack combos — each made to be the first thing you reach for. [Brand story content editable from CMS.]",
      image: IMG.brandScene,
      cta: { label: "Shop Our Snacks", href: "/shop" },
    },
    {
      id: "about-newsletter",
      type: "newsletter",
      spacingTop: "lg",
      newsletter: { title: "Get snack updates first", subtitle: "নতুন প্রোডাক্ট ও অফারের খবর সবার আগে পেতে সাবস্ক্রাইব করুন।" },
      social: { title: "Follow our snack stories", subtitle: "Instagram ও Facebook-এ আমাদের সাথে থাকুন।", images: [IMG.catDates, IMG.signatureMix, IMG.catPotato, IMG.review1] },
    },
  ],
};
