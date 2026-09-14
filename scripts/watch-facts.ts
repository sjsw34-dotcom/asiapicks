import { loadFacts, formatValue } from "@/lib/facts/registry";
import { judge, pageText, watchUrl, type WatchResult } from "@/lib/facts/watch";
import { loadContent } from "@/lib/content/loader";
import { getStaticPage, STATIC_PAGES } from "@/lib/content/pages";

/**
 * Weekly source watch for the fact registry.
 *
 *   npx tsx scripts/watch-facts.ts             plain text
 *   npx tsx scripts/watch-facts.ts --markdown  issue body; prints nothing when every value was found
 *
 * Each source URL is fetched once (three tries), and every fact citing it is
 * checked for its published value. It reports; it never edits the registry.
 */
const markdown = process.argv.includes("--markdown");
const UA = "Mozilla/5.0 (compatible; AsiaPicksFactWatch/1.0; +https://asiapicks.com/editorial-policy)";

async function fetchText(url: string): Promise<{ text: string | null; error?: string }> {
  let last = "";
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, { headers: { "user-agent": UA, "accept-language": "en,ko;q=0.8" }, signal: AbortSignal.timeout(30_000) });
      if (res.ok) return { text: pageText(await res.text()) };
      last = `HTTP ${res.status}`;
    } catch (err) {
      last = (err as Error).message;
    }
    if (attempt < 3) await new Promise((r) => setTimeout(r, attempt * 5_000));
  }
  return { text: null, error: last };
}

async function main() {
  const facts = [...loadFacts().values()];
  const idx = loadContent({ includeReview: false, asOf: "9999-12-31" });
  const usage = [...idx.hubs, ...idx.categories, ...idx.areas, ...idx.articles].map((n) => ({ path: n.path, facts: n.facts }))
    .concat(["home", ...STATIC_PAGES].map((s) => ({ path: s === "home" ? "/" : `/${s}`, facts: getStaticPage(s).facts })));
  const usedOn = (id: string) => usage.filter((u) => u.facts.includes(id)).map((u) => u.path);

  const pages = new Map<string, { text: string | null; error?: string }>();
  for (const url of new Set(facts.filter((f) => f.watch !== false).map(watchUrl))) pages.set(url, await fetchText(url));

  const results: WatchResult[] = facts.map((f) => {
    const page = pages.get(watchUrl(f));
    return judge(f, page ? page.text : null, page?.error);
  });
  const missing = results.filter((r) => r.status === "missing");
  const unreachable = results.filter((r) => r.status === "unreachable");
  const found = results.filter((r) => r.status === "found").length;

  if (!markdown) {
    for (const r of results) console.log(`${r.status.padEnd(11)} ${r.fact.id} = ${formatValue(r.fact.value)}  ${r.url}${r.detail ? `  (${r.detail})` : ""}`);
    console.log(`\n${found} found, ${missing.length} missing, ${unreachable.length} unreachable, ${results.length - found - missing.length - unreachable.length} skipped`);
    return;
  }
  if (missing.length === 0 && unreachable.length === 0) return;

  const out: string[] = [];
  out.push(`출처 페이지에서 우리가 게시한 값이 보이지 않는 사실이 있습니다 (${new Date().toISOString().slice(0, 10)}).`);
  out.push("");
  out.push("값이 바뀌었을 수도, 페이지 구조만 바뀌었을 수도 있습니다. 세션에서 \"사실 감시 이슈 처리해\"라고 하면 출처를 다시 읽고 판단합니다. 값이 바뀌었으면 `src/data/facts/`의 해당 항목 한 곳만 고치면 아래 글들이 함께 바뀝니다. 자동으로 값을 바꾸지는 않습니다.");
  if (missing.length) {
    out.push("", `## 값이 사라진 사실 (${missing.length})`);
    for (const r of missing) {
      out.push("", `- [ ] **${r.fact.label}**: 게시 값 ${formatValue(r.fact.value)} (\`${r.fact.id}\`)`);
      out.push(`  - 출처: ${r.url}`);
      out.push(`  - 찾은 표기: ${r.expected.map((e) => `"${e}"`).join(", ")}`);
      out.push(`  - 이 값을 쓰는 페이지: ${usedOn(r.fact.id).map((p) => `\`${p}\``).join(", ") || "없음"}`);
      if (r.fact.note) out.push(`  - 메모: ${r.fact.note}`);
    }
  }
  if (unreachable.length) {
    out.push("", `## 출처에 접속하지 못한 사실 (${unreachable.length})`);
    out.push("", "세 번 시도해도 열리지 않았습니다. 한 주만 그렇다면 일시 장애일 수 있습니다. 2주 이상 이어지면 출처 URL이 바뀌었는지 확인하세요.");
    for (const r of unreachable) out.push(`- [ ] \`${r.fact.id}\`: ${r.url} (${r.detail ?? "error"})`);
  }
  out.push("", `확인된 사실 ${found}개는 출처에 값이 그대로 있습니다.`);
  console.log(out.join("\n"));
}

main();
