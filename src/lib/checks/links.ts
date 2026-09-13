import type { ContentIndex } from "@/lib/content/loader";
import { buildLinkGraph } from "@/lib/content/links";
import { hubPath } from "@/lib/content/paths";
import { result, rel } from "./types";

export function linksCheck(idx: ContentIndex, extraLivePaths: Set<string>) {
  const r = result("links");
  const graph = buildLinkGraph(idx);
  const nodes = [...idx.hubs, ...idx.categories, ...idx.articles];
  for (const n of nodes) {
    for (const target of graph.get(n.path)!.out) {
      if (!idx.byPath.has(target) && !extraLivePaths.has(target)) r.errors.push(`${rel(n.file)}: broken internal link ${target}`);
    }
  }
  const articlePaths = new Set(idx.articles.map((a) => a.path));
  // Every article joins the web of guides both ways, so a new piece is never a dead end
  // and never unreachable from the pieces already published.
  const minOut = Math.min(2, idx.articles.length - 1);
  const minIn = Math.min(1, idx.articles.length - 1);
  for (const a of idx.articles) {
    const { in: inbound, out } = graph.get(a.path)!;
    const outArticles = out.filter((p) => articlePaths.has(p)).length;
    const inArticles = inbound.filter((p) => articlePaths.has(p)).length;
    if (outArticles < minOut) r.errors.push(`${rel(a.file)}: links to ${outArticles} other article(s); link to at least ${minOut} (GuideCard or inline)`);
    if (inArticles < minIn) r.errors.push(`${rel(a.file)}: no other article links here; add a GuideCard or link from a related article`);
    if (inbound.length === 0) r.errors.push(`${rel(a.file)}: orphan article (no contextual link from any hub, category or article)`);
    const hub = hubPath(a.country, a.city);
    if (!out.includes(hub)) r.errors.push(`${rel(a.file)}: does not link to its hub ${hub}`);
  }
  return r;
}
