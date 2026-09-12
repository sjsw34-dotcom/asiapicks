import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { articleSchema } from "@/lib/content/schema";
import { answerLabel, leadsWithStandfirst, TEMPLATES } from "@/lib/content/templates";

const base = {
  title: "t",
  description: "d".repeat(60),
  slug: "a-slug",
  category: "transportation",
  journeyStage: "planning",
  searchIntent: "informational",
  primaryKeyword: "k",
  summary: "s",
  publishedAt: "2026-09-12",
  updatedAt: "2026-09-12",
  status: "review",
};

test("the schema accepts an essay template alongside the existing shapes", () => {
  for (const template of TEMPLATES) {
    assert.equal(articleSchema.safeParse({ ...base, template }).success, true, `${template} should parse`);
  }
  assert.ok(TEMPLATES.includes("essay"), "essay is the narrative shape the enum was missing");
  assert.equal(articleSchema.safeParse({ ...base, template: "listicle" }).success, false);
});

test("a comparison leads with the verdict, so its box is labelled Our pick", () => {
  assert.equal(answerLabel("comparison"), "Our pick");
  assert.equal(answerLabel("where-to-stay"), "Our pick");
});

test("lookup shapes keep the short answer label", () => {
  assert.equal(answerLabel("guide"), "Short answer");
  assert.equal(answerLabel("itinerary"), "Short answer");
  assert.equal(answerLabel("best-of"), "Short answer");
});

test("an essay opens with a standfirst rather than a boxed answer", () => {
  assert.equal(leadsWithStandfirst("essay"), true);
  for (const t of TEMPLATES.filter((x) => x !== "essay")) {
    assert.equal(leadsWithStandfirst(t), false, `${t} keeps the answer box`);
  }
});

test("every template is documented in CLAUDE.md, so writers know the voice", () => {
  const doc = fs.readFileSync(path.join(process.cwd(), "CLAUDE.md"), "utf-8");
  for (const t of TEMPLATES) {
    assert.match(doc, new RegExp(`\\b${t}\\b`), `CLAUDE.md must describe the ${t} template`);
  }
});
