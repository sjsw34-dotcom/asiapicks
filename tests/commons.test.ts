import { test } from "node:test";
import assert from "node:assert/strict";
import {
  stripHtml,
  normalizeLicense,
  isFreeLicense,
  isUsableMime,
  parseImageInfo,
  toImageEntry,
  imageFileName,
  commonsSearchUrl,
  commonsInfoUrl,
  type CommonsImageInfo,
} from "@/lib/images/commons";

const INFO: CommonsImageInfo = {
  url: "https://upload.wikimedia.org/wikipedia/commons/1/12/Gyeongbokgung-Geunjeongjeon.jpg",
  descriptionurl: "https://commons.wikimedia.org/wiki/File:Gyeongbokgung-Geunjeongjeon.jpg",
  width: 4000,
  height: 3000,
  mime: "image/jpeg",
  extmetadata: {
    Artist: { value: '<a href="//commons.wikimedia.org/wiki/User:Foo" title="User:Foo">Foo&nbsp;Bar</a>' },
    LicenseShortName: { value: "CC BY-SA 4.0" },
    LicenseUrl: { value: "https://creativecommons.org/licenses/by-sa/4.0" },
  },
};

test("stripHtml removes markup and decodes entities", () => {
  assert.equal(stripHtml('<a href="#" title="x">Foo&nbsp;Bar</a>'), "Foo Bar");
  assert.equal(stripHtml("Jane &amp; Co. &lt;studio&gt;"), "Jane & Co. <studio>");
  assert.equal(stripHtml("  plain  "), "plain");
});

test("normalizeLicense canonicalises slug forms to display form", () => {
  assert.equal(normalizeLicense("cc-by-sa-4.0"), "CC BY-SA 4.0");
  assert.equal(normalizeLicense("cc-by-2.0"), "CC BY 2.0");
  assert.equal(normalizeLicense("CC BY-SA 3.0"), "CC BY-SA 3.0");
  assert.equal(normalizeLicense("cc0"), "CC0");
  assert.equal(normalizeLicense("Public domain"), "Public domain");
});

test("isFreeLicense accepts free licenses and rejects NC/ND and non-free", () => {
  for (const ok of ["CC BY-SA 4.0", "CC BY 2.0", "CC0", "Public domain", "PDM 1.0", "KOGL Type 1"]) {
    assert.equal(isFreeLicense(ok), true, `${ok} should be free`);
  }
  for (const bad of ["CC BY-NC 4.0", "CC BY-NC-SA 3.0", "CC BY-ND 4.0", "Fair use", "All rights reserved", ""]) {
    assert.equal(isFreeLicense(bad), false, `${bad} should not be free`);
  }
});

test("isUsableMime accepts web raster formats only", () => {
  assert.equal(isUsableMime("image/jpeg"), true);
  assert.equal(isUsableMime("image/png"), true);
  assert.equal(isUsableMime("image/webp"), true);
  assert.equal(isUsableMime("image/tiff"), false);
  assert.equal(isUsableMime("image/svg+xml"), false);
  assert.equal(isUsableMime("application/pdf"), false);
});

test("parseImageInfo extracts artist, license and dimensions", () => {
  const c = parseImageInfo("File:Gyeongbokgung-Geunjeongjeon.jpg", INFO);
  assert.equal(c.title, "File:Gyeongbokgung-Geunjeongjeon.jpg");
  assert.equal(c.artist, "Foo Bar");
  assert.equal(c.license, "CC BY-SA 4.0");
  assert.equal(c.width, 4000);
  assert.equal(c.height, 3000);
  assert.equal(c.free, true);
  assert.equal(c.usable, true);
  assert.equal(c.descriptionUrl, INFO.descriptionurl);
});

test("parseImageInfo falls back to License slug and marks unknown artist", () => {
  const c = parseImageInfo("File:X.jpg", {
    ...INFO,
    extmetadata: { License: { value: "cc-by-sa-3.0" } },
  });
  assert.equal(c.license, "CC BY-SA 3.0");
  assert.equal(c.artist, "Unknown author");
});

test("parseImageInfo flags non-free and unusable candidates", () => {
  const nc = parseImageInfo("File:X.jpg", {
    ...INFO,
    extmetadata: { LicenseShortName: { value: "CC BY-NC 4.0" } },
  });
  assert.equal(nc.free, false);
  const tif = parseImageInfo("File:X.tif", { ...INFO, mime: "image/tiff" });
  assert.equal(tif.usable, false);
});

test("toImageEntry builds a registry-valid entry with sourceUrl always set", () => {
  const c = parseImageInfo("File:Gyeongbokgung-Geunjeongjeon.jpg", INFO);
  const e = toImageEntry(c, { id: "gyeongbokgung-main-hall", alt: "Geunjeongjeon hall at Gyeongbokgung" });
  assert.equal(e.id, "gyeongbokgung-main-hall");
  assert.equal(e.src, "/images/gyeongbokgung-main-hall.jpg");
  assert.equal(e.credit, "Foo Bar");
  assert.equal(e.license, "CC BY-SA 4.0");
  assert.equal(e.sourceUrl, INFO.descriptionurl);
  assert.equal(e.aiGenerated, false);
  assert.equal(e.width, 4000);
});

test("toImageEntry refuses non-free and unusable candidates", () => {
  const nc = parseImageInfo("File:X.jpg", { ...INFO, extmetadata: { LicenseShortName: { value: "CC BY-ND 4.0" } } });
  assert.throws(() => toImageEntry(nc, { id: "x", alt: "x" }), /not free/i);
  const tif = parseImageInfo("File:X.tif", { ...INFO, mime: "image/tiff" });
  assert.throws(() => toImageEntry(tif, { id: "x", alt: "x" }), /image\/tiff/);
});

test("toImageEntry rejects an id the registry would reject", () => {
  const c = parseImageInfo("File:X.jpg", INFO);
  assert.throws(() => toImageEntry(c, { id: "Not_A_Slug", alt: "x" }), /id/);
});

test("toImageEntry requires alt text", () => {
  const c = parseImageInfo("File:X.jpg", INFO);
  assert.throws(() => toImageEntry(c, { id: "x", alt: "   " }), /alt/i);
});

test("imageFileName derives the extension from the mime type", () => {
  assert.equal(imageFileName("seoul-tower", "image/jpeg"), "seoul-tower.jpg");
  assert.equal(imageFileName("seoul-tower", "image/png"), "seoul-tower.png");
  assert.equal(imageFileName("seoul-tower", "image/webp"), "seoul-tower.webp");
});

test("commonsSearchUrl asks the File namespace with a bounded limit", () => {
  const u = new URL(commonsSearchUrl("Gyeongbokgung", 8));
  assert.equal(u.host, "commons.wikimedia.org");
  assert.equal(u.searchParams.get("action"), "query");
  assert.equal(u.searchParams.get("format"), "json");
  assert.equal(u.searchParams.get("srnamespace"), "6");
  assert.equal(u.searchParams.get("srsearch"), "Gyeongbokgung");
  assert.equal(u.searchParams.get("srlimit"), "8");
});

test("commonsInfoUrl requests imageinfo with extmetadata for many titles at once", () => {
  const u = new URL(commonsInfoUrl(["File:A.jpg", "File:B.jpg"]));
  assert.equal(u.searchParams.get("prop"), "imageinfo");
  assert.equal(u.searchParams.get("titles"), "File:A.jpg|File:B.jpg");
  assert.match(u.searchParams.get("iiprop") ?? "", /extmetadata/);
});
