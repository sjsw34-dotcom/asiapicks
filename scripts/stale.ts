import { loadContent } from "@/lib/content/loader";
import { loadOffers } from "@/lib/affiliates/offers";
import { staleFacts, staleItems, STALE_DAYS } from "@/lib/checks/facts";
import { staticPageSources } from "@/lib/content/pages";

/**
 * The weekly refresh worklist. `npm run check` mentions stale sources among
 * every other warning; this prints only what needs re-checking, oldest first,
 * so it can be worked straight down.
 */
function main() {
  const arg = process.argv.indexOf("--days");
  const days = arg >= 0 ? Number(process.argv[arg + 1]) : STALE_DAYS;
  const today = new Date().toISOString().slice(0, 10);

  // Review drafts count: they will publish carrying whatever their sources say.
  const items = [...staleFacts(today), ...staleItems(loadContent({ includeReview: true }), loadOffers(), today, days, staticPageSources())];

  if (items.length === 0) {
    console.log(`Nothing checked more than ${days} days ago. Refresh queue is empty.`);
    return;
  }

  console.log(`${items.length} source(s) checked more than ${days} days ago, oldest first:\n`);
  let current = "";
  for (const i of items) {
    const head = i.kind === "offer" ? `offer ${i.path}` : i.kind === "fact" ? `fact ${i.path}  (${i.file}; one edit updates every page using it)` : `${i.path}  (${i.file})`;
    if (head !== current) {
      console.log(`  ${head}`);
      current = head;
    }
    console.log(`      ${String(Math.round(i.days)).padStart(4)}d  ${i.checkedAt}  ${i.source}`);
  }
  console.log(`\nRe-check each source, update checkedAt and updatedAt, then run: npm run check`);
}

main();
