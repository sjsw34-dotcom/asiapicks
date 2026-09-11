import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { loadImages, imageSchema } from "@/lib/images/registry";

const dir = path.join(process.cwd(), "tests/fixtures/images");

test("loads image entries keyed by id", () => {
  const images = loadImages(dir);
  const img = images.get("gyeongbokgung-gate");
  assert.ok(img);
  assert.equal(img.width, 1600);
  assert.equal(img.aiGenerated, false);
});

test("non-decorative image requires alt text", () => {
  const r = imageSchema.safeParse({
    id: "x", src: "/images/x.jpg", width: 10, height: 10, alt: "", decorative: false,
    credit: "KTO", license: "KOGL Type 1", aiGenerated: false,
  });
  assert.equal(r.success, false);
});

test("decorative image may have empty alt", () => {
  const r = imageSchema.safeParse({
    id: "x", src: "/images/x.jpg", width: 10, height: 10, alt: "", decorative: true,
    credit: "AsiaPicks", license: "Owned", aiGenerated: false,
  });
  assert.equal(r.success, true);
});
