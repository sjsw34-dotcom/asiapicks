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
  for (const a of idx.articles) {
    const { in: inbound, out } = graph.get(a.path)!;
    if (inbound.length === 0) r.errors.push(`${rel(a.file)}: orphan article (no contextual link from any hub, category or article)`);
    const hub = hubPath(a.country, a.city);
    if (!out.includes(hub)) r.errors.push(`${rel(a.file)}: does not link to its hub ${hub}`);
  }
  return r;
}
