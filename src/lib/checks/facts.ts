import type { ContentIndex } from "@/lib/content/loader";
import type { Offer } from "@/lib/affiliates/offers";
import { result, rel } from "./types";
import { factsDue, factsExpiring, loadFacts, recheckBy, type Fact } from "@/lib/facts/registry";

const DAY = 86_400_000;
const age = (today: string, iso: string) => (Date.parse(`${today}T00:00:00Z`) - Date.parse(`${iso}T00:00:00Z`)) / DAY;

export const STALE_DAYS = 90;

export interface StaleItem {
  kind: "page" | "offer" | "fact";
  /** Page path for content, offer id for offers, fact id for facts. */
  path: string;
  /** Repo-relative file, for pages. */
  file?: string;
  title: string;
  source: string;
  checkedAt: string;
  days: number;
}

/**
 * The refresh worklist: every source whose last check has aged past the
 * threshold, oldest first, so the list is already in the order it should be
 * worked through.
 */
export interface StaticPageSources {
  slug: string;
  file: string;
  title: string;
  sources: { title: string; checkedAt: string; url?: string; publisher?: string }[];
}

export function staleItems(
  idx: ContentIndex,
  offers: Map<string, Offer>,
  today: string,
  days: number = STALE_DAYS,
  pages: StaticPageSources[] = [],
): StaleItem[] {
  const items: StaleItem[] = [];
  for (const p of pages) {
    for (const s of p.sources) {
      const d = age(today, s.checkedAt);
      if (d > days) {
        items.push({ kind: "page", path: `/${p.slug}`, file: p.file, title: p.title, source: s.title, checkedAt: s.checkedAt, days: d });
      }
    }
  }
  for (const n of [...idx.hubs, ...idx.articles]) {
    for (const s of n.fm.sources) {
      const d = age(today, s.checkedAt);
      if (d > days) {
        items.push({ kind: "page", path: n.path, file: rel(n.file), title: n.fm.title, source: s.title, checkedAt: s.checkedAt, days: d });
      }
    }
  }
  for (const o of offers.values()) {
    if (!o.priceCheckedAt) continue;
    const d = age(today, o.priceCheckedAt);
    if (d > days) {
      items.push({ kind: "offer", path: o.id, title: o.title ?? o.id, source: "price", checkedAt: o.priceCheckedAt, days: d });
    }
  }
  return items.sort((a, b) => b.days - a.days);
}

/** Registry facts past their recheck date. Each is one check, however many pages state it. */
export function staleFacts(today: string, facts: Map<string, Fact> = loadFacts()): StaleItem[] {
  return factsDue(facts, today).map((f) => ({
    kind: "fact" as const,
    path: f.id,
    file: rel(f.file),
    title: f.label,
    source: f.source.title,
    checkedAt: f.checkedAt,
    days: Math.round((Date.parse(`${today}T00:00:00Z`) - Date.parse(`${recheckBy(f)}T00:00:00Z`)) / 86_400_000),
  }));
}

export function factsCheck(
  idx: ContentIndex,
  offers: Map<string, Offer>,
  today: string,
  facts: Map<string, Fact> = loadFacts(),
  extraUsed: string[] = [],
) {
  const r = result("facts");
  for (const item of staleFacts(today, facts)) {
    r.warnings.push(`fact "${item.path}" (${item.file}): due for a check ${item.days} day(s) ago, last checked ${item.checkedAt}`);
  }
  for (const f of factsExpiring(facts, today)) {
    const passed = f.validUntil! < today;
    r.warnings.push(`fact "${f.id}": ${passed ? "stopped being true on" : "stops being true on"} ${f.validUntil}; reread every page using it`);
  }
  const used = new Set([...idx.hubs, ...idx.categories, ...idx.areas, ...idx.articles].flatMap((n) => n.facts).concat(extraUsed));
  for (const f of facts.values()) {
    if (!used.has(f.id)) r.warnings.push(`fact "${f.id}" (${rel(f.file)}) is not used by any page`);
  }
  for (const item of staleItems(idx, offers, today)) {
    r.warnings.push(
      item.kind === "offer"
        ? `offer "${item.path}": price checked ${item.checkedAt} (over ${STALE_DAYS} days)`
        : `${item.file}: source "${item.source}" checked ${item.checkedAt} (over ${STALE_DAYS} days)`,
    );
  }
  return r;
}
