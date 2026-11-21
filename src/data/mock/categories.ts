import type { Category } from "@/types";
import { IMG } from "./images";

export const categories: Category[] = [
  {
    slug: "potato-snacks",
    name: "Potato Snacks",
    nameBn: "আলুর স্ন্যাকস",
    description: "From crunchy chips to ready-to-fry potato snacks.",
    descriptionBn: "মুচমুচে আলুর চিপস থেকে রান্নার উপযোগী আলুর স্ন্যাকস",
    image: IMG.catPotato,
    banner: { ...IMG.catPotato },
    subCategories: [
      { slug: "chips", label: "Chips" },
      { slug: "flavoured", label: "Flavoured" },
      { slug: "ready-to-fry", label: "Ready to Fry" },
    ],
  },
  {
    slug: "date-snacks",
    name: "Date Snacks",
    nameBn: "খেজুরের স্ন্যাকস",
    description: "Soft, sweet and energising snacks made with dates.",
    descriptionBn: "খেজুর দিয়ে তৈরি নরম, মিষ্টি ও এনার্জি ভরা স্ন্যাকস",
    image: IMG.catDates,
    banner: { ...IMG.catDates },
    subCategories: [
      { slug: "dates", label: "Dates" },
      { slug: "date-bites", label: "Date Bites" },
      { slug: "date-combos", label: "Date Combos" },
    ],
  },
  {
    slug: "peanut-snacks",
    name: "Peanut Snacks",
    nameBn: "বাদামের স্ন্যাকস",
    description: "Roasted, spicy and mixed — crunchy peanuts for tea time.",
    descriptionBn: "রোস্টেড, মশলাদার ও মিক্সড — চায়ের সাথে মুচমুচে বাদাম",
    image: IMG.catPeanuts,
    banner: { ...IMG.catPeanuts },
    subCategories: [
      { slug: "roasted", label: "Roasted" },
      { slug: "masala", label: "Masala" },
      { slug: "mixes", label: "Mixes" },
    ],
  },
  {
    slug: "snack-combos",
    name: "Snack Combos",
    nameBn: "স্ন্যাকস কম্বো",
    description: "All your favourite snacks in one pack — for family or gifting.",
    descriptionBn: "এক প্যাকেই পছন্দের সব স্ন্যাকস — উপহার বা পরিবারের জন্য",
    image: IMG.signatureMix,
    banner: IMG.promoCombo,
    subCategories: [
      { slug: "family-packs", label: "Family Packs" },
      { slug: "gift-boxes", label: "Gift Boxes" },
      { slug: "mixes", label: "Mixes" },
    ],
  },
];
