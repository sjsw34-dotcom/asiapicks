export type Country = { slug: string; name: string; shortName: string };
export type City = { slug: string; country: string; name: string };
export type Category = { slug: string; label: string };

export const COUNTRIES: Country[] = [{ slug: "korea", name: "South Korea", shortName: "Korea" }];

export const CITIES: City[] = [
  { slug: "seoul", country: "korea", name: "Seoul" },
  { slug: "busan", country: "korea", name: "Busan" },
  { slug: "jeju", country: "korea", name: "Jeju" },
  { slug: "gyeongju", country: "korea", name: "Gyeongju" },
  { slug: "incheon", country: "korea", name: "Incheon" },
];

export const COUNTRY_CATEGORIES: Category[] = [
  { slug: "planning", label: "Planning" },
  { slug: "transportation", label: "Transportation" },
  { slug: "itineraries", label: "Itineraries" },
  { slug: "experiences", label: "Experiences" },
];

export const CITY_CATEGORIES: Category[] = [
  { slug: "things-to-do", label: "Things to Do" },
  { slug: "where-to-stay", label: "Where to Stay" },
  { slug: "day-trips", label: "Day Trips" },
  { slug: "food", label: "Food" },
  { slug: "transportation", label: "Transportation" },
  { slug: "itineraries", label: "Itineraries" },
  { slug: "tours", label: "Tours" },
  { slug: "attractions", label: "Attractions" },
];

export const getCountry = (slug: string) => COUNTRIES.find((c) => c.slug === slug);
export const getCity = (country: string, slug: string) =>
  CITIES.find((c) => c.country === country && c.slug === slug);
export const getCategory = (level: "country" | "city", slug: string) =>
  (level === "country" ? COUNTRY_CATEGORIES : CITY_CATEGORIES).find((c) => c.slug === slug);

export function isReservedSegment(country: string, segment: string): boolean {
  return !!getCity(country, segment) || !!getCategory("country", segment);
}
