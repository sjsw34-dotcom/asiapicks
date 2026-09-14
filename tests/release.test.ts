import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { loadContent } from "@/lib/content/loader";
import { affectedUrls, nodesForFiles, releasedOn } from "@/lib/release";
import { volatileLines } from "@/lib/checks/refresh";
import { CALENDAR, upcomingCalendar } from "@/data/calendar";

const root = path.join(process.cwd(), "tests/fixtures/content");

test("releasedOn finds only the article dated that day", () => {
  const idx = loadContent({ root, includeReview: false, asOf: "2099-01-01" });
  assert.deepEqual(releasedOn(idx, "2099-01-01").map((a) => a.path), ["/korea/seoul/future-guide"]);
});

test("affectedUrls pings the article, its hubs, its category and home", () => {
  const idx = loadContent({ root, includeReview: false, asOf: "2099-01-01" });
  assert.deepEqual(affectedUrls(releasedOn(idx, "2099-01-01"), idx).sort(), [
    "https://asiapicks.com",
    "https://asiapicks.com/korea",
    "https://asiapicks.com/korea/seoul",
    "https://asiapicks.com/korea/seoul/future-guide",
    "https://asiapicks.com/korea/seoul/transportation",
  ]);
});

test("nodesForFiles ignores files that are not live pages", () => {
  const idx = loadContent({ root, includeReview: false });
  const nodes = nodesForFiles(idx, [
    "tests/fixtures/content/korea/how-to-pay-in-korea.mdx",
    "tests/fixtures/content/korea/seoul/draft-post.mdx",
    "tests/fixtures/content/korea/seoul/future-guide.mdx",
  ]);
  assert.deepEqual(nodes.map((n) => n.path), ["/korea/how-to-pay-in-korea"]);
});

test("volatileLines flags prices, times and dates, not plain prose or components", () => {
  const { kinds, lines } = volatileLines([
    "The AREX express costs 13,000 won and takes 43 minutes.",
    "Palaces open from 9 a.m. and are closed on Mondays.",
    "The festival runs from November 7 to 16.",
    "Seoul is a big city with many neighbourhoods.",
    '<Offer id="x" />',
  ].join("\n"));
  assert.deepEqual(kinds.sort(), ["dated", "hours", "price"]);
  assert.equal(lines.length, 3);
});

test("calendar keeps a week between draft and publish, and lists what is due", () => {
  for (const e of CALENDAR) assert.ok(e.draftBy <= e.publishBy, e.topic);
  const due = upcomingCalendar("2026-10-01", 45);
  assert.ok(due.some((e) => e.path === "/korea/seoul/seoul-lantern-festival"));
  assert.ok(!due.some((e) => e.path === "/korea/chuseok-2026"));
});

test("openDays lists the days with nothing live or scheduled", async () => {
  const { openDays } = await import("@/lib/release");
  const idx = loadContent({ root, includeReview: false });
  // Fixture: live articles on 2026-09-12, future-guide scheduled on 2099-01-01.
  assert.deepEqual(openDays(idx, "2026-09-11", "2026-09-13"), ["2026-09-11", "2026-09-13"]);
  assert.deepEqual(openDays(idx, "2098-12-31", "2099-01-01"), ["2098-12-31"]);
});
