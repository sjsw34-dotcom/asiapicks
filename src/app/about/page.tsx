import { generatePageMetadata } from "@/lib/seo";
import { getSajumuseLink } from "@/lib/affiliates";
import Link from "next/link";

export const metadata = generatePageMetadata({
  title: "About Asiapicks — Asia Travel Guides & Affiliate Site",
  description:
    "Asiapicks is an independent Asia travel guide for English-speaking travelers. Expert city guides, hotel picks via Agoda, activities via Klook, and saju (Korean fortune) travel insights.",
  path: "/about",
});

const values = [
  {
    icon: "🗺️",
    title: "Honest, Independent Advice",
    body: "We only recommend places we'd actually visit. Hotel and activity picks are based on research and traveler reviews — never pay-to-play.",
  },
  {
    icon: "💰",
    title: "Transparent Affiliate Model",
    body: "We earn small commissions from Agoda and Klook when you book through our links. This is how we keep the site free — at no extra cost to you.",
  },
  {
    icon: "🌏",
    title: "Built for Western Travelers",
    body: "All guides are written for English-speaking travelers from the US, Europe, and Australia — with visa info, budget ranges in USD, and practical logistics.",
  },
  {
    icon: "✨",
    title: "East Meets West",
    body: "We blend modern travel planning with saju (Korean fortune-telling) insights — because sometimes your next trip is written in the stars.",
  },
];

const coverage = [
  { flag: "🇯🇵", country: "Japan", cities: ["Tokyo", "Osaka", "Kyoto"] },
  { flag: "🇹🇭", country: "Thailand", cities: ["Bangkok", "Chiang Mai"] },
  { flag: "🇰🇷", country: "South Korea", cities: ["Seoul", "Busan"] },
  { flag: "🇻🇳", country: "Vietnam", cities: ["Ho Chi Minh City", "Hanoi"] },
];

const partners = [
  {
    name: "Agoda",
    role: "Hotel Bookings",
    description:
      "One of Asia's largest hotel booking platforms. We use Agoda affiliate links for accommodation recommendations — it's where we'd book ourselves.",
    color: "text-primary",
    bg: "bg-teal-50 border-teal-200",
  },
  {
    name: "Klook",
    role: "Activities & Tours",
    description:
      "The leading Asia activities platform. Day trips, skip-the-line tickets, SIM cards, transport passes — all bookable in advance through Klook.",
    color: "text-secondary",
    bg: "bg-orange-50 border-orange-200",
  },
  {
    name: "Sajumuse",
    role: "Saju Travel Insights",
    description:
      "Our sister site offering Korean saju (四柱) readings for travelers. Discover which destinations align with your elemental energy.",
    color: "text-accent",
    bg: "bg-purple-50 border-purple-200",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-3xl md:text-4xl font-bold font-heading text-text-primary mb-4">
          About Asiapicks
        </h1>
        <p className="text-lg text-text-secondary leading-relaxed max-w-2xl">
          Asiapicks is an independent travel guide helping English-speaking travelers
          navigate the best of East and Southeast Asia — from booking the right hotel to
          finding hidden street food gems.
        </p>
      </div>

      {/* Mission */}
      <div className="bg-gradient-to-r from-primary/5 to-secondary/5 border border-border rounded-2xl p-6 md:p-8 mb-12">
        <h2 className="text-xl font-bold font-heading text-text-primary mb-3">
          Our Mission
        </h2>
        <p className="text-text-secondary leading-relaxed">
          We believe Asia is the world&apos;s most rewarding travel destination — but it can
          feel overwhelming to plan from scratch. Asiapicks exists to cut through the noise:
          clear itineraries, honest hotel picks, the best activity bookings, and a touch of
          ancient wisdom to help you choose your next destination.
        </p>
      </div>

      {/* Values */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold font-heading text-text-primary mb-6">
          What We Stand For
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {values.map((v) => (
            <div
              key={v.title}
              className="bg-surface border border-border rounded-xl p-5"
            >
              <span className="text-3xl block mb-3">{v.icon}</span>
              <h3 className="font-semibold font-heading text-text-primary mb-2">
                {v.title}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">{v.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Coverage */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold font-heading text-text-primary mb-2">
          Where We Cover
        </h2>
        <p className="text-text-secondary mb-6">
          Currently covering 4 countries with city-level guides — more destinations added regularly.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {coverage.map((c) => (
            <Link
              key={c.country}
              href={`/destinations/${c.country.toLowerCase().replace(/\s+/g, "-")}`}
              className="bg-white border border-border rounded-xl p-4 hover:shadow-md hover:border-primary transition-all group text-center"
            >
              <span className="text-4xl block mb-2">{c.flag}</span>
              <p className="font-semibold text-text-primary group-hover:text-primary text-sm">
                {c.country}
              </p>
              <p className="text-xs text-text-secondary mt-1">
                {c.cities.join(", ")}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Partners */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold font-heading text-text-primary mb-2">
          Our Partners
        </h2>
        <p className="text-text-secondary mb-6 text-sm">
          We work with trusted partners to bring you the best prices and experiences. Affiliate relationships are always disclosed.
        </p>
        <div className="space-y-4">
          {partners.map((p) => (
            <div
              key={p.name}
              className={`border rounded-xl p-5 ${p.bg}`}
            >
              <div className="flex items-start gap-3">
                <div>
                  <h3 className={`font-bold font-heading ${p.color}`}>{p.name}</h3>
                  <p className="text-xs text-text-secondary mb-1">{p.role}</p>
                  <p className="text-sm text-text-secondary leading-relaxed">{p.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Saju CTA */}
      <div className="bg-gradient-to-r from-accent/10 to-purple-100 border border-purple-200 rounded-2xl p-6 md:p-8 mb-8 text-center">
        <h3 className="text-xl font-bold font-heading text-text-primary mb-2">
          Discover Your Travel Destiny
        </h3>
        <p className="text-text-secondary text-sm mb-5 max-w-lg mx-auto">
          Saju is the ancient Korean art of reading your life path through birth date and time.
          Find out which Asian destination best matches your elemental energy.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <a
            href={getSajumuseLink("about-page")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-accent text-white px-6 py-3 rounded-xl font-semibold hover:bg-accent/90 transition-colors text-sm"
          >
            Get Your Saju Reading →
          </a>
          <Link
            href="/saju-travel"
            className="inline-flex items-center gap-2 border border-accent text-accent px-6 py-3 rounded-xl font-semibold hover:bg-accent/5 transition-colors text-sm"
          >
            Explore Saju × Travel
          </Link>
        </div>
      </div>

      {/* Contact / Legal */}
      <div className="text-center text-sm text-text-secondary">
        <p>
          Questions or partnership inquiries?{" "}
          <span className="text-primary">contact@asiapicks.com</span>
        </p>
        <p className="mt-2">
          <Link href="/affiliate-disclosure" className="hover:text-primary underline">
            Affiliate Disclosure
          </Link>
          {" · "}
          <Link href="/privacy" className="hover:text-primary underline">
            Privacy Policy
          </Link>
          {" · "}
          <Link href="/terms" className="hover:text-primary underline">
            Terms of Use
          </Link>
        </p>
      </div>
    </div>
  );
}
