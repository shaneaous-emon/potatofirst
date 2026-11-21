import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SectionRenderer } from "@/components/sections/section-renderer";
import { getPage } from "@/lib/repositories";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage("about");
  return { title: page?.title, description: page?.description };
}

export default async function AboutPage() {
  const page = await getPage("about");
  if (!page) notFound();
  return <SectionRenderer sections={page.sections} />;
}
