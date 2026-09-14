import type { ContentIndex } from "@/lib/content/loader";
import type { Offer } from "@/lib/affiliates/offers";
import { stripFences } from "@/lib/content/body";
import { rel } from "./types";
import { factsDue, loadFacts, recheckBy, type Fact } from "@/lib/facts/registry";

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
  /** Oldest source check on the page: the page is due when this reaches PAGE_RECHECK_DAYS. */
  lastChecked: string;
  dueBy: string;
}

/**
 * How often a page with inline volatile facts is re-verified. Rolling, not all at
 * once: each page comes up when its own oldest source reaches this age, so a
 * month's list is about a third of those pages instead of all of them.
 */
export const PAGE_RECHECK_DAYS = 90;

const addDays = (iso: string, days: number) => new Date(Date.parse(`${iso}T00:00:00Z`) + days * 86_400_000).toISOString().slice(0, 10);

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

export interface DueFact {
  fact: Fact;
  recheckBy: string;
  /** Pages that state the fact, so a changed value can be reread in context. */
  usedOn: string[];
}

/**
 * Pages to re-check this month, most volatile lines first, plus offers with a
 * recorded price and registry facts due within `factWindowDays`.
 *
 * Pages are scanned before fact tokens resolve: a line whose only volatile value
 * is a registry fact is checked once, as the fact, not again on every page.
 */
export function refreshList(
  idx: ContentIndex,
  offers: Map<string, Offer>,
  opts: { today?: string; factWindowDays?: number; facts?: Map<string, Fact>; extraUsage?: { path: string; facts: string[] }[] } = {},
  // With `today`, pages are listed only when due within `factWindowDays`; without it, every volatile page is listed.
) {
  const facts = opts.facts ?? loadFacts();
  const pages: RefreshPage[] = [];
  let notDue = 0;
  for (const n of [...idx.hubs, ...idx.articles]) {
    // A registry token (and a currency code written in front of it) is checked as a fact, not as a page line.
    const unresolved = `${n.raw.summary}\n${n.raw.faqs}\n${n.raw.body}`.replace(/(?:\bKRW\s*)?\{\{[^}]*\}\}/g, "");
    const { kinds, lines } = volatileLines(unresolved);
    if (lines.length === 0) continue;
    const checks = n.fm.sources.map((s) => s.checkedAt);
    const lastChecked = checks.length > 0 ? checks.sort()[0] : ("factCheckedAt" in n.fm && n.fm.factCheckedAt) || n.fm.updatedAt;
    const dueBy = addDays(lastChecked, PAGE_RECHECK_DAYS);
    if (opts.today && dueBy > addDays(opts.today, opts.factWindowDays ?? 31)) {
      notDue++;
      continue;
    }
    pages.push({
      lastChecked,
      dueBy,
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
  const usage = [...idx.hubs, ...idx.categories, ...idx.areas, ...idx.articles]
    .map((n) => ({ path: n.path, facts: n.facts }))
    .concat(opts.extraUsage ?? []);
  const dueFacts: DueFact[] = opts.today
    ? factsDue(facts, opts.today, opts.factWindowDays ?? 31).map((fact) => ({
        fact,
        recheckBy: recheckBy(fact),
        usedOn: usage.filter((u) => u.facts.includes(fact.id)).map((u) => u.path),
      }))
    : [];
  return { pages, pricedOffers, dueFacts, notDue };
}
