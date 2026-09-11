# AsiaPicks Platform Rebuild (Plan 1 of 4) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the old Asia blog codebase with the new Korea-first platform (content model, hubs, article templates, affiliate model, SEO/GEO, legacy URL handling, automated checks), verified with seed content.

**Architecture:** Git-based MDX content under `src/content/{country}/[{city}/]`, validated by zod at load time, rendered fully static (SSG) through three dynamic routes (`/[country]`, `/[country]/[segment]`, `/[country]/[segment]/[slug]`). Affiliate offers and images are JSON registries referenced by id from MDX with string-only props. Legacy URLs are handled by `next.config.ts` redirects (301/308) and `src/proxy.ts` (410 + www→apex). `npm run check` gates every build.

**Tech Stack:** Next.js 16.1.6 (App Router), React 19.2, TypeScript 5, Tailwind CSS 4, next-mdx-remote 6 (rsc), gray-matter, zod 4, @vercel/analytics, node:test via tsx.

**Spec:** `docs/superpowers/specs/2026-09-11-korea-rebuild-design.md` (read it before starting any task).

**Plan series:** 1 Platform (this) → 2 Production tooling (skills/agents) → 3 Launch content (5 hubs + 12 articles, trust copy review) → 4 Switch (inventory confirmation, merge, consoles).

## Global Constraints

- Brand string is exactly `AsiaPicks`. Entity description is exactly `AsiaPicks, an Asia travel discovery and planning website`.
- Canonical host `https://asiapicks.com` (non-www), no trailing slash.
- URLs: at most 3 segments: `/{country}`, `/{country}/{segment}`, `/{country}/{city}/{segment}`. Lowercase, hyphens.
- Every page is statically generated. No client JS except the mobile nav toggle and `@vercel/analytics`.
- No AdSense, no Klook, no Agoda, no sajumuse, no Unsplash, no Neon DB, no Google Indexing API anywhere.
- MDX component props are strings only (next-mdx-remote 6 `blockJS` default strips JS expressions). Lists are comma-separated strings: `ids="a,b"`.
- Affiliate links: `rel="sponsored nofollow noopener"`, `target="_blank"`. No ratings, no provider copy, no provider photos, no Product/Offer/AggregateRating schema.
- Affiliate IDs come only from env: `VIATOR_PID`, `VIATOR_MCID`, `CREATRIP_AFF_CODE`, `TRIPCOM_ALLIANCE_ID`, `TRIPCOM_SID`. Empty → plain link.
- Content statuses: `draft` (never built), `review` (built only when `VERCEL_ENV=preview` or `NODE_ENV=development`, always `noindex`), `published`.
- Tests: `node:test` + `node:assert/strict`, run with `npm test` (= `tsx --test "tests/**/*.test.ts"`). No new test framework.
- Never print `.env.local` contents. Never commit `.env.local`.
- Commit after every task with a conventional commit message ending in `Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>`. Do not push unless the user asks.

## File Structure

```
CLAUDE.md                                  rewritten project rules (Task 0)
src/proxy.ts                               410 for gone URLs + www→apex 308 (Task 12)
next.config.ts                             images config + legacy redirects (Task 12)
src/lib/site.ts                            brand, base URL, entity, contact (Task 1)
src/data/taxonomy.ts                       countries, cities, categories, reserved slugs (Task 1)
src/data/editors.ts                        editor identities (Task 1)
src/lib/content/schema.ts                  zod frontmatter schemas + types (Task 2)
src/lib/content/paths.ts                   URL builders (Task 2)
src/lib/content/loader.ts                  read/validate/index content (Task 2)
src/lib/images/registry.ts                 image registry loader (Task 3)
src/data/images/*.json                     image entries (Task 3, Task 14)
src/lib/affiliates/providers.ts            env → provider config + URL builder (Task 4)
src/lib/affiliates/offers.ts               offer registry loader (Task 4)
src/data/offers/*.json                     offer entries (Task 14)
src/lib/seo/metadata.ts                    Next Metadata builder (Task 5)
src/lib/seo/schema.ts                      JSON-LD builders (Task 5)
src/lib/content/links.ts                   related, next step, body link extraction (Task 6)
src/lib/legacy/legacy.ts                   legacy map loader + matcher (Task 12)
src/data/legacy-urls.json                  redirects + gone list (Task 12)
src/components/layout/{Header,Footer,MobileNav}.tsx      (Task 7)
src/components/content/*.tsx               article chrome + MDX components (Task 8)
src/components/affiliate/*.tsx             OfferCard, OfferList, ComparisonTable, BookingCTA, Disclosure (Task 4)
src/components/media/Figure.tsx            (Task 3)
src/app/page.tsx                           home (Task 9)
src/app/[country]/page.tsx                 country hub (Task 9)
src/app/[country]/[segment]/page.tsx       city hub | country category | country article (Task 9)
src/app/[country]/[segment]/[slug]/page.tsx city category | city article (Task 9)
src/app/{about,contact,editorial-policy,how-we-choose,affiliate-disclosure,privacy,terms}/page.tsx (Task 10)
src/content/pages/*.mdx                    trust page copy (Task 10)
src/app/not-found.tsx                      404 (Task 10)
src/app/sitemap.ts, src/app/robots.ts, src/app/api/og/route.tsx   (Task 11)
scripts/checks/*.ts + scripts/check.ts     build gates (Task 13)
scripts/legacy/build-inventory.ts          old URL inventory (Task 12)
scripts/indexnow.ts                        IndexNow ping (Task 11)
tests/**/*.test.ts, tests/fixtures/**      unit tests (every task)
```

---

### Task 0: Prepare branch, dependencies, test runner, CLAUDE.md

**Files:**
- Modify: `package.json`
- Rewrite: `CLAUDE.md`
- Create: `tests/smoke.test.ts`

**Interfaces:**
- Produces: `npm test` runs `tsx --test "tests/**/*.test.ts"`; `zod` and `@vercel/analytics` are direct dependencies.

- [ ] **Step 1: Confirm branch and park old uncommitted work**

Run:
```bash
git branch --show-current
git stash push -u -m "old-site uncommitted build fix (pre-rebuild)" -- scripts/generate-post.ts src/content/blog/3-days-in-hoi-an.mdx src/content/blog/3-days-in-taipei.mdx scripts/check-frontmatter.ts
git status --short
```
Expected: branch `korea-rebuild`; after stash, `git status --short` shows nothing for those four paths.

- [ ] **Step 2: Add dependencies and scripts**

Run:
```bash
npm install zod@^4.3.6 @vercel/analytics@^1
```
Then edit `package.json` `"scripts"` to exactly:
```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "prebuild": "tsx scripts/check.ts",
  "start": "next start",
  "lint": "eslint",
  "typecheck": "tsc --noEmit",
  "test": "tsx --test \"tests/**/*.test.ts\"",
  "check": "tsx scripts/check.ts"
}
```
(`scripts/check.ts` is created in Task 13. Until then `npm run build` will fail at prebuild; use `npx next build` directly if a build is needed before Task 13.)

- [ ] **Step 3: Write a smoke test**

`tests/smoke.test.ts`:
```ts
import { test } from "node:test";
import assert from "node:assert/strict";

test("test runner works with path aliases", async () => {
  const mod = await import("@/lib/site");
  assert.equal(typeof mod, "object");
});
```

- [ ] **Step 4: Run it to verify it fails**

Run: `npm test`
Expected: FAIL, cannot find module `@/lib/site` (created in Task 1). This proves the runner and alias resolution are wired.

- [ ] **Step 5: Rewrite CLAUDE.md**

Replace the entire file with:
````markdown
# CLAUDE.md — AsiaPicks

AsiaPicks is an Asia travel discovery and planning website for international travelers.
First expertise: South Korea. English only. Design spec: `docs/superpowers/specs/2026-09-11-korea-rebuild-design.md`.

## Entity
- Brand: `AsiaPicks`. Description: `AsiaPicks, an Asia travel discovery and planning website`.
- Canonical host: https://asiapicks.com (no www, no trailing slash).

## Commands
- `npm run dev` · `npm run build` (runs `npm run check` first) · `npm run typecheck` · `npm test` · `npm run check`

## Architecture
- Content: `src/content/{country}/_hub.mdx`, `src/content/{country}/{slug}.mdx`,
  `src/content/{country}/{city}/_hub.mdx`, `src/content/{country}/{city}/{slug}.mdx`,
  category intros in `src/content/{country}/[{city}/]_categories/{category}.mdx`.
- Frontmatter schema: `src/lib/content/schema.ts` (zod). Invalid content fails the build.
- Taxonomy (countries, cities, categories = reserved slugs): `src/data/taxonomy.ts`.
- Offers: `src/data/offers/{id}.json`. Images: `src/data/images/{id}.json` + files in `public/images/`.
- Legacy URLs: `src/data/legacy-urls.json` (redirects + gone). `src/proxy.ts` serves 410.
- All pages are SSG. Client components only for the mobile nav.

## Writing rules (every article)
- Under every question-style H2, the first 1–3 sentences answer the question directly.
- Self-contained sentences with specific nouns, no vague pronouns, no filler.
- Label recommendations as "Our pick"; keep facts, editorial judgment and affiliate options distinct.
- Every price, rule, opening time or fee has a source in `sources` with `checkedAt`. Unverified facts are not written.
- Never claim first-hand visits ("I visited", "we tried"). The site is research-based curation.
- No word-count targets. No H1 in MDX bodies (the page renders the H1 from `title`).
- MDX component props are strings only: `<OfferList ids="a,b" />`.

## Affiliate rules
- Viator = tours/day trips, Creatrip = Korea-specific experiences/tickets/beauty/K-pop/hanbok, Trip.com = hotels + KTX.
- One BookingCTA per article, after the informational sections. No sticky bars, popups or widget scripts.
- Never show ratings, provider descriptions or provider photos. No Product/Offer/AggregateRating schema.
- IDs only from env (`VIATOR_PID`, `VIATOR_MCID`, `CREATRIP_AFF_CODE`, `TRIPCOM_ALLIANCE_ID`, `TRIPCOM_SID`).

## Image rules
- Real places: KTO Photo Korea (KOGL type 1) or Wikimedia Commons with credit and license.
- AI images (OpenAI gpt-image-2) only for illustrations, maps, infographics; text-only prompts; caption
  "Illustration (AI-generated)"; never photoreal depictions of real landmarks; never use other sites' images as input.

## Publishing
- Content is produced in Claude Code sessions and published only after the owner approves (`status: published`).
- No cron publishing. No Google Indexing API. After deploy, ping IndexNow with `npx tsx scripts/indexnow.ts <urls>`.

## Safety
- Never print `.env.local`. Never commit it.
````

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json CLAUDE.md tests/smoke.test.ts
git commit -m "chore: set up rebuild branch tooling and rewrite CLAUDE.md"
```

---

### Task 1: Site constants, taxonomy, editors

**Files:**
- Create: `src/lib/site.ts`, `src/data/taxonomy.ts`, `src/data/editors.ts`
- Test: `tests/taxonomy.test.ts`

**Interfaces:**
- Produces:
  - `SITE: { name: "AsiaPicks"; description: string; baseUrl: string; contactEmail: string | null; locale: "en_US" }`
  - `absoluteUrl(path: string): string`
  - `COUNTRIES: Country[]`, `CITIES: City[]`, `COUNTRY_CATEGORIES: Category[]`, `CITY_CATEGORIES: Category[]`
  - `type Country = { slug: string; name: string; shortName: string }`
  - `type City = { slug: string; country: string; name: string }`
  - `type Category = { slug: string; label: string }`
  - `getCountry(slug)`, `getCity(country, slug)`, `getCategory(level: "country" | "city", slug)`, `isReservedSegment(country, segment): boolean`
  - `EDITORS: Editor[]`, `getEditor(id): Editor`, `type Editor = { id: string; name: string; kind: "Person" | "Organization"; url: string; bio: string }`

- [ ] **Step 1: Write the failing test**

`tests/taxonomy.test.ts`:
```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { SITE, absoluteUrl } from "@/lib/site";
import { getCountry, getCity, getCategory, isReservedSegment, CITIES } from "@/data/taxonomy";
import { getEditor } from "@/data/editors";

test("site constants", () => {
  assert.equal(SITE.name, "AsiaPicks");
  assert.equal(SITE.description, "AsiaPicks, an Asia travel discovery and planning website");
  assert.equal(absoluteUrl("/korea"), "https://asiapicks.com/korea");
  assert.equal(absoluteUrl("/"), "https://asiapicks.com");
});

test("taxonomy lookups", () => {
  assert.equal(getCountry("korea")?.name, "South Korea");
  assert.equal(getCity("korea", "seoul")?.name, "Seoul");
  assert.equal(getCity("korea", "tokyo"), undefined);
  assert.equal(getCategory("city", "where-to-stay")?.label, "Where to Stay");
  assert.equal(getCategory("country", "where-to-stay"), undefined);
  assert.deepEqual(CITIES.map((c) => c.slug), ["seoul", "busan", "jeju", "gyeongju", "incheon"]);
});

test("reserved segments", () => {
  assert.equal(isReservedSegment("korea", "seoul"), true);
  assert.equal(isReservedSegment("korea", "planning"), true);
  assert.equal(isReservedSegment("korea", "how-to-pay-in-korea"), false);
});

