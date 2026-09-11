import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import fs from "node:fs";
import os from "node:os";
import { loadContent } from "@/lib/content/loader";
import { buildSitemapEntries } from "@/lib/seo/sitemap";
import { indexNowPayload, findIndexNowKey, isCanonicalUrl } from "@/lib/indexnow";
import { escapeXml } from "@/lib/seo/feed";
import robots from "@/app/robots";
import { GET as feedGet } from "@/app/feed.xml/route";

const idx = loadContent({ root: path.join(process.cwd(), "tests/fixtures/content"), includeReview: false });

test("sitemap lists hubs, categories and articles with content dates", () => {
  const entries = buildSitemapEntries(idx);
  const byUrl = new Map(entries.map((e) => [e.url, e.lastModified]));
  assert.equal(byUrl.get("https://asiapicks.com/korea/seoul/incheon-airport-to-seoul"), "2026-09-12");
  assert.ok(byUrl.has("https://asiapicks.com/korea/seoul/transportation"));
  assert.ok(byUrl.has("https://asiapicks.com/about"));
  assert.equal([...byUrl.keys()].some((u) => u.includes("draft-post")), false);
});

test("indexnow payload targets the canonical host", () => {
  const p = indexNowPayload(["https://asiapicks.com/korea"], "abc");
  assert.equal(p.host, "asiapicks.com");
  assert.equal(p.keyLocation, "https://asiapicks.com/abc.txt");
});

test("indexnow key is found from env first, then public/", () => {
  assert.equal(findIndexNowKey(path.join(process.cwd(), "public"), { INDEXNOW_KEY: "fromenv" } as unknown as NodeJS.ProcessEnv), "fromenv");
  assert.equal(findIndexNowKey(path.join(process.cwd(), "public"), {} as NodeJS.ProcessEnv), "a3f2e7c8b1d49f6e2c8a4b7d1f3e9c2a");
});

test("isCanonicalUrl accepts only https URLs on the canonical host", () => {
  assert.equal(isCanonicalUrl("https://asiapicks.com/korea"), true);
  assert.equal(isCanonicalUrl("https://asiapicks.com.evil.com/x"), false);
  assert.equal(isCanonicalUrl("https://asiapicks.comX/x"), false);
  assert.equal(isCanonicalUrl("http://asiapicks.com/korea"), false);
  assert.equal(isCanonicalUrl("https://www.asiapicks.com/korea"), false);
  assert.equal(isCanonicalUrl("not a url"), false);
});

test("indexnow key throws when none is configured", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "indexnow-"));
  assert.throws(() => findIndexNowKey(dir, {} as NodeJS.ProcessEnv), /No IndexNow key/);
});

test("buildSitemapEntries excludes noindex articles", () => {
  const incheon = idx.articles.find((a) => a.fm.slug === "incheon-airport-to-seoul")!;
  const copy = {
    ...idx,
    articles: idx.articles.map((a) => (a === incheon ? { ...a, fm: { ...a.fm, noindex: true } } : a)),
  };
  const entries = buildSitemapEntries(copy);
  assert.equal(entries.some((e) => e.url === "https://asiapicks.com/korea/seoul/incheon-airport-to-seoul"), false);
});

test("buildSitemapEntries excludes articles with a canonical override", () => {
  const incheon = idx.articles.find((a) => a.fm.slug === "incheon-airport-to-seoul")!;
  const copy = {
    ...idx,
    articles: idx.articles.map((a) =>
      a === incheon ? { ...a, fm: { ...a.fm, canonical: "https://example.com/elsewhere" } } : a,
    ),
  };
  const entries = buildSitemapEntries(copy);
  assert.equal(entries.some((e) => e.url === "https://asiapicks.com/korea/seoul/incheon-airport-to-seoul"), false);
});

test("robots disallows everything on preview and omits the sitemap", () => {
  const prev = process.env.VERCEL_ENV;
  process.env.VERCEL_ENV = "preview";
  try {
    const r = robots();
    assert.deepEqual(r.rules, [{ userAgent: "*", disallow: "/" }]);
    assert.equal("sitemap" in r, false);
  } finally {
    if (prev === undefined) delete process.env.VERCEL_ENV;
    else process.env.VERCEL_ENV = prev;
  }
});

test("robots allows crawling outside preview and points at the sitemap", () => {
  const prev = process.env.VERCEL_ENV;
  delete process.env.VERCEL_ENV;
  try {
    const r = robots();
    assert.deepEqual(r.rules, [{ userAgent: "*", allow: "/", disallow: ["/api/"] }]);
    assert.equal(r.sitemap, "https://asiapicks.com/sitemap.xml");
  } finally {
    if (prev === undefined) delete process.env.VERCEL_ENV;
    else process.env.VERCEL_ENV = prev;
  }
});

test("escapeXml escapes ampersands and angle brackets", () => {
  assert.equal(escapeXml("A & B <c>"), "A &amp; B &lt;c&gt;");
});

test("feed route returns an RSS response", async () => {
  const res = feedGet();
  assert.ok(res.headers.get("content-type")?.includes("application/rss+xml"));
  const body = await res.text();
  assert.ok(body.startsWith("<?xml"));
});
