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

test("every layout that can render an image also renders its credits", () => {
  const layouts = [
    "src/components/content/ArticleLayout.tsx",
    "src/components/content/HubLayout.tsx",
    "src/components/content/CategoryLayout.tsx",
    "src/components/content/StaticPage.tsx",
  ];
  for (const file of layouts) {
    const src = read(file);
    assert.match(src, /<ImageCredits ids=\{/, `${file} must attribute the images it renders`);
    assert.match(src, /bodyImageIds\(/, `${file} must include images used in the MDX body`);
  }
});

test("article cards show the article's featured image as a thumbnail", () => {
  const src = read("src/components/content/ArticleCard.tsx");
  assert.match(src, /featuredImage/, "cards must render the featured image");
  assert.match(src, /export function cardImageIds/, "cards must expose the image ids they render so layouts can credit them");
});

test("every page that renders article cards credits the card thumbnails", () => {
  const pages: [string, RegExp][] = [
    ["src/components/content/ArticleLayout.tsx", /cardImageIds\(related/],
    ["src/components/content/HubLayout.tsx", /cardImageIds\(/],
    ["src/components/content/CategoryLayout.tsx", /cardImageIds\(page\.articles\)/],
    ["src/app/page.tsx", /cardImageIds\(planningGuides\)/],
  ];
  for (const [file, re] of pages) assert.match(read(file), re, `${file} must credit the thumbnails its cards show`);
});

test("sources are collapsed at the foot of articles and hubs, below related guides", () => {
  for (const file of ["src/components/content/ArticleLayout.tsx", "src/components/content/HubLayout.tsx"]) {
    const src = read(file);
    assert.match(src, /<SourcesDisclosure[\s\S]*<SourceList[\s\S]*<ImageCredits[\s\S]*<\/SourcesDisclosure>/, `${file} must collapse sources and credits`);
  }
  const article = read("src/components/content/ArticleLayout.tsx");
  assert.ok(article.indexOf("<RelatedGuides") < article.indexOf("<SourcesDisclosure"), "related guides must come before the collapsed sources");
});
