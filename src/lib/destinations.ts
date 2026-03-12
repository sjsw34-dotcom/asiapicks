import type { CityData } from "@/types/destination";

// --- Static imports for build-time SSG ---
import osakaData from "@/data/destinations/japan/osaka.json";
import tokyoData from "@/data/destinations/japan/tokyo.json";
import bangkokData from "@/data/destinations/thailand/bangkok.json";

const ALL_CITIES: CityData[] = [
  osakaData as CityData,
  tokyoData as CityData,
  bangkokData as CityData,
];

export function getAllCities(): CityData[] {
  return ALL_CITIES;
}

export function getCityBySlug(country: string, city: string): CityData | null {
  return (
    ALL_CITIES.find(
      (c) =>
        c.country.toLowerCase() === country.toLowerCase() &&
        c.id === city.toLowerCase()
    ) ?? null
  );
}

export function getCitiesByCountry(country: string): CityData[] {
  return ALL_CITIES.filter(
    (c) => c.country.toLowerCase() === country.toLowerCase()
  );
}

export function getCitiesByTheme(theme: string): CityData[] {
  return ALL_CITIES.filter((c) => c.themes.includes(theme));
}

export function getRelatedCities(city: CityData, limit = 3): CityData[] {
  return city.relatedCities
    .map((slug) => ALL_CITIES.find((c) => c.id === slug))
    .filter((c): c is CityData => c !== undefined)
    .slice(0, limit);
}

/** Returns [{country: 'japan', city: 'tokyo'}, ...] for generateStaticParams */
export function getAllCitySlugs(): { country: string; city: string }[] {
  return ALL_CITIES.map((c) => ({
    country: c.country.toLowerCase().replace(/\s+/g, "-"),
    city: c.id,
  }));
}
