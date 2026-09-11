import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { loadContent } from "@/lib/content/loader";
import { countryParams, segmentParams, slugParams, metadataFor } from "@/lib/content/route-data";
import type { Article, CategoryPage } from "@/lib/content/loader";

const idx = loadContent({ root: path.join(process.cwd(), "tests/fixtures/content"), includeReview: false });

test("static params cover every node exactly once", () => {
  assert.deepEqual(countryParams(idx), [{ country: "korea" }]);
  assert.deepEqual(segmentParams(idx).map((p) => p.segment).sort(), ["how-to-pay-in-korea", "planning", "seoul"]);
  assert.deepEqual(slugParams(idx).map((p) => `${p.segment}/${p.slug}`).sort(), [
    "seoul/incheon-airport-to-seoul",
    "seoul/transportation",
  ]);
});

test("metadata uses seoTitle fallback and canonical path", () => {
  const node = idx.byPath.get("/korea/seoul/incheon-airport-to-seoul")!;
  const m = metadataFor(node);
  assert.equal(m.title, "Incheon Airport to Seoul: AREX vs Airport Bus vs Taxi");
  assert.equal((m.alternates as { canonical: string }).canonical, "https://asiapicks.com/korea/seoul/incheon-airport-to-seoul");
  assert.deepEqual(m.robots, { index: true, follow: true });
});

test("metadata sets noindex for review-status articles", () => {
  const base = idx.byPath.get("/korea/seoul/incheon-airport-to-seoul")! as Article;
  const reviewNode: Article = { ...base, fm: { ...base.fm, status: "review" } };
  const m = metadataFor(reviewNode);
  assert.deepEqual(m.robots, { index: false, follow: true });
});

test("metadata honors fm.canonical override", () => {
  const base = idx.byPath.get("/korea/seoul/incheon-airport-to-seoul")! as Article;
  const withCanonical: Article = {
    ...base,
    fm: { ...base.fm, canonical: "https://asiapicks.com/korea/how-to-pay-in-korea" },
  };
  const m = metadataFor(withCanonical);
  assert.equal((m.alternates as { canonical: string }).canonical, "https://asiapicks.com/korea/how-to-pay-in-korea");
});

test("metadata for category nodes is website-typed, indexable, and does not crash without featuredImage", () => {
  const node = idx.byPath.get("/korea/seoul/transportation")! as CategoryPage;
  const m = metadataFor(node);
  const og = m.openGraph as { type: string };
  assert.equal(og.type, "website");
  assert.deepEqual(m.robots, { index: true, follow: true });
});
