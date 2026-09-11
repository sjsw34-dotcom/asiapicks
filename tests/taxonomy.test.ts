import { test } from "node:test";
import assert from "node:assert/strict";
import { SITE, absoluteUrl } from "@/lib/site";
import { getCountry, getCity, getCategory, isReservedSegment, CITIES } from "@/data/taxonomy";
import { getEditor } from "@/data/editors";

test("site constants", () => {
  assert.equal(SITE.name, "AsiaPicks");
  assert.equal(SITE.description, "AsiaPicks, an Asia travel discovery and planning website");
  assert.equal(absoluteUrl("/korea"), "https://asiapicks.com/korea");
  assert.equal(absoluteUrl("/"), "https://asiapicks.com");
});

test("taxonomy lookups", () => {
  assert.equal(getCountry("korea")?.name, "South Korea");
  assert.equal(getCity("korea", "seoul")?.name, "Seoul");
  assert.equal(getCity("korea", "tokyo"), undefined);
  assert.equal(getCategory("city", "where-to-stay")?.label, "Where to Stay");
  assert.equal(getCategory("country", "where-to-stay"), undefined);
  assert.deepEqual(CITIES.map((c) => c.slug), ["seoul", "busan", "jeju", "gyeongju", "incheon"]);
});

test("reserved segments", () => {
  assert.equal(isReservedSegment("korea", "seoul"), true);
  assert.equal(isReservedSegment("korea", "planning"), true);
  assert.equal(isReservedSegment("korea", "how-to-pay-in-korea"), false);
});

test("default editor exists", () => {
  assert.equal(getEditor("editorial").kind, "Organization");
  assert.throws(() => getEditor("nobody"));
});
