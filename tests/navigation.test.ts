import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { loadContent } from "@/lib/content/loader";
import { navigationCheck } from "@/lib/checks/navigation";
import { staticLivePaths } from "@/lib/checks/types";
import {
  FOOTER_DESTINATIONS,
  FOOTER_TRUST,
  GONE_PAGE_LINKS,
  HEADER_NAV,
  NOT_FOUND_LINKS,
  SITE_LINK_GROUPS,
} from "@/data/navigation";
import { GONE_HTML } from "@/lib/legacy/legacy";

const idx = loadContent({ root: path.join(process.cwd(), "tests/fixtures/content"), includeReview: false });
const live = staticLivePaths();

test("site link lists keep the header, footer, 404 and 410 links", () => {
  assert.deepEqual(HEADER_NAV.map((l) => l.href), [
    "/korea", "/korea/seoul", "/korea/busan", "/korea/jeju", "/korea/gyeongju", "/korea/planning",
  ]);
  assert.deepEqual(FOOTER_DESTINATIONS.map((l) => l.href), [
    "/korea", "/korea/seoul", "/korea/busan", "/korea/jeju", "/korea/gyeongju",
  ]);
  assert.deepEqual(FOOTER_TRUST.map((l) => l.href), [
    "/about", "/editorial-policy", "/how-we-choose", "/affiliate-disclosure", "/contact", "/privacy", "/terms",
  ]);
  assert.deepEqual(NOT_FOUND_LINKS.map((l) => l.href), ["/korea", "/korea/seoul", "/korea/busan", "/korea/jeju"]);
  assert.deepEqual(GONE_PAGE_LINKS.map((l) => l.href), ["/korea", "/korea/seoul", "/korea/busan", "/korea/jeju"]);
  const grouped = SITE_LINK_GROUPS.map((g) => g.links);
  for (const list of [HEADER_NAV, FOOTER_DESTINATIONS, FOOTER_TRUST, NOT_FOUND_LINKS, GONE_PAGE_LINKS]) {
    assert.ok(grouped.includes(list));
  }
});

test("410 page links come from the exported list", () => {
  const hrefs = [...GONE_HTML.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(hrefs, GONE_PAGE_LINKS.map((l) => l.href));
  for (const l of GONE_PAGE_LINKS) assert.ok(GONE_HTML.includes(`>${l.label}</a>`), l.label);
});

test("header, footer and 404 take their internal links from src/data/navigation.ts", () => {
  for (const f of ["src/components/layout/Header.tsx", "src/components/layout/Footer.tsx", "src/app/not-found.tsx"]) {
    const src = fs.readFileSync(path.join(process.cwd(), f), "utf-8");
    assert.doesNotMatch(src, /["'`]\/[a-z]/, `${f} hardcodes an internal path`);
    assert.match(src, /@\/data\/navigation/, f);
  }
});

test("site links to pages that are not live are errors in production", () => {
  const r = navigationCheck(idx, live, true);
  const errors = r.errors.join("\n");
  assert.match(errors, /\/korea\/busan /);
  assert.match(errors, /\/korea\/gyeongju /);
  assert.doesNotMatch(errors, /\/korea\/seoul |\/korea\/planning |\/about /);
  assert.deepEqual(r.warnings, []);
});

test("site links to pages that are not live are warnings outside production", () => {
  const r = navigationCheck(idx, live, false);
  assert.deepEqual(r.errors, []);
  assert.ok(r.warnings.some((w) => w.includes("/korea/busan ")));
});

test("site links that all resolve pass cleanly", () => {
  const groups = [{ name: "header", links: [{ href: "/korea", label: "South Korea" }, { href: "/about", label: "About" }] }];
  const r = navigationCheck(idx, live, true, groups);
  assert.deepEqual(r.errors, []);
  assert.deepEqual(r.warnings, []);
});
