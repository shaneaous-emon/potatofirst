import { NextResponse, type NextRequest } from "next/server";
import { getProducts } from "@/lib/repositories";

/**
 * Live search suggestions for the header search box.
 * Phase 2: proxy to Laravel `GET /products?q=&limit=` (or call it directly from the client).
 */
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json({ items: [], total: 0 });
  const all = await getProducts({ search: q });
  const items = all.slice(0, 6).map((p) => ({
    slug: p.slug,
    name: p.name,
    subtitle: p.subtitle,
    category: p.categoryName,
    image: p.images[0].src,
    price: p.variants[0].price,
  }));
  return NextResponse.json({ items, total: all.length }, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" } });
}
