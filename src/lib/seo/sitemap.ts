import type { ContentIndex } from "@/lib/content/loader";
import { STATIC_PAGES, getStaticPage } from "@/lib/content/pages";
import { absoluteUrl } from "@/lib/site";

export function buildSitemapEntries(idx: ContentIndex): { url: string; lastModified: string }[] {
  const latest = (dates: string[]) => dates.sort().at(-1) ?? "2026-09-12";
  const entries = [
    { url: absoluteUrl("/"), lastModified: latest(idx.articles.map((a) => a.fm.updatedAt).concat(idx.hubs.map((h) => h.fm.updatedAt))) },
    ...idx.hubs.map((h) => ({ url: absoluteUrl(h.path), lastModified: h.fm.updatedAt })),
    ...idx.categories.map((c) => ({ url: absoluteUrl(c.path), lastModified: latest(c.articles.map((a) => a.fm.updatedAt)) })),
    ...idx.articles.filter((a) => !a.fm.noindex && !a.fm.canonical).map((a) => ({ url: absoluteUrl(a.path), lastModified: a.fm.updatedAt })),
    ...STATIC_PAGES.map((slug) => ({ url: absoluteUrl(`/${slug}`), lastModified: getStaticPage(slug).fm.updatedAt })),
  ];
  return entries;
}
