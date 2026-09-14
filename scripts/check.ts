import fs from "node:fs";
import path from "node:path";
import { loadContent, includeReviewByDefault, contentToday } from "@/lib/content/loader";
import { loadImages } from "@/lib/images/registry";
import { loadOffers } from "@/lib/affiliates/offers";
import { contentCheck } from "@/lib/checks/content";
import { linksCheck } from "@/lib/checks/links";
import { imagesCheck } from "@/lib/checks/images";
import { seoCheck } from "@/lib/checks/seo";
import { redirectsCheck } from "@/lib/checks/redirects";
import { releaseCheck } from "@/lib/checks/release";
import { factsCheck } from "@/lib/checks/facts";
import { navigationCheck } from "@/lib/checks/navigation";
import { staticLivePaths, type CheckResult } from "@/lib/checks/types";
import { getStaticPage, STATIC_PAGES } from "@/lib/content/pages";

function main() {
  const production = process.env.VERCEL_ENV === "production" || process.env.CHECK_PRODUCTION === "1";
  const includeReview = !production && includeReviewByDefault();
  const idx = loadContent({ includeReview });
  const images = loadImages();
  const offers = loadOffers();
  const inventoryFile = path.join(process.cwd(), "src/data/legacy-inventory.json");
  const inventory: string[] = fs.existsSync(inventoryFile) ? JSON.parse(fs.readFileSync(inventoryFile, "utf-8")) : [];
  const live = staticLivePaths();
  const today = new Date().toISOString().slice(0, 10);

  const results: CheckResult[] = [
    contentCheck(idx, images, offers, production),
    linksCheck(idx, live),
    navigationCheck(idx, live, production),
    imagesCheck(images, path.join(process.cwd(), "public")),
    seoCheck(idx),
    redirectsCheck(idx, inventory, live, production),
    releaseCheck(idx, offers, process.env, production),
    // Scheduled articles count as users: a fact only they state is still in service.
    factsCheck(
      loadContent({ includeReview, asOf: "9999-12-31" }), offers, today, undefined,
      ["home", ...STATIC_PAGES].flatMap((s) => getStaticPage(s).facts),
    ),
  ];

  // Scheduled articles go live on later rebuilds nobody watches. Check the site as it
  // will build on each of those dates now, while the fix is still a local edit.
  const ahead = loadContent({ includeReview, asOf: contentToday() });
  for (const date of [...new Set(ahead.scheduled.values())].sort()) {
    const future = loadContent({ includeReview, asOf: date });
    for (const r of [contentCheck(future, images, offers, production), linksCheck(future, live), navigationCheck(future, live, production), seoCheck(future)]) {
      results.push({ name: `${r.name} @${date}`, warnings: [], errors: r.errors.filter((e) => !results.some((x) => x.errors.includes(e))) });
    }
  }

  let errors = 0;
  for (const r of results) {
    for (const w of r.warnings) console.warn(`warn  [${r.name}] ${w}`);
    for (const e of r.errors) console.error(`ERROR [${r.name}] ${e}`);
    errors += r.errors.length;
  }
  console.log(`check: ${idx.articles.length} articles, ${idx.hubs.length} hubs, ${idx.categories.length} categories; ${errors} error(s) (${production ? "production" : "non-production"})`);
  process.exit(errors > 0 ? 1 : 0);
}

main();
