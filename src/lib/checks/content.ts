import type { ContentIndex } from "@/lib/content/loader";
import type { ImageEntry } from "@/lib/images/registry";
import type { Offer } from "@/lib/affiliates/offers";
import { parseIdList } from "@/lib/affiliates/offers";
import { isProviderHost } from "@/lib/affiliates/providers";
import { bookingCtaCount, hasMdxH1, stripFences } from "@/lib/content/body";
import { CITY_CATEGORIES, isReservedSegment } from "@/data/taxonomy";
import { hubPath } from "@/lib/content/paths";
import { result, rel } from "./types";

const ATTR = (name: string, attr: string) => new RegExp(`<${name}\\b[^>]*\\b${attr}="([^"]*)"`, "g");
const SEED = /SEED CONTENT/;
const URL_TOKEN = /(?:https?:)?\/\/[^\s)"'<>\]]+/gi;

export const bodyImageIds = (body: string) => [...body.matchAll(ATTR("Figure", "id"))].map((m) => m[1]);

export const bodyOfferIds = (body: string) => [
  ...[...body.matchAll(ATTR("Offer", "id"))].map((m) => m[1]),
  ...[...body.matchAll(ATTR("BookingCTA", "id"))].map((m) => m[1]),
  ...[...body.matchAll(ATTR("OfferList", "ids"))].flatMap((m) => parseIdList(m[1])),
  ...[...body.matchAll(ATTR("ComparisonTable", "ids"))].flatMap((m) => parseIdList(m[1])),
];

/** URLs in an MDX body (markdown links, hrefs, bare or protocol-relative) that point at an affiliate provider. */
export function providerUrlsIn(body: string): string[] {
  const found: string[] = [];
  for (const m of stripFences(body).matchAll(URL_TOKEN)) {
    const token = m[0];
    let host: string;
    try {
      host = new URL(token.startsWith("//") ? `https:${token}` : token).hostname;
    } catch {
      continue;
    }
    if (isProviderHost(host)) found.push(token);
  }
  return found;
}

export function contentCheck(
  idx: ContentIndex,
  images: Map<string, ImageEntry>,
  offers: Map<string, Offer>,
  production = false,
) {
  const r = result("content");
  const hubPaths = new Set(idx.hubs.map((h) => h.path));
  const catPaths = new Set(idx.categories.map((c) => c.path));

  const checkBody = (where: string, body: string, extraImageIds: (string | undefined)[] = [], extraOfferIds: string[] = []) => {
    for (const id of [...extraImageIds, ...bodyImageIds(body)]) if (id && !images.has(id)) r.errors.push(`${where}: unknown image "${id}"`);
    for (const id of [...extraOfferIds, ...bodyOfferIds(body)]) if (!offers.has(id)) r.errors.push(`${where}: unknown offer "${id}"`);
    for (const url of providerUrlsIn(body)) {
      r.errors.push(`${where}: provider URL ${url} in body (link providers only through Offer/OfferList/ComparisonTable/BookingCTA)`);
    }
  };

  for (const a of idx.articles) {
    const where = rel(a.file);
    if (!hubPaths.has(hubPath(a.country))) r.errors.push(`${where}: country hub ${hubPath(a.country)} is missing or not visible`);
    if (a.city && !hubPaths.has(hubPath(a.country, a.city))) r.errors.push(`${where}: city hub ${hubPath(a.country, a.city)} is missing or not visible`);
    const catPath = a.city ? `/${a.country}/${a.city}/${a.fm.category}` : `/${a.country}/${a.fm.category}`;
    if (!catPaths.has(catPath)) r.errors.push(`${where}: missing category intro _categories/${a.fm.category}.mdx for ${catPath}`);
    if (!a.city && isReservedSegment(a.country, a.fm.slug)) r.errors.push(`${where}: slug "${a.fm.slug}" collides with a city or country category`);
    if (a.city && CITY_CATEGORIES.some((c) => c.slug === a.fm.slug)) r.errors.push(`${where}: slug "${a.fm.slug}" collides with a city category`);
    if (a.fm.status === "published" && (SEED.test(a.body) || SEED.test(a.fm.summary))) r.errors.push(`${where}: seed content cannot be published`);
    if (hasMdxH1(a.body)) r.errors.push(`${where}: H1 in MDX body (the page renders the H1 from title)`);
    if (bookingCtaCount(a.body) > 1) r.errors.push(`${where}: more than one BookingCTA`);
    checkBody(where, a.body, [a.fm.featuredImage, ...a.fm.gallery], a.fm.offers);
  }

  for (const h of idx.hubs) {
    const where = rel(h.file);
    if (hasMdxH1(h.body)) r.errors.push(`${where}: H1 in MDX body`);
    if (h.fm.status === "published" && (SEED.test(h.body) || SEED.test(h.fm.summary))) r.errors.push(`${where}: seed content cannot be published`);
    checkBody(where, h.body, [h.fm.featuredImage]);
  }

  // Category intros have no status of their own; in production any seed text in a built category page is fatal.
  for (const c of idx.categories) {
    const where = rel(c.file);
    if (production && (SEED.test(c.fm.summary) || SEED.test(c.body))) r.errors.push(`${where}: seed content cannot be published`);
    checkBody(where, c.body);
  }

  for (const o of offers.values()) {
    if (o.image && !images.has(o.image)) r.errors.push(`offer "${o.id}": unknown image "${o.image}"`);
    if (production && (SEED.test(o.title) || SEED.test(o.summary))) r.errors.push(`offer "${o.id}": seed content cannot ship to production`);
  }
  return r;
}
