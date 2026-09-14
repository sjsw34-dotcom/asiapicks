import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { loadFacts, type Fact } from "@/lib/facts/registry";
import { containsValue, expectedForms, judge, pageText, watchUrl } from "@/lib/facts/watch";

const facts = loadFacts(path.join(process.cwd(), "tests/fixtures/facts"));
const fare = facts.get("test-fare")!;
const deadline = facts.get("test-deadline")!;

test("expected forms cover grouped numbers and English and Korean date styles", () => {
  assert.deepEqual(expectedForms(fare), ["1,550", "1550"]);
  const forms = expectedForms(deadline);
  for (const f of ["31 December 2026", "December 31, 2026", "2026-12-31", "2026.12.31", "2026년 12월 31일"]) assert.ok(forms.includes(f), f);
});

test("page text drops scripts, styles and tags", () => {
  assert.equal(pageText("<p>Fare <b>1,550</b>&nbsp;won</p><script>var x='1,650'</script>").trim(), "Fare 1,550 won");
});

test("a value only matches as a whole number", () => {
  assert.equal(containsValue("어른 : 1,550원", ["1,550"]), true);
  assert.equal(containsValue("fare 11,550 won", ["1,550"]), false);
  assert.equal(containsValue("fare 1,5500 won", ["1,550"]), false);
  assert.equal(containsValue("until December 31, 2026.", expectedForms(deadline)), true);
});

test("judge reports found, missing, unreachable and skipped", () => {
  assert.equal(judge(fare, "base fare 1,550 won").status, "found");
  assert.equal(judge(fare, "base fare 1,650 won").status, "missing");
  assert.equal(judge(fare, null, "HTTP 503").status, "unreachable");
  const off: Fact = { ...fare, watch: false };
  assert.equal(judge(off, "anything").status, "skipped");
});

test("watch url and expected forms can be overridden per fact", () => {
  const custom: Fact = { ...fare, watch: { url: "https://example.gov/table", expect: ["1.550"] } };
  assert.equal(watchUrl(custom), "https://example.gov/table");
  assert.equal(judge(custom, "Preis 1.550").status, "found");
  assert.equal(watchUrl(fare), "https://example.gov/fares");
});

test("every live registry fact parses its watch settings", () => {
  assert.ok(loadFacts().size > 0);
});
