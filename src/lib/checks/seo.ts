import type { ContentIndex } from "@/lib/content/loader";
import { result, rel } from "./types";

const SUFFIX = " | AsiaPicks".length;

export function seoCheck(idx: ContentIndex) {
  const r = result("seo");
  for (const n of [...idx.hubs, ...idx.categories, ...idx.articles]) {
    const title = n.fm.seoTitle ?? n.fm.title;
    const len = title.length + SUFFIX;
    if (len > 65 || len < 30) r.warnings.push(`${rel(n.file)}: title tag is ${len} chars (aim for 50-60): "${title}"`);
    const d = n.fm.description.length;
    if (d < 120 || d > 160) r.warnings.push(`${rel(n.file)}: meta description is ${d} chars (aim for 150-160)`);
  }
  return r;
}
