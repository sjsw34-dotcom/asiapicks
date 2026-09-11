import type { MetadataRoute } from "next";
import { loadContent } from "@/lib/content/loader";
import { buildSitemapEntries } from "@/lib/seo/sitemap";

export default function sitemap(): MetadataRoute.Sitemap {
  return buildSitemapEntries(loadContent({ includeReview: false }));
}
