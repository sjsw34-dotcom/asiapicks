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

test("Gallery and Figure print no credit line, because the page attributes its images once", () => {
  for (const file of ["src/components/media/Gallery.tsx", "src/components/media/Figure.tsx"]) {
    const src = fs.readFileSync(path.join(process.cwd(), file), "utf-8");
    assert.doesNotMatch(src, /img\.credit|img\.license/, `${file} must leave attribution to ImageCredits`);
    // The AI disclosure is not a licence line and stays on the image itself.
    assert.match(src, /Illustration \(AI-generated\)/, `${file} must keep the AI-generated label`);
  }
});
