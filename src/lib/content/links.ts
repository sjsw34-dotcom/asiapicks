import type { Article, ContentIndex, ContentNode } from "./loader";

export const JOURNEY = ["discovery", "planning", "comparison", "booking", "on-trip"] as const;

const LINK_RE = /\]\((\/[^)\s#?]*)[^)]*\)|href="(\/[^"#?]*)[^"]*"/g;

const normalize = (p: string) => (p.length > 1 && p.endsWith("/") ? p.slice(0, -1) : p);

export function extractInternalLinks(body: string): string[] {
  const out = new Set<string>();
  for (const m of body.matchAll(LINK_RE)) {
    const raw = m[1] ?? m[2];
    if (raw && !raw.startsWith("//")) out.add(normalize(raw));
  }
  return [...out];
}

export function buildLinkGraph(idx: ContentIndex) {
  const graph = new Map<string, { out: string[]; in: string[] }>();
  const nodes: ContentNode[] = [...idx.hubs, ...idx.categories, ...idx.articles];
  for (const n of nodes) graph.set(n.path, { out: [], in: [] });
  for (const n of nodes) {
    const out = extractInternalLinks(n.body).filter((p) => p !== n.path);
    graph.get(n.path)!.out = out;
    for (const target of out) {
      const entry = graph.get(target);
      if (entry && !entry.in.includes(n.path)) entry.in.push(n.path);
    }
  }
  return graph;
}

function score(a: Article, b: Article): number {
  if (a.country !== b.country) return 0;
  if (a.city && a.city === b.city) return a.fm.category === b.fm.category ? 3 : 2;
  if (!a.city && !b.city) return a.fm.category === b.fm.category ? 2 : 1;
  return 1;
}

export function relatedArticles(a: Article, idx: ContentIndex, limit = 3): Article[] {
  const manual = a.fm.relatedArticles
    .map((p) => idx.byPath.get(p))
    .filter((n): n is Article => !!n && n.kind === "article" && n.path !== a.path);
  const scored = idx.articles
    .filter((b) => b.path !== a.path && !manual.includes(b))
    .map((b) => ({ b, s: score(a, b) }))
    .filter((x) => x.s > 0)
    .sort((x, y) => y.s - x.s || y.b.fm.updatedAt.localeCompare(x.b.fm.updatedAt))
    .map((x) => x.b);
  return [...manual, ...scored].slice(0, limit);
}

export function nextStep(a: Article, idx: ContentIndex): Article | null {
  const stage = JOURNEY.indexOf(a.fm.journeyStage);
  const candidates = idx.articles
    .filter((b) => b.path !== a.path && b.country === a.country && JOURNEY.indexOf(b.fm.journeyStage) > stage)
    .sort((x, y) => {
      const dx = JOURNEY.indexOf(x.fm.journeyStage) - stage;
      const dy = JOURNEY.indexOf(y.fm.journeyStage) - stage;
      const cx = x.city === a.city ? 0 : 1;
      const cy = y.city === a.city ? 0 : 1;
      return dx - dy || cx - cy || y.fm.updatedAt.localeCompare(x.fm.updatedAt);
    });
  return candidates[0] ?? null;
}
