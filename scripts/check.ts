import fs from "node:fs";
import path from "node:path";
import { loadContent, includeReviewByDefault } from "@/lib/content/loader";
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

function main() {
  const production = process.env.VERCEL_ENV === "production" || process.env.CHECK_PRODUCTION === "1";
  const idx = loadContent({ includeReview: !production && includeReviewByDefault() });
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
    factsCheck(idx, offers, today),
  ];

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
