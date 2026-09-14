# CLAUDE.md — AsiaPicks

AsiaPicks is an Asia travel discovery and planning website for international travelers.
First expertise: South Korea. English only. Design spec: `docs/superpowers/specs/2026-09-11-korea-rebuild-design.md`.
Long-term direction (principles, capacity limit on publishing, lifecycle, phases, review rhythm): `docs/MASTERPLAN.md`.
Read it before changing structure, cadence or scope; record new standing decisions in its §10.

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
- Taxonomy (countries, cities, categories, neighbourhoods = reserved slugs): `src/data/taxonomy.ts`.
- Neighbourhoods: a city article set in one area carries `area: seongsu` (slug from `AREAS`). Its URL stays
  `/korea/{city}/{slug}`, so retagging never moves a page. `/korea/{city}/{area}` exists once
  `src/content/korea/{city}/_areas/{area}.mdx` is written and at least one live article carries the tag; the intro
  is editorial content like a category intro. City-wide pieces (a whole-city where-to-stay, transit rules) leave
  `area` out. Add a new area to `AREAS` before tagging with it.
- Listing: city hubs show the newest 4 per category plus a link to the category page, and neighbourhood cards
  when area pages exist. Category pages group by neighbourhood once there is more than one group.
- Shared facts: `src/data/facts/{country}/{topic}.json` (schema and helpers in `src/lib/facts/registry.ts`).
  Pages write `{{id}}`, `{{id|number}}`, `{{id.previous}}`, `{{id.since}}`; the loader resolves them in body,
  summary and FAQs (never in `sources`). An unknown id fails the build. A page using a fact inherits the fact's
  `updatedAt` and shows its source.
- Offers: `src/data/offers/{id}.json`. Images: `src/data/images/{id}.json` + files in `public/images/`.
- Legacy URLs: `src/data/legacy-urls.json` (redirects + gone). `src/proxy.ts` serves 410.
- All pages are SSG. Client components only for the mobile nav.

## Writing rules (every article)
- Under every question-style H2, the first 1–3 sentences answer the question directly.
- Self-contained sentences with specific nouns, no vague pronouns, no filler.
- Label recommendations as "Our pick"; keep facts, editorial judgment and affiliate options distinct.
- Every price, rule, opening time or fee has a source in `sources` with `checkedAt`. Unverified facts are not written.
- A fact that appears on two or more pages, or is a baseline other guides will quote (transit base fares, entry
  rules, major admission fees), goes in the fact registry and is written as a token. Check the registry before
  typing a number. When changing a registry value, reread the pages that use it: a sentence built around the
  old value ("why guides still say X") may need rewriting, not just the number.
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
  Drafts wait as `status: review`; approval flips them to `published`.
- Scheduled release: an approved article goes live on its `publishedAt` date (Korea time). The loader hides
  future-dated articles in production; GuideCards and inline links to them render as nothing / plain text
  until that day. `npm run check` also checks the site as it will build on every scheduled date.
- `.github/workflows/publish.yml` runs daily at 06:05 KST: if an approved article is dated today it pushes an
  empty `release:` commit (Vercel rebuilds), waits until the page is live, then pings IndexNow. On pushes that
  change content it pings IndexNow for the changed live pages. It never writes, generates or approves content.
  Release commits land on `main`, so `git pull --rebase` before pushing a session's batch.
- No auto-generated posts. No Google Indexing API (Google limits it to job postings and livestreams). Manual IndexNow:
  `npx tsx scripts/indexnow.ts <urls>`.
- Google indexing is automated as far as Google allows: `publish.yml` resubmits `/sitemap.xml` through the Search
  Console API after every release and content push. Every Monday `search-console.yml` opens one `not-indexed` issue
  listing live articles still missing from Google 7 days after `publishedAt` (`search-console.ts stuck`), and closes
  it when none are. Only those URLs need a manual "Request indexing".
- Weekly workflow: Search Console performance and index status (`scripts/search-console.ts`, secret
  `GOOGLE_SERVICE_ACCOUNT_JSON`). Monthly workflow: an issue with `npm run refresh`: registry facts due for a
  check, then pages with inline prices, timetables, hours or dates whose oldest source reaches 90 days (rolling,
  not every page every month), plus seasonal guides due from `src/data/calendar.ts`. After re-verifying, update
  the fact's or source's `checkedAt`; bump `updatedAt` only when a value changed.
- Weekly batch: every Thursday `.github/workflows/weekly-reminder.yml` opens a GitHub issue (label `weekly-drafts`)
  telling the owner to open a session and say "다음 주 초안 준비해". Cadence is one article a day
  (`POSTS_PER_DAY` in `src/lib/release.ts`). That means: fill every open day next Monday–Sunday (`openDays`, listed
  in the issue) with one topic each (seasonal entries due in `src/data/calendar.ts` first, then the spec §11 backlog), draft them as
  `status: review` with one `publishedAt` per open day, add inbound links, run the dated checks, ask the owner which to
  approve, flip approved ones to `published`, `git pull --rebase`, push.
- Fact watch: every Monday `.github/workflows/fact-watch.yml` fetches each registry fact's source and checks the
  published value still appears (`scripts/watch-facts.ts`, `src/lib/facts/watch.ts`). Missing values or unreachable
  sources open one `fact-watch` issue; it closes itself when all values are found. "사실 감시 이슈 처리해" means:
  re-read each flagged source, then either update the fact (value, previous, since, checkedAt, updatedAt) and reread
  the pages listed, or point `watch.url`/`watch.expect` at where the value is actually printed. Never change a value
  from the scrape alone. A fact's `source.url` should be the page that prints the value, not a page about it.
- Seasonal guides publish about a month before the season (`src/data/calendar.ts`). Refresh: bump `updatedAt`
  only when a fact changed.

## Safety
- Never print `.env.local`. Never commit it.