import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { buildMetadata } from "@/lib/seo/metadata";
import { articleSchema, breadcrumbSchema, jsonLdString, organizationSchema, destinationSchema } from "@/lib/seo/schema";
import { loadContent } from "@/lib/content/loader";

const idx = loadContent({ root: path.join(process.cwd(), "tests/fixtures/content"), includeReview: false });

test("metadata sets canonical, og and robots", () => {
  const m = buildMetadata({ title: "T", description: "D", path: "/korea", noindex: true });
  assert.equal((m.alternates as { canonical: string }).canonical, "https://asiapicks.com/korea");
  assert.deepEqual(m.robots, { index: false, follow: true });
  const og = m.openGraph as { url: string; siteName: string };
  assert.equal(og.url, "https://asiapicks.com/korea");
  assert.equal(og.siteName, "AsiaPicks");
});

test("organization uses the entity description", () => {
  const org = organizationSchema();
  assert.equal(org.name, "AsiaPicks");
  assert.equal(org.description, "AsiaPicks, an Asia travel discovery and planning website");
});

test("article schema reflects frontmatter", () => {
  const a = idx.articles.find((x) => x.fm.slug === "how-to-pay-in-korea")!;
  const s = articleSchema(a);
  assert.equal(s["@type"], "BlogPosting");
  assert.equal(s.url, "https://asiapicks.com/korea/how-to-pay-in-korea");
  assert.equal(s.dateModified, "2026-09-12");
  assert.equal(s.author["@type"], "Organization");
  assert.equal("aggregateRating" in s, false);
});

test("destination schema for city hub", () => {
  const h = idx.hubs.find((x) => x.path === "/korea/seoul")!;
  const s = destinationSchema(h);
  assert.equal(s["@type"], "TouristDestination");
  assert.equal(s.name, "Seoul");
});

test("breadcrumbs and escaping", () => {
  const b = breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Korea", path: "/korea" }]);
  assert.equal(b.itemListElement[1].item, "https://asiapicks.com/korea");
  assert.equal(jsonLdString({ x: "</script>" }).includes("</script>"), false);
});
