export type Country = { slug: string; name: string; shortName: string };
export type City = { slug: string; country: string; name: string };
export type Category = { slug: string; label: string };
/** A neighbourhood inside a city. Articles tag it with `area`; its page exists once an intro and an article do. */
export type Area = { slug: string; country: string; city: string; name: string };

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

export const AREAS: Area[] = [
  { slug: "myeongdong", country: "korea", city: "seoul", name: "Myeongdong" },
  { slug: "jongno", country: "korea", city: "seoul", name: "Jongno and Insadong" },
  { slug: "hongdae", country: "korea", city: "seoul", name: "Hongdae" },
  { slug: "seongsu", country: "korea", city: "seoul", name: "Seongsu" },
  { slug: "gangnam", country: "korea", city: "seoul", name: "Gangnam" },
  { slug: "itaewon", country: "korea", city: "seoul", name: "Itaewon" },
  { slug: "dongdaemun", country: "korea", city: "seoul", name: "Dongdaemun" },
  { slug: "yeouido", country: "korea", city: "seoul", name: "Yeouido" },
  { slug: "jamsil", country: "korea", city: "seoul", name: "Jamsil" },
  { slug: "seomyeon", country: "korea", city: "busan", name: "Seomyeon" },
  { slug: "haeundae", country: "korea", city: "busan", name: "Haeundae" },
  { slug: "gwangalli", country: "korea", city: "busan", name: "Gwangalli" },
  { slug: "nampo-dong", country: "korea", city: "busan", name: "Nampo-dong and Busan Station" },
  { slug: "jeju-city", country: "korea", city: "jeju", name: "Jeju City" },
  { slug: "seogwipo", country: "korea", city: "jeju", name: "Seogwipo" },
  { slug: "aewol", country: "korea", city: "jeju", name: "Aewol" },
  { slug: "seongsan", country: "korea", city: "jeju", name: "Seongsan" },
  { slug: "hwangnidan-gil", country: "korea", city: "gyeongju", name: "Hwangnidan-gil and Daereungwon" },
  { slug: "bomun", country: "korea", city: "gyeongju", name: "Bomun Lake" },
];

export const getCountry = (slug: string) => COUNTRIES.find((c) => c.slug === slug);
export const getCity = (country: string, slug: string) =>
  CITIES.find((c) => c.country === country && c.slug === slug);
export const getCategory = (level: "country" | "city", slug: string) =>
  (level === "country" ? COUNTRY_CATEGORIES : CITY_CATEGORIES).find((c) => c.slug === slug);

export const getArea = (country: string, city: string, slug: string) =>
  AREAS.find((a) => a.country === country && a.city === city && a.slug === slug);
export const areasOf = (country: string, city: string) =>
  AREAS.filter((a) => a.country === country && a.city === city);

export function isReservedSegment(country: string, segment: string): boolean {
  return !!getCity(country, segment) || !!getCategory("country", segment);
}
