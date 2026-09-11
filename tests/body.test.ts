import { test } from "node:test";
import assert from "node:assert/strict";
import { usesAffiliateComponents, hasMdxH1, bookingCtaCount, formatDate } from "@/lib/content/body";

test("detects affiliate components", () => {
  assert.equal(usesAffiliateComponents('Text\n<OfferList ids="a,b" />'), true);
  assert.equal(usesAffiliateComponents("Plain text about offers"), false);
});

test("detects markdown H1 outside code fences", () => {
  assert.equal(hasMdxH1("# Title\n\nBody"), true);
  assert.equal(hasMdxH1("## H2\n\n```\n# not a heading\n```"), false);
});

test("counts booking CTAs", () => {
  assert.equal(bookingCtaCount('<BookingCTA id="a" />\n<BookingCTA id="b" />'), 2);
});

test("formats ISO dates in UTC", () => {
  assert.equal(formatDate("2026-09-12"), "Sep 12, 2026");
});

test("affiliate components inside a fenced code block are ignored", () => {
  const body = "Text\n\n```mdx\n<OfferList ids=\"a,b\" />\n<BookingCTA id=\"a\" />\n```\n";
  assert.equal(usesAffiliateComponents(body), false);
  assert.equal(bookingCtaCount(body), 0);
});
