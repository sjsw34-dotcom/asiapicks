import type { ContentIndex } from "@/lib/content/loader";
import type { ImageEntry } from "@/lib/images/registry";
import type { Offer } from "@/lib/affiliates/offers";
import { parseIdList } from "@/lib/affiliates/offers";
import { bookingCtaCount, hasMdxH1 } from "@/lib/content/body";
import { CITY_CATEGORIES, isReservedSegment } from "@/data/taxonomy";
import { hubPath } from "@/lib/content/paths";
import { result, rel } from "./types";

const ATTR = (name: string, attr: string) => new RegExp(`<${name}\\b[^>]*\\b${attr}="([^"]*)"`, "g");

export function contentCheck(idx: ContentIndex, images: Map<string, ImageEntry>, offers: Map<string, Offer>) {
  const r = result("content");
  const hubPaths = new Set(idx.hubs.map((h) => h.path));
  const catPaths = new Set(idx.categories.map((c) => c.path));

  for (const a of idx.articles) {
    const where = rel(a.file);
    if (!hubPaths.has(hubPath(a.country))) r.errors.push(`${where}: country hub ${hubPath(a.country)} is missing or not visible`);
    if (a.city && !hubPaths.has(hubPath(a.country, a.city))) r.errors.push(`${where}: city hub ${hubPath(a.country, a.city)} is missing or not visible`);
    const catPath = a.city ? `/${a.country}/${a.city}/${a.fm.category}` : `/${a.country}/${a.fm.category}`;
    if (!catPaths.has(catPath)) r.errors.push(`${where}: missing category intro _categories/${a.fm.category}.mdx for ${catPath}`);
    if (!a.city && isReservedSegment(a.country, a.fm.slug)) r.errors.push(`${where}: slug "${a.fm.slug}" collides with a city or country category`);
    if (a.city && CITY_CATEGORIES.some((c) => c.slug === a.fm.slug)) r.errors.push(`${where}: slug "${a.fm.slug}" collides with a city category`);
    if (a.fm.status === "published" && /SEED CONTENT/.test(a.body)) r.errors.push(`${where}: seed content cannot be published`);
    if (hasMdxH1(a.body)) r.errors.push(`${where}: H1 in MDX body (the page renders the H1 from title)`);
    if (bookingCtaCount(a.body) > 1) r.errors.push(`${where}: more than one BookingCTA`);

    const imageIds = [a.fm.featuredImage, ...a.fm.gallery, ...[...a.body.matchAll(ATTR("Figure", "id"))].map((m) => m[1])].filter(Boolean) as string[];
    for (const id of imageIds) if (!images.has(id)) r.errors.push(`${where}: unknown image "${id}"`);

    const offerIds = [
      ...a.fm.offers,
      ...[...a.body.matchAll(ATTR("Offer", "id"))].map((m) => m[1]),
      ...[...a.body.matchAll(ATTR("BookingCTA", "id"))].map((m) => m[1]),
      ...[...a.body.matchAll(ATTR("OfferList", "ids"))].flatMap((m) => parseIdList(m[1])),
      ...[...a.body.matchAll(ATTR("ComparisonTable", "ids"))].flatMap((m) => parseIdList(m[1])),
    ];
    for (const id of offerIds) if (!offers.has(id)) r.errors.push(`${where}: unknown offer "${id}"`);
  }

  for (const h of idx.hubs) {
    if (h.fm.featuredImage && !images.has(h.fm.featuredImage)) r.errors.push(`${rel(h.file)}: unknown image "${h.fm.featuredImage}"`);
    if (hasMdxH1(h.body)) r.errors.push(`${rel(h.file)}: H1 in MDX body`);
    if (h.fm.status === "published" && /SEED CONTENT/.test(h.body)) r.errors.push(`${rel(h.file)}: seed content cannot be published`);
  }
  return r;
}
