/**
 * scripts/index-all-posts.ts
 *
 * One-shot batch script: reads the live sitemap.xml and submits every URL
 * to Google Indexing API (URL_UPDATED). Useful for the initial indexing
 * boost or when you've made a sweeping change.
 *
 * Usage:
 *   npx tsx scripts/index-all-posts.ts
 *   npx tsx scripts/index-all-posts.ts --dry            # list URLs, don't submit
 *   npx tsx scripts/index-all-posts.ts --sitemap=https://asiapicks.com/sitemap.xml
 *
 * Env:
 *   GOOGLE_SERVICE_ACCOUNT_JSON  — service account JSON key (string), required
 *   NEXT_PUBLIC_BASE_URL         — optional, defaults to https://asiapicks.com
 *
 * Notes:
 *   - Google Indexing API daily quota is 200/day by default. If you have more
 *     URLs than that, the script will stop early or hit per-URL errors — request
 *     a quota increase in Cloud Console first.
 *   - 400ms delay between calls to stay under the 600/min rate limit.
 */

import { google } from "googleapis";

const BASE_URL = (
  process.env.NEXT_PUBLIC_BASE_URL ?? "https://asiapicks.com"
).replace(/\/$/, "");

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry");
const sitemapArg = args
  .find((a) => a.startsWith("--sitemap="))
  ?.split("=")[1];
const SITEMAP_URL = sitemapArg ?? `${BASE_URL}/sitemap.xml`;

async function collectUrls(): Promise<string[]> {
  console.log(`📥  Fetching sitemap: ${SITEMAP_URL}`);
  const res = await fetch(SITEMAP_URL);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${SITEMAP_URL}: ${res.status}`);
  }
  const xml = await res.text();

  // If sitemap is an index (nested sitemaps), recurse.
  if (xml.includes("<sitemapindex")) {
    const childSitemaps = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
      (m) => m[1].trim()
    );
    console.log(`   Sitemap index detected, ${childSitemaps.length} child sitemap(s).`);
    const all: string[] = [];
    for (const child of childSitemaps) {
      const childRes = await fetch(child);
      if (!childRes.ok) {
        console.warn(`   ⚠️  Skip ${child} (${childRes.status})`);
        continue;
      }
      const childXml = await childRes.text();
      const urls = [...childXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) =>
        m[1].trim()
      );
      all.push(...urls);
    }
    return [...new Set(all)];
  }

  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) =>
    m[1].trim()
  );
  if (urls.length === 0) {
    throw new Error(`No <loc> entries found in ${SITEMAP_URL}`);
  }
  return [...new Set(urls)];
}

async function main() {
  const urls = await collectUrls();
  console.log(`\n🌐  Site: ${BASE_URL}`);
  console.log(`📊  Collected ${urls.length} URLs\n`);

  if (DRY_RUN) {
    urls.forEach((u, i) => console.log(`  [${i + 1}] ${u}`));
    console.log("\n(dry run — no requests sent)");
    return;
  }

  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) {
    console.error("❌  GOOGLE_SERVICE_ACCOUNT_JSON not set.");
    process.exit(1);
  }

  const credentials = JSON.parse(raw) as Record<string, unknown>;
  console.log(`🔑  Service account: ${credentials.client_email}\n`);

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/indexing"],
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const indexing = google.indexing({ version: "v3", auth: auth as any });

  let success = 0;
  let failed = 0;
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    try {
      await indexing.urlNotifications.publish({
        requestBody: { url, type: "URL_UPDATED" },
      });
      success++;
      console.log(`  [${i + 1}/${urls.length}] OK   ${url}`);
    } catch (err) {
      failed++;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const e = err as any;
      const msg = e?.response?.data?.error?.message || e?.message || String(err);
      const code = e?.response?.status || e?.code || "";
      console.log(`  [${i + 1}/${urls.length}] FAIL ${url}  (${code}) ${msg}`);
    }
    await new Promise((r) => setTimeout(r, 400));
  }

  console.log(`\nDone: ${success} ok, ${failed} failed (of ${urls.length})`);
  if (failed > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error("Fatal:", err?.message || err);
  process.exit(1);
});
