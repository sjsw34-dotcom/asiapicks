import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { loadImages, imageSchema, getImage } from "@/lib/images/registry";

const dir = path.join(process.cwd(), "tests/fixtures/images");
const mismatchDir = path.join(process.cwd(), "tests/fixtures/images-mismatch");
const invalidDir = path.join(process.cwd(), "tests/fixtures/images-invalid");

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

test("id/filename mismatch throws", () => {
  assert.throws(() => loadImages(mismatchDir), /does not match file name/);
});

test("schema-invalid entry throws", () => {
  assert.throws(() => loadImages(invalidDir), /Invalid image entry/);
});

test("getImage with unknown id throws", () => {
  assert.throws(() => getImage("no-such-image"), /Unknown image id/);
});
