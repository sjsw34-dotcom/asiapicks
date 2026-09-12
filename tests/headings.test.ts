import { test } from "node:test";
import assert from "node:assert/strict";
import { headings } from "@/lib/content/body";

test("headings lists H2s with the same ids rehype-slug generates", () => {
  const body = [
    "## How many days do you need?",
    "prose",
    "## Do you need a visa or a K-ETA?",
    "prose",
    "## What does getting around cost?",
  ].join("\n\n");
  assert.deepEqual(headings(body), [
    { text: "How many days do you need?", id: "how-many-days-do-you-need" },
    { text: "Do you need a visa or a K-ETA?", id: "do-you-need-a-visa-or-a-k-eta" },
    { text: "What does getting around cost?", id: "what-does-getting-around-cost" },
  ]);
});

test("headings ignores H3s and deeper, so the list stays a page outline", () => {
  assert.deepEqual(headings("## Top\n\n### Nested\n\n#### Deeper"), [{ text: "Top", id: "top" }]);
});

test("headings ignores headings inside code fences", () => {
  const body = "## Real\n\n```\n## Not a heading\n```\n";
  assert.deepEqual(headings(body), [{ text: "Real", id: "real" }]);
});

test("headings de-duplicates repeated titles the way rehype-slug does", () => {
  assert.deepEqual(headings("## Costs\n\n## Costs"), [
    { text: "Costs", id: "costs" },
    { text: "Costs", id: "costs-1" },
  ]);
});

test("headings strips inline markdown from the label", () => {
  assert.deepEqual(headings("## The **1,550 won** fare"), [{ text: "The 1,550 won fare", id: "the-1550-won-fare" }]);
});

test("headings returns an empty list for a body with no H2", () => {
  assert.deepEqual(headings("just prose\n\nand more"), []);
});
