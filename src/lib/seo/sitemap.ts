import type { ContentIndex } from "@/lib/content/loader";
import { STATIC_PAGES, getStaticPage } from "@/lib/content/pages";
import { absoluteUrl } from "@/lib/site";

export function buildSitemapEntries(idx: ContentIndex): { url: string; lastModified: string }[] {
  const latest = (dates: string[]) => dates.sort().at(-1) ?? "2026-09-12";
  const entries = [
    { url: absoluteUrl("/"), lastModified: latest(idx.articles.map((a) => a.fm.updatedAt).concat(idx.hubs.map((h) => h.fm.updatedAt))) },
    ...idx.hubs.map((h) => ({ url: absoluteUrl(h.path), lastModified: h.fm.updatedAt })),
    // Only pages Google should index: noindex listings and 301ed listings (absent from idx) stay out.
    ...idx.categories.filter((c) => !c.fm.noindex).map((c) => ({ url: absoluteUrl(c.path), lastModified: latest(c.articles.map((a) => a.fm.updatedAt)) })),
    ...idx.areas.filter((a) => !a.fm.noindex).map((a) => ({ url: absoluteUrl(a.path), lastModified: latest(a.articles.map((x) => x.fm.updatedAt)) })),
    ...idx.articles.filter((a) => !a.fm.noindex && !a.fm.canonical).map((a) => ({ url: absoluteUrl(a.path), lastModified: a.fm.updatedAt })),
    ...STATIC_PAGES.map((slug) => ({ url: absoluteUrl(`/${slug}`), lastModified: getStaticPage(slug).fm.updatedAt })),
  ];
  return entries;
}
