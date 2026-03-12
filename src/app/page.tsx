import type { Metadata } from "next";
import HeroSlider from "@/components/home/HeroSlider";
import PopularDestinations from "@/components/home/PopularDestinations";
import ThemeCarousel from "@/components/home/ThemeCarousel";
import LatestPosts from "@/components/home/LatestPosts";
import SajuTravelBanner from "@/components/home/SajuTravelBanner";

export const metadata: Metadata = {
  title: "Asiapicks — Your Guide to Asia Travel",
  description:
    "Discover the best destinations, hotels, and activities across Southeast & East Asia. Expert travel guides, curated itineraries, and exclusive deals on Agoda and Klook.",
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
