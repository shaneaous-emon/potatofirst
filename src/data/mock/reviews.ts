/** MOCK REVIEWS — sample content until real customer reviews come from the API. */
import type { Review } from "@/types";
import { IMG } from "./images";

const BODIES = [
  { body: "“খেজুরগুলো একদম নরম আর মিষ্টি। প্যাকেজিংও খুব সুন্দর ছিল।”", image: IMG.review1 },
  { body: "“Great with evening tea. Will order the bigger pack next time.”" },
  { body: "“বাচ্চাদের টিফিনের জন্য নিয়েছিলাম, সবাই পছন্দ করেছে।”", image: IMG.review3 },
  { body: "“সময়মতো ডেলিভারি, বক্সটাও দারুণ।”" },
];

const LOCATIONS = ["Dhaka", "Chattogram", "Sylhet", "Rajshahi"];

/** Generic product reviews: every product gets the same sample set. */
export function sampleReviewsFor(productId: string): Review[] {
  return BODIES.map((b, i) => ({
    id: `${productId}-r${i + 1}`,
    productId,
    author: "Customer Name",
    location: LOCATIONS[i],
    rating: i === 1 ? 4 : 5,
    body: b.body,
    date: "DD Mon YYYY",
    image: b.image,
  }));
}

/** Homepage reel-style reviews (photo / video UGC). */
export const reelReviews: Review[] = [
  { id: "reel-1", productId: "p-date-bites", author: "Customer", rating: 5, date: "", body: "“খেজুরগুলো একদম নরম আর মিষ্টি। প্যাকেজিংও সুন্দর।”", image: IMG.review1, videoUrl: "" },
  { id: "reel-2", productId: "p-peanut-roasted", author: "Customer", rating: 5, date: "", body: "“Perfect office snack — fresh & crunchy!”", image: IMG.review2 },
  { id: "reel-3", productId: "p-chips-classic", author: "Customer", rating: 5, date: "", body: "“বাচ্চারা চিপস খুব পছন্দ করেছে।”", image: IMG.review3, videoUrl: "" },
  { id: "reel-4", productId: "p-combo-everyday", author: "Customer", rating: 5, date: "", body: "“সময়মতো ডেলিভারি, বক্সটাও দারুণ।”", image: IMG.review4, videoUrl: "" },
];
