"use client";

import { useState } from "react";
import HotelCard from "@/components/cards/HotelCard";
import AffiliateDisclosure from "@/components/affiliate/AffiliateDisclosure";
import type { Hotel } from "@/types/destination";

type Tab = "budget" | "mid-range" | "luxury";

interface HotelSectionProps {
  hotels: Hotel[];
  cityName: string;
}

const TAB_LABELS: { key: Tab; label: string }[] = [
  { key: "budget", label: "Budget" },
  { key: "mid-range", label: "Mid-Range" },
  { key: "luxury", label: "Luxury" },
];

export default function HotelSection({ hotels, cityName }: HotelSectionProps) {
  const [activeTab, setActiveTab] = useState<Tab>("mid-range");

  const filtered = hotels.filter((h) => h.tier === activeTab);
  const available = TAB_LABELS.filter((t) =>
    hotels.some((h) => h.tier === t.key)
  );

  return (
    <section className="mt-12">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold font-heading text-text-primary">
          Where to Stay in {cityName}
        </h2>
      </div>

      <AffiliateDisclosure variant="page" />

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-surface rounded-lg p-1 w-fit border border-border">
        {available.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === key
                ? "bg-white text-primary shadow-sm border border-border"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-text-secondary text-sm">
          No {activeTab} options listed yet.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((hotel) => (
            <HotelCard key={hotel.agodaHotelId} hotel={hotel} />
          ))}
        </div>
      )}
    </section>
  );
}
