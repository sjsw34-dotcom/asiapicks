/**
 * scripts/index-new-post.ts
 *
 * Notify Google about a single newly published blog post.
 * Called from GitHub Actions (auto-blog.yml) right after Vercel deploys.
 *
 * Usage:
 *   SLUG=my-post npx tsx scripts/index-new-post.ts
 *   npx tsx scripts/index-new-post.ts --slug=my-post
 *   npx tsx scripts/index-new-post.ts --url=https://asiapicks.com/blog/my-post
 *
 * Env:
 *   GOOGLE_SERVICE_ACCOUNT_JSON  — service account JSON key (string)
 *   NEXT_PUBLIC_BASE_URL         — optional, defaults to https://asiapicks.com
 */

import { requestIndexing } from "../src/lib/google-indexing";

const BASE_URL = (
  process.env.NEXT_PUBLIC_BASE_URL ?? "https://asiapicks.com"
).replace(/\/$/, "");

function resolveUrl(): string | null {
  const urlArg = process.argv
    .find((a) => a.startsWith("--url="))
    ?.split("=")[1];
  if (urlArg) return urlArg;

  const slugArg =
    process.argv.find((a) => a.startsWith("--slug="))?.split("=")[1] ??
    process.env.SLUG;
  if (slugArg) return `${BASE_URL}/blog/${slugArg}`;

  return null;
}

async function main() {
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    console.warn("⚠️  GOOGLE_SERVICE_ACCOUNT_JSON not set — exiting (non-fatal).");
    process.exit(0);
  }

  const url = resolveUrl();
  if (!url) {
    console.error("❌  No --slug, --url, or SLUG env var provided.");
    process.exit(1);
  }

  console.log(`📡  Submitting to Google: ${url}`);
  await requestIndexing(url);
  console.log("✅  Done.");
}

main().catch((err) => {
  console.error("❌  Fatal:", err);
  // Non-fatal: indexing failure should not break the publish workflow.
  process.exit(0);
});
