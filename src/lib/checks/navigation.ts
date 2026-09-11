import type { ContentIndex } from "@/lib/content/loader";
import { SITE_LINK_GROUPS, type NavLinkGroup } from "@/data/navigation";
import { result } from "./types";

/** Site-wide chrome links (header, footer, 404, 410) must point at live pages. */
export function navigationCheck(
  idx: ContentIndex,
  extraLivePaths: Set<string>,
  production: boolean,
  groups: NavLinkGroup[] = SITE_LINK_GROUPS,
) {
  const r = result("navigation");
  const dead = new Map<string, string[]>();
  for (const g of groups) {
    for (const l of g.links) {
      if (idx.byPath.has(l.href) || extraLivePaths.has(l.href)) continue;
      const where = dead.get(l.href) ?? [];
      if (!where.includes(g.name)) where.push(g.name);
      dead.set(l.href, where);
    }
  }
  for (const [href, where] of dead) {
    (production ? r.errors : r.warnings).push(`site link ${href} (${where.join(", ")}) is not a live page`);
  }
  return r;
}
