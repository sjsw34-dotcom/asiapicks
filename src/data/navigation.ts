import { CITIES } from "./taxonomy";

/**
 * Every internal link hardcoded in site-wide chrome (header, footer, 404, 410).
 * `npm run check` verifies each href is a live page (navigationCheck): ERROR in production, WARNING otherwise.
 */
export type NavLink = { href: string; label: string };
export type NavLinkGroup = { name: string; links: NavLink[] };

const guideCities = CITIES.filter((c) => c.slug !== "incheon");

export const HEADER_NAV: NavLink[] = [
  { href: "/korea", label: "South Korea" },
  ...guideCities.map((c) => ({ href: `/korea/${c.slug}`, label: c.name })),
  { href: "/korea/planning", label: "Plan Your Trip" },
];

export const FOOTER_DESTINATIONS: NavLink[] = [
  { href: "/korea", label: "South Korea travel guide" },
  ...guideCities.map((c) => ({ href: `/korea/${c.slug}`, label: `${c.name} travel guide` })),
];

export const FOOTER_TRUST: NavLink[] = [
  { href: "/about", label: "About" },
  { href: "/editorial-policy", label: "Editorial Policy" },
  { href: "/how-we-choose", label: "How We Choose Recommendations" },
  { href: "/affiliate-disclosure", label: "Affiliate Disclosure" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export const NOT_FOUND_LINKS: NavLink[] = [
  { href: "/korea", label: "South Korea" },
  { href: "/korea/seoul", label: "Seoul" },
  { href: "/korea/busan", label: "Busan" },
  { href: "/korea/jeju", label: "Jeju" },
];

/** Links on the 410 "page removed" response served by src/proxy.ts (GONE_HTML). */
export const GONE_PAGE_LINKS: NavLink[] = [
  { href: "/korea", label: "South Korea travel guide" },
  { href: "/korea/seoul", label: "Seoul" },
  { href: "/korea/busan", label: "Busan" },
  { href: "/korea/jeju", label: "Jeju" },
];

export const SITE_LINK_GROUPS: NavLinkGroup[] = [
  { name: "header", links: HEADER_NAV },
  { name: "footer destinations", links: FOOTER_DESTINATIONS },
  { name: "footer trust pages", links: FOOTER_TRUST },
  { name: "404 page", links: NOT_FOUND_LINKS },
  { name: "410 page", links: GONE_PAGE_LINKS },
];
