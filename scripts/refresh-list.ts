import { loadContent, contentToday } from "@/lib/content/loader";
import { loadOffers } from "@/lib/affiliates/offers";
import { refreshList } from "@/lib/checks/refresh";
import { upcomingCalendar } from "@/data/calendar";

/**
 * The monthly worklist: every live or scheduled page that states a price,
 * timetable, opening hour or dated event, with the lines to re-verify and the
 * sources to check them against. Also lists seasonal guides due for drafting.
 *
 *   npx tsx scripts/refresh-list.ts            plain text
 *   npx tsx scripts/refresh-list.ts --markdown GitHub issue body (used by the monthly workflow)
 */
const markdown = process.argv.includes("--markdown");
const today = contentToday();
// Scheduled articles count: they go live carrying whatever their sources say.
const idx = loadContent({ includeReview: false, asOf: "9999-12-31" });
const { pages, pricedOffers } = refreshList(idx, loadOffers());
const calendar = upcomingCalendar(today, 45);

const out: string[] = [];
if (markdown) {
  out.push(`Monthly check of pages with prices, timetables, opening hours or dated events (${today}).`);
  out.push("");
  out.push("For each page: re-open the sources, compare the quoted lines, edit what changed. Bump `updatedAt` and the source `checkedAt` only on pages you actually re-verified; bump `updatedAt` only when a fact changed. Then `npm run check`.");
  out.push("");
  out.push(`## Pages (${pages.length})`);
  for (const p of pages) {
    out.push("");
    out.push(`- [ ] **${p.title}** — \`${p.path}\` (${p.kinds.join(", ")})`);
    for (const line of p.lines.slice(0, 8)) out.push(`  - ${line.replace(/\s+/g, " ").slice(0, 220)}`);
    if (p.lines.length > 8) out.push(`  - …and ${p.lines.length - 8} more line(s) in \`${p.file}\``);
    for (const s of p.sources) out.push(`  - source: [${s.title}](${s.url}) — checked ${s.checkedAt}`);
  }
  if (pricedOffers.length) {
    out.push("", "## Offer prices");
    for (const o of pricedOffers) out.push(`- [ ] \`${o.id}\`: ${o.priceText ?? "price"} (checked ${o.priceCheckedAt})`);
  }
  out.push("", "## Seasonal guides due in the next 45 days");
  if (calendar.length === 0) out.push("Nothing due.");
  for (const e of calendar) out.push(`- [ ] ${e.kind === "refresh" ? "Refresh" : "Draft"} **${e.topic}** — \`${e.path}\`, draft by ${e.draftBy}, live by ${e.publishBy} (season: ${e.season})${e.note ? `. ${e.note}` : ""}`);
} else {
  out.push(`${pages.length} page(s) with volatile facts (${today}):`);
  for (const p of pages) {
    out.push("", `  ${p.path}  [${p.kinds.join(", ")}]  ${p.lines.length} line(s)  ${p.file}`);
    for (const s of p.sources) out.push(`      ${s.checkedAt}  ${s.title}`);
  }
  if (pricedOffers.length) out.push("", `${pricedOffers.length} offer(s) with a recorded price.`);
  out.push("", "Seasonal guides due in the next 45 days:");
  if (calendar.length === 0) out.push("  nothing due");
  for (const e of calendar) out.push(`  draft by ${e.draftBy}, live by ${e.publishBy}: ${e.topic} (${e.path})`);
}
console.log(out.join("\n"));
