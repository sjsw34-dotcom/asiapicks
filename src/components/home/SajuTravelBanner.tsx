import Link from "next/link";
import { getSajumuseLink } from "@/lib/affiliates";

const ELEMENTS = [
  { symbol: "木", name: "Wood", city: "Kyoto", color: "text-emerald-300" },
  { symbol: "火", name: "Fire", city: "Bangkok", color: "text-orange-300" },
  { symbol: "土", name: "Earth", city: "Chiang Mai", color: "text-yellow-300" },
  { symbol: "金", name: "Metal", city: "Tokyo", color: "text-slate-300" },
  { symbol: "水", name: "Water", city: "Hanoi", color: "text-cyan-300" },
];

export default function SajuTravelBanner() {
  const readingLink = getSajumuseLink("homepage-banner");

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-primary-dark to-slate-900 py-20 px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-8 left-1/4 text-[200px] font-bold text-white select-none">
          사주
        </div>
      </div>

      <div className="relative mx-auto max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left — Copy */}
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/80 text-xs font-medium tracking-wide mb-4">
              ✦ Saju × Travel
            </span>
            <h2 className="text-3xl md:text-4xl font-bold font-heading text-white leading-tight">
              What&apos;s Your{" "}
              <span className="text-primary-light">Travel Destiny?</span>
            </h2>
            <p className="mt-4 text-white/70 text-lg leading-relaxed">
              The ancient Korean art of Saju maps your birth elements to
              destinations that resonate with your energy. Some travelers feel
              at home in Tokyo. Others belong in Bangkok. Your chart knows why.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <a
                href={readingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-7 py-3.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-medium transition-colors"
              >
                Get My Saju Reading →
              </a>
              <Link
                href="/blog/saju-travel-guide-element"
                className="inline-flex items-center justify-center px-7 py-3.5 rounded-xl border border-white/30 text-white hover:bg-white/10 font-medium transition-colors"
              >
                Learn About Elements
              </Link>
            </div>
          </div>

          {/* Right — Element Grid */}
          <div className="grid grid-cols-5 gap-3">
            {ELEMENTS.map((el) => (
              <div
                key={el.name}
                className="flex flex-col items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-3 hover:bg-white/10 transition-colors cursor-default"
              >
                <span
                  className={`text-3xl font-bold font-heading ${el.color}`}
                >
                  {el.symbol}
                </span>
                <span className="text-white/60 text-[11px] font-medium">
                  {el.name}
                </span>
                <span className="text-white/40 text-[10px] text-center leading-tight">
                  {el.city}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