test("default editor exists", () => {
  assert.equal(getEditor("editorial").kind, "Organization");
  assert.throws(() => getEditor("nobody"));
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test`
Expected: FAIL, modules not found.

- [ ] **Step 3: Implement**

`src/lib/site.ts`:
```ts
const BASE_URL = "https://asiapicks.com";

export const SITE = {
  name: "AsiaPicks",
  description: "AsiaPicks, an Asia travel discovery and planning website",
  tagline: "Plan your Asia trip with answers checked against official sources, starting with South Korea.",
  baseUrl: BASE_URL,
  contactEmail: process.env.CONTACT_EMAIL?.trim() || null,
  locale: "en_US",
} as const;

export function absoluteUrl(path: string): string {
  if (path === "/" || path === "") return SITE.baseUrl;
  return `${SITE.baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
}
```
(Base URL is a constant, not env: canonical host is fixed by spec D12.)

`src/data/taxonomy.ts`:
```ts
export type Country = { slug: string; name: string; shortName: string };
export type City = { slug: string; country: string; name: string };
export type Category = { slug: string; label: string };

export const COUNTRIES: Country[] = [{ slug: "korea", name: "South Korea", shortName: "Korea" }];

export const CITIES: City[] = [
  { slug: "seoul", country: "korea", name: "Seoul" },
  { slug: "busan", country: "korea", name: "Busan" },
  { slug: "jeju", country: "korea", name: "Jeju" },
  { slug: "gyeongju", country: "korea", name: "Gyeongju" },
  { slug: "incheon", country: "korea", name: "Incheon" },
];

export const COUNTRY_CATEGORIES: Category[] = [
  { slug: "planning", label: "Planning" },
  { slug: "transportation", label: "Transportation" },
  { slug: "itineraries", label: "Itineraries" },
  { slug: "experiences", label: "Experiences" },
];

export const CITY_CATEGORIES: Category[] = [
  { slug: "things-to-do", label: "Things to Do" },
  { slug: "where-to-stay", label: "Where to Stay" },
  { slug: "day-trips", label: "Day Trips" },
  { slug: "food", label: "Food" },
  { slug: "transportation", label: "Transportation" },
  { slug: "itineraries", label: "Itineraries" },
  { slug: "tours", label: "Tours" },
  { slug: "attractions", label: "Attractions" },
];

export const getCountry = (slug: string) => COUNTRIES.find((c) => c.slug === slug);
export const getCity = (country: string, slug: string) =>
  CITIES.find((c) => c.country === country && c.slug === slug);
export const getCategory = (level: "country" | "city", slug: string) =>
  (level === "country" ? COUNTRY_CATEGORIES : CITY_CATEGORIES).find((c) => c.slug === slug);

export function isReservedSegment(country: string, segment: string): boolean {
  return !!getCity(country, segment) || !!getCategory("country", segment);
}
```

`src/data/editors.ts`:
```ts
import { absoluteUrl } from "@/lib/site";

export type Editor = { id: string; name: string; kind: "Person" | "Organization"; url: string; bio: string };

export const EDITORS: Editor[] = [
  {
    id: "editorial",
    name: "AsiaPicks Editorial Team",
    kind: "Organization",
    url: absoluteUrl("/about"),
    bio: "AsiaPicks researches every guide against official Korean sources and reviews each page before publishing.",
  },
];

export function getEditor(id: string): Editor {
  const editor = EDITORS.find((e) => e.id === id);
  if (!editor) throw new Error(`Unknown editor id: ${id}`);
  return editor;
}
```
(A Person entry with the owner's pen name is added in Plan 3 once the owner picks the name.)

- [ ] **Step 4: Run tests**

Run: `npm test`
Expected: PASS (smoke + taxonomy).

- [ ] **Step 5: Commit**

```bash
git add src/lib/site.ts src/data/taxonomy.ts src/data/editors.ts tests/taxonomy.test.ts
git commit -m "feat: add site constants, taxonomy and editors"
```

---

### Task 2: Content schema, paths, loader

**Files:**
- Create: `src/lib/content/schema.ts`, `src/lib/content/paths.ts`, `src/lib/content/loader.ts`
- Create fixtures: `tests/fixtures/content/korea/_hub.mdx`, `tests/fixtures/content/korea/how-to-pay-in-korea.mdx`, `tests/fixtures/content/korea/seoul/_hub.mdx`, `tests/fixtures/content/korea/seoul/incheon-airport-to-seoul.mdx`, `tests/fixtures/content/korea/seoul/_categories/transportation.mdx`, `tests/fixtures/content/korea/_categories/planning.mdx`, `tests/fixtures/content/korea/seoul/draft-post.mdx`
- Test: `tests/content-loader.test.ts`

**Interfaces:**
- Consumes: taxonomy (Task 1).
- Produces:
  - `ArticleFrontmatter`, `HubFrontmatter`, `CategoryFrontmatter` (zod-inferred types), `articleSchema`, `hubSchema`, `categorySchema`
  - `type Article = { kind: "article"; fm: ArticleFrontmatter; body: string; country: string; city: string | null; path: string; file: string }`
  - `type Hub = { kind: "hub"; fm: HubFrontmatter; body: string; country: string; city: string | null; path: string; file: string }`
  - `type CategoryPage = { kind: "category"; fm: CategoryFrontmatter; body: string; country: string; city: string | null; category: string; path: string; file: string; articles: Article[] }`
  - `type ContentIndex = { articles: Article[]; hubs: Hub[]; categories: CategoryPage[]; byPath: Map<string, Article | Hub | CategoryPage> }`
  - `loadContent(opts?: { root?: string; includeReview?: boolean }): ContentIndex` (memoized per root+flag)
  - `includeReviewByDefault(): boolean` (true when `VERCEL_ENV === "preview"` or `NODE_ENV === "development"`)
  - `getContent(): ContentIndex` = `loadContent({ includeReview: includeReviewByDefault() })`
  - `hubPath(country, city?)`, `categoryPath(country, city | null, category)`, `articlePath(country, city | null, slug)`

- [ ] **Step 1: Create fixtures**

`tests/fixtures/content/korea/_hub.mdx`:
```mdx
---
title: "South Korea Travel Guide"
description: "Plan a first trip to South Korea: entry rules, money, transport, cities and itineraries, checked against official sources."
summary: "South Korea is easy for first-time visitors: fast trains, card payments almost everywhere, and English signage in major cities."
updatedAt: "2026-09-12"
publishedAt: "2026-09-12"
status: "published"
faqs: []
sources: []
---

## Why visit South Korea

Body text with a link to [Incheon Airport to Seoul](/korea/seoul/incheon-airport-to-seoul), the [Seoul guide](/korea/seoul) and [how to pay in Korea](/korea/how-to-pay-in-korea).
```

`tests/fixtures/content/korea/how-to-pay-in-korea.mdx`:
```mdx
---
title: "How to Pay in Korea as a Tourist"
description: "Cards, cash, and mobile payments in South Korea for foreign visitors, with fees and where each method works."
slug: "how-to-pay-in-korea"
category: "planning"
template: "guide"
journeyStage: "planning"
searchIntent: "informational"
primaryKeyword: "how to pay in korea as a foreigner"
secondaryKeywords: ["do i need cash in korea"]
summary: "Foreign Visa and Mastercard credit cards work at most shops, restaurants and taxis in South Korea. Carry some cash for traditional markets."
faqs:
  - q: "Do I need cash in Korea?"
    a: "Card payments work almost everywhere in cities, but traditional market stalls often prefer cash."
sources:
  - title: "Payment guide"
    url: "https://english.visitkorea.or.kr/"
    publisher: "Korea Tourism Organization"
    checkedAt: "2026-09-10"
publishedAt: "2026-09-12"
updatedAt: "2026-09-12"
factCheckedAt: "2026-09-12"
status: "published"
author: "editorial"
---

## Can I use my credit card in Korea?

Yes. See [how to get from Incheon Airport to Seoul](/korea/seoul/incheon-airport-to-seoul) and the [South Korea guide](/korea).
```

`tests/fixtures/content/korea/seoul/_hub.mdx`:
```mdx
---
title: "Seoul Travel Guide"
description: "Seoul for first-time visitors: neighborhoods, transport, top experiences, day trips and itineraries."
summary: "Seoul rewards 4 to 5 days: palaces, markets, neighborhoods and easy day trips by subway and train."
updatedAt: "2026-09-12"
publishedAt: "2026-09-12"
status: "published"
faqs: []
sources: []
---

## Getting around Seoul

Start with [Incheon Airport to Seoul](/korea/seoul/incheon-airport-to-seoul).
```

`tests/fixtures/content/korea/seoul/incheon-airport-to-seoul.mdx`:
```mdx
---
title: "Incheon Airport to Seoul: AREX vs Airport Bus vs Taxi"
description: "Compare AREX trains, airport limousine buses and taxis from Incheon Airport to central Seoul by price, time and luggage."
slug: "incheon-airport-to-seoul"
category: "transportation"
template: "comparison"
journeyStage: "on-trip"
searchIntent: "informational"
primaryKeyword: "incheon airport to seoul"
secondaryKeywords: []
summary: "Travelers can reach central Seoul from Incheon International Airport by AREX train, airport limousine bus, or taxi."
faqs: []
sources:
  - title: "AREX fares"
    url: "https://www.arex.or.kr/"
    publisher: "AREX"
    checkedAt: "2026-09-10"
offers: []
publishedAt: "2026-09-12"
updatedAt: "2026-09-12"
factCheckedAt: "2026-09-12"
status: "published"
author: "editorial"
---

## What is the fastest way from Incheon Airport to Seoul?

The AREX Express train. Back to the [Seoul travel guide](/korea/seoul).
```

`tests/fixtures/content/korea/seoul/_categories/transportation.mdx`:
```mdx
---
title: "Seoul Transportation Guides"
description: "How to get around Seoul: airport transfers, subway, transport cards and taxis."
summary: "Seoul's subway covers every major neighborhood, and a rechargeable transport card works on subways, buses and many taxis."
---

Guides for getting into and around Seoul.
```

`tests/fixtures/content/korea/_categories/planning.mdx`:
```mdx
---
title: "Korea Trip Planning Guides"
description: "Plan a trip to South Korea: entry rules, money, phones and apps, checked against official sources."
summary: "Sort out entry rules, payments and a phone plan before you fly; everything else in Korea is easy to arrange on arrival."
---

Guides for the decisions to make before you fly to South Korea.
```

`tests/fixtures/content/korea/seoul/draft-post.mdx`:
```mdx
---
title: "Draft Post"
description: "A draft article that must never be built into the site or listed anywhere on it."
slug: "draft-post"
category: "food"
template: "guide"
journeyStage: "discovery"
searchIntent: "informational"
primaryKeyword: "draft"
secondaryKeywords: []
summary: "Draft."
faqs: []
sources: []
publishedAt: "2026-09-12"
updatedAt: "2026-09-12"
status: "draft"
author: "editorial"
---

Draft body.
```

- [ ] **Step 2: Write the failing test**

`tests/content-loader.test.ts`:
```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { loadContent } from "@/lib/content/loader";
import { articlePath, hubPath, categoryPath } from "@/lib/content/paths";

const root = path.join(process.cwd(), "tests/fixtures/content");

test("paths", () => {
  assert.equal(hubPath("korea"), "/korea");
  assert.equal(hubPath("korea", "seoul"), "/korea/seoul");
  assert.equal(categoryPath("korea", "seoul", "transportation"), "/korea/seoul/transportation");
  assert.equal(categoryPath("korea", null, "planning"), "/korea/planning");
  assert.equal(articlePath("korea", null, "how-to-pay-in-korea"), "/korea/how-to-pay-in-korea");
  assert.equal(articlePath("korea", "seoul", "incheon-airport-to-seoul"), "/korea/seoul/incheon-airport-to-seoul");
});

test("loads hubs, articles, categories; excludes drafts", () => {
  const idx = loadContent({ root, includeReview: false });
  assert.deepEqual(idx.hubs.map((h) => h.path).sort(), ["/korea", "/korea/seoul"]);
  assert.deepEqual(idx.articles.map((a) => a.path).sort(), [
    "/korea/how-to-pay-in-korea",
    "/korea/seoul/incheon-airport-to-seoul",
  ]);
  const cat = idx.categories.find((c) => c.path === "/korea/seoul/transportation");
  assert.ok(cat);
  assert.equal(cat.articles.length, 1);
  assert.ok(idx.byPath.get("/korea/seoul/incheon-airport-to-seoul"));
  assert.equal(idx.byPath.get("/korea/seoul/draft-post"), undefined);
});

test("category without published articles is not generated", () => {
  const idx = loadContent({ root, includeReview: false });
  assert.equal(idx.categories.find((c) => c.path === "/korea/seoul/food"), undefined);
});

test("invalid frontmatter throws with file path", () => {
  const badRoot = path.join(process.cwd(), "tests/fixtures/content-bad");
  assert.throws(() => loadContent({ root: badRoot, includeReview: false }), /content-bad.*bad\.mdx/s);
});
```

Also create `tests/fixtures/content-bad/korea/bad.mdx`:
```mdx
---
title: "Missing required fields"
status: "published"
---

Body.
```

- [ ] **Step 3: Run to verify it fails**

Run: `npm test`
Expected: FAIL, modules `@/lib/content/*` not found.

- [ ] **Step 4: Implement schema**

`src/lib/content/schema.ts`:
```ts
import { z } from "zod";

const isoDate = z.iso.date();

export const sourceSchema = z.object({
  title: z.string().min(1),
  url: z.url(),
  publisher: z.string().min(1),
  checkedAt: isoDate,
});

export const faqSchema = z.object({ q: z.string().min(1), a: z.string().min(1) });

export const statusSchema = z.enum(["draft", "review", "published"]);

export const articleSchema = z.object({
  title: z.string().min(1),
  seoTitle: z.string().min(1).optional(),
  description: z.string().min(50),
  slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  category: z.string().min(1),
  template: z.enum(["guide", "comparison", "best-of", "itinerary", "where-to-stay"]),
  journeyStage: z.enum(["discovery", "planning", "comparison", "booking", "on-trip"]),
  searchIntent: z.enum(["informational", "commercial", "transactional"]),
  primaryKeyword: z.string().min(1),
  secondaryKeywords: z.array(z.string()).default([]),
  summary: z.string().min(1),
  faqs: z.array(faqSchema).default([]),
  relatedArticles: z.array(z.string()).default([]),
  attractions: z.array(z.string()).default([]),
  offers: z.array(z.string()).default([]),
  featuredImage: z.string().optional(),
  gallery: z.array(z.string()).default([]),
  sources: z.array(sourceSchema).default([]),
  publishedAt: isoDate,
  updatedAt: isoDate,
  factCheckedAt: isoDate.optional(),
  status: statusSchema,
  author: z.string().default("editorial"),
  canonical: z.url().optional(),
  noindex: z.boolean().default(false),
});

export const hubSchema = z.object({
  title: z.string().min(1),
  seoTitle: z.string().min(1).optional(),
  description: z.string().min(50),
  summary: z.string().min(1),
  featuredImage: z.string().optional(),
  faqs: z.array(faqSchema).default([]),
  sources: z.array(sourceSchema).default([]),
  publishedAt: isoDate,
  updatedAt: isoDate,
  status: statusSchema,
  author: z.string().default("editorial"),
});

export const categorySchema = z.object({
  title: z.string().min(1),
  seoTitle: z.string().min(1).optional(),
  description: z.string().min(50),
  summary: z.string().min(1),
});

export type ArticleFrontmatter = z.infer<typeof articleSchema>;
export type HubFrontmatter = z.infer<typeof hubSchema>;
export type CategoryFrontmatter = z.infer<typeof categorySchema>;
export type ContentStatus = z.infer<typeof statusSchema>;
```

- [ ] **Step 5: Implement paths**

`src/lib/content/paths.ts`:
```ts
export const hubPath = (country: string, city?: string | null) =>
  city ? `/${country}/${city}` : `/${country}`;

export const categoryPath = (country: string, city: string | null, category: string) =>
  city ? `/${country}/${city}/${category}` : `/${country}/${category}`;

export const articlePath = (country: string, city: string | null, slug: string) =>
  city ? `/${country}/${city}/${slug}` : `/${country}/${slug}`;
```

- [ ] **Step 6: Implement loader**

`src/lib/content/loader.ts`:
```ts
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { z } from "zod";
import {
  articleSchema, hubSchema, categorySchema,
  type ArticleFrontmatter, type HubFrontmatter, type CategoryFrontmatter, type ContentStatus,
} from "./schema";
import { articlePath, categoryPath, hubPath } from "./paths";
import { COUNTRIES, CITIES, getCategory } from "@/data/taxonomy";

type Base = { body: string; country: string; city: string | null; path: string; file: string };
export type Article = Base & { kind: "article"; fm: ArticleFrontmatter };
export type Hub = Base & { kind: "hub"; fm: HubFrontmatter };
export type CategoryPage = Base & { kind: "category"; fm: CategoryFrontmatter; category: string; articles: Article[] };
export type ContentNode = Article | Hub | CategoryPage;
export type ContentIndex = {
  articles: Article[];
  hubs: Hub[];
  categories: CategoryPage[];
  byPath: Map<string, ContentNode>;
};

const DEFAULT_ROOT = path.join(process.cwd(), "src/content");
const cache = new Map<string, ContentIndex>();

export function includeReviewByDefault(): boolean {
  return process.env.VERCEL_ENV === "preview" || process.env.NODE_ENV === "development";
}

function read<T extends z.ZodType>(file: string, schema: T): { fm: z.infer<T>; body: string } {
  const raw = fs.readFileSync(file, "utf-8");
  const { data, content } = matter(raw);
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    throw new Error(`Invalid frontmatter in ${file}: ${issues}`);
  }
  return { fm: parsed.data, body: content };
}

const visible = (status: ContentStatus, includeReview: boolean) =>
  status === "published" || (includeReview && status === "review");

const mdxFiles = (dir: string) =>
  fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith(".mdx") && !f.startsWith("_")) : [];

export function loadContent(opts: { root?: string; includeReview?: boolean } = {}): ContentIndex {
  const root = opts.root ?? DEFAULT_ROOT;
  const includeReview = opts.includeReview ?? includeReviewByDefault();
  const key = `${root}|${includeReview}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const articles: Article[] = [];
  const hubs: Hub[] = [];
  const categories: CategoryPage[] = [];

  const scopes: { country: string; city: string | null; dir: string }[] = [];
  for (const country of COUNTRIES) {
    const countryDir = path.join(root, country.slug);
    if (!fs.existsSync(countryDir)) continue;
    scopes.push({ country: country.slug, city: null, dir: countryDir });
    for (const city of CITIES.filter((c) => c.country === country.slug)) {
      const cityDir = path.join(countryDir, city.slug);
      if (fs.existsSync(cityDir)) scopes.push({ country: country.slug, city: city.slug, dir: cityDir });
    }
  }

  for (const { country, city, dir } of scopes) {
    const hubFile = path.join(dir, "_hub.mdx");
    if (fs.existsSync(hubFile)) {
      const { fm, body } = read(hubFile, hubSchema);
      if (visible(fm.status, includeReview)) {
        hubs.push({ kind: "hub", fm, body, country, city, path: hubPath(country, city), file: hubFile });
      }
    }
    for (const name of mdxFiles(dir)) {
      const file = path.join(dir, name);
      const { fm, body } = read(file, articleSchema);
      if (fm.slug !== name.replace(/\.mdx$/, "")) {
        throw new Error(`Slug "${fm.slug}" does not match file name in ${file}`);
      }
      if (!getCategory(city ? "city" : "country", fm.category)) {
        throw new Error(`Unknown category "${fm.category}" for ${city ? "city" : "country"} article in ${file}`);
      }
      if (!visible(fm.status, includeReview)) continue;
      articles.push({ kind: "article", fm, body, country, city, path: articlePath(country, city, fm.slug), file });
    }
    const catDir = path.join(dir, "_categories");
    if (fs.existsSync(catDir)) {
      for (const name of fs.readdirSync(catDir).filter((f) => f.endsWith(".mdx"))) {
        const category = name.replace(/\.mdx$/, "");
        const file = path.join(catDir, name);
        const { fm, body } = read(file, categorySchema);
        const members = articles.filter((a) => a.country === country && a.city === city && a.fm.category === category);
        if (members.length === 0) continue;
        categories.push({
          kind: "category", fm, body, country, city, category,
          path: categoryPath(country, city, category), file, articles: members,
        });
      }
    }
  }

  articles.sort((a, b) => b.fm.updatedAt.localeCompare(a.fm.updatedAt));
  const byPath = new Map<string, ContentNode>();
  for (const node of [...hubs, ...categories, ...articles]) {
    if (byPath.has(node.path)) throw new Error(`Duplicate path ${node.path} (${node.file})`);
    byPath.set(node.path, node);
  }
  const index = { articles, hubs, categories, byPath };
  cache.set(key, index);
  return index;
}

export const getContent = () => loadContent({ includeReview: includeReviewByDefault() });
```

- [ ] **Step 7: Run tests**

Run: `npm test`
Expected: PASS (all loader tests).

- [ ] **Step 8: Commit**

```bash
git add src/lib/content tests/content-loader.test.ts tests/fixtures
git commit -m "feat: add content schema, paths and loader"
```

---

### Task 3: Image registry and Figure component

**Files:**
- Create: `src/lib/images/registry.ts`, `src/components/media/Figure.tsx`
- Create fixture: `tests/fixtures/images/gyeongbokgung-gate.json`
- Test: `tests/images.test.ts`

**Interfaces:**
- Produces:
  - `imageSchema` (zod), `type ImageEntry = { id: string; src: string; width: number; height: number; alt: string; decorative: boolean; caption?: string; credit: string; license: string; sourceUrl?: string; aiGenerated: boolean }`
  - `loadImages(dir?: string): Map<string, ImageEntry>` (memoized), `getImage(id: string): ImageEntry` (throws on unknown id)
  - `<Figure id="..." priority? sizes? />` server component: `next/image` with width/height, caption line with credit, "Illustration (AI-generated)" when `aiGenerated`.

- [ ] **Step 1: Fixture**

`tests/fixtures/images/gyeongbokgung-gate.json`:
```json
{
  "id": "gyeongbokgung-gate",
  "src": "/images/korea/seoul/gyeongbokgung-gate.jpg",
  "width": 1600,
  "height": 1067,
  "alt": "Gwanghwamun, the main gate of Gyeongbokgung Palace, with Bugaksan mountain behind it",
  "decorative": false,
  "caption": "Gwanghwamun Gate at Gyeongbokgung Palace",
  "credit": "Korea Tourism Organization",
  "license": "KOGL Type 1",
  "sourceUrl": "https://phoko.visitkorea.or.kr/",
  "aiGenerated": false
}
```

- [ ] **Step 2: Failing test**

`tests/images.test.ts`:
```ts
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
```

- [ ] **Step 3: Run to verify it fails**

Run: `npm test` → FAIL (module missing).

- [ ] **Step 4: Implement registry**

`src/lib/images/registry.ts`:
```ts
import fs from "node:fs";
import path from "node:path";
import { z } from "zod";

export const imageSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
    src: z.string().startsWith("/images/"),
    width: z.number().int().positive(),
    height: z.number().int().positive(),
    alt: z.string(),
    decorative: z.boolean().default(false),
    caption: z.string().optional(),
    credit: z.string().min(1),
    license: z.string().min(1),
    sourceUrl: z.url().optional(),
    aiGenerated: z.boolean().default(false),
  })
  .refine((v) => v.decorative || v.alt.trim().length > 0, { message: "alt is required unless decorative", path: ["alt"] });

export type ImageEntry = z.infer<typeof imageSchema>;

const DEFAULT_DIR = path.join(process.cwd(), "src/data/images");
const cache = new Map<string, Map<string, ImageEntry>>();

export function loadImages(dir: string = DEFAULT_DIR): Map<string, ImageEntry> {
  const hit = cache.get(dir);
  if (hit) return hit;
  const map = new Map<string, ImageEntry>();
  if (fs.existsSync(dir)) {
    for (const name of fs.readdirSync(dir).filter((f) => f.endsWith(".json"))) {
      const file = path.join(dir, name);
      const parsed = imageSchema.safeParse(JSON.parse(fs.readFileSync(file, "utf-8")));
      if (!parsed.success) {
        throw new Error(`Invalid image entry ${file}: ${parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`);
      }
      if (parsed.data.id !== name.replace(/\.json$/, "")) throw new Error(`Image id does not match file name: ${file}`);
      map.set(parsed.data.id, parsed.data);
    }
  }
  cache.set(dir, map);
  return map;
}

export function getImage(id: string): ImageEntry {
  const img = loadImages().get(id);
  if (!img) throw new Error(`Unknown image id: ${id}`);
  return img;
}
```

- [ ] **Step 5: Implement Figure**

`src/components/media/Figure.tsx`:
```tsx
import Image from "next/image";
import { getImage } from "@/lib/images/registry";

interface FigureProps {
  id: string;
  priority?: boolean;
  sizes?: string;
}

export default function Figure({ id, priority = false, sizes = "(max-width: 768px) 100vw, 768px" }: FigureProps) {
  const img = getImage(id);
  const credit = img.aiGenerated ? "Illustration (AI-generated)" : `Photo: ${img.credit} (${img.license})`;
  return (
    <figure className="my-8">
      <Image
        src={img.src}
        width={img.width}
        height={img.height}
        alt={img.decorative ? "" : img.alt}
        sizes={sizes}
        priority={priority}
        className="w-full h-auto rounded-xl"
      />
      <figcaption className="mt-2 text-xs text-text-secondary">
        {img.caption ? <span>{img.caption}. </span> : null}
        {img.sourceUrl ? (
          <a href={img.sourceUrl} rel="noopener" target="_blank" className="underline underline-offset-2">
            {credit}
          </a>
        ) : (
          credit
        )}
      </figcaption>
    </figure>
  );
}
```

- [ ] **Step 6: Run tests and typecheck**

Run: `npm test` → PASS. Run: `npx tsc --noEmit -p .` → no errors from new files (old files may still error until Task 7; if so, confirm errors are only in files deleted in Task 7).

- [ ] **Step 7: Commit**

```bash
git add src/lib/images src/components/media tests/images.test.ts tests/fixtures/images
git commit -m "feat: add image registry and Figure component"
```

---

### Task 4: Affiliate providers, offers registry, affiliate components

**Files:**
- Create: `src/lib/affiliates/providers.ts`, `src/lib/affiliates/offers.ts`
- Create: `src/components/affiliate/Disclosure.tsx`, `src/components/affiliate/OfferCard.tsx`, `src/components/affiliate/OfferList.tsx`, `src/components/affiliate/ComparisonTable.tsx`, `src/components/affiliate/BookingCTA.tsx`
- Create fixture: `tests/fixtures/offers/dmz-half-day-tour.json`
- Test: `tests/affiliates.test.ts`

(The new disclosure file is `Disclosure.tsx` so it does not overwrite the old `AffiliateDisclosure.tsx`, which Task 7 deletes.)

**Interfaces:**
- Consumes: `getImage` (Task 3).
- Produces:
  - `type ProviderId = "viator" | "creatrip" | "tripcom"`; `PROVIDER_LABELS: Record<ProviderId, string>`; `PROVIDER_HOSTS: Record<ProviderId, string[]>`
  - `isProviderConfigured(p: ProviderId, env?: NodeJS.ProcessEnv): boolean`
  - `buildAffiliateUrl(p: ProviderId, targetUrl: string, sourceSlug: string, env?: NodeJS.ProcessEnv): { url: string; tracked: boolean }`
  - `offerSchema`, `type Offer`, `loadOffers(dir?: string): Map<string, Offer>`, `getOffer(id: string): Offer`, `parseIdList(value: string): string[]`
  - `offerLinkProps(offer: Offer, sourceSlug: string)` (anchor props), `checkedLabel(iso?: string): string | null`
  - Server components: `<Disclosure />`, `<OfferCard id sourceSlug />`, `<OfferList ids sourceSlug />`, `<ComparisonTable ids sourceSlug />`, `<BookingCTA id sourceSlug heading? />`. MDX authors write `<OfferList ids="a,b" />`; Task 8 binds `sourceSlug`.

- [ ] **Step 1: Fixture**

`tests/fixtures/offers/dmz-half-day-tour.json`:
```json
{
  "id": "dmz-half-day-tour",
  "provider": "viator",
  "kind": "tour",
  "title": "Half-day DMZ tour from Seoul",
  "summary": "Morning departures from central Seoul. Good for travelers with only one free morning.",
  "priceText": "typically $45–80 per person",
  "priceCheckedAt": "2026-09-10",
  "targetUrl": "https://www.viator.com/Seoul/d973",
  "destination": "korea/seoul",
  "tags": ["dmz", "day-trip"]
}
```

- [ ] **Step 2: Failing test**

`tests/affiliates.test.ts`:
```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { buildAffiliateUrl, isProviderConfigured } from "@/lib/affiliates/providers";
import { loadOffers, offerSchema, parseIdList } from "@/lib/affiliates/offers";

const env = {
  VIATOR_PID: "P00319575", VIATOR_MCID: "42383",
  CREATRIP_AFF_CODE: "z2aiofi",
  TRIPCOM_ALLIANCE_ID: "10527938", TRIPCOM_SID: "331072155",
} as unknown as NodeJS.ProcessEnv;

test("viator link carries pid, mcid, medium and campaign", () => {
  const { url, tracked } = buildAffiliateUrl("viator", "https://www.viator.com/Seoul/d973", "dmz-tours", env);
  const u = new URL(url);
  assert.equal(tracked, true);
  assert.equal(u.searchParams.get("pid"), "P00319575");
  assert.equal(u.searchParams.get("mcid"), "42383");
  assert.equal(u.searchParams.get("medium"), "link");
  assert.equal(u.searchParams.get("campaign"), "dmz-tours");
});

test("creatrip link carries utm_source and aff_id", () => {
  const u = new URL(buildAffiliateUrl("creatrip", "https://creatrip.com/en/spot/123", "hanbok-rental", env).url);
  assert.equal(u.searchParams.get("utm_source"), "AFF-z2aiofi");
  assert.equal(u.searchParams.get("aff_id"), "AFF-z2aiofi");
  assert.equal(u.searchParams.get("utm_campaign"), "hanbok-rental");
});

test("trip.com link carries Allianceid, SID, trip_sub1", () => {
  const u = new URL(buildAffiliateUrl("tripcom", "https://www.trip.com/hotels/", "where-to-stay-in-seoul", env).url);
  assert.equal(u.searchParams.get("Allianceid"), "10527938");
  assert.equal(u.searchParams.get("SID"), "331072155");
  assert.equal(u.searchParams.get("trip_sub1"), "where-to-stay-in-seoul");
});

test("missing ids produce a plain link", () => {
  const empty = {} as NodeJS.ProcessEnv;
  const r = buildAffiliateUrl("viator", "https://www.viator.com/Seoul/d973", "x", empty);
  assert.equal(r.tracked, false);
  assert.equal(r.url, "https://www.viator.com/Seoul/d973");
  assert.equal(isProviderConfigured("viator", empty), false);
  assert.equal(isProviderConfigured("viator", env), true);
});

test("offer registry loads and validates provider host", () => {
  const offers = loadOffers(path.join(process.cwd(), "tests/fixtures/offers"));
  assert.equal(offers.get("dmz-half-day-tour")?.provider, "viator");
  const bad = offerSchema.safeParse({
    id: "bad", provider: "viator", kind: "tour", title: "t", summary: "s",
    targetUrl: "https://www.trip.com/x", destination: "korea/seoul", tags: [],
  });
  assert.equal(bad.success, false);
});

test("priceText requires priceCheckedAt", () => {
  const r = offerSchema.safeParse({
    id: "p", provider: "tripcom", kind: "hotel", title: "t", summary: "s", priceText: "$100",
    targetUrl: "https://www.trip.com/hotels/", destination: "korea/seoul", tags: [],
  });
  assert.equal(r.success, false);
});

test("parseIdList splits comma strings", () => {
  assert.deepEqual(parseIdList(" a, b ,c "), ["a", "b", "c"]);
  assert.deepEqual(parseIdList(""), []);
});
```

- [ ] **Step 3: Run to verify it fails**

Run: `npm test` → FAIL (modules missing).

- [ ] **Step 4: Implement providers**

`src/lib/affiliates/providers.ts`:
```ts
export type ProviderId = "viator" | "creatrip" | "tripcom";

export const PROVIDER_LABELS: Record<ProviderId, string> = {
  viator: "Viator",
  creatrip: "Creatrip",
  tripcom: "Trip.com",
};

export const PROVIDER_HOSTS: Record<ProviderId, string[]> = {
  viator: ["www.viator.com", "viator.com"],
  creatrip: ["creatrip.com", "www.creatrip.com"],
  tripcom: ["www.trip.com", "trip.com", "us.trip.com"],
};

const v = (env: NodeJS.ProcessEnv, key: string) => env[key]?.trim() || "";

export function isProviderConfigured(p: ProviderId, env: NodeJS.ProcessEnv = process.env): boolean {
  if (p === "viator") return !!(v(env, "VIATOR_PID") && v(env, "VIATOR_MCID"));
  if (p === "creatrip") return !!v(env, "CREATRIP_AFF_CODE");
  return !!(v(env, "TRIPCOM_ALLIANCE_ID") && v(env, "TRIPCOM_SID"));
}

export function buildAffiliateUrl(
  p: ProviderId,
  targetUrl: string,
  sourceSlug: string,
  env: NodeJS.ProcessEnv = process.env,
): { url: string; tracked: boolean } {
  if (!isProviderConfigured(p, env)) return { url: targetUrl, tracked: false };
  const u = new URL(targetUrl);
  if (p === "viator") {
    u.searchParams.set("pid", v(env, "VIATOR_PID"));
    u.searchParams.set("mcid", v(env, "VIATOR_MCID"));
    u.searchParams.set("medium", "link");
    u.searchParams.set("campaign", sourceSlug);
  } else if (p === "creatrip") {
    const code = `AFF-${v(env, "CREATRIP_AFF_CODE")}`;
    u.searchParams.set("utm_source", code);
    u.searchParams.set("aff_id", code);
    u.searchParams.set("utm_campaign", sourceSlug);
  } else {
    u.searchParams.set("Allianceid", v(env, "TRIPCOM_ALLIANCE_ID"));
    u.searchParams.set("SID", v(env, "TRIPCOM_SID"));
    u.searchParams.set("trip_sub1", sourceSlug);
  }
  return { url: u.toString(), tracked: true };
}
```

- [ ] **Step 5: Implement offers**

`src/lib/affiliates/offers.ts`:
```ts
import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import { PROVIDER_HOSTS, type ProviderId } from "./providers";

export const offerSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
    provider: z.enum(["viator", "creatrip", "tripcom"]),
    kind: z.enum(["tour", "experience", "hotel", "ticket", "transfer", "rail"]),
    title: z.string().min(1),
    summary: z.string().min(1),
    priceText: z.string().optional(),
    priceCheckedAt: z.iso.date().optional(),
    image: z.string().optional(),
    targetUrl: z.url(),
    destination: z.string().regex(/^[a-z]+(\/[a-z-]+)?$/),
    tags: z.array(z.string()).default([]),
  })
  .refine((o) => {
    try {
      return PROVIDER_HOSTS[o.provider as ProviderId].includes(new URL(o.targetUrl).host);
    } catch {
      return false;
    }
  }, {
    message: "targetUrl host does not belong to provider", path: ["targetUrl"],
  })
  .refine((o) => !o.priceText || !!o.priceCheckedAt, {
    message: "priceText requires priceCheckedAt", path: ["priceCheckedAt"],
  });

