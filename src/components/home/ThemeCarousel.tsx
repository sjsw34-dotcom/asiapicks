"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";

const THEMES = [
  {
    id: "food",
    name: "Food & Culinary",
    description: "Street markets to Michelin stars",
    image: "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=600&q=80",
    color: "from-orange-600/80",
    icon: "🍜",
  },
  {
    id: "culture",
    name: "Culture & Heritage",
    description: "Temples, history, and living traditions",
    image: "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=600&q=80",
    color: "from-amber-700/80",
    icon: "🏛️",
  },
  {
    id: "beach",
    name: "Beach & Islands",
    description: "Crystal waters and white-sand shores",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80",
    color: "from-cyan-600/80",
    icon: "🏖️",
  },
  {
    id: "adventure",
    name: "Adventure & Outdoors",
    description: "Trekking, diving, and wild spaces",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80",
    color: "from-emerald-700/80",
    icon: "🏔️",
  },
  {
    id: "nightlife",
    name: "Nightlife",
    description: "Rooftop bars and electric city nights",
    image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=600&q=80",
    color: "from-purple-700/80",
    icon: "🌃",
  },
  {
    id: "budget",
    name: "Budget Travel",
    description: "Incredible Asia for under $50/day",
    image: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=600&q=80",
    color: "from-teal-700/80",
    icon: "💰",
  },
  {
    id: "luxury",
    name: "Luxury Getaways",
    description: "5-star hotels and private experiences",
    image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&q=80",
    color: "from-slate-700/80",
    icon: "✨",
  },
  {
    id: "family",
    name: "Family Travel",
    description: "Safe, fun, and memorable for all ages",
    image: "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=600&q=80",
    color: "from-pink-700/80",
    icon: "👨‍👩‍👧‍👦",
  },
];

export default function ThemeCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);

  function scroll(dir: "left" | "right") {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: dir === "right" ? 280 : -280,
      behavior: "smooth",
    });
  }

  return (
    <section className="py-16 bg-surface">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold font-heading text-text-primary">
              Travel by Theme
            </h2>
            <p className="mt-1 text-text-secondary">
              Find destinations that match your travel style
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => scroll("left")}
              aria-label="Scroll left"
              className="w-9 h-9 rounded-full border border-border bg-white flex items-center justify-center text-text-secondary hover:border-primary hover:text-primary transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
            </button>
            <button
              onClick={() => scroll("right")}
              aria-label="Scroll right"
              className="w-9 h-9 rounded-full border border-border bg-white flex items-center justify-center text-text-secondary hover:border-primary hover:text-primary transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scroll Track */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide snap-x snap-mandatory"
        >
          {THEMES.map((theme) => (
            <Link
              key={theme.id}
              href={`/destinations?theme=${theme.id}`}
              className="group relative shrink-0 w-52 h-64 rounded-2xl overflow-hidden snap-start"
            >
              <Image
                src={theme.image}
                alt={theme.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="208px"
              />
              <div
                className={`absolute inset-0 bg-gradient-to-t ${theme.color} to-transparent`}
              />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <span className="text-2xl mb-2 block" aria-hidden="true">
                  {theme.icon}
                </span>
                <h3 className="text-white font-semibold font-heading text-sm leading-tight">
                  {theme.name}
                </h3>
                <p className="text-white/70 text-xs mt-0.5 leading-snug">
                  {theme.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
