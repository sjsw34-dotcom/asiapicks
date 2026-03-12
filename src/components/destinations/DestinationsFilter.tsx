"use client";

import { useState, useMemo } from "react";
import DestinationCard from "@/components/cards/DestinationCard";
import type { CityData } from "@/types/destination";

interface FilterTheme {
  id: string;
  name: string;
}

interface FilterCountry {
  id: string;
  name: string;
  flag: string;
}

interface Props {
  cities: CityData[];
  themes: FilterTheme[];
  countries: FilterCountry[];
}

export default function DestinationsFilter({ cities, themes, countries }: Props) {
  const [activeTheme, setActiveTheme] = useState<string | null>(null);
  const [activeCountry, setActiveCountry] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return cities.filter((city) => {
      const matchTheme = !activeTheme || city.themes.includes(activeTheme);
      const matchCountry =
        !activeCountry || city.country.toLowerCase() === activeCountry;
      return matchTheme && matchCountry;
    });
  }, [cities, activeTheme, activeCountry]);

  return (
    <>
      {/* Country Filter */}
      <div className="flex flex-wrap gap-2 mb-3">
        <button
          onClick={() => setActiveCountry(null)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            !activeCountry
              ? "bg-primary text-white"
              : "border border-border text-text-secondary hover:border-primary hover:text-primary"
          }`}
        >
          All Countries
        </button>
        {countries.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveCountry(activeCountry === c.id ? null : c.id)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeCountry === c.id
                ? "bg-primary text-white"
                : "border border-border text-text-secondary hover:border-primary hover:text-primary"
            }`}
          >
            {c.flag} {c.name}
          </button>
        ))}
      </div>

      {/* Theme Filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setActiveTheme(null)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            !activeTheme
              ? "bg-secondary/20 text-secondary border border-secondary/40"
              : "border border-border text-text-secondary hover:border-secondary hover:text-secondary"
          }`}
        >
          All Themes
        </button>
        {themes.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTheme(activeTheme === t.id ? null : t.id)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeTheme === t.id
                ? "bg-secondary/20 text-secondary border border-secondary/40"
                : "border border-border text-text-secondary hover:border-secondary hover:text-secondary"
            }`}
          >
            {t.name}
          </button>
        ))}
      </div>

      {/* Result count */}
      <p className="text-sm text-text-secondary mb-6">
        {filtered.length} destination{filtered.length !== 1 ? "s" : ""} found
        {(activeCountry || activeTheme) && (
          <button
            onClick={() => {
              setActiveCountry(null);
              setActiveTheme(null);
            }}
            className="ml-3 text-primary hover:underline"
          >
            Clear filters
          </button>
        )}
      </p>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((city) => (
            <DestinationCard key={city.id} city={city} />
          ))}
        </div>
      ) : (
        <p className="text-center text-text-secondary py-20">
          No destinations match your filters.
        </p>
      )}
    </>
  );
}
