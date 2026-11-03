import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { loadContent } from "@/lib/content/loader";
import { breadcrumbsFor } from "@/lib/content/breadcrumbs";
import { metadataFor, slugParams, segmentParams } from "@/lib/content/route-data";
import { buildSitemapEntries } from "@/lib/seo/sitemap";
import { contentCheck } from "@/lib/checks/content";
import { loadImages } from "@/lib/images/registry";
import { loadOffers } from "@/lib/affiliates/offers";
import { LEGACY } from "@/lib/legacy/legacy";
import { absoluteUrl } from "@/lib/site";

const root = path.join(process.cwd(), "tests/fixtures/content-areas");
const redirects = [
  { from: "/korea/seoul/where-to-stay", to: "/korea/seoul/stay-jongno" },
  { from: "/korea/seoul/jongno", to: "/korea/seoul/bukchon-walk" },
];
const idx = loadContent({ root, includeReview: false, redirects });

test("a listing with a 301 is not a page, but its category still heads a hub section", () => {
  assert.equal(idx.byPath.get("/korea/seoul/where-to-stay"), undefined);
  assert.ok(!idx.categories.some((c) => c.path === "/korea/seoul/where-to-stay"));
  const merged = idx.mergedCategories.find((c) => c.path === "/korea/seoul/where-to-stay");
  assert.equal(merged?.redirectTo, "/korea/seoul/stay-jongno");
  assert.deepEqual(merged?.articles.map((a) => a.fm.slug), ["stay-jongno"]);
  assert.equal(idx.merged.get("/korea/seoul/where-to-stay"), "/korea/seoul/stay-jongno");
});

test("a neighbourhood page with a 301 is not a page either", () => {
  assert.equal(idx.byPath.get("/korea/seoul/jongno"), undefined);
  assert.deepEqual(idx.areas, []);
  assert.equal(idx.merged.get("/korea/seoul/jongno"), "/korea/seoul/bukchon-walk");
});

test("merged listings get no static params and no sitemap entry", () => {
  const params = [...slugParams(idx), ...segmentParams(idx)];
  assert.ok(!params.some((p) => "slug" in p && p.segment === "seoul" && (p.slug === "where-to-stay" || p.slug === "jongno")));
  const urls = buildSitemapEntries(idx).map((e) => e.url);
  assert.ok(!urls.includes(absoluteUrl("/korea/seoul/where-to-stay")));
  assert.ok(!urls.includes(absoluteUrl("/korea/seoul/jongno")));
});

test("an article's breadcrumb skips a category that is not a page", () => {
  const article = idx.byPath.get("/korea/seoul/stay-jongno")!;
  assert.deepEqual(breadcrumbsFor(article, idx).map((c) => c.path), ["/", "/korea", "/korea/seoul", "/korea/seoul/stay-jongno"]);
  const live = idx.byPath.get("/korea/seoul/bukchon-walk")!;
  assert.ok(breadcrumbsFor(live, idx).some((c) => c.path === "/korea/seoul/things-to-do"));
});

test("an article in a merged category still has its category intro", () => {
  const r = contentCheck(idx, loadImages(), loadOffers());
  assert.ok(!r.errors.some((e) => e.includes("missing category intro")), r.errors.join("\n"));
});

// The live site, as production builds it.
const site = loadContent({ includeReview: false });

test("every listing 301 in legacy-urls.json leaves no page behind on the live site", () => {
  for (const r of LEGACY.redirects) assert.equal(site.byPath.get(r.from), undefined, r.from);
});

test("a noindex listing says noindex, follow and stays out of the sitemap", () => {
  const food = site.byPath.get("/korea/seoul/food");
  assert.ok(food && food.kind === "category" && food.fm.noindex);
  assert.deepEqual(metadataFor(food).robots, { index: false, follow: true });
  assert.ok(!buildSitemapEntries(site).some((e) => e.url === absoluteUrl("/korea/seoul/food")));
});

test("the sitemap lists only pages that are indexable and canonical to themselves", () => {
  for (const { url } of buildSitemapEntries(site)) {
    const p = new URL(url).pathname;
    const node = site.byPath.get(p);
    if (!node) continue; // home and trust pages
    const meta = metadataFor(node);
    assert.deepEqual(meta.robots, { index: true, follow: true }, p);
    assert.equal(meta.alternates?.canonical, url, p);
    assert.ok(!LEGACY.redirects.some((r) => r.from === p), p);
  }
});

test("typography check flags em dashes, en dashes and prose double hyphens, not URLs", async () => {
  const { typographyCheck } = await import("@/lib/checks/typography");
  const fs = await import("node:fs");
  const os = await import("node:os");
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "typo-"));
  // Written with escapes so the repository itself holds no dash characters.
  fs.writeFileSync(path.join(dir, "bad.mdx"), "Open 9\u201318\nA pause\u2014then\nwait -- here\nurl https://x.com/a--b ok\n--flag at start\n");
  const r = typographyCheck([dir]);
  assert.deepEqual(r.errors.map((e) => e.split(":")[1]), ["1", "2", "3"]);
  assert.deepEqual(typographyCheck().errors, []);
});

test("IndexNow after a push: changed listing intros and new 301 sources are announced", async () => {
  const { addedRedirects, nodesForFiles } = await import("@/lib/release");
  const before = { redirects: [{ from: "/a", to: "/korea" }] };
  const after = { redirects: [{ from: "/a", to: "/korea" }, { from: "/korea/x", to: "/korea/y" }] };
  assert.deepEqual(addedRedirects(before, after), [{ from: "/korea/x", to: "/korea/y" }]);
  const food = site.byPath.get("/korea/seoul/food")!;
  assert.deepEqual(nodesForFiles(site, ["src/content/korea/seoul/_categories/food.mdx"]).map((n) => n.path), [food.path]);
});
