import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { loadContent } from "@/lib/content/loader";
import { buildSearchIndex } from "@/lib/search/build-index";
import { faqId, normalize, parseQuery, search, type SearchIndex } from "@/lib/search/query";
import { isGone } from "@/lib/legacy/legacy";
import { staticLivePaths } from "@/lib/checks/types";

const root = path.join(process.cwd(), "tests/fixtures/content");

const doc = (p: string, title: string, extra: Partial<SearchIndex["docs"][number]> = {}) => ({
  path: p, title, label: "", summary: "", headings: [], keywords: [], faqs: [], ...extra,
});

const index: SearchIndex = {
  docs: [
    doc("/korea/seoul/subway-fares-and-transfers", "Seoul subway fares and transfers", {
      summary: "A single ride costs a base fare.",
      keywords: ["seoul subway fare"],
      faqs: [{ q: "Do I need a T-money card?", a: "Not for one ride.", id: faqId("Do I need a T-money card?") }],
    }),
    doc("/korea/how-to-pay-in-korea", "How to pay in Korea", {
      headings: ["Do I need cash in Korea?"],
      faqs: [
        { q: "Do you tip in Korea?", a: "No. Tipping is not expected.", id: faqId("Do you tip in Korea?") },
        { q: "Do I need cash in Korea?", a: "A small amount for markets.", id: faqId("Do I need cash in Korea?") },
      ],
    }),
    doc("/korea/k-eta-e-arrival-card", "K-ETA and the e-Arrival Card", { keywords: ["k-eta"] }),
    doc("/korea", "South Korea travel guide", {
      faqs: [{ q: "Do I need cash in Korea?", a: "Some.", id: faqId("Do I need cash in Korea?") }],
    }),
  ],
};

test("normalize folds case, accents and punctuation", () => {
  assert.equal(normalize("T-Money!"), "tmoney");
  assert.equal(normalize("T money card"), "tmoney card");
  assert.equal(normalize("Café  Seoul"), "cafe seoul");
});

test("synonyms: metro finds the subway guide, visa finds K-ETA", () => {
  assert.equal(search(index, "metro").docs[0].doc.path, "/korea/seoul/subway-fares-and-transfers");
  assert.equal(search(index, "visa").docs[0].doc.path, "/korea/k-eta-e-arrival-card");
  assert.equal(search(index, "tmoney").docs[0].doc.path, "/korea/seoul/subway-fares-and-transfers");
});

test("multi-word synonym phrases are one term", () => {
  assert.equal(parseQuery("credit card").length, 1);
  assert.equal(parseQuery("do I need a transit card in Korea").length, 1);
});

test("a question surfaces its FAQ answer first, once, from the guide", () => {
  const r = search(index, "Do I need cash?");
  assert.equal(r.answers.length, 1);
  assert.equal(r.answers[0].q, "Do I need cash in Korea?");
  assert.equal(r.answers[0].href, "/korea/how-to-pay-in-korea#faq-do-i-need-cash-in-korea");
});

test("a place name alone does not make a question an answer", () => {
  assert.deepEqual(search(index, "cash seoul").answers.map((a) => a.q), ["Do I need cash in Korea?"]);
  assert.equal(search(index, "can I use uber").answers.length, 0);
});

test("tipping query returns the tipping answer", () => {
  assert.equal(search(index, "tipping").answers[0]?.q, "Do you tip in Korea?");
});

test("all terms match when possible, else the closest pages; stop words alone return nothing", () => {
  assert.deepEqual(search(index, "cash tipping").docs.map((d) => d.doc.path), ["/korea/how-to-pay-in-korea"]);
  assert.deepEqual(search(index, "tmoney busy").docs.map((d) => d.doc.path), ["/korea/seoul/subway-fares-and-transfers"]);
  assert.equal(search(index, "how do I").docs.length, 0);
  assert.equal(search(index, "zzzz").docs.length, 0);
});

test("index holds live content only: no drafts, no future-dated articles", () => {
  const idx = loadContent({ root, includeReview: false, asOf: "2026-09-17" });
  const built = buildSearchIndex(idx);
  const paths = built.docs.map((d) => d.path);
  assert.ok(paths.includes("/korea/how-to-pay-in-korea"));
  assert.ok(!paths.includes("/korea/seoul/draft-post"));
  assert.ok(!paths.includes("/korea/seoul/future-guide"));
  assert.equal(paths[0].startsWith("/korea/") && idx.byPath.get(paths[0])?.kind, "article");
  const pay = built.docs.find((d) => d.path === "/korea/how-to-pay-in-korea")!;
  assert.equal(pay.faqs[0].id, faqId(pay.faqs[0].q));
});

test("/search is a live page, not a 410", () => {
  assert.equal(isGone("/search"), false);
  assert.ok(staticLivePaths().has("/search"));
});
