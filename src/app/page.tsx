import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SectionRenderer } from "@/components/sections/section-renderer";
import { getPage } from "@/lib/repositories";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("home");
  return { title: { absolute: page?.title ?? "Potato First" }, description: page?.description };
}

export default async function HomePage() {
  const page = await getPage("home");
  if (!page) notFound();
  return <SectionRenderer sections={page.sections} />;
}
