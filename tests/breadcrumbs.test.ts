import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { loadContent } from "@/lib/content/loader";
import { breadcrumbsFor } from "@/lib/content/breadcrumbs";

const idx = loadContent({ root: path.join(process.cwd(), "tests/fixtures/content"), includeReview: false });

test("breadcrumbs for country hub", () => {
  const hub = idx.hubs.find((h) => h.path === "/korea")!;
  assert.deepEqual(breadcrumbsFor(hub), [
    { name: "Home", path: "/" },
    { name: "South Korea", path: "/korea" },
  ]);
});

test("breadcrumbs for city hub", () => {
  const hub = idx.hubs.find((h) => h.path === "/korea/seoul")!;
  assert.deepEqual(breadcrumbsFor(hub), [
    { name: "Home", path: "/" },
    { name: "South Korea", path: "/korea" },
    { name: "Seoul", path: "/korea/seoul" },
  ]);
});

test("breadcrumbs for category page", () => {
  const cat = idx.categories.find((c) => c.path === "/korea/seoul/transportation")!;
  assert.deepEqual(breadcrumbsFor(cat), [
    { name: "Home", path: "/" },
    { name: "South Korea", path: "/korea" },
    { name: "Seoul", path: "/korea/seoul" },
    { name: "Seoul Transportation Guides", path: "/korea/seoul/transportation" },
  ]);
});

test("breadcrumbs for country article", () => {
  const a = idx.articles.find((x) => x.path === "/korea/how-to-pay-in-korea")!;
  assert.deepEqual(breadcrumbsFor(a), [
    { name: "Home", path: "/" },
    { name: "South Korea", path: "/korea" },
    { name: "Planning", path: "/korea/planning" },
    { name: "How to Pay in Korea as a Tourist", path: "/korea/how-to-pay-in-korea" },
  ]);
});

test("breadcrumbs for city article", () => {
  const a = idx.articles.find((x) => x.path === "/korea/seoul/incheon-airport-to-seoul")!;
  assert.deepEqual(breadcrumbsFor(a), [
    { name: "Home", path: "/" },
    { name: "South Korea", path: "/korea" },
    { name: "Seoul", path: "/korea/seoul" },
    { name: "Transportation", path: "/korea/seoul/transportation" },
    { name: "Incheon Airport to Seoul: AREX vs Airport Bus vs Taxi", path: "/korea/seoul/incheon-airport-to-seoul" },
  ]);
});
