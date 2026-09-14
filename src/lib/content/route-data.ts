import type { Metadata } from "next";
import type { ContentIndex, ContentNode } from "./loader";
import { buildMetadata } from "@/lib/seo/metadata";
import { getImage } from "@/lib/images/registry";
import { absoluteUrl } from "@/lib/site";

export const countryParams = (idx: ContentIndex) =>
  idx.hubs.filter((h) => !h.city).map((h) => ({ country: h.country }));

export const segmentParams = (idx: ContentIndex) => [
  ...idx.hubs.filter((h) => h.city).map((h) => ({ country: h.country, segment: h.city! })),
  ...idx.categories.filter((c) => !c.city).map((c) => ({ country: c.country, segment: c.category })),
  ...idx.articles.filter((a) => !a.city).map((a) => ({ country: a.country, segment: a.fm.slug })),
];

export const slugParams = (idx: ContentIndex) => [
  ...idx.categories.filter((c) => c.city).map((c) => ({ country: c.country, segment: c.city!, slug: c.category })),
  ...idx.areas.map((a) => ({ country: a.country, segment: a.city, slug: a.area })),
  ...idx.articles.filter((a) => a.city).map((a) => ({ country: a.country, segment: a.city!, slug: a.fm.slug })),
];

export function metadataFor(node: ContentNode): Metadata {
  const title = node.fm.seoTitle ?? node.fm.title;
  const review = (node.kind === "article" || node.kind === "hub") && node.fm.status === "review";
  const noindex = review || (node.kind === "article" && node.fm.noindex);
  const imageId = node.kind === "category" ? undefined : node.fm.featuredImage;
  const imageUrl = imageId ? absoluteUrl(getImage(imageId).src) : undefined;
  return buildMetadata({
    title,
    description: node.fm.description,
    path: node.kind === "article" && node.fm.canonical ? new URL(node.fm.canonical).pathname : node.path,
    imageUrl,
    noindex,
    type: node.kind === "article" ? "article" : "website",
    publishedTime: node.kind === "article" ? node.fm.publishedAt : undefined,
    modifiedTime: node.kind === "article" ? node.fm.updatedAt : undefined,
  });
}
