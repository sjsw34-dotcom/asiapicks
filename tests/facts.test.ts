import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { loadContent } from "@/lib/content/loader";
import { refreshList } from "@/lib/checks/refresh";
import { factsCheck, staleFacts } from "@/lib/checks/facts";
import { nodesForFiles } from "@/lib/release";
import {
  factsDue, factsExpiring, formatDate, formatValue, loadFacts, recheckBy, resolveFacts, withFactSources,
} from "@/lib/facts/registry";

const factsDir = path.join(process.cwd(), "tests/fixtures/facts");
const facts = loadFacts(factsDir);
const idx = loadContent({ root: path.join(process.cwd(), "tests/fixtures/content-facts"), includeReview: false, factsDir });
const hub = idx.hubs[0];

test("formats values and dates the way the site writes them", () => {
  assert.equal(formatDate("2026-12-31"), "31 December 2026");
  assert.equal(formatValue({ type: "won", amount: 54400 }), "54,400 won");
  assert.equal(formatValue({ type: "won", amount: 54400 }, "number"), "54,400");
  assert.equal(resolveFacts("{{test-fare}} / {{ test-fare|number }} / {{test-fare.previous}} / {{test-fare.since}}", facts, "t"),
    "1,550 won / 1,550 / 1,400 won / 28 June 2025");
});

test("unknown facts and missing fields fail loudly", () => {
  assert.throws(() => resolveFacts("{{no-such-fact}}", facts, "page.mdx"), /Unknown fact "no-such-fact" in page\.mdx/);
  assert.throws(() => resolveFacts("{{test-deadline.previous}}", facts, "page.mdx"), /has no "previous"/);
  assert.throws(() => loadFacts(path.join(process.cwd(), "tests/fixtures/facts-bad")), /Duplicate fact id "same"/);
});

test("the loader resolves body, summary and FAQs but leaves source titles verbatim", () => {
  assert.equal(hub.fm.summary, "Rides start at 1,550 won and the exemption ends 31 December 2026.");
  assert.equal(hub.fm.faqs[0].a, "1,550 won, raised from 1,400 won on 28 June 2025. KRW 1,550 on a card.");
  assert.match(hub.body, /A ride costs 1,550 won\./);
  assert.equal(hub.fm.sources[0].title, "Fare to rise to {{test-fare}}");
  assert.deepEqual(hub.facts, ["test-deadline", "test-fare"]);
  assert.match(hub.raw.body, /\{\{test-fare\}\}/);
});

test("a page inherits the updatedAt of a fact that changed after it", () => {
  assert.equal(hub.fm.updatedAt, "2026-09-20");
});

test("sources list adds fact sources without repeating a URL", () => {
  const list = withFactSources(hub.fm.sources, hub.facts, facts);
  assert.deepEqual(list.map((s) => s.url), ["https://example.gov/page-source", "https://example.gov/fares"]);
});

test("recheck and expiry dates", () => {
  const fare = facts.get("test-fare")!;
  assert.equal(recheckBy(fare), "2026-11-30");
  assert.equal(recheckBy(facts.get("test-deadline")!), "2026-10-01");
  assert.deepEqual(factsDue(facts, "2026-09-15").map((f) => f.id), []);
  assert.deepEqual(factsDue(facts, "2026-10-02").map((f) => f.id), ["test-deadline"]);
  assert.deepEqual(factsExpiring(facts, "2026-10-01", 60).map((f) => f.id), []);
  assert.deepEqual(factsExpiring(facts, "2026-11-15", 60).map((f) => f.id), ["test-deadline"]);
  assert.equal(staleFacts("2026-12-01", facts).length, 2);
});

test("refresh scans the page before resolution: registry facts are listed once, inline prices stay on the page", () => {
  const { pages, dueFacts } = refreshList(idx, new Map(), { today: "2026-12-05", facts });
  assert.equal(pages.length, 1);
  assert.deepEqual(pages[0].lines, ["The monorail ticket is 12,200 won."]);
  assert.deepEqual(dueFacts.map((d) => [d.fact.id, d.usedOn]), [["test-deadline", ["/korea"]], ["test-fare", ["/korea"]]]);
});

test("refresh lists a page only when its oldest source is due", () => {
  const early = refreshList(idx, new Map(), { today: "2026-09-15", facts });
  assert.equal(early.pages.length, 0);
  assert.equal(early.notDue, 1);
});

test("check warns about expiring and unused facts", () => {
  const r = factsCheck(idx, new Map(), "2026-11-15", facts);
  assert.ok(r.warnings.some((w) => /test-deadline.*stops being true on 2026-12-31/.test(w)));
  const unused = factsCheck(loadContent({ root: path.join(process.cwd(), "tests/fixtures/content"), includeReview: false, factsDir }), new Map(), "2026-09-15", facts);
  assert.ok(unused.warnings.some((w) => /"test-fare".*not used/.test(w)));
});

test("a changed fact file maps to every page that uses its facts", () => {
  const nodes = nodesForFiles(idx, ["tests/fixtures/facts/korea/transport.json"], process.cwd(), facts);
  assert.deepEqual(nodes.map((n) => n.path), ["/korea"]);
});
