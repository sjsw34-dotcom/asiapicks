import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { needsDisclosure } from "@/lib/content/body";

test("needsDisclosure: offers in frontmatter or affiliate components in the body", () => {
  assert.equal(needsDisclosure('Intro\n<OfferList ids="a,b" />'), true);
  assert.equal(needsDisclosure('<ComparisonTable ids="a,b" />'), true);
  assert.equal(needsDisclosure("Plain hub body with no offers."), false);
  assert.equal(needsDisclosure("Plain body", ["dmz-half-day-tour"]), true);
  assert.equal(needsDisclosure('```mdx\n<Offer id="a" />\n```'), false);
});

test("every layout that renders MDX shows the disclosure before the answer box and body", () => {
  const dir = path.join(process.cwd(), "src/components/content");
  const read = (f: string) => fs.readFileSync(path.join(dir, f), "utf-8");
  const layouts = fs.readdirSync(dir).filter((f) => f.endsWith(".tsx") && /<Mdx\b/.test(read(f)));
  assert.deepEqual(layouts.sort(), ["AreaLayout.tsx", "ArticleLayout.tsx", "CategoryLayout.tsx", "HubLayout.tsx", "StaticPage.tsx"]);
  for (const f of layouts) {
    const src = read(f);
    assert.match(src, /needsDisclosure\(/, `${f} does not decide the disclosure with needsDisclosure()`);
    const d = src.indexOf("<Disclosure />");
    assert.ok(d > 0, `${f} never renders <Disclosure />`);
    const firstBody = Math.min(...["<AnswerBox", "<Mdx"].map((t) => src.indexOf(t)).filter((i) => i >= 0));
    assert.ok(d < firstBody, `${f} renders <Disclosure /> after the answer box or body`);
  }
});
