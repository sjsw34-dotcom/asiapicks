import type { ContentIndex } from "@/lib/content/loader";
import { LEGACY, classifyLegacy, isGone } from "@/lib/legacy/legacy";
import { result } from "./types";

export function redirectsCheck(idx: ContentIndex, inventory: string[], extraLivePaths: Set<string>, production: boolean) {
  const r = result("redirects");
  const live = new Set<string>([...idx.byPath.keys(), ...extraLivePaths]);
  for (const red of LEGACY.redirects) {
    if (live.has(red.from)) r.errors.push(`redirect source ${red.from} is a live page on the new site`);
    if (!live.has(red.to)) {
      const msg = `redirect ${red.from} -> ${red.to}: target is not published yet`;
      (production ? r.errors : r.warnings).push(msg);
    }
  }
  // The proxy answers gone prefixes with 410 before any page renders, so a live page there would be unreachable.
  for (const p of live) {
    if (isGone(p)) r.errors.push(`live page ${p} matches a gone prefix; the proxy would serve 410 instead of the page`);
  }
  for (const p of inventory) {
    if (classifyLegacy(p, live) === "unhandled") r.errors.push(`legacy URL ${p} has no redirect, 410 rule or live page`);
  }
  return r;
}