export type Offer = z.infer<typeof offerSchema>;

const DEFAULT_DIR = path.join(process.cwd(), "src/data/offers");
const cache = new Map<string, Map<string, Offer>>();

export function loadOffers(dir: string = DEFAULT_DIR): Map<string, Offer> {
  const hit = cache.get(dir);
  if (hit) return hit;
  const map = new Map<string, Offer>();
  if (fs.existsSync(dir)) {
    for (const name of fs.readdirSync(dir).filter((f) => f.endsWith(".json"))) {
      const file = path.join(dir, name);
      const parsed = offerSchema.safeParse(JSON.parse(fs.readFileSync(file, "utf-8")));
      if (!parsed.success) {
        throw new Error(`Invalid offer ${file}: ${parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`);
      }
      if (parsed.data.id !== name.replace(/\.json$/, "")) throw new Error(`Offer id does not match file name: ${file}`);
      map.set(parsed.data.id, parsed.data);
    }
  }
  cache.set(dir, map);
  return map;
}

export function getOffer(id: string): Offer {
  const offer = loadOffers().get(id);
  if (!offer) throw new Error(`Unknown offer id: ${id}`);
  return offer;
}

export const parseIdList = (value: string): string[] =>
  value.split(",").map((s) => s.trim()).filter(Boolean);
```

- [ ] **Step 6: Run tests**

Run: `npm test` → PASS.

- [ ] **Step 7: Implement components**

`src/components/affiliate/Disclosure.tsx`:
```tsx
import Link from "next/link";

export default function Disclosure() {
  return (
    <p className="my-6 rounded-lg border border-border bg-surface px-4 py-3 text-sm text-text-secondary">
      We may earn a commission if you book through links on this page, at no extra cost to you.{" "}
      <Link href="/affiliate-disclosure" className="underline underline-offset-2">How we make money</Link>
    </p>
  );
}
```

`src/components/affiliate/OfferCard.tsx`:
```tsx
import Image from "next/image";
import { getOffer, type Offer } from "@/lib/affiliates/offers";
import { buildAffiliateUrl, PROVIDER_LABELS } from "@/lib/affiliates/providers";
import { getImage } from "@/lib/images/registry";

const KIND_LABEL: Record<Offer["kind"], string> = {
  tour: "Tour", experience: "Experience", hotel: "Hotel", ticket: "Ticket", transfer: "Transfer", rail: "Train",
};

export function offerLinkProps(offer: Offer, sourceSlug: string) {
  const { url, tracked } = buildAffiliateUrl(offer.provider, offer.targetUrl, sourceSlug);
  return {
    href: url,
    target: "_blank",
    rel: tracked ? "sponsored nofollow noopener" : "nofollow noopener",
    "data-offer": offer.id,
    "data-provider": offer.provider,
  } as const;
}

export const checkedLabel = (iso?: string) =>
  iso ? new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" }) : null;

export default function OfferCard({ id, sourceSlug }: { id: string; sourceSlug: string }) {
  const offer = getOffer(id);
  const img = offer.image ? getImage(offer.image) : null;
  const provider = PROVIDER_LABELS[offer.provider];
  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-border bg-white">
      {img ? (
        <Image src={img.src} width={img.width} height={img.height} alt={img.decorative ? "" : img.alt}
          sizes="(max-width: 768px) 100vw, 360px" className="h-44 w-full object-cover" />
      ) : null}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-text-secondary">{KIND_LABEL[offer.kind]} · {provider}</p>
        <h3 className="font-heading text-lg font-semibold text-text-primary">{offer.title}</h3>
        <p className="text-sm text-text-secondary">{offer.summary}</p>
        {offer.priceText ? (
          <p className="text-sm text-text-primary">
            {offer.priceText} <span className="text-text-secondary">(checked {checkedLabel(offer.priceCheckedAt)})</span>
          </p>
        ) : null}
        <a {...offerLinkProps(offer, sourceSlug)}
          className="mt-auto inline-flex items-center justify-center rounded-lg bg-secondary px-4 py-2.5 text-sm font-medium text-white hover:bg-secondary-dark">
          Check availability on {provider}
        </a>
      </div>
    </article>
  );
}
```

`src/components/affiliate/OfferList.tsx`:
```tsx
import OfferCard from "./OfferCard";
import { parseIdList } from "@/lib/affiliates/offers";

export default function OfferList({ ids, sourceSlug }: { ids: string; sourceSlug: string }) {
  return (
    <div className="my-8 grid gap-4 sm:grid-cols-2">
      {parseIdList(ids).map((id) => <OfferCard key={id} id={id} sourceSlug={sourceSlug} />)}
    </div>
  );
}
```

`src/components/affiliate/ComparisonTable.tsx`:
```tsx
import { getOffer, parseIdList } from "@/lib/affiliates/offers";
import { PROVIDER_LABELS } from "@/lib/affiliates/providers";
import { offerLinkProps } from "./OfferCard";

export default function ComparisonTable({ ids, sourceSlug }: { ids: string; sourceSlug: string }) {
  const offers = parseIdList(ids).map(getOffer);
  return (
    <div className="my-8 overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead className="bg-surface">
          <tr>
            <th className="px-4 py-2.5 text-left font-semibold">Option</th>
            <th className="px-4 py-2.5 text-left font-semibold">Best for</th>
            <th className="px-4 py-2.5 text-left font-semibold">Typical price</th>
            <th className="px-4 py-2.5 text-left font-semibold">Book</th>
          </tr>
        </thead>
        <tbody>
          {offers.map((o) => (
            <tr key={o.id} className="border-t border-border align-top">
              <td className="px-4 py-2.5 font-medium">{o.title}</td>
              <td className="px-4 py-2.5 text-text-secondary">{o.summary}</td>
              <td className="px-4 py-2.5 text-text-secondary">{o.priceText ?? "Varies"}</td>
              <td className="px-4 py-2.5">
                <a {...offerLinkProps(o, sourceSlug)} className="text-primary underline underline-offset-2">
                  {PROVIDER_LABELS[o.provider]}
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

`src/components/affiliate/BookingCTA.tsx`:
```tsx
import { getOffer } from "@/lib/affiliates/offers";
import { PROVIDER_LABELS } from "@/lib/affiliates/providers";
import { offerLinkProps } from "./OfferCard";

export default function BookingCTA({ id, sourceSlug, heading }: { id: string; sourceSlug: string; heading?: string }) {
  const offer = getOffer(id);
  const provider = PROVIDER_LABELS[offer.provider];
  return (
    <aside className="my-10 rounded-2xl border border-secondary/30 bg-orange-50 p-6">
      <p className="text-xs font-medium uppercase tracking-wide text-secondary-dark">Affiliate option</p>
      <h3 className="mt-1 font-heading text-xl font-semibold text-text-primary">{heading ?? offer.title}</h3>
      <p className="mt-2 text-sm text-text-secondary">{offer.summary}</p>
      <a {...offerLinkProps(offer, sourceSlug)}
        className="mt-4 inline-flex items-center rounded-lg bg-secondary px-5 py-2.5 text-sm font-medium text-white hover:bg-secondary-dark">
        Check availability on {provider}
      </a>
    </aside>
  );
}
```

- [ ] **Step 8: Typecheck new files**

Run: `npx tsc --noEmit -p . 2>&1 | grep -E "src/(lib/affiliates|components/affiliate/(Disclosure|OfferCard|OfferList|ComparisonTable|BookingCTA))" || echo "no errors in new files"`
Expected: `no errors in new files`.

- [ ] **Step 9: Commit**

```bash
git add src/lib/affiliates src/components/affiliate/Disclosure.tsx src/components/affiliate/OfferCard.tsx src/components/affiliate/OfferList.tsx src/components/affiliate/ComparisonTable.tsx src/components/affiliate/BookingCTA.tsx tests/affiliates.test.ts tests/fixtures/offers
git commit -m "feat: add affiliate providers, offer registry and offer components"
```

---

### Task 5: SEO metadata and JSON-LD builders

**Files:**
- Create: `src/lib/seo/metadata.ts`, `src/lib/seo/schema.ts`, `src/components/content/JsonLd.tsx`
- Test: `tests/seo.test.ts`

**Interfaces:**
- Consumes: `SITE`, `absoluteUrl` (Task 1), `getEditor` (Task 1), `Article`, `Hub`, `CategoryPage` (Task 2), `getCountry`, `getCity` (Task 1).
- Produces:
  - `buildMetadata(input: { title: string; description: string; path: string; imageUrl?: string; noindex?: boolean; type?: "website" | "article"; publishedTime?: string; modifiedTime?: string; absoluteTitle?: boolean }): Metadata`
  - `ogImageUrl(title: string, eyebrow?: string): string`
  - `organizationSchema()`, `websiteSchema()`, `breadcrumbSchema(items: { name: string; path: string }[])`,
    `articleSchema(a: Article, imageUrl?: string)`, `destinationSchema(h: Hub)`, `faqSchema(faqs: { q: string; a: string }[])`,
    `profilePageSchema(editorId: string)` — all return plain objects with `@context`.
  - `jsonLdString(data: object | object[]): string` (escapes `<` as `<`)
  - `<JsonLd data={...} />`

- [ ] **Step 1: Failing test**

`tests/seo.test.ts`:
```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { buildMetadata } from "@/lib/seo/metadata";
import { articleSchema, breadcrumbSchema, jsonLdString, organizationSchema, destinationSchema } from "@/lib/seo/schema";
import { loadContent } from "@/lib/content/loader";

const idx = loadContent({ root: path.join(process.cwd(), "tests/fixtures/content"), includeReview: false });

test("metadata sets canonical, og and robots", () => {
  const m = buildMetadata({ title: "T", description: "D", path: "/korea", noindex: true });
  assert.equal((m.alternates as { canonical: string }).canonical, "https://asiapicks.com/korea");
  assert.deepEqual(m.robots, { index: false, follow: true });
  const og = m.openGraph as { url: string; siteName: string };
  assert.equal(og.url, "https://asiapicks.com/korea");
  assert.equal(og.siteName, "AsiaPicks");
});

test("organization uses the entity description", () => {
  const org = organizationSchema();
  assert.equal(org.name, "AsiaPicks");
  assert.equal(org.description, "AsiaPicks, an Asia travel discovery and planning website");
});

test("article schema reflects frontmatter", () => {
  const a = idx.articles.find((x) => x.fm.slug === "how-to-pay-in-korea")!;
  const s = articleSchema(a);
  assert.equal(s["@type"], "BlogPosting");
  assert.equal(s.url, "https://asiapicks.com/korea/how-to-pay-in-korea");
  assert.equal(s.dateModified, "2026-09-12");
  assert.equal(s.author["@type"], "Organization");
  assert.equal("aggregateRating" in s, false);
});

test("destination schema for city hub", () => {
  const h = idx.hubs.find((x) => x.path === "/korea/seoul")!;
  const s = destinationSchema(h);
  assert.equal(s["@type"], "TouristDestination");
  assert.equal(s.name, "Seoul");
});

test("breadcrumbs and escaping", () => {
  const b = breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Korea", path: "/korea" }]);
  assert.equal(b.itemListElement[1].item, "https://asiapicks.com/korea");
  assert.equal(jsonLdString({ x: "</script>" }).includes("</script>"), false);
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test` → FAIL (modules missing).

- [ ] **Step 3: Implement metadata**

`src/lib/seo/metadata.ts`:
```ts
import type { Metadata } from "next";
import { SITE, absoluteUrl } from "@/lib/site";

export function ogImageUrl(title: string, eyebrow?: string): string {
  const p = new URLSearchParams({ title });
  if (eyebrow) p.set("eyebrow", eyebrow);
  return absoluteUrl(`/api/og?${p.toString()}`);
}

export function buildMetadata(input: {
  title: string;
  description: string;
  path: string;
  imageUrl?: string;
  noindex?: boolean;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  absoluteTitle?: boolean;
}): Metadata {
  const url = absoluteUrl(input.path);
  const image = input.imageUrl ?? ogImageUrl(input.title);
  return {
    title: input.absoluteTitle ? { absolute: input.title } : input.title,
    description: input.description,
    alternates: { canonical: url },
    robots: input.noindex ? { index: false, follow: true } : { index: true, follow: true },
    openGraph: {
      type: input.type ?? "website",
      url,
      siteName: SITE.name,
      locale: SITE.locale,
      title: input.title,
      description: input.description,
      images: [{ url: image, width: 1200, height: 630, alt: input.title }],
      ...(input.type === "article" ? { publishedTime: input.publishedTime, modifiedTime: input.modifiedTime } : {}),
    },
    twitter: { card: "summary_large_image", title: input.title, description: input.description, images: [image] },
  };
}
```

- [ ] **Step 4: Implement schema builders**

`src/lib/seo/schema.ts`:
```ts
import { SITE, absoluteUrl } from "@/lib/site";
import { getEditor } from "@/data/editors";
import { getCity, getCountry } from "@/data/taxonomy";
import type { Article, Hub } from "@/lib/content/loader";

const ORG_ID = `${SITE.baseUrl}/#organization`;
const SITE_ID = `${SITE.baseUrl}/#website`;

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    name: SITE.name,
    url: SITE.baseUrl,
    logo: absoluteUrl("/icon"),
    description: SITE.description,
    knowsAbout: ["South Korea travel", "Seoul travel", "Busan travel", "Jeju travel", "Gyeongju travel"],
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": SITE_ID,
    name: SITE.name,
    url: SITE.baseUrl,
    description: SITE.description,
    inLanguage: "en",
    publisher: { "@id": ORG_ID },
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.path),
    })),
  };
}

function authorNode(editorId: string) {
  const e = getEditor(editorId);
  return { "@type": e.kind, name: e.name, url: e.url };
}

function placeNode(country: string, city: string | null) {
  const c = getCountry(country);
  const ci = city ? getCity(country, city) : undefined;
  return ci
    ? { "@type": "TouristDestination", name: ci.name, containedInPlace: { "@type": "Country", name: c?.name } }
    : { "@type": "Country", name: c?.name };
}

export function articleSchema(a: Article, imageUrl?: string) {
  const url = absoluteUrl(a.path);
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: a.fm.title,
    description: a.fm.description,
    url,
    mainEntityOfPage: url,
    datePublished: a.fm.publishedAt,
    dateModified: a.fm.updatedAt,
    author: authorNode(a.fm.author),
    publisher: { "@id": ORG_ID },
    inLanguage: "en",
    ...(imageUrl ? { image: [imageUrl] } : {}),
    about: placeNode(a.country, a.city),
  };
}

