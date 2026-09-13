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

## Connecting articles (every new article, enforced by `npm run check`)
- Each article links to at least 2 other articles and is linked from at least 1 other article. Hubs and categories do not count toward either.
- Use `<GuideCard href="/korea/..." />` where the text hands the reader on (a photo card is hard to miss on a phone); plain inline links still count.
- When publishing a new article, add a GuideCard or inline link to it from the 1–2 most related published articles in the same commit, and link back to them. A link to an unpublished article fails the production build, so the new article and its inbound links ship together.
- Every hub and article carries a relevant booking option (`<Offer>`/`<OfferList>` at the decision point, one `<BookingCTA>` per article). The page's lead offer is repeated automatically under the answer box and in the desktop sidebar.

## Templates (every article picks one; it decides the writing, not just the layout)

`template` is an editorial instruction. A site where every piece is shaped the same
reads as machine output, however good the facts are. Pick the shape the question
deserves, then write in that shape's register.

- **guide** — procedural. The reader has a task: get from A to B, buy the card, claim
  the refund. Short paragraphs, steps in order, the number they need in the sentence
  they need it. Question-style H2s with the answer in the first sentence.
- **comparison** — verdict first. Open with the pick and the one condition that would
  change it, then the table, then why. Terse. No throat-clearing. The table is the
  body of the piece, not an illustration of it.
- **where-to-stay** — opinionated by area. Each area gets a character sentence, who it
  suits, who it does not, and the trade-off in plain terms. Recommendations labelled
  "Our pick".
- **itinerary** — day by day, written as a sequence with travel times between stops.
  Prose, not bullets, because the point is the shape of a day.
- **best-of** — ranked and justified. Every entry says why it beats the next one.
  A list with no argument is a directory, not an article.
- **essay** — argues rather than answers. Statement headings, longer paragraphs, one
  idea developed. Use it for discovery-stage pieces where the reader has no task yet:
  why October, what the fare rise says about Korean transit, why Gyeongju is skipped.
  The summary renders as a standfirst, not a "Short answer" box.

Two rules bind every template, essays included. Facts still carry a source and a
`checkedAt`, and no piece may claim a first-hand visit. An essay here is analytical,
not experiential: it may argue about a place, never pretend to have stood in it.

The direct-answer rule applies to question-style H2s. An essay using statement
headings is not exempt from clarity, only from that specific device.

## Affiliate rules
- Viator = tours/day trips, Creatrip = Korea-specific experiences/tickets/beauty/K-pop/hanbok, Trip.com = hotels + KTX.
- One BookingCTA per article, after the informational sections. No sticky bars, popups or widget scripts.
- Never show ratings, provider descriptions or provider photos. No Product/Offer/AggregateRating schema.
- IDs only from env (`VIATOR_PID`, `VIATOR_MCID`, `CREATRIP_AFF_CODE`, `TRIPCOM_ALLIANCE_ID`, `TRIPCOM_SID`).
- Link attributes: tracked affiliate links (provider IDs configured) use `rel="sponsored nofollow noopener"`; partner links without configured IDs use `rel="nofollow noopener"`. Both use `target="_blank"`.
- Providers are linked only through `<Offer>`, `<OfferList>`, `<ComparisonTable>`, `<BookingCTA>`. Never put a provider URL in an MDX body.

## Image rules
- Real places: KTO Photo Korea (KOGL type 1) or Wikimedia Commons with credit and license.
- AI images (OpenAI gpt-image-2) only for illustrations, maps, infographics; text-only prompts; caption
  "Illustration (AI-generated)"; never photoreal depictions of real landmarks; never use other sites' images as input.

## Publishing
- Content is produced in Claude Code sessions and published only after the owner approves (`status: published`).
- No cron publishing. No Google Indexing API. After deploy, ping IndexNow with `npx tsx scripts/indexnow.ts <urls>`.

## Safety
- Never print `.env.local`. Never commit it.