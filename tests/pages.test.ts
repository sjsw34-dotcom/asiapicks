import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { getStaticPage, STATIC_PAGES } from "@/lib/content/pages";

test("every trust page exists and says what AsiaPicks is", () => {
  for (const slug of STATIC_PAGES) {
    const page = getStaticPage(slug);
    assert.ok(page.fm.title.length > 0, slug);
    assert.ok(page.fm.description.length >= 50, slug);
  }
  assert.match(getStaticPage("about").body, /Asia travel discovery and planning website/);
  assert.match(getStaticPage("editorial-policy").body, /do not claim first-hand visits/i);
  assert.doesNotMatch(getStaticPage("privacy").body, /adsense|agoda|klook/i);
});

test("invalid frontmatter throws with file path", () => {
  const badDir = path.join(process.cwd(), "tests/fixtures/pages-bad");
  assert.throws(
    () => getStaticPage("about", badDir),
    /Invalid frontmatter/,
  );
  assert.throws(
    () => getStaticPage("about", badDir),
    /about\.mdx/,
  );
});

test("unknown slug throws", () => {
  assert.throws(() => getStaticPage("no-such-page"));
});
