import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { loadImages, imageSchema, getImage } from "@/lib/images/registry";

const dir = path.join(process.cwd(), "tests/fixtures/images");
const mismatchDir = path.join(process.cwd(), "tests/fixtures/images-mismatch");
const invalidDir = path.join(process.cwd(), "tests/fixtures/images-invalid");
const malformedDir = path.join(process.cwd(), "tests/fixtures/images-malformed");

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

test("third-party (KOGL/CC) images require sourceUrl; owned and AI images do not", () => {
  const base = {
    id: "x", src: "/images/x.jpg", width: 10, height: 10, alt: "a palace gate", decorative: false,
    credit: "Korea Tourism Organization", aiGenerated: false,
  };
  const kogl = imageSchema.safeParse({ ...base, license: "KOGL Type 1" });
  assert.equal(kogl.success, false);
  assert.ok(kogl.error?.issues.some((i) => i.path.join(".") === "sourceUrl"));
  assert.equal(imageSchema.safeParse({ ...base, license: "CC BY-SA 4.0", credit: "Wikimedia Commons user" }).success, false);
  assert.equal(imageSchema.safeParse({ ...base, license: "KOGL Type 1", sourceUrl: "https://phoko.visitkorea.or.kr/" }).success, true);
  assert.equal(imageSchema.safeParse({ ...base, license: "Owned", credit: "AsiaPicks" }).success, true);
  assert.equal(imageSchema.safeParse({ ...base, license: "AI-generated", credit: "AsiaPicks", aiGenerated: true }).success, true);
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

test("malformed JSON throws with file path", () => {
  assert.throws(() => loadImages(malformedDir), /Invalid JSON in image entry.*bad-syntax\.json/);
});
