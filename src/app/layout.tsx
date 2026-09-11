import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import JsonLd from "@/components/content/JsonLd";
import { SITE } from "@/lib/site";
import { organizationSchema, websiteSchema } from "@/lib/seo/schema";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const jakarta = Plus_Jakarta_Sans({ variable: "--font-plus-jakarta-sans", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.baseUrl),
  title: { default: `${SITE.name}: Asia travel planning, starting with South Korea`, template: `%s | ${SITE.name}` },
  description: SITE.tagline,
  applicationName: SITE.name,
  openGraph: { siteName: SITE.name, locale: SITE.locale, type: "website" },
  twitter: { card: "summary_large_image" },
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION } }
    : {}),
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${jakarta.variable} antialiased`}>
        <JsonLd data={[organizationSchema(), websiteSchema()]} />
        <Header />
        <main id="main" className="min-h-[60vh]">{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
