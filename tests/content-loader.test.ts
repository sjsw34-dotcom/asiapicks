import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { loadContent } from "@/lib/content/loader";
import { articlePath, hubPath, categoryPath } from "@/lib/content/paths";

const root = path.join(process.cwd(), "tests/fixtures/content");

test("paths", () => {
  assert.equal(hubPath("korea"), "/korea");
  assert.equal(hubPath("korea", "seoul"), "/korea/seoul");
  assert.equal(categoryPath("korea", "seoul", "transportation"), "/korea/seoul/transportation");
  assert.equal(categoryPath("korea", null, "planning"), "/korea/planning");
  assert.equal(articlePath("korea", null, "how-to-pay-in-korea"), "/korea/how-to-pay-in-korea");
  assert.equal(articlePath("korea", "seoul", "incheon-airport-to-seoul"), "/korea/seoul/incheon-airport-to-seoul");
});

test("loads hubs, articles, categories; excludes drafts", () => {
  const idx = loadContent({ root, includeReview: false });
  assert.deepEqual(idx.hubs.map((h) => h.path).sort(), ["/korea", "/korea/seoul"]);
  assert.deepEqual(idx.articles.map((a) => a.path).sort(), [
    "/korea/how-to-pay-in-korea",
    "/korea/seoul/incheon-airport-to-seoul",
  ]);
  const cat = idx.categories.find((c) => c.path === "/korea/seoul/transportation");
  assert.ok(cat);
  assert.equal(cat.articles.length, 1);
  assert.ok(idx.byPath.get("/korea/seoul/incheon-airport-to-seoul"));
  assert.equal(idx.byPath.get("/korea/seoul/draft-post"), undefined);
});

test("category without published articles is not generated", () => {
  const idx = loadContent({ root, includeReview: false });
  assert.equal(idx.categories.find((c) => c.path === "/korea/seoul/food"), undefined);
});

test("category members are sorted like idx.articles (updatedAt desc)", () => {
  const idx = loadContent({ root: path.join(process.cwd(), "tests/fixtures/content-sort"), includeReview: false });
  const cat = idx.categories.find((c) => c.path === "/korea/planning");
  assert.ok(cat);
  assert.deepEqual(cat.articles.map((a) => a.fm.slug), ["b-newer-guide", "a-older-guide"]);
  assert.deepEqual(
    cat.articles.map((a) => a.path),
    idx.articles.filter((a) => a.fm.category === "planning").map((a) => a.path),
  );
});

test("invalid frontmatter throws with file path", () => {
  const badRoot = path.join(process.cwd(), "tests/fixtures/content-bad");
  assert.throws(() => loadContent({ root: badRoot, includeReview: false }), /content-bad.*bad\.mdx/s);
});

test("slug/file name mismatch throws", () => {
  const badRoot = path.join(process.cwd(), "tests/fixtures/content-slug-mismatch");
  assert.throws(() => loadContent({ root: badRoot, includeReview: false }), /does not match file name/);
});

test("unknown category throws", () => {
  const badRoot = path.join(process.cwd(), "tests/fixtures/content-bad-category");
  assert.throws(() => loadContent({ root: badRoot, includeReview: false }), /Unknown category/);
});

test("duplicate output path throws", () => {
  const badRoot = path.join(process.cwd(), "tests/fixtures/content-duplicate");
  assert.throws(() => loadContent({ root: badRoot, includeReview: false }), /Duplicate path \/korea\/seoul/);
});
