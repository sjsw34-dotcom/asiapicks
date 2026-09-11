const BASE_URL = "https://asiapicks.com";

export const SITE = {
  name: "AsiaPicks",
  description: "AsiaPicks, an Asia travel discovery and planning website",
  tagline: "Plan your Asia trip with answers checked against official sources, starting with South Korea.",
  baseUrl: BASE_URL,
  contactEmail: process.env.CONTACT_EMAIL?.trim() || null,
  locale: "en_US",
} as const;

export function absoluteUrl(path: string): string {
  if (path === "/" || path === "") return SITE.baseUrl;
  return `${SITE.baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}
