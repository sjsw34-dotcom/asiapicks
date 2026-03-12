import type { CityData } from "@/types/destination";

// Japan
import tokyoData from "@/data/destinations/japan/tokyo.json";
import osakaData from "@/data/destinations/japan/osaka.json";
import kyotoData from "@/data/destinations/japan/kyoto.json";
import fukuokaData from "@/data/destinations/japan/fukuoka.json";
import okinawaData from "@/data/destinations/japan/okinawa.json";

// Thailand
import bangkokData from "@/data/destinations/thailand/bangkok.json";
import chiangMaiData from "@/data/destinations/thailand/chiang-mai.json";
import phuketData from "@/data/destinations/thailand/phuket.json";
import pattayaData from "@/data/destinations/thailand/pattaya.json";

// South Korea
import seoulData from "@/data/destinations/korea/seoul.json";
import busanData from "@/data/destinations/korea/busan.json";
import jejuData from "@/data/destinations/korea/jeju.json";

// Vietnam
import hanoiData from "@/data/destinations/vietnam/hanoi.json";
import hoChiMinhData from "@/data/destinations/vietnam/ho-chi-minh.json";
import daNangData from "@/data/destinations/vietnam/da-nang.json";

const ALL_CITIES: CityData[] = [
  // Japan
  tokyoData as CityData,
  osakaData as CityData,
  kyotoData as CityData,
  fukuokaData as CityData,
  okinawaData as CityData,
  // Thailand
  bangkokData as CityData,
  chiangMaiData as CityData,
  phuketData as CityData,
  pattayaData as CityData,
  // South Korea
  seoulData as CityData,
  busanData as CityData,
  jejuData as CityData,
  // Vietnam
  hanoiData as CityData,
  hoChiMinhData as CityData,
  daNangData as CityData,
];

export function getAllCities(): CityData[] {
  return ALL_CITIES;
}

const toSlug = (s: string) => s.toLowerCase().replace(/\s+/g, "-");

export function getCityBySlug(country: string, city: string): CityData | null {
  return (
    ALL_CITIES.find(
      (c) =>
        toSlug(c.country) === country.toLowerCase() &&
        c.id === city.toLowerCase()
    ) ?? null
  );
}

export function getCitiesByCountry(country: string): CityData[] {
  return ALL_CITIES.filter(
    (c) => toSlug(c.country) === country.toLowerCase()
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
