import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { loadContent } from "@/lib/content/loader";
import { breadcrumbsFor } from "@/lib/content/breadcrumbs";
import { slugParams } from "@/lib/content/route-data";
import { groupByArea, groupByCategory } from "@/lib/content/grouping";
import { buildSitemapEntries } from "@/lib/seo/sitemap";
import { affectedUrls } from "@/lib/release";
import { AREAS, CITY_CATEGORIES, getArea } from "@/data/taxonomy";

const root = path.join(process.cwd(), "tests/fixtures/content-areas");
const idx = loadContent({ root, includeReview: false });

test("area page exists only with an intro and at least one tagged article", () => {
  assert.deepEqual(idx.areas.map((a) => a.path), ["/korea/seoul/jongno"]);
  const jongno = idx.areas[0];
  assert.deepEqual(jongno.articles.map((a) => a.fm.slug), ["insadong-tea", "bukchon-walk", "stay-jongno"]);
  // Seongsu has a tagged article but no intro yet: no page.
  assert.equal(idx.byPath.get("/korea/seoul/seongsu"), undefined);
});

test("article URLs do not change when an article is tagged with an area", () => {
  assert.ok(idx.byPath.get("/korea/seoul/bukchon-walk"));
});

test("area pages get static params, breadcrumbs and sitemap entries", () => {
  assert.ok(slugParams(idx).some((p) => p.segment === "seoul" && p.slug === "jongno"));
  assert.deepEqual(breadcrumbsFor(idx.areas[0]), [
    { name: "Home", path: "/" },
    { name: "South Korea", path: "/korea" },
    { name: "Seoul", path: "/korea/seoul" },
    { name: "Jongno and Insadong", path: "/korea/seoul/jongno" },
  ]);
  assert.ok(buildSitemapEntries(idx).some((e) => e.url === "https://asiapicks.com/korea/seoul/jongno"));
});

test("category lists group by area in taxonomy order, city-wide last", () => {
  const cat = idx.categories.find((c) => c.path === "/korea/seoul/things-to-do")!;
  const groups = groupByArea(cat.articles, idx);
  assert.deepEqual(groups.map((g) => [g.title, g.href, g.articles.map((a) => a.fm.slug)]), [
    ["Jongno and Insadong", "/korea/seoul/jongno", ["insadong-tea", "bukchon-walk"]],
    ["Seongsu", undefined, ["seongsu-cafes"]],
    ["Across the city", undefined, ["palace-rules"]],
  ]);
});

test("a list with nothing to split stays one untitled group", () => {
  const cat = idx.categories.find((c) => c.path === "/korea/seoul/where-to-stay")!;
  assert.deepEqual(groupByArea(cat.articles, idx).map((g) => g.title), [""]);
});

test("area page groups its guides by category", () => {
  assert.deepEqual(groupByCategory(idx.areas[0]).map((g) => [g.title, g.articles.length]), [
    ["Things to Do", 2],
    ["Where to Stay", 1],
  ]);
});

test("releasing a tagged article pings its area page", () => {
  const a = idx.byPath.get("/korea/seoul/bukchon-walk")!;
  assert.ok(affectedUrls([a], idx).includes("https://asiapicks.com/korea/seoul/jongno"));
});

test("releasing an article tagged with an area that has no page yet does not ping that URL", () => {
  // Seongsu is tagged but has no intro, so /korea/seoul/seongsu is a 404 the release workflow would wait on until it fails.
  const a = idx.byPath.get("/korea/seoul/seongsu-cafes")!;
  const urls = affectedUrls([a], idx);
  assert.ok(!urls.includes("https://asiapicks.com/korea/seoul/seongsu"));
  assert.ok(urls.includes("https://asiapicks.com/korea/seoul/things-to-do"));
});

test("unknown area throws", () => {
  assert.throws(() => loadContent({ root: path.join(process.cwd(), "tests/fixtures/content-bad-area"), includeReview: false }), /Unknown area "shibuya"/);
});

test("area slugs are unique per city and never collide with city categories", () => {
  const keys = AREAS.map((a) => `${a.country}/${a.city}/${a.slug}`);
  assert.equal(new Set(keys).size, keys.length);
  for (const a of AREAS) assert.ok(!CITY_CATEGORIES.some((c) => c.slug === a.slug), a.slug);
  assert.equal(getArea("korea", "seoul", "jongno")?.name, "Jongno and Insadong");
  assert.equal(getArea("korea", "busan", "jongno"), undefined);
});
