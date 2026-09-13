import path from "node:path";
import type { Article, ContentIndex, ContentNode } from "@/lib/content/loader";
import { categoryPath, hubPath } from "@/lib/content/paths";
import { absoluteUrl } from "@/lib/site";

/** Articles whose publish date is exactly this day: the ones a day's rebuild brings live. */
export const releasedOn = (idx: ContentIndex, date: string): Article[] =>
  idx.articles.filter((a) => a.fm.publishedAt === date);

/**
 * The pages a new or edited article changes on the live site: itself, the hubs
 * and category page that list it, and the home page's latest guides.
 */
export function affectedUrls(nodes: ContentNode[]): string[] {
  const paths = new Set<string>();
  for (const n of nodes) {
    paths.add(n.path);
    if (n.kind !== "article") continue;
    paths.add(hubPath(n.country));
    if (n.city) paths.add(hubPath(n.country, n.city));
    paths.add(categoryPath(n.country, n.city, n.fm.category));
  }
  if (nodes.some((n) => n.kind === "article")) paths.add("/");
  return [...paths].map(absoluteUrl);
}

/** Live hubs and articles behind a list of changed repo files (git diff --name-only output). */
export function nodesForFiles(idx: ContentIndex, files: string[], cwd = process.cwd()): ContentNode[] {
  const wanted = new Set(files.map((f) => path.resolve(cwd, f.trim())).filter(Boolean));
  return [...idx.hubs, ...idx.articles].filter((n) => wanted.has(path.resolve(n.file)));
}
