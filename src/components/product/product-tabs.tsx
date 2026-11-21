"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const REVIEWS_ANCHOR = "reviews";

/**
 * Figma: Product Tabs (Description / Reviews / Delivery & Returns).
 * Tab panels are server-rendered and passed in; this only switches them.
 * Linking to `#reviews` opens the Reviews tab and scrolls to it.
 */
export function ProductTabs({
  reviewCount,
  description,
  reviews,
  delivery,
}: {
  reviewCount: number;
  description: React.ReactNode;
  reviews: React.ReactNode;
  delivery: React.ReactNode;
}) {
  const [tab, setTab] = useState("description");
  useEffect(() => {
    const sync = () => {
      if (window.location.hash === `#${REVIEWS_ANCHOR}`) {
        setTab("reviews");
        document.getElementById("product-tabs")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  return (
    <Tabs id="product-tabs" value={tab} onValueChange={setTab} className="scroll-mt-24">
      <TabsList aria-label="Product information">
        <TabsTrigger value="description">Description</TabsTrigger>
        <TabsTrigger value="reviews">Reviews ({reviewCount})</TabsTrigger>
        <TabsTrigger value="delivery">Delivery &amp; Returns</TabsTrigger>
      </TabsList>
      <TabsContent value="description">{description}</TabsContent>
      <TabsContent value="reviews" id={REVIEWS_ANCHOR}>
        {reviews}
      </TabsContent>
      <TabsContent value="delivery">{delivery}</TabsContent>
    </Tabs>
  );
}
