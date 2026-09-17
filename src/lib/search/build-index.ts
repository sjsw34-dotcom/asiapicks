import type { ContentIndex, ContentNode } from "@/lib/content/loader";
import { headings } from "@/lib/content/body";
import { getCategory, getCity } from "@/data/taxonomy";
import { faqId, type SearchDoc, type SearchIndex } from "./query";

function label(n: ContentNode): string {
  const city = n.city ? getCity(n.country, n.city)?.name : null;
  if (n.kind === "hub") return city ? "City guide" : "Country guide";
  if (n.kind === "area") return `${city} · Neighbourhood`;
  const cat = getCategory(n.city ? "city" : "country", n.kind === "category" ? n.category : n.fm.category)?.label;
  if (n.kind === "category") return [city, "All guides"].filter(Boolean).join(" · ") || "All guides";
  return [city, cat].filter(Boolean).join(" · ");
}

/**
 * The search index is built from what the site shows now: `idx` must be the
 * production view (published, dated today or earlier), so a scheduled article
 * never appears in search before its release day.
 */
export function buildSearchIndex(idx: ContentIndex): SearchIndex {
  const nodes: ContentNode[] = [...idx.articles, ...idx.hubs, ...idx.categories, ...idx.areas];
  const docs: SearchDoc[] = nodes
    .filter((n) => !(n.kind === "article" && (n.fm.noindex || n.fm.canonical)))
    .map((n) => ({
      path: n.path,
      title: n.fm.title,
      label: label(n),
      summary: n.fm.summary,
      headings: headings(n.body).map((h) => h.text),
      keywords: n.kind === "article" ? [n.fm.primaryKeyword, ...n.fm.secondaryKeywords] : [],
      faqs: "faqs" in n.fm ? n.fm.faqs.map((f) => ({ q: f.q, a: f.a, id: faqId(f.q) })) : [],
    }));
  // Guides first: a hub repeats a guide's question, and the guide is the fuller answer.
  const rank = { article: 0, area: 1, hub: 2, category: 3 } as const;
  docs.sort((a, b) => rank[idx.byPath.get(a.path)!.kind] - rank[idx.byPath.get(b.path)!.kind]);
  return { docs };
}
