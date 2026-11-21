import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Toaster } from "sonner";
import { site } from "@/content/site";
import "./globals.css";

/* Self-hosted fonts (no runtime request to Google): Poppins headings, Inter body, Hind Siliguri Bangla. */
const poppins = localFont({
  variable: "--font-poppins",
  display: "swap",
  src: [
    { path: "../fonts/poppins-latin-400-normal.woff2", weight: "400" },
    { path: "../fonts/poppins-latin-500-normal.woff2", weight: "500" },
    { path: "../fonts/poppins-latin-600-normal.woff2", weight: "600" },
    { path: "../fonts/poppins-latin-700-normal.woff2", weight: "700" },
  ],
});
const inter = localFont({
  variable: "--font-inter",
  display: "swap",
  src: [
    { path: "../fonts/inter-latin-400-normal.woff2", weight: "400" },
    { path: "../fonts/inter-latin-500-normal.woff2", weight: "500" },
    { path: "../fonts/inter-latin-600-normal.woff2", weight: "600" },
  ],
});
const hind = localFont({
  variable: "--font-hind",
  display: "swap",
  preload: false,
  src: [
    { path: "../fonts/hind-siliguri-bengali-400-normal.woff2", weight: "400" },
    { path: "../fonts/hind-siliguri-bengali-500-normal.woff2", weight: "500" },
    { path: "../fonts/hind-siliguri-bengali-600-normal.woff2", weight: "600" },
  ],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} — ${site.tagline}`, template: `%s | ${site.name}` },
  description: site.description,
  applicationName: site.name,
  openGraph: { type: "website", siteName: site.name, locale: "en_BD", images: ["/images/banners/brand-scene.webp"] },
  twitter: { card: "summary_large_image" },
  formatDetection: { telephone: false },
};

import { Suspense } from "react";
import { AnalyticsScripts } from "@/components/analytics/analytics-scripts";

export const viewport: Viewport = { themeColor: "#5a2b13", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${poppins.variable} ${inter.variable} ${hind.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <Suspense fallback={null}>
          <AnalyticsScripts />
        </Suspense>
        {children}
        <Toaster position="bottom-center" toastOptions={{ classNames: { toast: "!rounded-xl !bg-brown-900 !text-cream-100 !border-0 !font-sans", description: "!text-cream-100/70", actionButton: "!bg-transparent !text-orange-500 !font-semibold" } }} />
      </body>
    </html>
  );
}

