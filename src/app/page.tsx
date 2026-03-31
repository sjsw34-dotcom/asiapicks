import type { Metadata } from "next";
import HeroSlider from "@/components/home/HeroSlider";
import PopularDestinations from "@/components/home/PopularDestinations";
import ThemeCarousel from "@/components/home/ThemeCarousel";
import LatestPosts from "@/components/home/LatestPosts";
import SajuTravelBanner from "@/components/home/SajuTravelBanner";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://asiapicks.com";

export const metadata: Metadata = {
  title: "Asiapicks — Your Expert Guide to Asia Travel | Japan, Korea, Thailand, Vietnam",
  description:
    "Curated Asia travel guides, hotel deals, and itineraries. Expert tips for Japan, South Korea, Thailand, and Vietnam. Book the best hotels on Agoda & tours on Klook.",
  alternates: { canonical: BASE_URL },
  openGraph: {
    title: "Asiapicks — Your Expert Guide to Asia Travel",
    description:
      "Curated Asia travel guides, hotel deals, and itineraries. Expert tips for Japan, South Korea, Thailand, and Vietnam.",
    url: BASE_URL,
    type: "website",
    images: [
      {
        url: `${BASE_URL}/api/og?title=Asiapicks — Your Expert Guide to Asia Travel`,
        width: 1200,
        height: 630,
        alt: "Asiapicks",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Asiapicks — Your Expert Guide to Asia Travel",
    description:
      "Curated Asia travel guides, hotel deals, and itineraries. Expert tips for Japan, South Korea, Thailand, and Vietnam.",
  },
};

export default function HomePage() {
  return (
    <>
      {/* 1. Full-screen hero slider + search */}
      <HeroSlider />

      {/* 2. Popular destinations grid (8 cities) */}
      <PopularDestinations />

      {/* 3. Theme carousel (horizontal scroll) */}
      <ThemeCarousel />

      {/* 4. Latest blog posts */}
      <LatestPosts />

      {/* 5. Saju Travel Banner */}
      <SajuTravelBanner />
    </>
  );
}
