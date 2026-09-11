import { test } from "node:test";
import assert from "node:assert/strict";
import { isGone, classifyLegacy, LEGACY } from "@/lib/legacy/legacy";

test("gone prefixes match on segment boundaries", () => {
  assert.equal(isGone("/blog/3-days-in-kyoto"), true);
  assert.equal(isGone("/blog/category/saju-travel"), true);
  assert.equal(isGone("/destinations/japan/tokyo"), true);
  assert.equal(isGone("/saju-travel"), true);
  assert.equal(isGone("/blogger"), false);
  assert.equal(isGone("/korea/seoul"), false);
});

test("gone prefixes match with trailing slash", () => {
  assert.equal(isGone("/blog/3-days-in-kyoto/"), true);
});

test("classification order: redirect, live, gone", () => {
  const live = new Set(["/", "/about"]);
  assert.equal(classifyLegacy("/blog/where-to-stay-busan", live), "redirect");
  assert.equal(classifyLegacy("/about", live), "live");
  assert.equal(classifyLegacy("/blog/best-ryokan-kyoto", live), "gone");
  assert.equal(classifyLegacy("/old-unknown-page", live), "unhandled");
});

test("classifyLegacy treats root as live when present in livePaths", () => {
  assert.equal(classifyLegacy("/", new Set(["/"])), "live");
});

test("redirect sources are unique and targets are new-site paths", () => {
  const froms = LEGACY.redirects.map((r) => r.from);
  assert.equal(new Set(froms).size, froms.length);
  for (const r of LEGACY.redirects) assert.ok(r.to === "/" || r.to.startsWith("/korea"), r.to);
});

test("proxy: www host redirects 308 to apex, preserving path and query", async () => {
  const { proxy } = await import("@/proxy");
  const { NextRequest } = await import("next/server");
  const res = proxy(
    new NextRequest("https://www.asiapicks.com/korea?x=1", { headers: { host: "www.asiapicks.com" } })
  );
  assert.equal(res.status, 308);
  assert.equal(res.headers.get("location"), "https://asiapicks.com/korea?x=1");
});

test("proxy: gone prefix on apex host returns 410 with noindex and removal copy", async () => {
  const { proxy } = await import("@/proxy");
  const { NextRequest } = await import("next/server");
  const res = proxy(
    new NextRequest("https://asiapicks.com/blog/3-days-in-kyoto", { headers: { host: "asiapicks.com" } })
  );
  assert.equal(res.status, 410);
  assert.equal(res.headers.get("x-robots-tag"), "noindex");
  const body = await res.text();
  assert.ok(body.includes("This page has been removed"));
});

test("proxy: apex host, live path passes through untouched", async () => {
  const { proxy } = await import("@/proxy");
  const { NextRequest } = await import("next/server");
  const res = proxy(
    new NextRequest("https://asiapicks.com/korea", { headers: { host: "asiapicks.com" } })
  );
  assert.equal(res.headers.get("location"), null);
  assert.notEqual(res.status, 410);
});
