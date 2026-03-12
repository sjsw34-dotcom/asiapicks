"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

const SLIDES = [
  {
    city: "Tokyo",
    country: "Japan",
    tagline: "Where ancient tradition meets neon-lit future",
    image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1800&q=80",
    credit: { name: "Timo Volz", link: "https://unsplash.com/@magict1910" },
  },
  {
    city: "Bangkok",
    country: "Thailand",
    tagline: "Golden temples, sizzling street food, electric nights",
    image: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=1800&q=80",
    credit: { name: "Florian Wehde", link: "https://unsplash.com/@florianwehde" },
  },
  {
    city: "Kyoto",
    country: "Japan",
    tagline: "Twelve hundred temples and an unhurried soul",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1800&q=80",
    credit: { name: "Sora Sagano", link: "https://unsplash.com/@sorasagano" },
  },
  {
    city: "Seoul",
    country: "South Korea",
    tagline: "K-culture, fried chicken, and the Han River at midnight",
    image: "https://images.unsplash.com/photo-1538485399081-7191377e8241?w=1800&q=80",
    credit: { name: "Mathew Schwartz", link: "https://unsplash.com/@cadop" },
  },
  {
    city: "Hanoi",
    country: "Vietnam",
    tagline: "Pho, scooters, and the ancient Old Quarter",
    image: "https://images.unsplash.com/photo-1557750255-c76072a7aad1?w=1800&q=80",
    credit: { name: "Ammie Ngo", link: "https://unsplash.com/@ammiengo" },
  },
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [query, setQuery] = useState("");
  const router = useRouter();

  const next = useCallback(
    () => setCurrent((c) => (c + 1) % SLIDES.length),
    []
  );

  useEffect(() => {
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [next]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/destinations?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push("/destinations");
    }
  }

  const slide = SLIDES[current];

  return (
    <section className="relative h-[90vh] min-h-[560px] max-h-[800px] overflow-hidden bg-slate-900">
      {/* Slides */}
      {SLIDES.map((s, i) => (
        <div
          key={s.city}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            i === current ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={s.image}
            alt={`${s.city}, ${s.country}`}
            fill
            className="object-cover"
            sizes="100vw"
            priority={i === 0}
          />
        </div>
      ))}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/70" />

      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
        {/* Location badge */}
        <div className="flex items-center gap-2 mb-4 animate-fade-in">
          <span className="text-white/70 text-sm font-medium uppercase tracking-widest">
            {slide.country}
          </span>
        </div>

        {/* City name */}
        <h1
          key={slide.city}
          className="text-5xl sm:text-6xl md:text-7xl font-bold font-heading text-white leading-none mb-4"
        >
          {slide.city}
        </h1>

        {/* Tagline */}
        <p className="text-white/80 text-lg md:text-xl max-w-xl mb-10 leading-relaxed">
          {slide.tagline}
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="w-full max-w-xl">
          <div className="flex rounded-2xl overflow-hidden shadow-2xl bg-white">
            <div className="flex items-center pl-5 text-text-secondary shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search destinations — Tokyo, Bangkok, Seoul..."
              className="flex-1 px-4 py-4 text-text-primary placeholder:text-text-secondary text-sm bg-transparent outline-none"
            />
            <button
              type="submit"
              className="shrink-0 m-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-sm font-medium transition-colors"
            >
              Explore
            </button>
          </div>
        </form>

        {/* Quick Links */}
        <div className="flex flex-wrap justify-center gap-3 mt-6">
          {["Japan", "Thailand", "South Korea", "Vietnam"].map((country) => (
            <a
              key={country}
              href={`/destinations/${country.toLowerCase().replace(/\s+/g, "-")}`}
              className="px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/30 text-white text-xs font-medium hover:bg-white/25 transition-colors"
            >
              {country}
            </a>
          ))}
        </div>
      </div>

      {/* Dot Navigation */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`rounded-full transition-all duration-300 ${
              i === current
                ? "bg-white w-6 h-2"
                : "bg-white/50 hover:bg-white/70 w-2 h-2"
            }`}
          />
        ))}
      </div>

      {/* Prev / Next arrows */}
      <button
        onClick={() => setCurrent((c) => (c - 1 + SLIDES.length) % SLIDES.length)}
        aria-label="Previous slide"
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm flex items-center justify-center text-white transition-colors"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
        </svg>
      </button>
      <button
        onClick={next}
        aria-label="Next slide"
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm flex items-center justify-center text-white transition-colors"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
        </svg>
      </button>

      {/* Photo credit */}
      <p className="absolute bottom-2 right-3 text-[10px] text-white/40">
        Photo:{" "}
        <a href={slide.credit.link} target="_blank" rel="noopener noreferrer" className="underline">
          {slide.credit.name}
        </a>{" "}
        / Unsplash
      </p>
    </section>
  );
}
