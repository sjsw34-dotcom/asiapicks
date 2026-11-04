import { indexNowPayload, findIndexNowKey, isCanonicalUrl } from "@/lib/indexnow";

const urls = process.argv.slice(2).filter(isCanonicalUrl);
if (urls.length === 0) {
  console.error("Usage: npx tsx scripts/indexnow.ts https://asiapicks.com/korea/... [more urls]");
  process.exit(1);
}
async function main() {
  const res = await fetch("https://api.indexnow.org/indexnow", {
    method: "POST",
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify(indexNowPayload(urls, findIndexNowKey())),
  });
  // 200 = received, 202 = accepted (key check pending). Anything else is logged with the reply for the workflow log.
  console.log(`IndexNow ${res.status} ${res.statusText} for ${urls.length} URL(s)`);
  if (!res.ok) console.log(await res.text().catch(() => ""));
  for (const u of urls) console.log(`  ${u}`);
  process.exit(res.ok ? 0 : 1);
}

main();
