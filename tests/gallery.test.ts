import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { bodyImageIds } from "@/lib/checks/content";

test("bodyImageIds finds ids in both Figure and Gallery", () => {
  const body = '<Figure id="hero" />\n\nsome prose\n\n<Gallery ids="one, two,three" />';
  assert.deepEqual(bodyImageIds(body), ["hero", "one", "two", "three"]);
});

test("bodyImageIds still returns an empty list for a body with no images", () => {
  assert.deepEqual(bodyImageIds("just prose with an <OfferList ids=\"a\" /> in it"), []);
});

test("Gallery is registered in the MDX component map", () => {
  const mdx = fs.readFileSync(path.join(process.cwd(), "src/components/content/Mdx.tsx"), "utf-8");
  assert.match(mdx, /Gallery/, "Gallery must be available to MDX bodies");
});

test("Gallery credits every image, because CC BY-SA requires attribution per image", () => {
  const src = fs.readFileSync(path.join(process.cwd(), "src/components/media/Gallery.tsx"), "utf-8");
  // Each rendered item must surface credit and licence, not just the first.
  assert.match(src, /credit/, "Gallery must render the photographer credit");
  assert.match(src, /license/, "Gallery must render the licence");
  assert.match(src, /sourceUrl/, "Gallery must link back to the source");
});
