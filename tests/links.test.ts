import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { loadContent } from "@/lib/content/loader";
import { extractInternalLinks, buildLinkGraph, relatedArticles, nextStep } from "@/lib/content/links";

const idx = loadContent({ root: path.join(process.cwd(), "tests/fixtures/content"), includeReview: false });

test("extracts markdown and href links, internal only", () => {
  const body = 'See [A](/korea/seoul/) and [B](/korea#x) and [C](https://x.com) and <a href="/korea/seoul?y=1">D</a>.';
  assert.deepEqual(extractInternalLinks(body).sort(), ["/korea", "/korea/seoul"]);
});

test("link graph records inbound links", () => {
  const g = buildLinkGraph(idx);
  const inbound = g.get("/korea/seoul/incheon-airport-to-seoul")!.in.sort();
  assert.deepEqual(inbound, ["/korea", "/korea/how-to-pay-in-korea", "/korea/seoul"]);
});

test("related prefers same city, excludes self", () => {
  const a = idx.articles.find((x) => x.fm.slug === "how-to-pay-in-korea")!;
  const rel = relatedArticles(a, idx, 3);
  assert.equal(rel.some((r) => r.path === a.path), false);
  assert.equal(rel.length, 1);
});

test("next step moves forward in the journey", () => {
  const a = idx.articles.find((x) => x.fm.slug === "how-to-pay-in-korea")!; // planning
  assert.equal(nextStep(a, idx)?.fm.slug, "incheon-airport-to-seoul"); // on-trip, nearest later stage
});

test("nextStep returns null for on-trip articles (last stage)", () => {
  const a = idx.articles.find((x) => x.fm.slug === "incheon-airport-to-seoul")!; // on-trip
  assert.equal(nextStep(a, idx), null);
});

test("relatedArticles puts manually listed paths first", () => {
  // Copy the index and modify the incheon article to have relatedArticles set
  const modifiedArticles = idx.articles.map((art) =>
    art.fm.slug === "incheon-airport-to-seoul"
      ? {
          ...art,
          fm: { ...art.fm, relatedArticles: ["/korea/how-to-pay-in-korea"] },
        }
      : art
  );
  const modifiedIdx: typeof idx = {
    ...idx,
    articles: modifiedArticles,
    byPath: new Map([...idx.byPath]),
  };
  // Rebuild byPath with modified article
  const modified = modifiedIdx.articles.find((x) => x.fm.slug === "incheon-airport-to-seoul")!;
  modifiedIdx.byPath.set(modified.path, modified);

  const rel = relatedArticles(modified, modifiedIdx, 3);
  // First result should be the manually listed one
  assert.equal(rel[0]?.path, "/korea/how-to-pay-in-korea");
});

test("relatedArticles ignores manual paths that don't exist", () => {
  // Copy the index and set a non-existent manual related article path
  const modifiedArticles = idx.articles.map((art) =>
    art.fm.slug === "incheon-airport-to-seoul"
      ? {
          ...art,
          fm: { ...art.fm, relatedArticles: ["/nonexistent/path", "/korea/how-to-pay-in-korea"] },
        }
      : art
  );
  const modifiedIdx: typeof idx = {
    ...idx,
    articles: modifiedArticles,
    byPath: new Map([...idx.byPath]),
  };
  const modified = modifiedIdx.articles.find((x) => x.fm.slug === "incheon-airport-to-seoul")!;
  modifiedIdx.byPath.set(modified.path, modified);

  const rel = relatedArticles(modified, modifiedIdx, 3);
  // Should only include the one that exists
  assert.equal(rel[0]?.path, "/korea/how-to-pay-in-korea");
  assert.equal(rel.length, 1);
});

test("extractInternalLinks ignores protocol-relative links", () => {
  const body = '[x](//cdn.example.com/a) [y](/real/path)';
  assert.deepEqual(extractInternalLinks(body), ["/real/path"]);
});
