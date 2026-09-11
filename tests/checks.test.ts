import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { loadContent, type ContentIndex, type Article, type Hub } from "@/lib/content/loader";
import { contentCheck } from "@/lib/checks/content";
import { linksCheck } from "@/lib/checks/links";
import { imagesCheck } from "@/lib/checks/images";
import { redirectsCheck } from "@/lib/checks/redirects";
import { releaseCheck } from "@/lib/checks/release";
import { factsCheck } from "@/lib/checks/facts";
import { staticLivePaths } from "@/lib/checks/types";
import { loadImages, type ImageEntry } from "@/lib/images/registry";
import type { Offer } from "@/lib/affiliates/offers";

const idx = loadContent({ root: path.join(process.cwd(), "tests/fixtures/content"), includeReview: false });
const live = staticLivePaths();

function withArticle(base: ContentIndex, patch: (a: Article) => Article): ContentIndex {
  const src = base.articles.find((a) => a.fm.slug === "how-to-pay-in-korea")!;
  const changed = patch({ ...src, fm: { ...src.fm } });
  const articles = base.articles.map((a) => (a === src ? changed : a));
  const byPath = new Map(base.byPath);
  byPath.set(changed.path, changed);
  return { ...base, articles, byPath };
}

function withHub(base: ContentIndex, patch: (h: Hub) => Hub): ContentIndex {
  const src = base.hubs.find((h) => h.path === "/korea")!;
  const changed = patch({ ...src, fm: { ...src.fm } });
  const hubs = base.hubs.map((h) => (h === src ? changed : h));
  const byPath = new Map(base.byPath);
  byPath.set(changed.path, changed);
  return { ...base, hubs, byPath };
}

test("fixture content passes content and link checks", () => {
  assert.deepEqual(contentCheck(idx, new Map(), new Map()).errors, []);
  assert.deepEqual(linksCheck(idx, live).errors, []);
});

test("broken internal link is an error", () => {
  const bad = withArticle(idx, (a) => ({ ...a, body: `${a.body}\n[x](/korea/nowhere)` }));
  assert.match(linksCheck(bad, live).errors.join("\n"), /\/korea\/nowhere/);
});

test("H1 in body, two booking CTAs, unknown offer are errors", () => {
  const bad = withArticle(idx, (a) => ({
    ...a,
    body: `# Title\n<BookingCTA id="x" />\n<BookingCTA id="y" />`,
  }));
  const errors = contentCheck(bad, new Map(), new Map()).errors.join("\n");
  assert.match(errors, /H1/);
  assert.match(errors, /BookingCTA/);
  assert.match(errors, /unknown offer "x"/);
});

test("published seed content is an error", () => {
  const bad = withArticle(idx, (a) => ({ ...a, body: `${a.body}\nSEED CONTENT` }));
  assert.match(contentCheck(bad, new Map(), new Map()).errors.join("\n"), /seed/i);
});

test("legacy inventory must be fully handled; missing targets only fail production", () => {
  const inventory = ["/blog/where-to-stay-busan", "/blog/best-ryokan-kyoto", "/about", "/mystery"];
  const dev = redirectsCheck(idx, inventory, live, false);
  assert.match(dev.errors.join("\n"), /\/mystery/);
  assert.equal(dev.errors.some((e) => e.includes("where-to-stay-in-busan")), false);
  assert.ok(dev.warnings.some((w) => w.includes("where-to-stay-in-busan")));
  const prod = redirectsCheck(idx, [], live, true);
  assert.ok(prod.errors.some((e) => e.includes("where-to-stay-in-busan")));
});

test("production requires CONTACT_EMAIL", () => {
  const r = releaseCheck(idx, new Map(), {} as NodeJS.ProcessEnv, true);
  assert.match(r.errors.join("\n"), /CONTACT_EMAIL/);
  assert.deepEqual(releaseCheck(idx, new Map(), {} as NodeJS.ProcessEnv, false).errors, []);
});

test("stale sources are warnings", () => {
  const r = factsCheck(idx, new Map(), "2027-01-15");
  assert.ok(r.warnings.length > 0);
  assert.deepEqual(r.errors, []);
});

// --- Controller ruling additions below ---

test("article with no inbound links is an orphan", () => {
  const noLink = withHub(idx, (h) => ({
    ...h,
    body: h.body.replace("[how to pay in Korea](/korea/how-to-pay-in-korea)", "how to pay in Korea"),
  }));
  assert.match(linksCheck(noLink, live).errors.join("\n"), /orphan/);
});

test("spoke article that stops linking to its hub is an error", () => {
  const noHubLink = withArticle(idx, (a) => ({
    ...a,
    body: a.body.replace("[South Korea guide](/korea)", "South Korea guide"),
  }));
  assert.match(linksCheck(noHubLink, live).errors.join("\n"), /does not link to its hub/);
});

test("article referencing an unknown image id is an error", () => {
  const bad = withArticle(idx, (a) => ({ ...a, fm: { ...a.fm, featuredImage: "missing-image" } }));
  assert.match(contentCheck(bad, new Map(), new Map()).errors.join("\n"), /unknown image "missing-image"/);
});

test("article slug colliding with a reserved segment is an error", () => {
  const bad = withArticle(idx, (a) => ({ ...a, fm: { ...a.fm, slug: "transportation" } }));
  assert.match(contentCheck(bad, new Map(), new Map()).errors.join("\n"), /collides/);
});

test("images check flags a missing file and an AI caption calling itself a photo", () => {
  const images = loadImages(path.join(process.cwd(), "tests/fixtures/images"));
  const missing = imagesCheck(images, path.join(process.cwd(), "public"));
  assert.match(missing.errors.join("\n"), /gyeongbokgung-gate/);

  const aiImages = new Map<string, ImageEntry>([
    [
      "ai-palace",
      {
        id: "ai-palace",
        src: "/images/korea/ai-palace.jpg",
        width: 100,
        height: 100,
        alt: "an illustrated palace",
        decorative: false,
        caption: "Photo of a palace",
        credit: "AsiaPicks",
        license: "AI-generated",
        aiGenerated: true,
      },
    ],
  ]);
  const captioned = imagesCheck(aiImages, path.join(process.cwd(), "public"));
  assert.match(captioned.errors.join("\n"), /caption/);
});

test("a redirect whose source is now a live page is an error", () => {
  const withBlog: ContentIndex = { ...idx, byPath: new Map(idx.byPath) };
  withBlog.byPath.set("/blog", idx.hubs[0]);
  const r = redirectsCheck(withBlog, [], live, false);
  assert.match(r.errors.join("\n"), /is a live page/);
});

test("release check in production warns about unconfigured providers without failing", () => {
  const offers = new Map<string, Offer>([
    [
      "dmz-tour",
      {
        id: "dmz-tour",
        provider: "viator",
        kind: "tour",
        title: "DMZ Half Day Tour",
        summary: "A half day tour of the DMZ.",
        targetUrl: "https://www.viator.com/tours/dmz",
        destination: "korea",
        tags: [],
      },
    ],
  ]);
  const r = releaseCheck(idx, offers, { NODE_ENV: "production", CONTACT_EMAIL: "hello@asiapicks.com" } as NodeJS.ProcessEnv, true);
  assert.match(r.warnings.join("\n"), /Viator/);
  assert.deepEqual(r.errors, []);
});
