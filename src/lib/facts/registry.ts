import fs from "node:fs";
import path from "node:path";
import { z } from "zod";

/**
 * The fact registry: every number, date or rule that more than one page states
 * lives here once, with its source and the date it was last checked. Pages write
 * `{{id}}` instead of the value, the loader swaps the value in, and a change is
 * one edit that every page picks up on the next build.
 *
 * Why it exists: the refresh load of a site that keeps publishing grows with its
 * page count, but the set of facts those pages repeat (a subway fare, a visa
 * deadline) stays small. Checking facts instead of pages keeps upkeep flat for
 * years, and a fact can no longer be fixed on one page and forgotten on eight.
 */

const isoDate = z.iso.date();

const valueSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("won"), amount: z.number().int().nonnegative() }),
  z.object({ type: z.literal("date"), date: isoDate }),
]);

export const FACT_KINDS = ["price", "schedule", "hours", "rule", "date"] as const;

/** Days between checks when a fact does not set its own `recheckDays`. */
export const RECHECK_DAYS: Record<(typeof FACT_KINDS)[number], number> = {
  price: 90,
  schedule: 90,
  hours: 90,
  rule: 180,
  date: 180,
};

export const factSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  label: z.string().min(1),
  kind: z.enum(FACT_KINDS),
  value: valueSchema,
  /** The value before the latest change, for sentences like "raised from X on Y". */
  previous: valueSchema.optional(),
  /** When the current value took effect. */
  since: isoDate.optional(),
  /** The fact stops being true after this date (a temporary exemption, a seasonal fare). */
  validUntil: isoDate.optional(),
  recheckDays: z.number().int().positive().optional(),
  source: z.object({ title: z.string().min(1), url: z.url(), publisher: z.string().min(1) }),
  checkedAt: isoDate,
  /** Last date the value changed on this site. Pages using the fact inherit it as their updatedAt. */
  updatedAt: isoDate,
  note: z.string().optional(),
});

export type Fact = z.infer<typeof factSchema> & { file: string };
export type FactValue = z.infer<typeof valueSchema>;

const DEFAULT_DIR = path.join(process.cwd(), "src/data/facts");
const cache = new Map<string, Map<string, Fact>>();

export function loadFacts(dir: string = DEFAULT_DIR): Map<string, Fact> {
  const hit = cache.get(dir);
  if (hit) return hit;
  const map = new Map<string, Fact>();
  const walk = (d: string) => {
    if (!fs.existsSync(d)) return;
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith(".json")) readFile(full, map);
    }
  };
  walk(dir);
  cache.set(dir, map);
  return map;
}

function readFile(file: string, map: Map<string, Fact>) {
  let json: unknown;
  try {
    json = JSON.parse(fs.readFileSync(file, "utf-8"));
  } catch (err) {
    throw new Error(`Invalid JSON in fact file ${file}: ${(err as Error).message}`);
  }
  if (!Array.isArray(json)) throw new Error(`Fact file ${file} must be a JSON array`);
  json.forEach((raw, i) => {
    const parsed = factSchema.safeParse(raw);
    if (!parsed.success) {
      const issues = parsed.error.issues.map((x) => `${x.path.join(".")}: ${x.message}`).join("; ");
      throw new Error(`Invalid fact #${i} in ${file}: ${issues}`);
    }
    if (map.has(parsed.data.id)) throw new Error(`Duplicate fact id "${parsed.data.id}" in ${file}`);
    map.set(parsed.data.id, { ...parsed.data, file });
  });
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** "2026-12-31" -> "31 December 2026", the date style the site writes in prose. */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

export function formatValue(v: FactValue, format?: "number"): string {
  if (v.type === "date") return formatDate(v.date);
  const n = v.amount.toLocaleString("en-US");
  return format === "number" ? n : `${n} won`;
}

/**
 * `{{id}}` the value, `{{id|number}}` the bare number, `{{id.previous}}` the value
 * before the last change, `{{id.since}}` the date the value took effect.
 */
export const FACT_TOKEN = /\{\{\s*([a-z0-9]+(?:-[a-z0-9]+)*)(?:\.(previous|since))?(?:\|(number))?\s*\}\}/g;

export function resolveFacts(text: string, facts: Map<string, Fact>, where: string, used?: Set<string>): string {
  return text.replace(FACT_TOKEN, (token, id: string, field?: "previous" | "since", format?: "number") => {
    const fact = facts.get(id);
    if (!fact) throw new Error(`Unknown fact "${id}" in ${where} (${token})`);
    used?.add(id);
    if (field === "since") {
      if (!fact.since) throw new Error(`Fact "${id}" has no "since" date, used in ${where}`);
      return formatDate(fact.since);
    }
    if (field === "previous") {
      if (!fact.previous) throw new Error(`Fact "${id}" has no "previous" value, used in ${where}`);
      return formatValue(fact.previous, format);
    }
    return formatValue(fact.value, format);
  });
}

/** Every string inside a parsed frontmatter object resolved, except `sources`, whose titles quote the publisher verbatim. */
export function resolveDeep<T>(data: T, facts: Map<string, Fact>, where: string, used: Set<string>): T {
  const walk = (v: unknown, key?: string): unknown => {
    if (key === "sources") return v;
    if (typeof v === "string") return resolveFacts(v, facts, where, used);
    if (Array.isArray(v)) return v.map((x) => walk(x));
    if (v && typeof v === "object" && !(v instanceof Date)) {
      return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, walk(x, k)]));
    }
    return v;
  };
  return walk(data) as T;
}

const DAY = 86_400_000;
const daysBetween = (from: string, to: string) => (Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / DAY;

/** The date a fact is next due for a check. */
export function recheckBy(f: Fact): string {
  const days = f.recheckDays ?? RECHECK_DAYS[f.kind];
  return new Date(Date.parse(`${f.checkedAt}T00:00:00Z`) + days * DAY).toISOString().slice(0, 10);
}

/** Facts due for a check within `withinDays` of today, soonest first. */
export function factsDue(facts: Map<string, Fact>, today: string, withinDays = 0): Fact[] {
  return [...facts.values()]
    .filter((f) => daysBetween(today, recheckBy(f)) <= withinDays)
    .sort((a, b) => recheckBy(a).localeCompare(recheckBy(b)));
}

/** Facts whose validUntil has passed or falls within `withinDays`: the page text will soon be wrong by itself. */
export function factsExpiring(facts: Map<string, Fact>, today: string, withinDays = 60): Fact[] {
  return [...facts.values()]
    .filter((f) => f.validUntil && daysBetween(today, f.validUntil) <= withinDays)
    .sort((a, b) => a.validUntil!.localeCompare(b.validUntil!));
}

/** Sources a page shows: its own, then those of the facts it uses, without repeating a URL. */
export function withFactSources<S extends { url: string }>(
  own: S[],
  factIds: string[],
  facts: Map<string, Fact> = loadFacts(),
): (S | { title: string; url: string; publisher: string; checkedAt: string })[] {
  const out: (S | { title: string; url: string; publisher: string; checkedAt: string })[] = [...own];
  const seen = new Set(own.map((s) => s.url));
  for (const id of factIds) {
    const f = facts.get(id);
    if (!f || seen.has(f.source.url)) continue;
    seen.add(f.source.url);
    out.push({ ...f.source, checkedAt: f.checkedAt });
  }
  return out;
}
