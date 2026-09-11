import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { buildAffiliateUrl, isProviderConfigured } from "@/lib/affiliates/providers";
import { getOffer, loadOffers, offerSchema, parseIdList } from "@/lib/affiliates/offers";

// Obviously fake IDs. Never put the owner's real affiliate IDs in tests.
const env = {
  VIATOR_PID: "P00000001", VIATOR_MCID: "11111",
  CREATRIP_AFF_CODE: "testcode",
  TRIPCOM_ALLIANCE_ID: "1234567", TRIPCOM_SID: "7654321",
} as unknown as NodeJS.ProcessEnv;

const dir = path.join(process.cwd(), "tests/fixtures/offers");
const malformedDir = path.join(process.cwd(), "tests/fixtures/offers-malformed");
const invalidDir = path.join(process.cwd(), "tests/fixtures/offers-invalid");
const mismatchDir = path.join(process.cwd(), "tests/fixtures/offers-mismatch");

test("viator link carries pid, mcid, medium and campaign", () => {
  const { url, tracked } = buildAffiliateUrl("viator", "https://www.viator.com/Seoul/d973", "dmz-tours", env);
  const u = new URL(url);
  assert.equal(tracked, true);
  assert.equal(u.searchParams.get("pid"), "P00000001");
  assert.equal(u.searchParams.get("mcid"), "11111");
  assert.equal(u.searchParams.get("medium"), "link");
  assert.equal(u.searchParams.get("campaign"), "dmz-tours");
});

test("creatrip link carries utm_source and aff_id", () => {
  const u = new URL(buildAffiliateUrl("creatrip", "https://creatrip.com/en/spot/123", "hanbok-rental", env).url);
  assert.equal(u.searchParams.get("utm_source"), "AFF-testcode");
  assert.equal(u.searchParams.get("aff_id"), "AFF-testcode");
  assert.equal(u.searchParams.get("utm_campaign"), "hanbok-rental");
});

test("trip.com link carries Allianceid, SID, trip_sub1", () => {
  const u = new URL(buildAffiliateUrl("tripcom", "https://www.trip.com/hotels/", "where-to-stay-in-seoul", env).url);
  assert.equal(u.searchParams.get("Allianceid"), "1234567");
  assert.equal(u.searchParams.get("SID"), "7654321");
  assert.equal(u.searchParams.get("trip_sub1"), "where-to-stay-in-seoul");
});

test("missing ids produce a plain link", () => {
  const empty = {} as NodeJS.ProcessEnv;
  const r = buildAffiliateUrl("viator", "https://www.viator.com/Seoul/d973", "x", empty);
  assert.equal(r.tracked, false);
  assert.equal(r.url, "https://www.viator.com/Seoul/d973");
  assert.equal(isProviderConfigured("viator", empty), false);
  assert.equal(isProviderConfigured("viator", env), true);
});

test("offer registry loads and validates provider host", () => {
  const offers = loadOffers(dir);
  assert.equal(offers.get("dmz-half-day-tour")?.provider, "viator");
  const bad = offerSchema.safeParse({
    id: "bad", provider: "viator", kind: "tour", title: "t", summary: "s",
    targetUrl: "https://www.trip.com/x", destination: "korea/seoul", tags: [],
  });
  assert.equal(bad.success, false);
});

test("priceText requires priceCheckedAt", () => {
  const r = offerSchema.safeParse({
    id: "p", provider: "tripcom", kind: "hotel", title: "t", summary: "s", priceText: "$100",
    targetUrl: "https://www.trip.com/hotels/", destination: "korea/seoul", tags: [],
  });
  assert.equal(r.success, false);
});

test("parseIdList splits comma strings", () => {
  assert.deepEqual(parseIdList(" a, b ,c "), ["a", "b", "c"]);
  assert.deepEqual(parseIdList(""), []);
});

// --- Controller rulings: error-path coverage for the offers registry loader ---

test("malformed JSON throws with file name", () => {
  assert.throws(() => loadOffers(malformedDir), /Invalid JSON in offer/);
  assert.throws(() => loadOffers(malformedDir), /bad-syntax\.json/);
});

test("schema-invalid entry throws", () => {
  assert.throws(() => loadOffers(invalidDir), /Invalid offer/);
});

test("id/filename mismatch throws", () => {
  assert.throws(() => loadOffers(mismatchDir), /does not match file name/);
});

test("getOffer with unknown id throws", () => {
  assert.throws(() => getOffer("no-such-offer"), /Unknown offer id/);
});

test("invalid targetUrl fails schema without throwing", () => {
  const r = offerSchema.safeParse({
    id: "bad-url", provider: "viator", kind: "tour", title: "t", summary: "s",
    targetUrl: "not-a-url", destination: "korea/seoul", tags: [],
  });
  assert.equal(r.success, false);
});

// --- Final review: documented rel rules must match the implementation ---

test("CLAUDE.md and the plan's Global Constraints document the implemented rel rules", () => {
  const read = (p: string) => fs.readFileSync(path.join(process.cwd(), p), "utf-8");
  const impl = read("src/components/affiliate/OfferCard.tsx");
  assert.match(impl, /tracked \? "sponsored nofollow noopener" : "nofollow noopener"/);
  const docs = {
    "CLAUDE.md": read("CLAUDE.md"),
    "plan Global Constraints": read("docs/superpowers/plans/2026-09-12-platform-rebuild.md").split("## File Structure")[0],
  };
  for (const [name, doc] of Object.entries(docs)) {
    const line = doc.split("\n").find((l) => l.includes('rel="sponsored nofollow noopener"'));
    assert.ok(line, `${name} does not state the tracked-link rel`);
    assert.ok(line.includes('rel="nofollow noopener"'), `${name} does not state the untracked-link rel on the same rule`);
  }
});
