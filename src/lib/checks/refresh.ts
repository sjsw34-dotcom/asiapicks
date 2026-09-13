import type { ContentIndex } from "@/lib/content/loader";
import type { Offer } from "@/lib/affiliates/offers";
import { stripFences } from "@/lib/content/body";
import { rel } from "./types";

/**
 * Facts that go out of date on their own: prices, timetables, opening hours and
 * dated events. A page carrying any of them is re-checked every month, however
 * recently its sources were checked, because operators change these without notice.
 */
export const VOLATILE_KINDS = {
  price: /₩\s?\d|\bKRW\b|\b\d{1,3}(?:,\d{3})+\s?won\b|\b\d+\s?won\b|\bUS\$\s?\d|\$\d/i,
  schedule: /\b(?:every|each)\s\d+\s?min|\bfirst (?:train|bus|ferry)|\blast (?:train|bus|ferry|entry|admission)|\btimetable|\bdepart(?:s|ures)?\b.*\d/i,
  hours: /\b\d{1,2}(?::\d{2})?\s?(?:a\.m\.|p\.m\.|am|pm)\b|\b\d{1,2}:\d{2}\s?(?:–|-|to)\s?\d{1,2}:\d{2}\b|\bopen(?:s|ing hours)?\s(?:from|until|daily|at|\d)|\bclosed on\b|\bopening hours\b/i,
  dated: /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s\d{1,2}\b|\b\d{1,2}\s(?:January|February|March|April|May|June|July|August|September|October|November|December)\b/,
} as const;

export type VolatileKind = keyof typeof VOLATILE_KINDS;

export interface RefreshPage {
  path: string;
  file: string;
  title: string;
  kinds: VolatileKind[];
  /** Body lines carrying a volatile fact, trimmed, so the checker sees what to re-verify. */
  lines: string[];
  sources: { title: string; url: string; checkedAt: string }[];
}

const CONTENT_LINE = (line: string) => {
  const t = line.trim();
  return t.length > 0 && !t.startsWith("<") && !t.startsWith("import ") && !/^\|[\s:-|]+\|$/.test(t);
};

export function volatileLines(body: string): { kinds: VolatileKind[]; lines: string[] } {
  const kinds = new Set<VolatileKind>();
  const lines: string[] = [];
  for (const line of stripFences(body).split("\n").filter(CONTENT_LINE)) {
    const hit = (Object.keys(VOLATILE_KINDS) as VolatileKind[]).filter((k) => VOLATILE_KINDS[k].test(line));
    if (hit.length === 0) continue;
    hit.forEach((k) => kinds.add(k));
    lines.push(line.trim());
  }
  return { kinds: [...kinds], lines };
}

/** Pages to re-check this month, most volatile lines first, plus offers with a recorded price. */
export function refreshList(idx: ContentIndex, offers: Map<string, Offer>) {
  const pages: RefreshPage[] = [];
  for (const n of [...idx.hubs, ...idx.articles]) {
    const summary = "summary" in n.fm ? n.fm.summary : "";
    const faqs = n.fm.faqs.map((f) => f.a).join("\n");
    const { kinds, lines } = volatileLines(`${summary}\n${faqs}\n${n.body}`);
    if (lines.length === 0) continue;
    pages.push({
      path: n.path,
      file: rel(n.file),
      title: n.fm.title,
      kinds,
      lines,
      sources: n.fm.sources.map((s) => ({ title: s.title, url: s.url, checkedAt: s.checkedAt })),
    });
  }
  pages.sort((a, b) => b.lines.length - a.lines.length || a.path.localeCompare(b.path));
  const pricedOffers = [...offers.values()].filter((o) => o.priceCheckedAt);
  return { pages, pricedOffers };
}
