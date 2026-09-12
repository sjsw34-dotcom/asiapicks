import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const read = (p: string) => fs.readFileSync(path.join(process.cwd(), p), "utf-8");

test("ImageCredits carries credit, licence and a link back, because CC BY-SA requires attribution", () => {
  const src = read("src/components/media/ImageCredits.tsx");
  assert.match(src, /credit/, "must render the photographer credit");
  assert.match(src, /license/, "must render the licence");
  assert.match(src, /sourceUrl/, "must link back to the source");
});

test("the home page attributes its hero and its card images, which render without captions", () => {
  const page = read("src/app/page.tsx");
  assert.match(page, /<ImageCredits ids=\{creditIds\} \/>/, "the home page must render the credits block");
  // The ids must cover both uncaptioned uses: the hero and each destination card.
  assert.match(page, /creditIds\b[^\n]*HERO/, "credits must include the hero image");
  assert.match(page, /creditIds\b[^\n]*featuredImage|cardImages/, "credits must include the destination card images");
});
