import Link from "next/link";
import { generatePageMetadata } from "@/lib/seo";
import { getSajumuseLink } from "@/lib/affiliates";
import { getMDXPostsByCategory } from "@/lib/mdx";
import ElementDestinations from "@/components/saju/ElementDestinations";
import BlogPostCard from "@/components/cards/BlogPostCard";

export const metadata = generatePageMetadata({
  title: "Astrology Travel: Find Your Perfect Asia Destination by Birth Element",
  description:
    "Discover which Asian city matches your energy using Korean Saju astrology. A fresh alternative to zodiac travel — Wood to Kyoto, Fire to Bangkok, Water to Bali.",
  path: "/saju-travel",
});

export default function SajuTravelPage() {
  const sajuPosts = getMDXPostsByCategory("saju-travel");
  const readingLink = getSajumuseLink("saju-travel-page");

  return (
    <>
      {/* ── Hero ──────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-[#0c1f1a] to-slate-900 py-24 md:py-32 px-4">
        {/* Decorative Chinese characters */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
          aria-hidden="true"
        >
          <span className="text-[28vw] font-bold font-heading text-white/[0.03] leading-none">
            運命
          </span>
        </div>

        <div className="relative mx-auto max-w-4xl text-center">
          {/* Eyebrow */}
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/40 bg-primary/10 text-primary-light text-sm font-medium mb-6">
            <span>✦</span> Saju × Travel
          </span>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-heading text-white leading-tight">
            Travel According to{" "}
            <span className="text-primary-light">Your Destiny</span>
          </h1>

          <p className="mt-6 text-lg md:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
            Saju (사주) — Korea's ancient Four Pillars of Destiny — encodes your
            birth moment into five elemental energies. Those energies shape not
            just who you are, but which places on earth will resonate most
            deeply with your soul.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={readingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-medium transition-colors"
            >
              🔮 Get My Free Saju Reading
            </a>
            <a
              href="#elements"
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl border border-white/25 text-white hover:bg-white/10 font-medium transition-colors"
            >
              Explore the Five Elements ↓
            </a>
          </div>

          {/* Five elements preview bar */}
          <div className="mt-14 grid grid-cols-5 gap-3 max-w-lg mx-auto">
            {[
              { symbol: "木", name: "Wood", color: "text-emerald-400" },
              { symbol: "火", name: "Fire", color: "text-orange-400" },
              { symbol: "土", name: "Earth", color: "text-amber-400" },
              { symbol: "金", name: "Metal", color: "text-slate-300" },
              { symbol: "水", name: "Water", color: "text-cyan-400" },
            ].map((el) => (
              <div
                key={el.name}
                className="flex flex-col items-center gap-1.5 bg-white/5 border border-white/10 rounded-xl py-4 px-2"
              >
                <span className={`text-2xl font-bold font-heading ${el.color}`}>
                  {el.symbol}
                </span>
                <span className="text-white/50 text-[11px]">{el.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What is Saju? ─────────────────────────────── */}
      <section className="bg-surface border-b border-border">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: "📅",
              title: "Four Pillars",
              desc: "Your birth year, month, day, and hour each hold a heavenly stem and earthly branch — four pillars encoding your elemental blueprint.",
            },
            {
              icon: "⚖️",
              title: "Five Elements",
              desc: "Wood, Fire, Earth, Metal, and Water each resonate with specific landscapes, climates, and travel experiences.",
            },
            {
              icon: "🗺️",
              title: "Your Destination",
              desc: "The city that feels like home on first arrival, the landscape that energizes instead of drains — your chart points there.",
            },
          ].map((item) => (
            <div key={item.title} className="text-center">
              <span className="text-3xl">{item.icon}</span>
              <h3 className="mt-3 font-semibold font-heading text-text-primary">
                {item.title}
              </h3>
              <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Element Destinations ──────────────────────── */}
      <div id="elements">
        <ElementDestinations />
      </div>

      {/* ── Personalized Reading CTA ──────────────────── */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="rounded-2xl bg-gradient-to-br from-primary to-primary-dark p-10 md:p-14 text-center text-white relative overflow-hidden">
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
            aria-hidden="true"
          >
            <span className="text-[180px] font-bold font-heading text-white/5 leading-none">
              사주
            </span>
          </div>
          <div className="relative">
            <span className="inline-block px-3 py-1 rounded-full bg-white/15 border border-white/25 text-white/80 text-xs font-medium mb-4">
              Powered by sajumuse.com
            </span>
            <h2 className="text-2xl md:text-3xl font-bold font-heading leading-snug">
              Get Your Personalized Saju Travel Reading
            </h2>
            <p className="mt-4 text-white/75 max-w-lg mx-auto leading-relaxed">
              Your full chart reveals which destinations align with your
              dominant elements, the best travel years ahead, and the places
              to avoid during low-energy cycles.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={readingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl bg-white text-primary font-semibold hover:bg-white/90 transition-colors"
              >
                Start My Free Reading →
              </a>
              <Link
                href="/blog/saju-travel-guide-element"
                className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl border border-white/30 text-white hover:bg-white/10 font-medium transition-colors"
              >
                Read the Element Guide
              </Link>
            </div>
            <p className="mt-5 text-white/40 text-xs">
              Free mini reading available · No account required
            </p>
          </div>
        </div>
      </section>

      {/* ── Saju Travel Blog Posts ────────────────────── */}
      {sajuPosts.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-20">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-xl md:text-2xl font-bold font-heading text-text-primary">
                Saju Travel Articles
              </h2>
              <p className="mt-1 text-text-secondary text-sm">
                The intersection of Korean destiny and Asian travel
              </p>
            </div>
            <Link
              href="/blog/category/saju-travel"
              className="hidden sm:inline-flex text-sm font-medium text-primary hover:text-primary-dark transition-colors"
            >
              View all →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sajuPosts.map((post) => (
              <BlogPostCard
                key={post.slug}
                post={{
                  slug: post.slug,
                  title: post.frontmatter.title,
                  description: post.frontmatter.description,
                  category: post.frontmatter.category,
                  image: post.frontmatter.image ?? null,
                  read_time: post.frontmatter.readTime,
                  published_at: post.frontmatter.date,
                  id: 0,
                  city: post.frontmatter.city ?? null,
                  country: post.frontmatter.country ?? null,
                  tags: post.frontmatter.tags,
                  content: "",
                  updated_at: post.frontmatter.date,
                }}
              />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