export function destinationSchema(h: Hub) {
  const c = getCountry(h.country);
  const ci = h.city ? getCity(h.country, h.city) : undefined;
  return {
    "@context": "https://schema.org",
    "@type": ci ? "TouristDestination" : "Country",
    name: ci?.name ?? c?.name,
    description: h.fm.description,
    url: absoluteUrl(h.path),
    ...(ci ? { containedInPlace: { "@type": "Country", name: c?.name } } : {}),
  };
}

export function faqSchema(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
}

export function profilePageSchema(editorId: string) {
  const e = getEditor(editorId);
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: { "@type": e.kind, name: e.name, url: e.url, description: e.bio },
  };
}

export function jsonLdString(data: object | object[]): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
```

`src/components/content/JsonLd.tsx`:
```tsx
import { jsonLdString } from "@/lib/seo/schema";

export default function JsonLd({ data }: { data: object | object[] }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(data) }} />;
}
```

- [ ] **Step 5: Run tests**

Run: `npm test` → PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/seo src/components/content/JsonLd.tsx tests/seo.test.ts
git commit -m "feat: add metadata and JSON-LD builders"
```

---

### Task 6: Internal link engine

**Files:**
- Create: `src/lib/content/links.ts`
- Test: `tests/links.test.ts`

**Interfaces:**
- Consumes: `ContentIndex`, `Article`, `ContentNode` (Task 2), `hubPath` (Task 2).
- Produces:
  - `extractInternalLinks(body: string): string[]` (unique paths starting with `/`, no hash or query, no trailing slash)
  - `buildLinkGraph(idx: ContentIndex): Map<string, { out: string[]; in: string[] }>` (body links of hubs, categories, articles)
  - `relatedArticles(a: Article, idx: ContentIndex, limit?: number): Article[]`
  - `nextStep(a: Article, idx: ContentIndex): Article | null`
  - `JOURNEY: readonly ["discovery", "planning", "comparison", "booking", "on-trip"]`

- [ ] **Step 1: Failing test**

`tests/links.test.ts`:
```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { loadContent } from "@/lib/content/loader";
import { extractInternalLinks, buildLinkGraph, relatedArticles, nextStep } from "@/lib/content/links";

const idx = loadContent({ root: path.join(process.cwd(), "tests/fixtures/content"), includeReview: false });

test("extracts markdown and href links, internal only", () => {
  const body = 'See [A](/korea/seoul/) and [B](/korea#x) and [C](https://x.com) and <a href="/korea/seoul?y=1">D</a>.';
  assert.deepEqual(extractInternalLinks(body).sort(), ["/korea", "/korea/seoul"]);
});

test("link graph records inbound links", () => {
  const g = buildLinkGraph(idx);
  const inbound = g.get("/korea/seoul/incheon-airport-to-seoul")!.in.sort();
  assert.deepEqual(inbound, ["/korea", "/korea/how-to-pay-in-korea", "/korea/seoul"]);
});

test("related prefers same city, excludes self", () => {
  const a = idx.articles.find((x) => x.fm.slug === "how-to-pay-in-korea")!;
  const rel = relatedArticles(a, idx, 3);
  assert.equal(rel.some((r) => r.path === a.path), false);
  assert.equal(rel.length, 1);
});

test("next step moves forward in the journey", () => {
  const a = idx.articles.find((x) => x.fm.slug === "how-to-pay-in-korea")!; // planning
  assert.equal(nextStep(a, idx)?.fm.slug, "incheon-airport-to-seoul"); // on-trip, nearest later stage
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test` → FAIL.

- [ ] **Step 3: Implement**

`src/lib/content/links.ts`:
```ts
import type { Article, ContentIndex, ContentNode } from "./loader";

export const JOURNEY = ["discovery", "planning", "comparison", "booking", "on-trip"] as const;

const LINK_RE = /\]\((\/[^)\s#?]*)[^)]*\)|href="(\/[^"#?]*)[^"]*"/g;

const normalize = (p: string) => (p.length > 1 && p.endsWith("/") ? p.slice(0, -1) : p);

export function extractInternalLinks(body: string): string[] {
  const out = new Set<string>();
  for (const m of body.matchAll(LINK_RE)) {
    const raw = m[1] ?? m[2];
    if (raw && !raw.startsWith("//")) out.add(normalize(raw));
  }
  return [...out];
}

export function buildLinkGraph(idx: ContentIndex) {
  const graph = new Map<string, { out: string[]; in: string[] }>();
  const nodes: ContentNode[] = [...idx.hubs, ...idx.categories, ...idx.articles];
  for (const n of nodes) graph.set(n.path, { out: [], in: [] });
  for (const n of nodes) {
    const out = extractInternalLinks(n.body).filter((p) => p !== n.path);
    graph.get(n.path)!.out = out;
    for (const target of out) {
      const entry = graph.get(target);
      if (entry && !entry.in.includes(n.path)) entry.in.push(n.path);
    }
  }
  return graph;
}

function score(a: Article, b: Article): number {
  if (a.country !== b.country) return 0;
  if (a.city && a.city === b.city) return a.fm.category === b.fm.category ? 3 : 2;
  if (!a.city && !b.city) return a.fm.category === b.fm.category ? 2 : 1;
  return 1;
}

export function relatedArticles(a: Article, idx: ContentIndex, limit = 3): Article[] {
  const manual = a.fm.relatedArticles
    .map((p) => idx.byPath.get(p))
    .filter((n): n is Article => !!n && n.kind === "article" && n.path !== a.path);
  const scored = idx.articles
    .filter((b) => b.path !== a.path && !manual.includes(b))
    .map((b) => ({ b, s: score(a, b) }))
    .filter((x) => x.s > 0)
    .sort((x, y) => y.s - x.s || y.b.fm.updatedAt.localeCompare(x.b.fm.updatedAt))
    .map((x) => x.b);
  return [...manual, ...scored].slice(0, limit);
}

export function nextStep(a: Article, idx: ContentIndex): Article | null {
  const stage = JOURNEY.indexOf(a.fm.journeyStage);
  const candidates = idx.articles
    .filter((b) => b.path !== a.path && b.country === a.country && JOURNEY.indexOf(b.fm.journeyStage) > stage)
    .sort((x, y) => {
      const dx = JOURNEY.indexOf(x.fm.journeyStage) - stage;
      const dy = JOURNEY.indexOf(y.fm.journeyStage) - stage;
      const cx = x.city === a.city ? 0 : 1;
      const cy = y.city === a.city ? 0 : 1;
      return dx - dy || cx - cy || y.fm.updatedAt.localeCompare(x.fm.updatedAt);
    });
  return candidates[0] ?? null;
}
```

- [ ] **Step 4: Run tests**

Run: `npm test` → PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/content/links.ts tests/links.test.ts
git commit -m "feat: add internal link engine"
```

---

### Task 7: Remove the old site and install the new global layout

This task deletes the old Asia blog code on the `korea-rebuild` branch only. `main` keeps serving the old site until Plan 4. Git history keeps every deleted file.

**Files:**
- Delete (all of them):
  - Routes: `src/app/admin/`, `src/app/api/admin/`, `src/app/ads.txt/`, `src/app/blog/`, `src/app/deals/`, `src/app/destinations/`, `src/app/saju-travel/`, `src/app/search/`, `src/app/feed.xml/`, `src/app/api/og/route.tsx`, `src/app/sitemap.ts`, `src/app/about/page.tsx`, `src/app/privacy/page.tsx`, `src/app/terms/page.tsx`, `src/app/affiliate-disclosure/page.tsx`
  - Components: `src/components/ads/`, `src/components/blog/`, `src/components/cards/`, `src/components/common/`, `src/components/destination/`, `src/components/destinations/`, `src/components/home/`, `src/components/saju/`, `src/components/search/`, `src/components/ui/`, `src/components/affiliate/ActivitySection.tsx`, `src/components/affiliate/AffiliateCTA.tsx`, `src/components/affiliate/AffiliateDisclosure.tsx`, `src/components/affiliate/HotelSection.tsx`, `src/components/affiliate/KlookSideBanner.tsx`, `src/components/affiliate/KlookWidget.tsx`, `src/components/affiliate/StickyBookingBar.tsx`
  - Lib/data/types: `src/lib/affiliates.ts`, `src/lib/blog.ts`, `src/lib/db.ts`, `src/lib/destinations.ts`, `src/lib/google-indexing.ts`, `src/lib/mdx.ts`, `src/lib/seo.ts`, `src/lib/unsplash.ts`, `src/types/`, `src/data/affiliates.json`, `src/data/content-queue.json`, `src/data/countries.json`, `src/data/destinations/`, `src/data/popular-destinations.json`, `src/data/themes.json`
  - Content: `src/content/blog/` (155 files)
  - Scripts/CI: `scripts/fix-post-images.ts`, `scripts/generate-post.ts`, `scripts/index-all-posts.ts`, `scripts/index-new-post.ts`, `scripts/init-db.ts`, `.github/workflows/auto-blog.yml`, `.github/workflows/index-all.yml`
  - Public: `public/robots.txt`, `public/images/destinations/`, `public/images/hotels/`, `public/file.svg`, `public/globe.svg`, `public/next.svg`, `public/vercel.svg`, `public/window.svg`
- Keep: `public/a3f2e7c8b1d49f6e2c8a4b7d1f3e9c2a.txt` (existing IndexNow key file), `src/app/favicon.ico`
- Rewrite: `src/app/layout.tsx`, `src/app/page.tsx` (interim; final in Task 9), `src/app/globals.css`, `src/components/layout/Header.tsx`, `src/components/layout/Footer.tsx`, `next.config.ts`
- Modify: `package.json` (remove unused deps)

**Interfaces:**
- Consumes: `SITE` (Task 1), `COUNTRIES`, `CITIES` (Task 1), `organizationSchema`, `websiteSchema` (Task 5), `JsonLd` (Task 5).
- Produces: root layout with `Header`, `Footer`, `<Analytics />`; title template `%s | AsiaPicks`.

- [ ] **Step 1: Record the deletion list for the owner**

Run:
```bash
git ls-files src/content/blog | wc -l
git ls-files src/app/admin src/app/api/admin src/app/ads.txt src/app/blog src/app/deals src/app/destinations src/app/saju-travel src/app/search src/app/feed.xml src/components src/lib src/types src/data scripts .github/workflows public | grep -v -E "^src/(lib/(site\.ts|content/|images/|affiliates/|seo/)|data/(taxonomy|editors)\.ts|components/(media/|content/JsonLd|affiliate/(Disclosure|OfferCard|OfferList|ComparisonTable|BookingCTA)))" > /tmp/asiapicks-deletions.txt
wc -l /tmp/asiapicks-deletions.txt
```
Expected: 155 blog files; the list file names every path removed in Step 2 (plus new files that are filtered out). Keep the list for the Plan 4 switch report.

- [ ] **Step 2: Delete**

```bash
git rm -r -q src/app/admin src/app/api/admin src/app/ads.txt src/app/blog src/app/deals src/app/destinations src/app/saju-travel src/app/search src/app/feed.xml src/app/api/og/route.tsx src/app/sitemap.ts src/app/about/page.tsx src/app/privacy/page.tsx src/app/terms/page.tsx src/app/affiliate-disclosure/page.tsx
git rm -r -q src/components/ads src/components/blog src/components/cards src/components/common src/components/destination src/components/destinations src/components/home src/components/saju src/components/search src/components/ui
git rm -q src/components/affiliate/ActivitySection.tsx src/components/affiliate/AffiliateCTA.tsx src/components/affiliate/AffiliateDisclosure.tsx src/components/affiliate/HotelSection.tsx src/components/affiliate/KlookSideBanner.tsx src/components/affiliate/KlookWidget.tsx src/components/affiliate/StickyBookingBar.tsx
git rm -r -q src/lib/affiliates.ts src/lib/blog.ts src/lib/db.ts src/lib/destinations.ts src/lib/google-indexing.ts src/lib/mdx.ts src/lib/seo.ts src/lib/unsplash.ts src/types src/data/affiliates.json src/data/content-queue.json src/data/countries.json src/data/destinations src/data/popular-destinations.json src/data/themes.json
git rm -r -q src/content/blog
git rm -q scripts/fix-post-images.ts scripts/generate-post.ts scripts/index-all-posts.ts scripts/index-new-post.ts scripts/init-db.ts .github/workflows/auto-blog.yml .github/workflows/index-all.yml
git rm -r -q public/robots.txt public/file.svg public/globe.svg public/next.svg public/vercel.svg public/window.svg
rm -rf public/images/destinations public/images/hotels
npm uninstall @neondatabase/serverless googleapis react-markdown @anthropic-ai/sdk
```
(`scripts/check-frontmatter.ts` was stashed in Task 0 and is not tracked; it stays out of the branch.)

- [ ] **Step 3: Rewrite `next.config.ts`**

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
```
(Task 12 adds `redirects()`.)

- [ ] **Step 4: Rewrite `src/app/globals.css`**

```css
@import "tailwindcss";

@theme inline {
  --color-primary: #0D9488;
  --color-primary-light: #14B8A6;
  --color-primary-dark: #0F766E;
  --color-secondary: #F97316;
  --color-secondary-dark: #EA580C;
  --color-background: #FFFFFF;
  --color-surface: #F8FAFC;
  --color-text-primary: #1E293B;
  --color-text-secondary: #64748B;
  --color-border: #E2E8F0;
  --font-sans: var(--font-inter);
  --font-heading: var(--font-plus-jakarta-sans);
}

body {
  background: var(--color-background);
  color: var(--color-text-primary);
  font-family: var(--font-sans), system-ui, sans-serif;
}

h1, h2, h3, h4 {
  font-family: var(--font-heading), var(--font-sans), system-ui, sans-serif;
}

.content-body {
  font-size: 1.0625rem;
  line-height: 1.75;
}
```

- [ ] **Step 5: Header (no client JS; `<details>` for mobile menu)**

`src/components/layout/Header.tsx`:
```tsx
import Link from "next/link";
import { CITIES } from "@/data/taxonomy";
import { SITE } from "@/lib/site";

const NAV = [
  { href: "/korea", label: "South Korea" },
  ...CITIES.filter((c) => c.slug !== "incheon").map((c) => ({ href: `/korea/${c.slug}`, label: c.name })),
  { href: "/korea/planning", label: "Plan Your Trip" },
];

export default function Header() {
  return (
    <header className="border-b border-border bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="font-heading text-2xl font-bold text-primary">{SITE.name}</Link>
        <nav aria-label="Main" className="hidden items-center gap-6 md:flex">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="text-sm font-medium text-text-secondary hover:text-primary">{n.label}</Link>
          ))}
        </nav>
        <details className="relative md:hidden">
          <summary className="cursor-pointer list-none rounded-md px-3 py-2 text-sm font-medium text-text-secondary" aria-label="Open menu">Menu</summary>
          <nav aria-label="Mobile" className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-border bg-white p-2 shadow-lg">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="block rounded-lg px-3 py-2 text-sm text-text-primary hover:bg-surface">{n.label}</Link>
            ))}
          </nav>
        </details>
      </div>
    </header>
  );
}
```
(`/korea/planning` returns 404 until a planning article is published; Task 13's link check does not scan components, so Plan 3 must publish at least one `planning` article before launch. Plan 3's first article, `how-to-pay-in-korea`, is `planning`.)

- [ ] **Step 6: Footer**

`src/components/layout/Footer.tsx`:
```tsx
import Link from "next/link";
import { CITIES } from "@/data/taxonomy";
import { SITE } from "@/lib/site";

const TRUST = [
  { href: "/about", label: "About" },
  { href: "/editorial-policy", label: "Editorial Policy" },
  { href: "/how-we-choose", label: "How We Choose Recommendations" },
  { href: "/affiliate-disclosure", label: "Affiliate Disclosure" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-surface">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-3 sm:px-6">
        <div>
          <p className="font-heading text-lg font-bold text-primary">{SITE.name}</p>
          <p className="mt-2 text-sm text-text-secondary">{SITE.tagline}</p>
        </div>
        <nav aria-label="Destinations">
          <p className="text-sm font-semibold text-text-primary">South Korea</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/korea" className="text-text-secondary hover:text-primary">South Korea travel guide</Link></li>
            {CITIES.filter((c) => c.slug !== "incheon").map((c) => (
              <li key={c.slug}><Link href={`/korea/${c.slug}`} className="text-text-secondary hover:text-primary">{c.name} travel guide</Link></li>
            ))}
          </ul>
        </nav>
        <nav aria-label="About AsiaPicks">
          <p className="text-sm font-semibold text-text-primary">About</p>
          <ul className="mt-3 space-y-2 text-sm">
            {TRUST.map((t) => (
              <li key={t.href}><Link href={t.href} className="text-text-secondary hover:text-primary">{t.label}</Link></li>
            ))}
          </ul>
        </nav>
      </div>
      <p className="border-t border-border px-4 py-6 text-center text-xs text-text-secondary">
        © {new Date().getFullYear()} {SITE.name}. Some links are affiliate links; we may earn a commission at no extra cost to you.
      </p>
    </footer>
  );
}
```

- [ ] **Step 7: Root layout**

`src/app/layout.tsx`:
```tsx
import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import JsonLd from "@/components/content/JsonLd";
import { SITE } from "@/lib/site";
import { organizationSchema, websiteSchema } from "@/lib/seo/schema";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const jakarta = Plus_Jakarta_Sans({ variable: "--font-plus-jakarta-sans", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.baseUrl),
  title: { default: `${SITE.name}: Asia travel planning, starting with South Korea`, template: `%s | ${SITE.name}` },
  description: SITE.tagline,
  applicationName: SITE.name,
  openGraph: { siteName: SITE.name, locale: SITE.locale, type: "website" },
  twitter: { card: "summary_large_image" },
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION } }
    : {}),
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${jakarta.variable} antialiased`}>
        <JsonLd data={[organizationSchema(), websiteSchema()]} />
        <Header />
        <main id="main" className="min-h-[60vh]">{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
```

- [ ] **Step 8: Interim home page (replaced in Task 9)**

`src/app/page.tsx`:
```tsx
import Link from "next/link";
import { SITE } from "@/lib/site";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-heading text-4xl font-bold">{SITE.name}</h1>
      <p className="mt-4 text-text-secondary">{SITE.tagline}</p>
      <Link href="/korea" className="mt-6 inline-block text-primary underline">South Korea travel guide</Link>
    </div>
  );
}
```

- [ ] **Step 9: Verify nothing references removed code**

Run:
```bash
npx tsc --noEmit
grep -rn -i -E "agoda|klook|sajumuse|saju|unsplash|adsense|neon|google-indexing" src scripts .github next.config.ts || echo "clean"
npm test
```
Expected: tsc exits 0; grep prints `clean`; tests PASS.

- [ ] **Step 10: Commit**

```bash
git add -A src scripts .github public next.config.ts package.json package-lock.json
git commit -m "refactor!: remove old Asia blog and install new global layout"
```

---

### Task 8: Content chrome components and MDX renderer

**Files:**
- Create: `src/lib/content/body.ts`
- Create: `src/components/content/{Breadcrumbs,AnswerBox,ArticleMeta,FAQ,SourceList,NextStep,RelatedGuides,ArticleCard,Callout,QuickFacts,Verdict,Mdx}.tsx`
- Create: `src/components/content/{ArticleLayout,HubLayout,CategoryLayout}.tsx`
- Test: `tests/body.test.ts`

**Interfaces:**
- Consumes: Tasks 2–6 (`Article`, `Hub`, `CategoryPage`, `ContentIndex`, `getContent`, `relatedArticles`, `nextStep`, `Figure`, affiliate components, `Disclosure`, `JsonLd`, schema builders, `getEditor`, `getCity`, `getCountry`, `getCategory`, `CITY_CATEGORIES`).
- Produces:
  - `usesAffiliateComponents(body: string): boolean`, `hasMdxH1(body: string): boolean`, `bookingCtaCount(body: string): number`, `formatDate(iso: string): string` ("Sep 12, 2026")
  - `<Mdx source sourceSlug />` (server; next-mdx-remote/rsc with remark-gfm + rehype-slug; string props only)
  - `<ArticleLayout article idx />`, `<HubLayout hub idx />`, `<CategoryLayout page />`
  - `breadcrumbsFor(node): { name: string; path: string }[]` exported from `Breadcrumbs.tsx`

- [ ] **Step 1: Failing test**

`tests/body.test.ts`:
```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { usesAffiliateComponents, hasMdxH1, bookingCtaCount, formatDate } from "@/lib/content/body";

test("detects affiliate components", () => {
  assert.equal(usesAffiliateComponents('Text\n<OfferList ids="a,b" />'), true);
  assert.equal(usesAffiliateComponents("Plain text about offers"), false);
});

test("detects markdown H1 outside code fences", () => {
  assert.equal(hasMdxH1("# Title\n\nBody"), true);
  assert.equal(hasMdxH1("## H2\n\n```\n# not a heading\n```"), false);
});

