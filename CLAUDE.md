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