export const hubPath = (country: string, city?: string | null) =>
  city ? `/${country}/${city}` : `/${country}`;

export const categoryPath = (country: string, city: string | null, category: string) =>
  city ? `/${country}/${city}/${category}` : `/${country}/${category}`;

export const articlePath = (country: string, city: string | null, slug: string) =>
  city ? `/${country}/${city}/${slug}` : `/${country}/${slug}`;

export const areaPath = (country: string, city: string, area: string) => `/${country}/${city}/${area}`;
