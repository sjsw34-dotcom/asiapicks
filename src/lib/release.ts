import path from "node:path";
import type { Article, ContentIndex, ContentNode } from "@/lib/content/loader";
import { areaPath, categoryPath, hubPath } from "@/lib/content/paths";
import { absoluteUrl } from "@/lib/site";
import { loadFacts, type Fact } from "@/lib/facts/registry";

/** Articles whose publish date is exactly this day: the ones a day's rebuild brings live. */
export const releasedOn = (idx: ContentIndex, date: string): Article[] =>
  idx.articles.filter((a) => a.fm.publishedAt === date);

/**
 * The pages a new or edited article changes on the live site: itself, the hubs,
 * category and neighbourhood pages that list it, and the home page's latest guides.
 */
export function affectedUrls(nodes: ContentNode[]): string[] {
  const paths = new Set<string>();
  for (const n of nodes) {
    paths.add(n.path);
    if (n.kind !== "article") continue;
    paths.add(hubPath(n.country));
    if (n.city) paths.add(hubPath(n.country, n.city));
    paths.add(categoryPath(n.country, n.city, n.fm.category));
    if (n.city && n.fm.area) paths.add(areaPath(n.country, n.city, n.fm.area));
  }
  if (nodes.some((n) => n.kind === "article")) paths.add("/");
  return [...paths].map(absoluteUrl);
}

/**
 * Live hubs and articles behind a list of changed repo files (git diff --name-only
 * output). A changed fact file counts for every page using a fact defined in it.
 */
export function nodesForFiles(idx: ContentIndex, files: string[], cwd = process.cwd(), facts: Map<string, Fact> = loadFacts()): ContentNode[] {
  const wanted = new Set(files.map((f) => f.trim()).filter(Boolean).map((f) => path.resolve(cwd, f)));
  const changedFacts = new Set([...facts.values()].filter((f) => wanted.has(path.resolve(f.file))).map((f) => f.id));
  return [...idx.hubs, ...idx.articles].filter((n) => wanted.has(path.resolve(n.file)) || n.facts.some((id) => changedFacts.has(id)));
}

/** The posting target: one approved article goes live every day. */
export const POSTS_PER_DAY = 1;

/**
 * Days in [from, to] (inclusive, YYYY-MM-DD) with no article going live, counting
 * both live articles and approved ones still scheduled. These are the slots a
 * drafting session fills.
 */
export function openDays(idx: ContentIndex, from: string, to: string): string[] {
  const taken = new Map<string, number>();
  for (const a of idx.articles) taken.set(a.fm.publishedAt, (taken.get(a.fm.publishedAt) ?? 0) + 1);
  for (const d of idx.scheduled.values()) taken.set(d, (taken.get(d) ?? 0) + 1);
  const days: string[] = [];
  for (let t = Date.parse(`${from}T00:00:00Z`); t <= Date.parse(`${to}T00:00:00Z`); t += 86_400_000) {
    const d = new Date(t).toISOString().slice(0, 10);
    if ((taken.get(d) ?? 0) < POSTS_PER_DAY) days.push(d);
  }
  return days;
}