test("counts booking CTAs", () => {
  assert.equal(bookingCtaCount('<BookingCTA id="a" />\n<BookingCTA id="b" />'), 2);
});

test("formats ISO dates in UTC", () => {
  assert.equal(formatDate("2026-09-12"), "Sep 12, 2026");
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test` → FAIL.

- [ ] **Step 3: Implement body helpers**

`src/lib/content/body.ts`:
```ts
const stripFences = (body: string) => body.replace(/```[\s\S]*?```/g, "");

export const usesAffiliateComponents = (body: string) =>
  /<(Offer|OfferList|ComparisonTable|BookingCTA)\b/.test(stripFences(body));

export const hasMdxH1 = (body: string) => /^#\s+\S/m.test(stripFences(body));

export const bookingCtaCount = (body: string) => (stripFences(body).match(/<BookingCTA\b/g) ?? []).length;

export const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
```

- [ ] **Step 4: Run tests** → `npm test` PASS.

- [ ] **Step 5: Small presentational components**

`src/components/content/AnswerBox.tsx`:
```tsx
export default function AnswerBox({ summary }: { summary: string }) {
  return (
    <section aria-label="Short answer" className="my-6 rounded-xl border-l-4 border-primary bg-teal-50 px-5 py-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-primary-dark">Short answer</p>
      <p className="mt-1 text-base text-text-primary">{summary}</p>
    </section>
  );
}
```

`src/components/content/ArticleMeta.tsx`:
```tsx
import Link from "next/link";
import { getEditor } from "@/data/editors";
import { formatDate } from "@/lib/content/body";

export default function ArticleMeta({ updatedAt, factCheckedAt, author }: { updatedAt: string; factCheckedAt?: string; author: string }) {
  const editor = getEditor(author);
  return (
    <p className="mt-3 text-sm text-text-secondary">
      Updated <time dateTime={updatedAt}>{formatDate(updatedAt)}</time>
      {factCheckedAt ? <> · Fact-checked <time dateTime={factCheckedAt}>{formatDate(factCheckedAt)}</time></> : null}
      {" · "}By <Link href="/about" className="underline underline-offset-2">{editor.name}</Link>
    </p>
  );
}
```

`src/components/content/FAQ.tsx`:
```tsx
export default function FAQ({ faqs }: { faqs: { q: string; a: string }[] }) {
  if (faqs.length === 0) return null;
  return (
    <section className="mt-12">
      <h2 className="font-heading text-2xl font-bold">Frequently asked questions</h2>
      {faqs.map((f) => (
        <div key={f.q} className="mt-6">
          <h3 className="font-heading text-lg font-semibold">{f.q}</h3>
          <p className="mt-2 text-text-primary">{f.a}</p>
        </div>
      ))}
    </section>
  );
}
```

`src/components/content/SourceList.tsx`:
```tsx
import { formatDate } from "@/lib/content/body";

export default function SourceList({ sources }: { sources: { title: string; url: string; publisher: string; checkedAt: string }[] }) {
  if (sources.length === 0) return null;
  return (
    <section className="mt-12 border-t border-border pt-6">
      <h2 className="font-heading text-lg font-semibold">Sources</h2>
      <ul className="mt-3 space-y-2 text-sm text-text-secondary">
        {sources.map((s) => (
          <li key={s.url}>
            <a href={s.url} target="_blank" rel="noopener" className="underline underline-offset-2">{s.title}</a>
            {" "}({s.publisher}), checked {formatDate(s.checkedAt)}
          </li>
        ))}
      </ul>
    </section>
  );
}
```

`src/components/content/ArticleCard.tsx`:
```tsx
import Link from "next/link";
import type { Article } from "@/lib/content/loader";
import { formatDate } from "@/lib/content/body";

export default function ArticleCard({ article }: { article: Article }) {
  return (
    <Link href={article.path} className="block rounded-xl border border-border p-5 hover:border-primary">
      <p className="font-heading text-lg font-semibold text-text-primary">{article.fm.title}</p>
      <p className="mt-2 text-sm text-text-secondary">{article.fm.description}</p>
      <p className="mt-3 text-xs text-text-secondary">Updated {formatDate(article.fm.updatedAt)}</p>
    </Link>
  );
}
```

`src/components/content/NextStep.tsx`:
```tsx
import Link from "next/link";
import type { Article } from "@/lib/content/loader";

export default function NextStep({ article }: { article: Article | null }) {
  if (!article) return null;
  return (
    <aside className="mt-12 rounded-xl bg-surface p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">Next step</p>
      <Link href={article.path} className="mt-1 block font-heading text-lg font-semibold text-primary underline-offset-2 hover:underline">
        {article.fm.title}
      </Link>
      <p className="mt-1 text-sm text-text-secondary">{article.fm.description}</p>
    </aside>
  );
}
```

`src/components/content/RelatedGuides.tsx`:
```tsx
import type { Article } from "@/lib/content/loader";
import ArticleCard from "./ArticleCard";

export default function RelatedGuides({ articles }: { articles: Article[] }) {
  if (articles.length === 0) return null;
  return (
    <section className="mt-12">
      <h2 className="font-heading text-2xl font-bold">Related guides</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {articles.map((a) => <ArticleCard key={a.path} article={a} />)}
      </div>
    </section>
  );
}
```

`src/components/content/Callout.tsx`:
```tsx
const LABELS = { tip: "Tip", pick: "Our pick", note: "Note" } as const;

export default function Callout({ type = "note", title, children }: { type?: keyof typeof LABELS; title?: string; children: React.ReactNode }) {
  return (
    <aside className="my-6 rounded-xl border border-border bg-surface px-5 py-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-primary-dark">{LABELS[type] ?? LABELS.note}{title ? `: ${title}` : ""}</p>
      <div className="mt-1 text-text-primary [&>p]:my-1">{children}</div>
    </aside>
  );
}
```

`src/components/content/QuickFacts.tsx`:
```tsx
export default function QuickFacts({ title = "Quick facts", children }: { title?: string; children: React.ReactNode }) {
  return (
    <section aria-label={title} className="my-6 rounded-xl border border-border px-5 py-4">
      <p className="font-heading text-base font-semibold">{title}</p>
      <div className="mt-2 text-sm [&_ul]:space-y-1">{children}</div>
    </section>
  );
}
```

`src/components/content/Verdict.tsx`:
```tsx
export default function Verdict({ children }: { children: React.ReactNode }) {
  return (
    <section aria-label="Verdict" className="my-6 rounded-xl border-2 border-primary px-5 py-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-primary-dark">The short verdict</p>
      <div className="mt-1 text-text-primary">{children}</div>
    </section>
  );
}
```

`src/components/content/Breadcrumbs.tsx`:
```tsx
import Link from "next/link";
import type { ContentNode } from "@/lib/content/loader";
import { getCategory, getCity, getCountry } from "@/data/taxonomy";
import { categoryPath, hubPath } from "@/lib/content/paths";

export function breadcrumbsFor(node: ContentNode): { name: string; path: string }[] {
  const items = [{ name: "Home", path: "/" }];
  const country = getCountry(node.country)!;
  if (node.kind === "hub" && !node.city) return [...items, { name: country.name, path: hubPath(node.country) }];
  items.push({ name: country.name, path: hubPath(node.country) });
  if (node.city) items.push({ name: getCity(node.country, node.city)!.name, path: hubPath(node.country, node.city) });
  if (node.kind === "category") items.push({ name: node.fm.title, path: node.path });
  if (node.kind === "article") {
    const level = node.city ? "city" : "country";
    const cat = getCategory(level, node.fm.category)!;
    items.push({ name: cat.label, path: categoryPath(node.country, node.city, node.fm.category) });
    items.push({ name: node.fm.title, path: node.path });
  }
  return items;
}

export default function Breadcrumbs({ items }: { items: { name: string; path: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-text-secondary">
      <ol className="flex flex-wrap gap-1">
        {items.map((it, i) => (
          <li key={it.path} className="flex items-center gap-1">
            {i > 0 ? <span aria-hidden="true">/</span> : null}
            {i === items.length - 1 ? <span aria-current="page">{it.name}</span> : <Link href={it.path} className="hover:text-primary">{it.name}</Link>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
```
(An article's category breadcrumb links to the category page. The category page exists because the article itself is a member of it, and Task 13 fails the build if its `_categories/{category}.mdx` intro is missing.)

- [ ] **Step 6: MDX renderer**

`src/components/content/Mdx.tsx`:
```tsx
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import Figure from "@/components/media/Figure";
import OfferCard from "@/components/affiliate/OfferCard";
import OfferList from "@/components/affiliate/OfferList";
import ComparisonTable from "@/components/affiliate/ComparisonTable";
import BookingCTA from "@/components/affiliate/BookingCTA";
import Callout from "./Callout";
import QuickFacts from "./QuickFacts";
import Verdict from "./Verdict";

type P = { children?: React.ReactNode };

export default function Mdx({ source, sourceSlug }: { source: string; sourceSlug: string }) {
  const components = {
    h1: ({ children }: P) => <h2 className="mt-10 mb-4 font-heading text-2xl font-bold">{children}</h2>,
    h2: ({ children, ...rest }: P & { id?: string }) => <h2 {...rest} className="mt-10 mb-4 scroll-mt-20 font-heading text-2xl font-bold">{children}</h2>,
    h3: ({ children, ...rest }: P & { id?: string }) => <h3 {...rest} className="mt-7 mb-3 scroll-mt-20 font-heading text-xl font-semibold">{children}</h3>,
    p: ({ children }: P) => <p className="my-4">{children}</p>,
    ul: ({ children }: P) => <ul className="my-4 ml-5 list-disc space-y-1.5">{children}</ul>,
    ol: ({ children }: P) => <ol className="my-4 ml-5 list-decimal space-y-1.5">{children}</ol>,
    table: ({ children }: P) => <div className="my-6 overflow-x-auto rounded-xl border border-border"><table className="w-full text-sm">{children}</table></div>,
    thead: ({ children }: P) => <thead className="bg-surface">{children}</thead>,
    th: ({ children }: P) => <th className="border-b border-border px-4 py-2.5 text-left font-semibold">{children}</th>,
    td: ({ children }: P) => <td className="border-b border-border px-4 py-2.5 align-top">{children}</td>,
    a: ({ href = "", children }: P & { href?: string }) =>
      href.startsWith("/") ? (
        <Link href={href} className="text-primary underline underline-offset-2">{children}</Link>
      ) : (
        <a href={href} target="_blank" rel="noopener" className="text-primary underline underline-offset-2">{children}</a>
      ),
    Figure,
    Callout,
    QuickFacts,
    Verdict,
    Offer: ({ id }: { id: string }) => <OfferCard id={id} sourceSlug={sourceSlug} />,
    OfferList: ({ ids }: { ids: string }) => <OfferList ids={ids} sourceSlug={sourceSlug} />,
    ComparisonTable: ({ ids }: { ids: string }) => <ComparisonTable ids={ids} sourceSlug={sourceSlug} />,
    BookingCTA: ({ id, heading }: { id: string; heading?: string }) => <BookingCTA id={id} heading={heading} sourceSlug={sourceSlug} />,
  };
  return (
    <div className="content-body">
      <MDXRemote source={source} components={components} options={{ mdxOptions: { remarkPlugins: [remarkGfm], rehypePlugins: [rehypeSlug] } }} />
    </div>
  );
}
```

- [ ] **Step 7: Article layout**

`src/components/content/ArticleLayout.tsx`:
```tsx
import type { Article, ContentIndex } from "@/lib/content/loader";
import { relatedArticles, nextStep } from "@/lib/content/links";
import { usesAffiliateComponents } from "@/lib/content/body";
import { articleSchema, breadcrumbSchema, faqSchema } from "@/lib/seo/schema";
import { getImage } from "@/lib/images/registry";
import { absoluteUrl } from "@/lib/site";
import { getCategory } from "@/data/taxonomy";
import Figure from "@/components/media/Figure";
import Disclosure from "@/components/affiliate/Disclosure";
import OfferList from "@/components/affiliate/OfferList";
import JsonLd from "./JsonLd";
import Breadcrumbs, { breadcrumbsFor } from "./Breadcrumbs";
import AnswerBox from "./AnswerBox";
import ArticleMeta from "./ArticleMeta";
import Mdx from "./Mdx";
import FAQ from "./FAQ";
import SourceList from "./SourceList";
import NextStep from "./NextStep";
import RelatedGuides from "./RelatedGuides";

export default function ArticleLayout({ article, idx }: { article: Article; idx: ContentIndex }) {
  const { fm } = article;
  const crumbs = breadcrumbsFor(article);
  const hasAffiliate = fm.offers.length > 0 || usesAffiliateComponents(article.body);
  const image = fm.featuredImage ? getImage(fm.featuredImage) : null;
  const schemas: object[] = [articleSchema(article, image ? absoluteUrl(image.src) : undefined), breadcrumbSchema(crumbs)];
  if (fm.faqs.length > 0) schemas.push(faqSchema(fm.faqs));
  const category = getCategory(article.city ? "city" : "country", fm.category)!;

  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <JsonLd data={schemas} />
      <Breadcrumbs items={crumbs} />
      <header className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">{category.label}</p>
        <h1 className="mt-2 font-heading text-3xl font-bold leading-tight md:text-4xl">{fm.title}</h1>
        <ArticleMeta updatedAt={fm.updatedAt} factCheckedAt={fm.factCheckedAt} author={fm.author} />
      </header>
      {hasAffiliate ? <Disclosure /> : null}
      <AnswerBox summary={fm.summary} />
      {image ? <Figure id={image.id} priority /> : null}
      <Mdx source={article.body} sourceSlug={fm.slug} />
      {fm.offers.length > 0 ? (
        <section className="mt-12">
          <h2 className="font-heading text-2xl font-bold">Booking options</h2>
          <OfferList ids={fm.offers.join(",")} sourceSlug={fm.slug} />
        </section>
      ) : null}
      <FAQ faqs={fm.faqs} />
      <SourceList sources={fm.sources} />
      <NextStep article={nextStep(article, idx)} />
      <RelatedGuides articles={relatedArticles(article, idx, 4)} />
    </article>
  );
}
```

- [ ] **Step 8: Hub and category layouts**

`src/components/content/HubLayout.tsx`:
```tsx
import Link from "next/link";
import type { ContentIndex, Hub } from "@/lib/content/loader";
import { breadcrumbSchema, destinationSchema, faqSchema } from "@/lib/seo/schema";
import { getImage } from "@/lib/images/registry";
import Figure from "@/components/media/Figure";
import JsonLd from "./JsonLd";
import Breadcrumbs, { breadcrumbsFor } from "./Breadcrumbs";
import AnswerBox from "./AnswerBox";
import ArticleMeta from "./ArticleMeta";
import Mdx from "./Mdx";
import FAQ from "./FAQ";
import SourceList from "./SourceList";
import ArticleCard from "./ArticleCard";

export default function HubLayout({ hub, idx }: { hub: Hub; idx: ContentIndex }) {
  const crumbs = breadcrumbsFor(hub);
  const schemas: object[] = [destinationSchema(hub), breadcrumbSchema(crumbs)];
  if (hub.fm.faqs.length > 0) schemas.push(faqSchema(hub.fm.faqs));
  const categories = idx.categories.filter((c) => c.country === hub.country && c.city === hub.city);
  const cityHubs = hub.city ? [] : idx.hubs.filter((h) => h.country === hub.country && h.city);
  const image = hub.fm.featuredImage ? getImage(hub.fm.featuredImage) : null;
  const slug = hub.city ?? hub.country;

  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <JsonLd data={schemas} />
      <Breadcrumbs items={crumbs} />
      <header className="mt-6">
        <h1 className="font-heading text-3xl font-bold md:text-4xl">{hub.fm.title}</h1>
        <ArticleMeta updatedAt={hub.fm.updatedAt} author={hub.fm.author} />
      </header>
      <AnswerBox summary={hub.fm.summary} />
      {image ? <Figure id={image.id} priority /> : null}
      {categories.length > 0 ? (
        <nav aria-label="Guide categories" className="my-6 flex flex-wrap gap-2">
          {categories.map((c) => (
            <Link key={c.path} href={c.path} className="rounded-full border border-border px-3 py-1 text-sm hover:border-primary">{c.fm.title}</Link>
          ))}
        </nav>
      ) : null}
      <Mdx source={hub.body} sourceSlug={`hub-${slug}`} />
      {cityHubs.length > 0 ? (
        <section className="mt-12">
          <h2 className="font-heading text-2xl font-bold">City guides</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {cityHubs.map((h) => (
              <Link key={h.path} href={h.path} className="block rounded-xl border border-border p-5 hover:border-primary">
                <p className="font-heading text-lg font-semibold">{h.fm.title}</p>
                <p className="mt-2 text-sm text-text-secondary">{h.fm.summary}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
      {categories.map((c) => (
        <section key={c.path} className="mt-12">
          <h2 className="font-heading text-2xl font-bold">{c.fm.title}</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {c.articles.map((a) => <ArticleCard key={a.path} article={a} />)}
          </div>
        </section>
      ))}
      <FAQ faqs={hub.fm.faqs} />
      <SourceList sources={hub.fm.sources} />
    </article>
  );
}
```

`src/components/content/CategoryLayout.tsx`:
```tsx
import type { CategoryPage } from "@/lib/content/loader";
import { breadcrumbSchema } from "@/lib/seo/schema";
import JsonLd from "./JsonLd";
import Breadcrumbs, { breadcrumbsFor } from "./Breadcrumbs";
import AnswerBox from "./AnswerBox";
import Mdx from "./Mdx";
import ArticleCard from "./ArticleCard";

export default function CategoryLayout({ page }: { page: CategoryPage }) {
  const crumbs = breadcrumbsFor(page);
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 font-heading text-3xl font-bold md:text-4xl">{page.fm.title}</h1>
      <AnswerBox summary={page.fm.summary} />
      <Mdx source={page.body} sourceSlug={`category-${page.category}`} />
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {page.articles.map((a) => <ArticleCard key={a.path} article={a} />)}
      </div>
    </div>
  );
}
```

- [ ] **Step 9: Typecheck and tests**

Run: `npx tsc --noEmit && npm test`
Expected: exit 0, PASS.

- [ ] **Step 10: Commit**

```bash
git add src/lib/content/body.ts src/components/content tests/body.test.ts
git commit -m "feat: add article, hub and category layouts with MDX renderer"
```

---

### Task 9: Routes and home page

**Files:**
- Create: `src/lib/content/route-data.ts`, `src/app/[country]/page.tsx`, `src/app/[country]/[segment]/page.tsx`, `src/app/[country]/[segment]/[slug]/page.tsx`
- Rewrite: `src/app/page.tsx`
- Test: `tests/route-data.test.ts`

**Interfaces:**
- Consumes: `loadContent`, `getContent`, `ContentIndex`, `ContentNode` (Task 2), layouts (Task 8), `buildMetadata` (Task 5), `getImage` (Task 3), `SITE`, `absoluteUrl` (Task 1).
- Produces:
  - `countryParams(idx): { country: string }[]`
  - `segmentParams(idx): { country: string; segment: string }[]` (city hubs, country categories, country articles)
  - `slugParams(idx): { country: string; segment: string; slug: string }[]` (city categories, city articles)
  - `metadataFor(node: ContentNode): Metadata` (noindex when the node or its article is `review`)

- [ ] **Step 1: Failing test**

`tests/route-data.test.ts`:
```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { loadContent } from "@/lib/content/loader";
import { countryParams, segmentParams, slugParams, metadataFor } from "@/lib/content/route-data";

const idx = loadContent({ root: path.join(process.cwd(), "tests/fixtures/content"), includeReview: false });

test("static params cover every node exactly once", () => {
  assert.deepEqual(countryParams(idx), [{ country: "korea" }]);
  assert.deepEqual(segmentParams(idx).map((p) => p.segment).sort(), ["how-to-pay-in-korea", "planning", "seoul"]);
  assert.deepEqual(slugParams(idx).map((p) => `${p.segment}/${p.slug}`).sort(), [
    "seoul/incheon-airport-to-seoul",
    "seoul/transportation",
  ]);
});

test("metadata uses seoTitle fallback and canonical path", () => {
  const node = idx.byPath.get("/korea/seoul/incheon-airport-to-seoul")!;
  const m = metadataFor(node);
  assert.equal(m.title, "Incheon Airport to Seoul: AREX vs Airport Bus vs Taxi");
  assert.equal((m.alternates as { canonical: string }).canonical, "https://asiapicks.com/korea/seoul/incheon-airport-to-seoul");
  assert.deepEqual(m.robots, { index: true, follow: true });
});
```

- [ ] **Step 2: Run to verify it fails** → `npm test` FAIL.

- [ ] **Step 3: Implement route data**

`src/lib/content/route-data.ts`:
```ts
import type { Metadata } from "next";
import type { ContentIndex, ContentNode } from "./loader";
import { buildMetadata } from "@/lib/seo/metadata";
import { getImage } from "@/lib/images/registry";
import { absoluteUrl } from "@/lib/site";

export const countryParams = (idx: ContentIndex) =>
  idx.hubs.filter((h) => !h.city).map((h) => ({ country: h.country }));

export const segmentParams = (idx: ContentIndex) => [
  ...idx.hubs.filter((h) => h.city).map((h) => ({ country: h.country, segment: h.city! })),
  ...idx.categories.filter((c) => !c.city).map((c) => ({ country: c.country, segment: c.category })),
  ...idx.articles.filter((a) => !a.city).map((a) => ({ country: a.country, segment: a.fm.slug })),
];

export const slugParams = (idx: ContentIndex) => [
  ...idx.categories.filter((c) => c.city).map((c) => ({ country: c.country, segment: c.city!, slug: c.category })),
  ...idx.articles.filter((a) => a.city).map((a) => ({ country: a.country, segment: a.city!, slug: a.fm.slug })),
];

export function metadataFor(node: ContentNode): Metadata {
  const title = node.fm.seoTitle ?? node.fm.title;
  const review = node.kind !== "category" && node.fm.status === "review";
  const noindex = review || (node.kind === "article" && node.fm.noindex);
  const imageId = node.kind === "category" ? undefined : node.fm.featuredImage;
  const imageUrl = imageId ? absoluteUrl(getImage(imageId).src) : undefined;
  return buildMetadata({
    title,
    description: node.fm.description,
    path: node.kind === "article" && node.fm.canonical ? new URL(node.fm.canonical).pathname : node.path,
    imageUrl,
    noindex,
    type: node.kind === "article" ? "article" : "website",
    publishedTime: node.kind === "article" ? node.fm.publishedAt : undefined,
    modifiedTime: node.kind === "article" ? node.fm.updatedAt : undefined,
  });
}
```

- [ ] **Step 4: Run tests** → `npm test` PASS.

- [ ] **Step 5: Country route**

`src/app/[country]/page.tsx`:
```tsx
import { notFound } from "next/navigation";
import { getContent } from "@/lib/content/loader";
import { countryParams, metadataFor } from "@/lib/content/route-data";
import HubLayout from "@/components/content/HubLayout";

export const dynamicParams = false;
export const generateStaticParams = () => countryParams(getContent());

type Props = { params: Promise<{ country: string }> };

export async function generateMetadata({ params }: Props) {
  const { country } = await params;
  const node = getContent().byPath.get(`/${country}`);
  return node ? metadataFor(node) : {};
}

export default async function CountryPage({ params }: Props) {
  const { country } = await params;
  const idx = getContent();
  const node = idx.byPath.get(`/${country}`);
  if (!node || node.kind !== "hub") notFound();
  return <HubLayout hub={node} idx={idx} />;
}
```

- [ ] **Step 6: Segment route**

`src/app/[country]/[segment]/page.tsx`:
```tsx
import { notFound } from "next/navigation";
import { getContent } from "@/lib/content/loader";
import { segmentParams, metadataFor } from "@/lib/content/route-data";
import HubLayout from "@/components/content/HubLayout";
import CategoryLayout from "@/components/content/CategoryLayout";
import ArticleLayout from "@/components/content/ArticleLayout";

export const dynamicParams = false;
export const generateStaticParams = () => segmentParams(getContent());

type Props = { params: Promise<{ country: string; segment: string }> };

export async function generateMetadata({ params }: Props) {
  const { country, segment } = await params;
  const node = getContent().byPath.get(`/${country}/${segment}`);
  return node ? metadataFor(node) : {};
}

export default async function SegmentPage({ params }: Props) {
  const { country, segment } = await params;
  const idx = getContent();
  const node = idx.byPath.get(`/${country}/${segment}`);
  if (!node) notFound();
  if (node.kind === "hub") return <HubLayout hub={node} idx={idx} />;
  if (node.kind === "category") return <CategoryLayout page={node} />;
  return <ArticleLayout article={node} idx={idx} />;
}
```

- [ ] **Step 7: Slug route**

`src/app/[country]/[segment]/[slug]/page.tsx`:
```tsx
import { notFound } from "next/navigation";
import { getContent } from "@/lib/content/loader";
import { slugParams, metadataFor } from "@/lib/content/route-data";
import CategoryLayout from "@/components/content/CategoryLayout";
import ArticleLayout from "@/components/content/ArticleLayout";

export const dynamicParams = false;
export const generateStaticParams = () => slugParams(getContent());

type Props = { params: Promise<{ country: string; segment: string; slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { country, segment, slug } = await params;
  const node = getContent().byPath.get(`/${country}/${segment}/${slug}`);
  return node ? metadataFor(node) : {};
}

export default async function SlugPage({ params }: Props) {
  const { country, segment, slug } = await params;
  const idx = getContent();
  const node = idx.byPath.get(`/${country}/${segment}/${slug}`);
  if (!node || node.kind === "hub") notFound();
  if (node.kind === "category") return <CategoryLayout page={node} />;
  return <ArticleLayout article={node} idx={idx} />;
}
```

- [ ] **Step 8: Home page**

`src/app/page.tsx`:
```tsx
import Link from "next/link";
import { getContent } from "@/lib/content/loader";
import { buildMetadata } from "@/lib/seo/metadata";
import { SITE } from "@/lib/site";
import ArticleCard from "@/components/content/ArticleCard";

export const metadata = buildMetadata({
  title: `${SITE.name}: Asia travel planning, starting with South Korea`,
  description: SITE.tagline,
  path: "/",
  absoluteTitle: true,
});

export default function HomePage() {
  const idx = getContent();
  const countryHub = idx.hubs.find((h) => h.country === "korea" && !h.city);
  const cityHubs = idx.hubs.filter((h) => h.country === "korea" && h.city);
  const beforeYouGo = idx.articles.filter((a) => a.country === "korea" && !a.city && a.fm.journeyStage === "planning").slice(0, 5);
  const recent = idx.articles.slice(0, 6);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <section className="max-w-3xl">
        <h1 className="font-heading text-4xl font-bold leading-tight md:text-5xl">
          {SITE.name}: plan your Asia trip, starting with South Korea
        </h1>
        <p className="mt-4 text-lg text-text-secondary">{SITE.tagline}</p>
        {countryHub ? (
          <Link href={countryHub.path} className="mt-6 inline-flex rounded-lg bg-primary px-5 py-3 font-medium text-white hover:bg-primary-dark">
            Start with the South Korea travel guide
          </Link>
        ) : null}
      </section>

      {cityHubs.length > 0 ? (
        <section className="mt-16">
          <h2 className="font-heading text-2xl font-bold">Where to go in South Korea</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cityHubs.map((h) => (
              <Link key={h.path} href={h.path} className="block rounded-xl border border-border p-5 hover:border-primary">
                <p className="font-heading text-lg font-semibold">{h.fm.title}</p>
                <p className="mt-2 text-sm text-text-secondary">{h.fm.summary}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {beforeYouGo.length > 0 ? (
        <section className="mt-16">
          <h2 className="font-heading text-2xl font-bold">Before you go to Korea</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {beforeYouGo.map((a) => <ArticleCard key={a.path} article={a} />)}
          </div>
        </section>
      ) : null}

      {recent.length > 0 ? (
        <section className="mt-16">
          <h2 className="font-heading text-2xl font-bold">Recently updated guides</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((a) => <ArticleCard key={a.path} article={a} />)}
          </div>
        </section>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 9: Typecheck and tests**

Run: `npx tsc --noEmit && npm test` → exit 0, PASS.

- [ ] **Step 10: Commit**

```bash
git add src/lib/content/route-data.ts src/app/page.tsx "src/app/[country]" tests/route-data.test.ts
git commit -m "feat: add country, city, category and article routes and home page"
```

---

### Task 10: Trust pages, 404, gone page

**Files:**
- Create: `src/lib/content/pages.ts`, `src/components/content/StaticPage.tsx`
- Create: `src/content/pages/{about,editorial-policy,how-we-choose,affiliate-disclosure,privacy,terms,contact}.mdx`
- Create: `src/app/{about,editorial-policy,how-we-choose,affiliate-disclosure,privacy,terms,contact}/page.tsx`
- Create: `src/app/not-found.tsx`
- Test: `tests/pages.test.ts`

**Interfaces:**
- Produces: `pageSchema`, `getStaticPage(slug: string): { fm: { title: string; description: string; updatedAt: string }; body: string }`, `STATIC_PAGES: readonly string[]`, `<StaticPage slug />`, `staticPageMetadata(slug): Metadata`.

- [ ] **Step 1: Failing test**

`tests/pages.test.ts`:
```ts
import { test } from "node:test";
import assert from "node:assert/strict";
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
```

- [ ] **Step 2: Run to verify it fails** → FAIL.

- [ ] **Step 3: Loader and component**

`src/lib/content/pages.ts`:
```ts
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";

export const STATIC_PAGES = ["about", "editorial-policy", "how-we-choose", "affiliate-disclosure", "privacy", "terms", "contact"] as const;

export const pageSchema = z.object({ title: z.string().min(1), description: z.string().min(50), updatedAt: z.iso.date() });

const DIR = path.join(process.cwd(), "src/content/pages");

export function getStaticPage(slug: string) {
  const file = path.join(DIR, `${slug}.mdx`);
  const { data, content } = matter(fs.readFileSync(file, "utf-8"));
  const fm = pageSchema.parse(data);
  return { fm, body: content };
}
```

`src/components/content/StaticPage.tsx`:
```tsx
import type { Metadata } from "next";
import { getStaticPage } from "@/lib/content/pages";
import { buildMetadata } from "@/lib/seo/metadata";
import { formatDate } from "@/lib/content/body";
import { SITE } from "@/lib/site";
import Mdx from "./Mdx";

export function staticPageMetadata(slug: string): Metadata {
  const { fm } = getStaticPage(slug);
  return buildMetadata({ title: fm.title, description: fm.description, path: `/${slug}` });
}

export default function StaticPage({ slug }: { slug: string }) {
  const { fm, body } = getStaticPage(slug);
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-heading text-3xl font-bold md:text-4xl">{fm.title}</h1>
      <p className="mt-2 text-sm text-text-secondary">Last updated {formatDate(fm.updatedAt)}</p>
      <Mdx source={body} sourceSlug={`page-${slug}`} />
      {slug === "contact" ? (
        SITE.contactEmail ? (
          <p className="mt-6 text-lg">Email: <a className="text-primary underline" href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a></p>
        ) : (
          <p className="mt-6 text-sm text-text-secondary">CONTACT_EMAIL is not configured in this environment.</p>
        )
      ) : null}
    </div>
  );
}
```
(Task 13 fails production builds when `CONTACT_EMAIL` is empty, so the fallback line never ships.)

- [ ] **Step 4: One route file per trust page**

Create each of the seven files with this exact content, substituting the slug (`about`, `editorial-policy`, `how-we-choose`, `affiliate-disclosure`, `privacy`, `terms`, `contact`). Example `src/app/about/page.tsx`:
```tsx
import StaticPage, { staticPageMetadata } from "@/components/content/StaticPage";

export const metadata = staticPageMetadata("about");

export default function Page() {
  return <StaticPage slug="about" />;
}
```

- [ ] **Step 5: Page copy**

`src/content/pages/about.mdx`:
```mdx
---
title: "About AsiaPicks"
description: "AsiaPicks is an Asia travel discovery and planning website. We start with South Korea and check every practical fact against official sources."
updatedAt: "2026-09-12"
---

AsiaPicks is an Asia travel discovery and planning website for international travelers. Our first area of expertise is South Korea: Seoul, Busan, Jeju, Gyeongju and the trips between them.

## What we publish

We publish planning guides that answer the questions first-time visitors ask: where to stay, how to get from the airport, which transport card to buy, which tours are worth booking and how many days each city needs.

## How our guides are made

Every guide is researched from official sources such as the Korea Tourism Organization, Korail, AREX and city governments. Prices, opening hours and rules are listed with the source and the date we checked them. We use AI tools to help research and draft, and a person reviews every page before it is published. Read our [editorial policy](/editorial-policy).

## How we make money

Some pages link to booking partners. If you book through those links, we may earn a commission at no extra cost to you. Read our [affiliate disclosure](/affiliate-disclosure) and [how we choose recommendations](/how-we-choose).
```

`src/content/pages/editorial-policy.mdx`:
```mdx
---
title: "Editorial Policy"
description: "How AsiaPicks researches, writes, fact-checks and updates its South Korea travel guides, and what we will never do."
updatedAt: "2026-09-12"
---

## Research-based guides

AsiaPicks guides are built from official and primary sources: tourism organizations, transport operators, attraction operators and government pages. We do not claim first-hand visits. When we describe an experience, we describe what the operator and official sources state.

## Facts, recommendations and affiliate options are kept apart

Facts carry a source and a "checked" date. Recommendations are labeled "Our pick". Booking options from partners are labeled as affiliate options.

## AI assistance and human review

We use AI tools to help gather sources and draft text. A person reviews every guide, checks every price and rule against the cited source, and approves the page before it is published.

## Updates and corrections

We re-check prices, opening hours and entry rules at least every 90 days and update the "Updated" date only when something on the page changes. If you find an error, tell us through the [contact page](/contact) and we will correct it.
```

`src/content/pages/how-we-choose.mdx`:
```mdx
---
title: "How We Choose Recommendations"
description: "The criteria AsiaPicks uses to pick tours, experiences, hotels and transport options, and how booking partners fit in."
updatedAt: "2026-09-12"
---

## Criteria

We recommend an option when it fits a clear traveler need and official information supports it: location, travel time, what is included, cancellation terms and price range.

## Partners

We work with Viator for guided tours and day trips, Creatrip for Korea-specific experiences and tickets, and Trip.com for hotels and trains. A partner never pays for placement, and an option does not need a partner to be recommended. When the best answer is a free option, such as a public bus or a free palace entry, we say so.

## One clear choice per need

Each guide shows the single booking option that best fits the page, after the planning information, instead of many competing links.
```

`src/content/pages/affiliate-disclosure.mdx`:
```mdx
---
title: "Affiliate Disclosure"
description: "AsiaPicks earns commissions from some booking links. Here is which partners we use and how it affects our guides."
updatedAt: "2026-09-12"
---

Some links on AsiaPicks are affiliate links. If you book through them, we may earn a commission at no extra cost to you. These are paid links.

Our partners are Viator (tours and day trips), Creatrip (Korea experiences, tickets and passes) and Trip.com (hotels and trains).

Commissions never change our facts. Pages that contain affiliate links say so near the top of the page, and affiliate links are marked with `rel="sponsored"` for search engines.
```

`src/content/pages/privacy.mdx`:
```mdx
---
title: "Privacy Policy"
description: "What AsiaPicks collects when you visit, how anonymous analytics work, and what happens when you click a booking partner link."
updatedAt: "2026-09-12"
---

## What we collect

AsiaPicks does not ask you to create an account and does not collect names, emails or payment details on this site.

## Analytics

We use Vercel Web Analytics to count page views. It does not use cookies and does not identify individual visitors.

## Booking partner links

When you click a link to Viator, Creatrip or Trip.com, you leave AsiaPicks. Those sites may set their own cookies to track bookings for commission purposes, under their own privacy policies.

## Contact

Questions about privacy can be sent through the [contact page](/contact).
```

`src/content/pages/terms.mdx`:
```mdx
---
title: "Terms of Use"
description: "Terms for using AsiaPicks travel guides, including how to treat prices, rules and third-party booking sites."
updatedAt: "2026-09-12"
---

AsiaPicks guides are general travel information. Prices, schedules and entry rules change; each fact shows the date we checked it. Confirm important details with the official source before you travel.

Bookings made through partner sites are contracts between you and that partner. AsiaPicks is not responsible for partner services, cancellations or refunds.

The text and original graphics on AsiaPicks belong to AsiaPicks. Photos credited to other sources are used under the license shown in each caption.
```

`src/content/pages/contact.mdx`:
```mdx
---
title: "Contact AsiaPicks"
description: "How to reach AsiaPicks to report an error in a guide, ask about a partnership or send privacy questions."
updatedAt: "2026-09-12"
---

Found a price, opening time or rule that has changed? Tell us which page and what you found, and we will check it against the official source.
```

- [ ] **Step 6: 404 page**

`src/app/not-found.tsx`:
```tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <h1 className="font-heading text-3xl font-bold">Page not found</h1>
      <p className="mt-4 text-text-secondary">This page does not exist. Start from one of our South Korea guides.</p>
      <p className="mt-6 flex flex-wrap justify-center gap-4">
        <Link href="/korea" className="text-primary underline">South Korea</Link>
        <Link href="/korea/seoul" className="text-primary underline">Seoul</Link>
        <Link href="/korea/busan" className="text-primary underline">Busan</Link>
        <Link href="/korea/jeju" className="text-primary underline">Jeju</Link>
      </p>
    </div>
  );
}
```

- [ ] **Step 7: Tests and typecheck** → `npx tsc --noEmit && npm test` PASS.

- [ ] **Step 8: Commit**

```bash
git add src/lib/content/pages.ts src/components/content/StaticPage.tsx src/content/pages src/app/about src/app/editorial-policy src/app/how-we-choose src/app/affiliate-disclosure src/app/privacy src/app/terms src/app/contact src/app/not-found.tsx tests/pages.test.ts
git commit -m "feat: add trust pages and 404"
```

---

### Task 11: Sitemap, robots, OG image, icon, RSS feed, IndexNow

**Files:**
- Create: `src/lib/seo/sitemap.ts`, `src/app/sitemap.ts`, `src/app/robots.ts`, `src/app/api/og/route.tsx`, `src/app/icon.tsx`, `src/app/feed.xml/route.ts`, `src/lib/indexnow.ts`, `scripts/indexnow.ts`
- Test: `tests/sitemap-indexnow.test.ts`

**Interfaces:**
- Consumes: `loadContent` (Task 2), `STATIC_PAGES`, `getStaticPage` (Task 10), `absoluteUrl`, `SITE` (Task 1).
- Produces:
  - `buildSitemapEntries(idx: ContentIndex): { url: string; lastModified: string }[]` in `src/lib/seo/sitemap.ts` (special route files export only what Next expects)
  - `indexNowPayload(urls: string[], key: string): { host: string; key: string; keyLocation: string; urlList: string[] }`
  - `findIndexNowKey(publicDir?: string, env?: NodeJS.ProcessEnv): string`

- [ ] **Step 1: Failing test**

`tests/sitemap-indexnow.test.ts`:
```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { loadContent } from "@/lib/content/loader";
import { buildSitemapEntries } from "@/lib/seo/sitemap";
import { indexNowPayload, findIndexNowKey } from "@/lib/indexnow";

const idx = loadContent({ root: path.join(process.cwd(), "tests/fixtures/content"), includeReview: false });

test("sitemap lists hubs, categories and articles with content dates", () => {
  const entries = buildSitemapEntries(idx);
  const byUrl = new Map(entries.map((e) => [e.url, e.lastModified]));
  assert.equal(byUrl.get("https://asiapicks.com/korea/seoul/incheon-airport-to-seoul"), "2026-09-12");
  assert.ok(byUrl.has("https://asiapicks.com/korea/seoul/transportation"));
  assert.ok(byUrl.has("https://asiapicks.com/about"));
  assert.equal([...byUrl.keys()].some((u) => u.includes("draft-post")), false);
});

test("indexnow payload targets the canonical host", () => {
  const p = indexNowPayload(["https://asiapicks.com/korea"], "abc");
  assert.equal(p.host, "asiapicks.com");
  assert.equal(p.keyLocation, "https://asiapicks.com/abc.txt");
});

test("indexnow key is found from env first, then public/", () => {
  assert.equal(findIndexNowKey(path.join(process.cwd(), "public"), { INDEXNOW_KEY: "fromenv" } as unknown as NodeJS.ProcessEnv), "fromenv");
  assert.equal(findIndexNowKey(path.join(process.cwd(), "public"), {} as NodeJS.ProcessEnv), "a3f2e7c8b1d49f6e2c8a4b7d1f3e9c2a");
});
```

- [ ] **Step 2: Run to verify it fails** → FAIL.

- [ ] **Step 3: Sitemap**

`src/lib/seo/sitemap.ts`:
```ts
import type { ContentIndex } from "@/lib/content/loader";
import { STATIC_PAGES, getStaticPage } from "@/lib/content/pages";
import { absoluteUrl } from "@/lib/site";

export function buildSitemapEntries(idx: ContentIndex): { url: string; lastModified: string }[] {
  const latest = (dates: string[]) => dates.sort().at(-1) ?? "2026-09-12";
  const entries = [
    { url: absoluteUrl("/"), lastModified: latest(idx.articles.map((a) => a.fm.updatedAt).concat(idx.hubs.map((h) => h.fm.updatedAt))) },
    ...idx.hubs.map((h) => ({ url: absoluteUrl(h.path), lastModified: h.fm.updatedAt })),
    ...idx.categories.map((c) => ({ url: absoluteUrl(c.path), lastModified: latest(c.articles.map((a) => a.fm.updatedAt)) })),
    ...idx.articles.filter((a) => !a.fm.noindex && !a.fm.canonical).map((a) => ({ url: absoluteUrl(a.path), lastModified: a.fm.updatedAt })),
    ...STATIC_PAGES.map((slug) => ({ url: absoluteUrl(`/${slug}`), lastModified: getStaticPage(slug).fm.updatedAt })),
  ];
  return entries;
}
```

`src/app/sitemap.ts`:
```ts
import type { MetadataRoute } from "next";
import { loadContent } from "@/lib/content/loader";
import { buildSitemapEntries } from "@/lib/seo/sitemap";

export default function sitemap(): MetadataRoute.Sitemap {
  return buildSitemapEntries(loadContent({ includeReview: false }));
}
```
(The sitemap never lists `review` content, even on preview.)

- [ ] **Step 4: Robots**

`src/app/robots.ts`:
```ts
import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  if (process.env.VERCEL_ENV === "preview") {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/"] }],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
```
(`User-agent: *` allows Googlebot, Bingbot, OAI-SearchBot, ChatGPT-User, PerplexityBot, Claude-SearchBot, Claude-User and the training crawlers, as spec §9 decides. `/api/og` stays reachable for crawlers fetching OG images because images are requested by social platforms, not indexed; if Search Console flags it, add `allow: ["/", "/api/og"]`.)

- [ ] **Step 5: OG image**

`src/app/api/og/route.tsx`:
```tsx
import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = (searchParams.get("title") ?? "AsiaPicks").slice(0, 110);
  const eyebrow = (searchParams.get("eyebrow") ?? "South Korea travel").slice(0, 40);
  return new ImageResponse(
    (
      <div style={{ width: "1200px", height: "630px", display: "flex", flexDirection: "column", justifyContent: "space-between",
        padding: "72px", background: "linear-gradient(135deg, #0F766E 0%, #0D9488 55%, #14B8A6 100%)", color: "white" }}>
        <div style={{ fontSize: 30, letterSpacing: 2, textTransform: "uppercase", opacity: 0.85 }}>{eyebrow}</div>
        <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.15 }}>{title}</div>
        <div style={{ fontSize: 32, fontWeight: 700 }}>AsiaPicks</div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
```

- [ ] **Step 6: Icon**

`src/app/icon.tsx`:
```tsx
import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center",
        background: "#0D9488", color: "white", fontSize: 220, fontWeight: 700, borderRadius: 96 }}>
        AP
      </div>
    ),
    size,
  );
}
```

- [ ] **Step 7: RSS feed**

`src/app/feed.xml/route.ts`:
```ts
import { loadContent } from "@/lib/content/loader";
import { SITE, absoluteUrl } from "@/lib/site";

export const dynamic = "force-static";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function GET() {
  const items = loadContent({ includeReview: false }).articles.slice(0, 30).map((a) => `
    <item>
      <title>${esc(a.fm.title)}</title>
      <link>${absoluteUrl(a.path)}</link>
      <guid>${absoluteUrl(a.path)}</guid>
      <description>${esc(a.fm.description)}</description>
      <pubDate>${new Date(`${a.fm.publishedAt}T00:00:00Z`).toUTCString()}</pubDate>
    </item>`).join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
  <title>${SITE.name}</title>
  <link>${SITE.baseUrl}</link>
  <description>${esc(SITE.description)}</description>
  <language>en</language>${items}
</channel></rss>`;
  return new Response(xml, { headers: { "content-type": "application/rss+xml; charset=utf-8" } });
}
```

- [ ] **Step 8: IndexNow**

`src/lib/indexnow.ts`:
```ts
import fs from "node:fs";
import path from "node:path";
import { SITE } from "@/lib/site";

export function indexNowPayload(urls: string[], key: string) {
  const host = new URL(SITE.baseUrl).host;
  return { host, key, keyLocation: `${SITE.baseUrl}/${key}.txt`, urlList: urls };
}

export function findIndexNowKey(publicDir = path.join(process.cwd(), "public"), env: NodeJS.ProcessEnv = process.env): string {
  if (env.INDEXNOW_KEY?.trim()) return env.INDEXNOW_KEY.trim();
  const file = fs.readdirSync(publicDir).find((f) => /^[a-f0-9]{32}\.txt$/.test(f));
  if (!file) throw new Error("No IndexNow key: set INDEXNOW_KEY or add public/<key>.txt");
  return file.replace(/\.txt$/, "");
}
```

`scripts/indexnow.ts`:
```ts
import { indexNowPayload, findIndexNowKey } from "@/lib/indexnow";

const urls = process.argv.slice(2).filter((u) => u.startsWith("https://asiapicks.com"));
if (urls.length === 0) {
  console.error("Usage: npx tsx scripts/indexnow.ts https://asiapicks.com/korea/... [more urls]");
  process.exit(1);
}
async function main() {
  const res = await fetch("https://api.indexnow.org/IndexNow", {
    method: "POST",
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify(indexNowPayload(urls, findIndexNowKey())),
  });
  console.log(`IndexNow ${res.status} for ${urls.length} URL(s)`);
  process.exit(res.ok ? 0 : 1);
}

main();
```
(Run only after a production deploy, and only when the owner asks. Never in CI.)

- [ ] **Step 9: Tests and typecheck** → `npx tsc --noEmit && npm test` PASS.

- [ ] **Step 10: Commit**

```bash
git add src/lib/seo/sitemap.ts src/app/sitemap.ts src/app/robots.ts src/app/api/og src/app/icon.tsx src/app/feed.xml src/lib/indexnow.ts scripts/indexnow.ts tests/sitemap-indexnow.test.ts
git commit -m "feat: add sitemap, robots, OG image, icon, feed and IndexNow"
```

---

### Task 12: Legacy URLs (inventory, 301 map, 410, www)

**Files:**
- Create: `src/data/legacy-urls.json`, `src/lib/legacy/legacy.ts`, `src/proxy.ts`, `scripts/legacy/build-inventory.ts`, `src/data/legacy-inventory.json` (generated)
- Modify: `next.config.ts`
- Test: `tests/legacy.test.ts`

**Interfaces:**
- Produces:
  - `LEGACY: { redirects: { from: string; to: string }[]; gonePrefixes: string[] }`
  - `isGone(pathname: string, prefixes?: string[]): boolean` (segment-boundary prefix match)
  - `classifyLegacy(path: string, livePaths: Set<string>): "redirect" | "gone" | "live" | "unhandled"`
  - `GONE_HTML: string`
  - `proxy(req)` in `src/proxy.ts`

- [ ] **Step 1: Legacy map**

`src/data/legacy-urls.json`:
```json
{
  "redirects": [
    { "from": "/blog", "to": "/korea" },
    { "from": "/destinations", "to": "/" },
    { "from": "/destinations/korea", "to": "/korea" },
    { "from": "/destinations/korea/seoul", "to": "/korea/seoul" },
    { "from": "/destinations/korea/busan", "to": "/korea/busan" },
    { "from": "/destinations/korea/jeju", "to": "/korea/jeju" },
    { "from": "/blog/best-hotels-seoul-by-area", "to": "/korea/seoul/where-to-stay-in-seoul" },
    { "from": "/blog/where-to-stay-busan", "to": "/korea/busan/where-to-stay-in-busan" },
    { "from": "/blog/seoul-dmz-tour-guide", "to": "/korea/seoul/dmz-tours" },
    { "from": "/blog/jeju-itinerary-3-days", "to": "/korea/jeju/jeju-without-a-car" },
    { "from": "/blog/3-days-in-seoul", "to": "/korea/seoul" },
    { "from": "/blog/seoul-on-a-budget", "to": "/korea/seoul" },
    { "from": "/blog/seoul-palace-tour", "to": "/korea/seoul" },
    { "from": "/blog/seoul-subway-guide", "to": "/korea/seoul/transportation" },
    { "from": "/blog/busan-weekend-trip", "to": "/korea/busan" },
    { "from": "/blog/busan-day-trip-from-seoul", "to": "/korea/busan" },
    { "from": "/blog/best-hotels-jeju-island-by-area", "to": "/korea/jeju" }
  ],
  "gonePrefixes": ["/blog", "/destinations", "/saju-travel", "/deals", "/search", "/admin", "/api/admin", "/ads.txt"]
}
```
(Matches spec §10. `next.config` redirects run before the proxy, so redirected paths never reach the 410 rule.)

- [ ] **Step 2: Failing test**

`tests/legacy.test.ts`:
```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { isGone, classifyLegacy, LEGACY } from "@/lib/legacy/legacy";

test("gone prefixes match on segment boundaries", () => {
  assert.equal(isGone("/blog/3-days-in-kyoto"), true);
  assert.equal(isGone("/blog/category/saju-travel"), true);
  assert.equal(isGone("/destinations/japan/tokyo"), true);
  assert.equal(isGone("/saju-travel"), true);
  assert.equal(isGone("/blogger"), false);
  assert.equal(isGone("/korea/seoul"), false);
});

test("classification order: redirect, live, gone", () => {
  const live = new Set(["/", "/about"]);
  assert.equal(classifyLegacy("/blog/where-to-stay-busan", live), "redirect");
  assert.equal(classifyLegacy("/about", live), "live");
  assert.equal(classifyLegacy("/blog/best-ryokan-kyoto", live), "gone");
  assert.equal(classifyLegacy("/old-unknown-page", live), "unhandled");
});

test("redirect sources are unique and targets are new-site paths", () => {
  const froms = LEGACY.redirects.map((r) => r.from);
  assert.equal(new Set(froms).size, froms.length);
  for (const r of LEGACY.redirects) assert.ok(r.to === "/" || r.to.startsWith("/korea"), r.to);
});
```

- [ ] **Step 3: Run to verify it fails** → FAIL.

- [ ] **Step 4: Implement legacy helpers**

`src/lib/legacy/legacy.ts`:
```ts
import data from "@/data/legacy-urls.json";

export const LEGACY: { redirects: { from: string; to: string }[]; gonePrefixes: string[] } = data;

const redirectFroms = new Set(LEGACY.redirects.map((r) => r.from));

export function isGone(pathname: string, prefixes: string[] = LEGACY.gonePrefixes): boolean {
  const p = pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
  return prefixes.some((prefix) => p === prefix || p.startsWith(`${prefix}/`));
}

export function classifyLegacy(path: string, livePaths: Set<string>): "redirect" | "gone" | "live" | "unhandled" {
  if (redirectFroms.has(path)) return "redirect";
  if (livePaths.has(path)) return "live";
  if (isGone(path)) return "gone";
  return "unhandled";
}

export const GONE_HTML = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Page removed | AsiaPicks</title>
<meta name="robots" content="noindex"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:system-ui,sans-serif;max-width:40rem;margin:4rem auto;padding:0 1rem;color:#1E293B">
<h1>This page has been removed</h1>
<p>AsiaPicks now focuses on South Korea travel. Start here:</p>
<ul><li><a href="/korea">South Korea travel guide</a></li><li><a href="/korea/seoul">Seoul</a></li>
<li><a href="/korea/busan">Busan</a></li><li><a href="/korea/jeju">Jeju</a></li></ul></body></html>`;
```

- [ ] **Step 5: Run tests** → PASS.

- [ ] **Step 6: Wire redirects**

`next.config.ts`:
```ts
import type { NextConfig } from "next";
import legacy from "./src/data/legacy-urls.json";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    return legacy.redirects.map((r) => ({ source: r.from, destination: r.to, permanent: true }));
  },
};

export default nextConfig;
```

- [ ] **Step 7: Proxy (410 + www)**

`src/proxy.ts`:
```ts
import { NextResponse, type NextRequest } from "next/server";
import { GONE_HTML, isGone } from "@/lib/legacy/legacy";

export function proxy(req: NextRequest) {
  const host = req.headers.get("host") ?? "";
  if (host.startsWith("www.")) {
    return NextResponse.redirect(`https://${host.slice(4)}${req.nextUrl.pathname}${req.nextUrl.search}`, 308);
  }
  if (isGone(req.nextUrl.pathname)) {
    return new NextResponse(GONE_HTML, {
      status: 410,
      headers: { "content-type": "text/html; charset=utf-8", "x-robots-tag": "noindex" },
    });
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/|api/og|icon|favicon.ico|images/|sitemap.xml|robots.txt|feed.xml).*)"],
};
```

- [ ] **Step 8: Inventory script**

`scripts/legacy/build-inventory.ts`:
```ts
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const REF = process.env.LEGACY_REF ?? "main";
const git = (cmd: string) => execSync(`git ${cmd}`, { encoding: "utf-8" }).split("\n").map((s) => s.trim()).filter(Boolean);

const paths = new Set<string>([
  "/", "/destinations", "/blog", "/deals", "/saju-travel", "/search", "/about", "/privacy", "/terms",
  "/affiliate-disclosure", "/feed.xml",
  ...["travel-guides", "hotels-stays", "activities-tours", "travel-tips", "saju-travel"].map((c) => `/blog/category/${c}`),
]);

for (const f of git(`ls-tree --name-only ${REF} src/content/blog/`)) {
  if (f.endsWith(".mdx")) paths.add(`/blog/${path.basename(f, ".mdx")}`);
}
for (const f of git(`ls-tree -r --name-only ${REF} src/data/destinations`)) {
  const m = f.match(/src\/data\/destinations\/([^/]+)\/([^/]+)\.json$/);
  if (m) { paths.add(`/destinations/${m[1]}`); paths.add(`/destinations/${m[1]}/${m[2]}`); }
}

const extra = path.join("scripts", "legacy", "gsc-pages.txt");
if (fs.existsSync(extra)) {
  for (const line of fs.readFileSync(extra, "utf-8").split("\n")) {
    const t = line.trim();
    if (!t) continue;
    const p = new URL(t, "https://asiapicks.com").pathname.replace(/\/$/, "") || "/";
    paths.add(p);
  }
}

const out = [...paths].sort();
fs.writeFileSync(path.join("src", "data", "legacy-inventory.json"), `${JSON.stringify(out, null, 2)}\n`);
console.log(`legacy inventory: ${out.length} paths from ${REF}${fs.existsSync(extra) ? " + gsc-pages.txt" : ""}`);
```

Run: `npx tsx scripts/legacy/build-inventory.ts`
Expected: `legacy inventory: N paths from main` with N ≥ 170 (155 posts + destinations + static routes). Commit the generated file. (Plan 4 re-runs it with a Search Console export in `scripts/legacy/gsc-pages.txt` to catch URLs that never existed in git, such as old DB posts.)

- [ ] **Step 9: Tests and typecheck** → `npx tsc --noEmit && npm test` PASS.

- [ ] **Step 10: Commit**

```bash
git add src/data/legacy-urls.json src/data/legacy-inventory.json src/lib/legacy src/proxy.ts scripts/legacy next.config.ts tests/legacy.test.ts
git commit -m "feat: add legacy URL redirects, 410 proxy and inventory"
```

---

### Task 13: Build gates (`npm run check`)

**Files:**
- Create: `src/lib/checks/types.ts`, `src/lib/checks/content.ts`, `src/lib/checks/links.ts`, `src/lib/checks/images.ts`, `src/lib/checks/seo.ts`, `src/lib/checks/redirects.ts`, `src/lib/checks/release.ts`, `src/lib/checks/facts.ts`, `scripts/check.ts`
- Test: `tests/checks.test.ts`

**Interfaces:**
- Consumes: everything from Tasks 1–12.
- Produces:
  - `type CheckResult = { name: string; errors: string[]; warnings: string[] }`
  - `contentCheck(idx, images: Map<string, ImageEntry>, offers: Map<string, Offer>): CheckResult`
  - `linksCheck(idx, extraLivePaths: Set<string>): CheckResult`
  - `imagesCheck(images, publicDir: string): CheckResult`
  - `seoCheck(idx): CheckResult`
  - `redirectsCheck(idx, inventory: string[], extraLivePaths: Set<string>, production: boolean): CheckResult`
  - `releaseCheck(idx, offers, env: NodeJS.ProcessEnv, production: boolean): CheckResult`
  - `factsCheck(idx, offers, today: string): CheckResult`
  - `staticLivePaths(): Set<string>` (home, trust pages, feed) from `src/lib/checks/types.ts`
- Severity rules:
  - Errors: schema (thrown by loaders), missing hub for content, missing category intro, reserved-slug collision, unknown image/offer id, published seed content, >1 BookingCTA, H1 in body, broken internal link, orphan article, spoke without hub link, missing image file, unhandled legacy URL, redirect `from` that is now a live path, redirect target missing (production only), empty `CONTACT_EMAIL` (production only).
  - Warnings: title/description length, redirect target missing (non-production), provider IDs missing while offers are used (production), sources or prices checked more than 90 days ago.
  - `production` = `VERCEL_ENV === "production"` or `CHECK_PRODUCTION === "1"`.

- [ ] **Step 1: Failing test**

`tests/checks.test.ts`:
```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { loadContent, type ContentIndex, type Article } from "@/lib/content/loader";
import { contentCheck } from "@/lib/checks/content";
import { linksCheck } from "@/lib/checks/links";
import { redirectsCheck } from "@/lib/checks/redirects";
import { releaseCheck } from "@/lib/checks/release";
import { factsCheck } from "@/lib/checks/facts";
import { staticLivePaths } from "@/lib/checks/types";

const idx = loadContent({ root: path.join(process.cwd(), "tests/fixtures/content"), includeReview: false });
const live = staticLivePaths();

function withArticle(base: ContentIndex, patch: (a: Article) => Article): ContentIndex {
  const src = base.articles.find((a) => a.fm.slug === "how-to-pay-in-korea")!;
  const changed = patch({ ...src, fm: { ...src.fm } });
  const articles = base.articles.map((a) => (a === src ? changed : a));
  const byPath = new Map(base.byPath);
  byPath.set(changed.path, changed);
  return { ...base, articles, byPath };
}

test("fixture content passes content and link checks", () => {
  assert.deepEqual(contentCheck(idx, new Map(), new Map()).errors, []);
  assert.deepEqual(linksCheck(idx, live).errors, []);
});

test("broken internal link is an error", () => {
  const bad = withArticle(idx, (a) => ({ ...a, body: `${a.body}\n[x](/korea/nowhere)` }));
  assert.match(linksCheck(bad, live).errors.join("\n"), /\/korea\/nowhere/);
});

test("H1 in body, two booking CTAs, unknown offer are errors", () => {
  const bad = withArticle(idx, (a) => ({
    ...a,
    body: `# Title\n<BookingCTA id="x" />\n<BookingCTA id="y" />`,
  }));
  const errors = contentCheck(bad, new Map(), new Map()).errors.join("\n");
  assert.match(errors, /H1/);
  assert.match(errors, /BookingCTA/);
  assert.match(errors, /unknown offer "x"/);
});

test("published seed content is an error", () => {
  const bad = withArticle(idx, (a) => ({ ...a, body: `${a.body}\nSEED CONTENT` }));
  assert.match(contentCheck(bad, new Map(), new Map()).errors.join("\n"), /seed/i);
});

test("legacy inventory must be fully handled; missing targets only fail production", () => {
  const inventory = ["/blog/where-to-stay-busan", "/blog/best-ryokan-kyoto", "/about", "/mystery"];
  const dev = redirectsCheck(idx, inventory, live, false);
  assert.match(dev.errors.join("\n"), /\/mystery/);
  assert.equal(dev.errors.some((e) => e.includes("where-to-stay-in-busan")), false);
  assert.ok(dev.warnings.some((w) => w.includes("where-to-stay-in-busan")));
  const prod = redirectsCheck(idx, [], live, true);
  assert.ok(prod.errors.some((e) => e.includes("where-to-stay-in-busan")));
});

test("production requires CONTACT_EMAIL", () => {
  const r = releaseCheck(idx, new Map(), {} as NodeJS.ProcessEnv, true);
  assert.match(r.errors.join("\n"), /CONTACT_EMAIL/);
  assert.deepEqual(releaseCheck(idx, new Map(), {} as NodeJS.ProcessEnv, false).errors, []);
});

test("stale sources are warnings", () => {
  const r = factsCheck(idx, new Map(), "2027-01-15");
  assert.ok(r.warnings.length > 0);
  assert.deepEqual(r.errors, []);
});
```

- [ ] **Step 2: Run to verify it fails** → FAIL.

- [ ] **Step 3: Shared types**

`src/lib/checks/types.ts`:
```ts
import { STATIC_PAGES } from "@/lib/content/pages";

export type CheckResult = { name: string; errors: string[]; warnings: string[] };

export const result = (name: string): CheckResult => ({ name, errors: [], warnings: [] });

export const staticLivePaths = () => new Set<string>(["/", "/feed.xml", ...STATIC_PAGES.map((s) => `/${s}`)]);

export const rel = (file: string) => file.replace(process.cwd(), "").replace(/\\/g, "/").replace(/^\//, "");
```

- [ ] **Step 4: Content check**

`src/lib/checks/content.ts`:
```ts
import type { ContentIndex } from "@/lib/content/loader";
import type { ImageEntry } from "@/lib/images/registry";
import type { Offer } from "@/lib/affiliates/offers";
import { parseIdList } from "@/lib/affiliates/offers";
import { bookingCtaCount, hasMdxH1 } from "@/lib/content/body";
import { CITY_CATEGORIES, isReservedSegment } from "@/data/taxonomy";
import { hubPath } from "@/lib/content/paths";
import { result, rel } from "./types";

const ATTR = (name: string, attr: string) => new RegExp(`<${name}\\b[^>]*\\b${attr}="([^"]*)"`, "g");

export function contentCheck(idx: ContentIndex, images: Map<string, ImageEntry>, offers: Map<string, Offer>) {
  const r = result("content");
  const hubPaths = new Set(idx.hubs.map((h) => h.path));
  const catPaths = new Set(idx.categories.map((c) => c.path));

  for (const a of idx.articles) {
    const where = rel(a.file);
    if (!hubPaths.has(hubPath(a.country))) r.errors.push(`${where}: country hub ${hubPath(a.country)} is missing or not visible`);
    if (a.city && !hubPaths.has(hubPath(a.country, a.city))) r.errors.push(`${where}: city hub ${hubPath(a.country, a.city)} is missing or not visible`);
    const catPath = a.city ? `/${a.country}/${a.city}/${a.fm.category}` : `/${a.country}/${a.fm.category}`;
    if (!catPaths.has(catPath)) r.errors.push(`${where}: missing category intro _categories/${a.fm.category}.mdx for ${catPath}`);
    if (!a.city && isReservedSegment(a.country, a.fm.slug)) r.errors.push(`${where}: slug "${a.fm.slug}" collides with a city or country category`);
    if (a.city && CITY_CATEGORIES.some((c) => c.slug === a.fm.slug)) r.errors.push(`${where}: slug "${a.fm.slug}" collides with a city category`);
    if (a.fm.status === "published" && /SEED CONTENT/.test(a.body)) r.errors.push(`${where}: seed content cannot be published`);
    if (hasMdxH1(a.body)) r.errors.push(`${where}: H1 in MDX body (the page renders the H1 from title)`);
    if (bookingCtaCount(a.body) > 1) r.errors.push(`${where}: more than one BookingCTA`);

    const imageIds = [a.fm.featuredImage, ...a.fm.gallery, ...[...a.body.matchAll(ATTR("Figure", "id"))].map((m) => m[1])].filter(Boolean) as string[];
    for (const id of imageIds) if (!images.has(id)) r.errors.push(`${where}: unknown image "${id}"`);

    const offerIds = [
      ...a.fm.offers,
      ...[...a.body.matchAll(ATTR("Offer", "id"))].map((m) => m[1]),
      ...[...a.body.matchAll(ATTR("BookingCTA", "id"))].map((m) => m[1]),
      ...[...a.body.matchAll(ATTR("OfferList", "ids"))].flatMap((m) => parseIdList(m[1])),
      ...[...a.body.matchAll(ATTR("ComparisonTable", "ids"))].flatMap((m) => parseIdList(m[1])),
    ];
    for (const id of offerIds) if (!offers.has(id)) r.errors.push(`${where}: unknown offer "${id}"`);
  }

  for (const h of idx.hubs) {
    if (h.fm.featuredImage && !images.has(h.fm.featuredImage)) r.errors.push(`${rel(h.file)}: unknown image "${h.fm.featuredImage}"`);
    if (hasMdxH1(h.body)) r.errors.push(`${rel(h.file)}: H1 in MDX body`);
    if (h.fm.status === "published" && /SEED CONTENT/.test(h.body)) r.errors.push(`${rel(h.file)}: seed content cannot be published`);
  }
  return r;
}
```

- [ ] **Step 5: Links check**

`src/lib/checks/links.ts`:
```ts
import type { ContentIndex } from "@/lib/content/loader";
import { buildLinkGraph } from "@/lib/content/links";
import { hubPath } from "@/lib/content/paths";
import { result, rel } from "./types";

export function linksCheck(idx: ContentIndex, extraLivePaths: Set<string>) {
  const r = result("links");
  const graph = buildLinkGraph(idx);
  const nodes = [...idx.hubs, ...idx.categories, ...idx.articles];
  for (const n of nodes) {
    for (const target of graph.get(n.path)!.out) {
      if (!idx.byPath.has(target) && !extraLivePaths.has(target)) r.errors.push(`${rel(n.file)}: broken internal link ${target}`);
    }
  }
  for (const a of idx.articles) {
    const { in: inbound, out } = graph.get(a.path)!;
    if (inbound.length === 0) r.errors.push(`${rel(a.file)}: orphan article (no contextual link from any hub, category or article)`);
    const hub = hubPath(a.country, a.city);
    if (!out.includes(hub)) r.errors.push(`${rel(a.file)}: does not link to its hub ${hub}`);
  }
  return r;
}
```

- [ ] **Step 6: Images, SEO, redirects, release, facts checks**

`src/lib/checks/images.ts`:
```ts
import fs from "node:fs";
import path from "node:path";
import type { ImageEntry } from "@/lib/images/registry";
import { result } from "./types";

export function imagesCheck(images: Map<string, ImageEntry>, publicDir: string) {
  const r = result("images");
  for (const img of images.values()) {
    if (!fs.existsSync(path.join(publicDir, img.src))) r.errors.push(`image "${img.id}": file ${img.src} not found in public/`);
    if (img.aiGenerated && /photo/i.test(img.caption ?? "")) r.errors.push(`image "${img.id}": AI image caption must not call it a photo`);
  }
  return r;
}
```

`src/lib/checks/seo.ts`:
```ts
import type { ContentIndex } from "@/lib/content/loader";
import { result, rel } from "./types";

const SUFFIX = " | AsiaPicks".length;

export function seoCheck(idx: ContentIndex) {
  const r = result("seo");
  for (const n of [...idx.hubs, ...idx.categories, ...idx.articles]) {
    const title = n.fm.seoTitle ?? n.fm.title;
    const len = title.length + SUFFIX;
    if (len > 65 || len < 30) r.warnings.push(`${rel(n.file)}: title tag is ${len} chars (aim for 50-60): "${title}"`);
    const d = n.fm.description.length;
    if (d < 120 || d > 160) r.warnings.push(`${rel(n.file)}: meta description is ${d} chars (aim for 150-160)`);
  }
  return r;
}
```

`src/lib/checks/redirects.ts`:
```ts
import type { ContentIndex } from "@/lib/content/loader";
import { LEGACY, classifyLegacy } from "@/lib/legacy/legacy";
import { result } from "./types";

export function redirectsCheck(idx: ContentIndex, inventory: string[], extraLivePaths: Set<string>, production: boolean) {
  const r = result("redirects");
  const live = new Set<string>([...idx.byPath.keys(), ...extraLivePaths]);
  for (const red of LEGACY.redirects) {
    if (live.has(red.from)) r.errors.push(`redirect source ${red.from} is a live page on the new site`);
    if (!live.has(red.to)) {
      const msg = `redirect ${red.from} -> ${red.to}: target is not published yet`;
      (production ? r.errors : r.warnings).push(msg);
    }
  }
  for (const p of inventory) {
    if (classifyLegacy(p, live) === "unhandled") r.errors.push(`legacy URL ${p} has no redirect, 410 rule or live page`);
  }
  return r;
}
```

`src/lib/checks/release.ts`:
```ts
import type { ContentIndex } from "@/lib/content/loader";
import type { Offer } from "@/lib/affiliates/offers";
import { isProviderConfigured, PROVIDER_LABELS, type ProviderId } from "@/lib/affiliates/providers";
import { result } from "./types";

export function releaseCheck(idx: ContentIndex, offers: Map<string, Offer>, env: NodeJS.ProcessEnv, production: boolean) {
  const r = result("release");
  if (!production) return r;
  if (!env.CONTACT_EMAIL?.trim()) r.errors.push("CONTACT_EMAIL is empty; the contact page needs an address in production");
  const used = new Set<ProviderId>();
  for (const a of idx.articles) for (const id of a.fm.offers) { const o = offers.get(id); if (o) used.add(o.provider); }
  for (const o of offers.values()) used.add(o.provider);
  for (const p of used) if (!isProviderConfigured(p, env)) r.warnings.push(`${PROVIDER_LABELS[p]} IDs are missing; its links will not earn commission`);
  return r;
}
```

`src/lib/checks/facts.ts`:
```ts
import type { ContentIndex } from "@/lib/content/loader";
import type { Offer } from "@/lib/affiliates/offers";
import { result, rel } from "./types";

const DAY = 86_400_000;
const age = (today: string, iso: string) => (Date.parse(`${today}T00:00:00Z`) - Date.parse(`${iso}T00:00:00Z`)) / DAY;

export function factsCheck(idx: ContentIndex, offers: Map<string, Offer>, today: string) {
  const r = result("facts");
  for (const n of [...idx.hubs, ...idx.articles]) {
    for (const s of n.fm.sources) if (age(today, s.checkedAt) > 90) r.warnings.push(`${rel(n.file)}: source "${s.title}" checked ${s.checkedAt} (over 90 days)`);
  }
  for (const o of offers.values()) {
    if (o.priceCheckedAt && age(today, o.priceCheckedAt) > 90) r.warnings.push(`offer "${o.id}": price checked ${o.priceCheckedAt} (over 90 days)`);
  }
  return r;
}
```

- [ ] **Step 7: Runner**

`scripts/check.ts`:
```ts
import fs from "node:fs";
import path from "node:path";
import { loadContent, includeReviewByDefault } from "@/lib/content/loader";
import { loadImages } from "@/lib/images/registry";
import { loadOffers } from "@/lib/affiliates/offers";
import { contentCheck } from "@/lib/checks/content";
import { linksCheck } from "@/lib/checks/links";
import { imagesCheck } from "@/lib/checks/images";
import { seoCheck } from "@/lib/checks/seo";
import { redirectsCheck } from "@/lib/checks/redirects";
import { releaseCheck } from "@/lib/checks/release";
import { factsCheck } from "@/lib/checks/facts";
import { staticLivePaths, type CheckResult } from "@/lib/checks/types";

function main() {
  const production = process.env.VERCEL_ENV === "production" || process.env.CHECK_PRODUCTION === "1";
  const idx = loadContent({ includeReview: !production && includeReviewByDefault() });
  const images = loadImages();
  const offers = loadOffers();
  const inventoryFile = path.join(process.cwd(), "src/data/legacy-inventory.json");
  const inventory: string[] = fs.existsSync(inventoryFile) ? JSON.parse(fs.readFileSync(inventoryFile, "utf-8")) : [];
  const live = staticLivePaths();
  const today = new Date().toISOString().slice(0, 10);

  const results: CheckResult[] = [
    contentCheck(idx, images, offers),
    linksCheck(idx, live),
    imagesCheck(images, path.join(process.cwd(), "public")),
    seoCheck(idx),
    redirectsCheck(idx, inventory, live, production),
    releaseCheck(idx, offers, process.env, production),
    factsCheck(idx, offers, today),
  ];

  let errors = 0;
  for (const r of results) {
    for (const w of r.warnings) console.warn(`warn  [${r.name}] ${w}`);
    for (const e of r.errors) console.error(`ERROR [${r.name}] ${e}`);
    errors += r.errors.length;
  }
  console.log(`check: ${idx.articles.length} articles, ${idx.hubs.length} hubs, ${idx.categories.length} categories; ${errors} error(s) (${production ? "production" : "non-production"})`);
  process.exit(errors > 0 ? 1 : 0);
}

main();
```

- [ ] **Step 8: Run tests and the runner**

Run: `npm test` → PASS.
Run: `npm run check`
Expected: exits 0 with warnings like `redirect /blog/where-to-stay-busan -> ...: target is not published yet` (there is no real content until Task 14 / Plan 3).
Run: `CHECK_PRODUCTION=1 npm run check`
Expected: exits 1 with `CONTACT_EMAIL is empty` and the redirect-target errors. This is correct: production stays blocked until Plan 3 publishes content and the owner sets `CONTACT_EMAIL`.

- [ ] **Step 9: Commit**

```bash
git add src/lib/checks scripts/check.ts tests/checks.test.ts
git commit -m "feat: add build gates for content, links, images, SEO, redirects and release"
```

---

### Task 14: Seed content for end-to-end verification (status `review`)

Seed files let the platform be verified in a preview build. They are `status: "review"`, carry the marker `SEED CONTENT`, and can never be published (Task 13 errors). Plan 3 replaces them with real content.

**Files:**
- Create: `src/content/korea/_hub.mdx`, `src/content/korea/seoul/_hub.mdx`, `src/content/korea/seoul/_categories/transportation.mdx`, `src/content/korea/seoul/incheon-airport-to-seoul.mdx`, `src/data/offers/arex-express-ticket.json`

**Interfaces:**
- Consumes: content schema (Task 2), offer schema (Task 4), MDX components (Task 8).

- [ ] **Step 1: Country hub**

`src/content/korea/_hub.mdx`:
```mdx
---
title: "South Korea Travel Guide"
description: "Plan a first trip to South Korea: entry rules, payments, transport between cities, where to go and how long to stay, checked against official sources."
summary: "SEED CONTENT for platform verification. Replaced in Plan 3."
publishedAt: "2026-09-12"
updatedAt: "2026-09-12"
status: "review"
faqs: []
sources: []
---

SEED CONTENT. This hub links to the [Seoul travel guide](/korea/seoul).
```

- [ ] **Step 2: Seoul hub and category intro**

`src/content/korea/seoul/_hub.mdx`:
```mdx
---
title: "Seoul Travel Guide"
description: "Seoul for first-time visitors: neighborhoods, getting around, top experiences, day trips and itineraries, checked against official sources."
summary: "SEED CONTENT for platform verification. Replaced in Plan 3."
publishedAt: "2026-09-12"
updatedAt: "2026-09-12"
status: "review"
faqs: []
sources: []
---

SEED CONTENT. Start with [Incheon Airport to Seoul](/korea/seoul/incheon-airport-to-seoul).
```

`src/content/korea/seoul/_categories/transportation.mdx`:
```mdx
---
title: "Seoul Transportation Guides"
description: "How to get into and around Seoul: airport transfers, the subway, transport cards and taxis for first-time visitors."
summary: "SEED CONTENT for platform verification. Replaced in Plan 3."
---

SEED CONTENT.
```

- [ ] **Step 3: Seed article with every component**

`src/data/offers/arex-express-ticket.json`:
```json
{
  "id": "arex-express-ticket",
  "provider": "creatrip",
  "kind": "transfer",
  "title": "AREX Express train ticket (seed)",
  "summary": "SEED CONTENT offer for platform verification.",
  "targetUrl": "https://creatrip.com/en",
  "destination": "korea/seoul",
  "tags": ["seed"]
}
```

`src/content/korea/seoul/incheon-airport-to-seoul.mdx`:
```mdx
---
title: "Incheon Airport to Seoul: AREX vs Airport Bus vs Taxi"
description: "Compare the AREX train, airport limousine buses and taxis from Incheon Airport to central Seoul by travel time, luggage space and where each one stops."
slug: "incheon-airport-to-seoul"
category: "transportation"
template: "comparison"
journeyStage: "on-trip"
searchIntent: "informational"
primaryKeyword: "incheon airport to seoul"
secondaryKeywords: ["arex vs airport bus"]
summary: "SEED CONTENT for platform verification. Replaced in Plan 3."
faqs:
  - q: "Seed question?"
    a: "SEED CONTENT answer."
sources:
  - title: "AREX official site"
    url: "https://www.arex.or.kr/"
    publisher: "AREX"
    checkedAt: "2026-09-12"
offers: []
publishedAt: "2026-09-12"
updatedAt: "2026-09-12"
factCheckedAt: "2026-09-12"
status: "review"
author: "editorial"
---

SEED CONTENT. Back to the [Seoul travel guide](/korea/seoul).

## Which option is fastest?

<Verdict>
SEED CONTENT verdict.
</Verdict>

<QuickFacts>
- **Seed fact:** seed value
</QuickFacts>

<Callout type="tip">SEED CONTENT tip.</Callout>

| Option | Seed |
| --- | --- |
| A | B |

<BookingCTA id="arex-express-ticket" />
```

- [ ] **Step 4: Verify checks see the seed only outside production**

Run: `npm run check`
Expected: exit 0 (local non-production build excludes `review`; warnings only).
Run: `VERCEL_ENV=preview npm run check`
Expected: exit 0; output reports `1 articles, 2 hubs, 1 categories`.

- [ ] **Step 5: Commit**

```bash
git add src/content/korea src/data/offers/arex-express-ticket.json
git commit -m "chore: add review-only seed content for platform verification"
```

---

### Task 15: End-to-end verification

**Files:** none created (verification only). Fix any defect found in the task that introduced it, then re-run this task.

- [ ] **Step 1: Static checks**

Run:
```bash
npm run typecheck
npm run lint
npm test
npm run check
```
Expected: all exit 0 (check may print warnings).

- [ ] **Step 2: Preview-mode build**

Run: `VERCEL_ENV=preview npm run build`
Expected: build succeeds; the route list includes `/korea`, `/korea/seoul`, `/korea/seoul/transportation`, `/korea/seoul/incheon-airport-to-seoul`, the seven trust pages, `/sitemap.xml`, `/robots.txt`, `/feed.xml`, and every content route is marked static (○ or ●), not dynamic (ƒ).

- [ ] **Step 3: Serve and probe**

Run the server in the background: `VERCEL_ENV=preview npx next start -p 3100` (background task). Then:
```bash
B=http://localhost:3100
curl -s $B/korea/seoul/incheon-airport-to-seoul -o /tmp/a.html -w "%{http_code}\n"            # 200
grep -c "<h1" /tmp/a.html                                                                     # 1
grep -o 'rel="canonical" href="[^"]*"' /tmp/a.html                                            # https://asiapicks.com/korea/seoul/incheon-airport-to-seoul
grep -c 'application/ld+json' /tmp/a.html                                                     # >= 2 (layout + page)
grep -o '<meta name="robots" content="[^"]*"' /tmp/a.html                                     # noindex, follow (review)
grep -c 'Short answer' /tmp/a.html                                                            # 1
grep -o 'We may earn a commission' /tmp/a.html | head -1                                      # present (BookingCTA in body)
grep -o 'rel="[^"]*sponsored[^"]*"' /tmp/a.html | head -1                                     # sponsored nofollow noopener
grep -o 'utm_source=AFF-[a-z0-9]*' /tmp/a.html | head -1                                      # AFF-<code> when .env.local has CREATRIP_AFF_CODE
curl -s -o /dev/null -w "%{http_code}\n" $B/blog/3-days-in-kyoto                                # 410
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" $B/blog/where-to-stay-busan            # 308 .../korea/busan/where-to-stay-in-busan
curl -s -o /dev/null -w "%{http_code}\n" $B/destinations/japan/tokyo                            # 410
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" -H "Host: www.asiapicks.com" $B/korea  # 308 https://asiapicks.com/korea
curl -s $B/sitemap.xml | grep -c incheon                                                      # 0 (review never in sitemap)
curl -s $B/robots.txt                                                                         # Disallow: / (preview)
curl -s -o /dev/null -w "%{http_code} %{content_type}\n" "$B/api/og?title=Test"                 # 200 image/png
curl -s -o /dev/null -w "%{http_code}\n" $B/feed.xml                                            # 200
curl -s -o /dev/null -w "%{http_code}\n" $B/korea/seoul/does-not-exist                          # 404
```
Stop the background server afterwards.

- [ ] **Step 4: Production-mode gate**

Run: `CHECK_PRODUCTION=1 npm run check`
Expected: exit 1 listing `CONTACT_EMAIL` and unpublished redirect targets. Record the list in the handoff: these are Plan 3 and Plan 4 prerequisites, not defects.

- [ ] **Step 5: Handoff note**

Append a dated entry to `.castra` notes (`python3 ~/.castra/scripts/castra_notes.py checkpoint --progress "Plan 1 complete" --next "Plan 2 tooling"`) and report to the owner: what was built, the probe results from Step 3, and the production blockers from Step 4. Do not push; the owner decides when to push the branch for a Vercel preview.

---

## Spec coverage and deferrals

| Spec section | Covered by | Deferred to |
|---|---|---|
| §3 URL rules, reserved slugs, journeyStage, link rules | Tasks 1, 2, 6, 9, 13 | Sibling/practical/where-to-stay link counts are writing rules enforced by Plan 2 skills and critics |
| §4 templates and common parts | Tasks 8, 9 | Per-template body structure: Plan 2 `write-guide` skill |
| §5 content model | Task 2 | — |
| §6 affiliates | Task 4, Task 13 release check | Vercel Production-only env and Preview without IDs: Plan 4 |
| §7 images | Task 3, Task 13 images check | Photo Korea API fetch, gpt-image-2 generation, IPTC `trainedAlgorithmicMedia` embedding: Plan 2 `images` skill |
| §8 pipeline (skills, agents) | Task 0 (CLAUDE.md) | Plan 2 |
| §9 technical SEO | Tasks 5, 7, 9, 10, 11 | Bing Webmaster, Search Console sitemap swap: Plan 4 |
| §10 legacy URLs | Task 12, Task 13 redirects check | Search Console URL export into `scripts/legacy/gsc-pages.txt`, final inventory review: Plan 4 |
| §11 launch content | Task 14 (seed only) | Plan 3 |
| §12 switch | — | Plan 4 |
| §15 owner actions | Task 13 blocks production until `CONTACT_EMAIL` is set | Owner: `CONTACT_EMAIL`, pen name (Person editor), `KTO_PHOTO_API_KEY`, `OPENAI_API_KEY` |
