import data from "@/data/legacy-urls.json";

export const LEGACY: { redirects: { from: string; to: string }[]; gonePrefixes: string[] } = data;

const redirectFroms = new Set(LEGACY.redirects.map((r) => r.from));

export function isGone(pathname: string, prefixes: string[] = LEGACY.gonePrefixes): boolean {
  const p = pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
  return prefixes.some((prefix) => p === prefix || p.startsWith(`${prefix}/`));
}

export function classifyLegacy(path: string, livePaths: Set<string>): "redirect" | "gone" | "live" | "unhandled" {
  if (redirectFroms.has(path)) return "redirect";
  if (livePaths.has(path)) return "live";
  if (isGone(path)) return "gone";
  return "unhandled";
}

export const GONE_HTML = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Page removed | AsiaPicks</title>
<meta name="robots" content="noindex"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:system-ui,sans-serif;max-width:40rem;margin:4rem auto;padding:0 1rem;color:#1E293B">
<h1>This page has been removed</h1>
<p>AsiaPicks now focuses on South Korea travel. Start here:</p>
<ul><li><a href="/korea">South Korea travel guide</a></li><li><a href="/korea/seoul">Seoul</a></li>
<li><a href="/korea/busan">Busan</a></li><li><a href="/korea/jeju">Jeju</a></li></ul></body></html>`;
