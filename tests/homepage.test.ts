import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { getStaticPage, pageSchema } from "@/lib/content/pages";
import { staleItems } from "@/lib/checks/facts";
import type { ContentIndex } from "@/lib/content/loader";
import type { Offer } from "@/lib/affiliates/offers";

test("pageSchema accepts sources and faqs, and defaults them to empty", () => {
  const minimal = pageSchema.safeParse({ title: "t", description: "d".repeat(60), updatedAt: "2026-09-12" });
  assert.equal(minimal.success, true);
  assert.deepEqual(minimal.success && minimal.data.sources, []);
  assert.deepEqual(minimal.success && minimal.data.faqs, []);

  const full = pageSchema.safeParse({
    title: "t",
    description: "d".repeat(60),
    updatedAt: "2026-09-12",
    faqs: [{ q: "q", a: "a" }],
    sources: [{ title: "s", url: "https://example.com", publisher: "p", checkedAt: "2026-09-12" }],
  });
  assert.equal(full.success, true);
  assert.equal(full.success && full.data.sources[0].publisher, "p");
});

test("pageSchema still rejects a source with no checkedAt", () => {
  const r = pageSchema.safeParse({
    title: "t",
    description: "d".repeat(60),
    updatedAt: "2026-09-12",
    sources: [{ title: "s", url: "https://example.com", publisher: "p" }],
  });
  assert.equal(r.success, false);
});

test("the home page exists and targets the planning query", () => {
  const { fm, body } = getStaticPage("home");
  assert.match(fm.title, /plan/i, "title must carry the planning intent, not a brand slogan");
  assert.ok(fm.sources.length > 0, "home page facts must be sourced like any other page");
  assert.ok(fm.faqs.length > 0, "home page should emit FAQ structured data");
  assert.doesNotMatch(body, /^#\s/m, "no H1 in the body; the page renders it from the title");
});

test("staleItems covers static pages, so home page facts cannot rot unnoticed", () => {
  const items = staleItems(
    { hubs: [], articles: [], categories: [] } as unknown as ContentIndex,
    new Map<string, Offer>(),
    "2026-09-12",
    90,
    [{ slug: "home", file: "src/content/pages/home.mdx", title: "Home", sources: [{ title: "old", url: "https://e.com", publisher: "p", checkedAt: "2025-01-01" }] }],
  );
  assert.equal(items.length, 1);
  assert.equal(items[0].kind, "page");
  assert.equal(items[0].path, "/home");
});

test("every static page with sources keeps them in the registry-checked shape", () => {
  const dir = path.join(process.cwd(), "src/content/pages");
  for (const name of fs.readdirSync(dir).filter((f) => f.endsWith(".mdx"))) {
    const slug = name.replace(/\.mdx$/, "");
    assert.doesNotThrow(() => getStaticPage(slug), `${slug} must parse`);
  }
});
