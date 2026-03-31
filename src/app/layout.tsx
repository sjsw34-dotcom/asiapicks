import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import KlookSideBanner from "@/components/affiliate/KlookSideBanner";
import JsonLd from "@/components/common/JsonLd";
import { websiteSchema } from "@/lib/seo";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  display: "swap",
});

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://asiapicks.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Asiapicks — Your Expert Guide to Asia Travel | Japan, Korea, Thailand, Vietnam",
    template: "%s | Asiapicks",
  },
  description:
    "Curated Asia travel guides, hotel deals, and itineraries. Expert tips for Japan, South Korea, Thailand, and Vietnam. Book the best hotels on Agoda & tours on Klook.",
  keywords: [
    "Asia travel",
    "Japan travel guide",
    "Thailand travel",
    "Korea travel",
    "Vietnam travel",
    "Agoda hotels",
    "Klook activities",
    "Southeast Asia",
  ],
  authors: [{ name: "Asiapicks", url: BASE_URL }],
  creator: "Asiapicks",
  publisher: "Asiapicks",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Asiapicks",
    images: [
      {
        url: `${BASE_URL}/api/og?title=Asiapicks — Your Guide to Asia Travel`,
        width: 1200,
        height: 630,
        alt: "Asiapicks",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@asiapicks",
  },
  // Google Search Console — replace with actual code after verifying
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ?? "",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <JsonLd schema={websiteSchema()} />
        <meta name="agd-partner-manual-verification" />
      </head>
      <body className={`${inter.variable} ${plusJakartaSans.variable} antialiased`}>
        <Header />
        <div className="flex justify-center">
          <main className="min-h-screen flex-1 max-w-[1280px]">{children}</main>
          <KlookSideBanner />
        </div>
        <Footer />
      </body>
    </html>
  );
}
