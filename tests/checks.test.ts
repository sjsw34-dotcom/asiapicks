import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { loadContent, type ContentIndex, type Article, type Hub, type CategoryPage } from "@/lib/content/loader";
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

test("an article that links to no other article, or that no article links to, is an error", () => {
  const isolated = withArticle(idx, (a) => ({ ...a, body: "[Korea](/korea)" }));
  const errors = linksCheck(isolated, live).errors.join("\n");
  assert.match(errors, /how-to-pay-in-korea\.mdx: links to 0 other article/);
  assert.match(errors, /incheon-airport-to-seoul\.mdx: no other article links here/);
});

test("a GuideCard counts as a link in both directions", () => {
  const carded = withArticle(idx, (a) => ({ ...a, body: `[Korea](/korea)\n<GuideCard href="/korea/seoul/incheon-airport-to-seoul" />` }));
  assert.deepEqual(linksCheck(carded, live).errors, []);
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
  const airport = noLink.articles.find((a) => a.fm.slug === "incheon-airport-to-seoul")!;
  const unlinked = { ...airport, body: airport.body.replace("[how to pay in Korea](/korea/how-to-pay-in-korea)", "how to pay in Korea") };
  noLink.articles = noLink.articles.map((a) => (a === airport ? unlinked : a));
  noLink.byPath.set(unlinked.path, unlinked);
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

// --- Final whole-branch review fixes ---

function withCategory(base: ContentIndex, patch: (c: CategoryPage) => CategoryPage): ContentIndex {
  const src = base.categories.find((c) => c.path === "/korea/planning")!;
  const changed = patch({ ...src, fm: { ...src.fm } });
  const categories = base.categories.map((c) => (c === src ? changed : c));
  const byPath = new Map(base.byPath);
  byPath.set(changed.path, changed);
  return { ...base, categories, byPath };
}

const offer = (id: string, patch: Partial<Offer> = {}): Offer => ({
  id,
  provider: "creatrip",
  kind: "ticket",
  title: "Palace entry ticket",
  summary: "Skip the ticket line at the palace gate.",
  targetUrl: "https://creatrip.com/en",
  destination: "korea/seoul",
  tags: [],
  ...patch,
});

test("unknown offer and image ids in hub and category bodies are errors", () => {
  const hub = withHub(idx, (h) => ({ ...h, body: `${h.body}\n<OfferList ids="x" />` }));
  assert.match(contentCheck(hub, new Map(), new Map()).errors.join("\n"), /korea\/_hub\.mdx: unknown offer "x"/);
  const cat = withCategory(idx, (c) => ({ ...c, body: `${c.body}\n<Figure id="no-such-figure" />\n<BookingCTA id="y" />` }));
  const errors = contentCheck(cat, new Map(), new Map()).errors.join("\n");
  assert.match(errors, /_categories\/planning\.mdx: unknown image "no-such-figure"/);
  assert.match(errors, /_categories\/planning\.mdx: unknown offer "y"/);
});

test("seed category intro is an error only in production", () => {
  const bySummary = withCategory(idx, (c) => ({ ...c, fm: { ...c.fm, summary: "SEED CONTENT intro." } }));
  const byBody = withCategory(idx, (c) => ({ ...c, body: "SEED CONTENT." }));
  for (const seeded of [bySummary, byBody]) {
    assert.match(contentCheck(seeded, new Map(), new Map(), true).errors.join("\n"), /planning\.mdx: seed content/);
    assert.deepEqual(contentCheck(seeded, new Map(), new Map(), false).errors, []);
  }
});

test("seed offer is an error only in production", () => {
  for (const o of [offer("seed-a", { summary: "SEED CONTENT offer." }), offer("seed-b", { title: "SEED CONTENT title" })]) {
    const offers = new Map([[o.id, o]]);
    assert.match(contentCheck(idx, new Map(), offers, true).errors.join("\n"), new RegExp(`offer "${o.id}": seed content`));
    assert.deepEqual(contentCheck(idx, new Map(), offers, false).errors, []);
  }
});

test("offer image missing from the image registry is an error", () => {
  const offers = new Map([["palace-ticket", offer("palace-ticket", { image: "missing-image" })]]);
  assert.match(contentCheck(idx, new Map(), offers).errors.join("\n"), /offer "palace-ticket": unknown image "missing-image"/);
  const images = loadImages(path.join(process.cwd(), "tests/fixtures/images"));
  const ok = new Map([["palace-ticket", offer("palace-ticket", { image: "gyeongbokgung-gate" })]]);
  assert.deepEqual(contentCheck(idx, images, ok).errors, []);
});

test("provider URLs hardcoded in MDX bodies are errors", () => {
  const article = withArticle(idx, (a) => ({ ...a, body: `${a.body}\n[book](https://www.viator.com/x)` }));
  assert.match(
    contentCheck(article, new Map(), new Map()).errors.join("\n"),
    /how-to-pay-in-korea\.mdx: provider URL https:\/\/www\.viator\.com\/x/,
  );
  const hub = withHub(idx, (h) => ({ ...h, body: `${h.body}\n<a href="https://KR.Trip.com/hotels">hotels</a>` }));
  assert.match(contentCheck(hub, new Map(), new Map()).errors.join("\n"), /_hub\.mdx: provider URL/);
  const cat = withCategory(idx, (c) => ({ ...c, body: `${c.body}\n[spot](https://creatrip.com/en/spot/1)` }));
  assert.match(contentCheck(cat, new Map(), new Map()).errors.join("\n"), /planning\.mdx: provider URL/);
  const official = withArticle(idx, (a) => ({
    ...a,
    body: `${a.body}\n[AREX](https://www.arex.or.kr/) and [a blog](https://notviator.com/x)`,
  }));
  assert.deepEqual(contentCheck(official, new Map(), new Map()).errors, []);
});

test("a live page under a gone prefix is an error (the proxy would 410 it)", () => {
  const withGone: ContentIndex = { ...idx, byPath: new Map(idx.byPath) };
  withGone.byPath.set("/deals", idx.hubs[0]);
  assert.match(redirectsCheck(withGone, [], live, false).errors.join("\n"), /\/deals.*410/);
  assert.equal(redirectsCheck(idx, [], live, false).errors.some((e) => e.includes("410")), false);
});
