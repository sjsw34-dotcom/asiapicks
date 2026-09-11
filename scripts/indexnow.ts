import { indexNowPayload, findIndexNowKey } from "@/lib/indexnow";

const urls = process.argv.slice(2).filter((u) => u.startsWith("https://asiapicks.com"));
if (urls.length === 0) {
  console.error("Usage: npx tsx scripts/indexnow.ts https://asiapicks.com/korea/... [more urls]");
  process.exit(1);
}
async function main() {
  const res = await fetch("https://api.indexnow.org/IndexNow", {
    method: "POST",
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify(indexNowPayload(urls, findIndexNowKey())),
  });
  console.log(`IndexNow ${res.status} for ${urls.length} URL(s)`);
  process.exit(res.ok ? 0 : 1);
}

main();
