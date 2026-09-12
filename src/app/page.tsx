import Link from "next/link";
import Image from "next/image";
import { getContent } from "@/lib/content/loader";
import { getStaticPage } from "@/lib/content/pages";
import { getImage } from "@/lib/images/registry";
import { buildMetadata } from "@/lib/seo/metadata";
import { faqSchema } from "@/lib/seo/schema";
import { formatDate } from "@/lib/content/body";
import ArticleCard from "@/components/content/ArticleCard";
import JsonLd from "@/components/content/JsonLd";
import Mdx from "@/components/content/Mdx";
import FAQ from "@/components/content/FAQ";
import SourceList from "@/components/content/SourceList";

const home = () => getStaticPage("home");

/** Few cards should not scatter across a four-wide grid; widen them instead. */
const gridFor = (n: number) => (n <= 1 ? "sm:grid-cols-1 lg:max-w-md" : n === 2 ? "sm:grid-cols-2 lg:max-w-3xl" : "sm:grid-cols-2 lg:grid-cols-3");
const HERO = "seoul-bukchon-hanok-street";

/**
 * The four decisions a first trip turns on. Each answer is stated here and
 * argued in the matching section below, so the anchors point into the prose.
 */
const DECISIONS = [
  { q: "How long do you need?", a: "5 days", note: "Covers Seoul properly. Eight to ten adds Busan or Jeju.", href: "#how-many-days-do-you-need" },
  { q: "Which month?", a: "October", note: "20.1°C and about 50mm of rain, against 415mm in July.", href: "#which-month-should-you-pick" },
  { q: "Paperwork before you fly?", a: "None, for now", note: "Visa-free nationals need no K-ETA until 31 Dec 2026.", href: "#do-you-need-a-visa-or-a-k-eta" },
  { q: "What is a subway ride?", a: "1,550 won", note: "Seoul, on a transit card. Busan runs 1,600 to 1,800.", href: "#what-does-getting-around-cost" },
];

export const metadata = buildMetadata({
  title: "South Korea Trip Planner: Costs, Transport and When to Go",
  description: home().fm.description,
  path: "/",
  absoluteTitle: true,
});

export default function HomePage() {
  const { fm, body } = home();
  const idx = getContent();
  const hero = getImage(HERO);
  const countryHub = idx.hubs.find((h) => h.country === "korea" && !h.city);
  const cityHubs = idx.hubs.filter((h) => h.country === "korea" && h.city);
  const beforeYouGo = idx.articles.filter((a) => a.country === "korea" && !a.city && a.fm.journeyStage === "planning").slice(0, 5);
  const recent = idx.articles.slice(0, 6);

  return (
    <div>
      {fm.faqs.length > 0 ? <JsonLd data={faqSchema(fm.faqs)} /> : null}

      {/* Hero: the headline and a real place, side by side, so neither waits for a scroll. */}
      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pt-10 pb-14 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:pt-16">
        <div>
          <h1 className="font-heading text-4xl font-bold leading-[1.08] tracking-tight md:text-5xl">{fm.title}</h1>
          <p className="mt-5 max-w-[52ch] text-lg leading-relaxed text-text-secondary">
            Four decisions settle a first trip: how long, which month, what you need before you fly, and what moving
            around costs. Every figure on this site carries its source and the day we checked it.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-4">
            {countryHub ? (
              <Link
                href={countryHub.path}
                className="inline-flex rounded-lg bg-primary px-5 py-3 font-medium text-white transition-colors hover:bg-primary-dark"
              >
                Start with the South Korea guide
              </Link>
            ) : null}
            <span className="text-sm text-text-secondary">Checked {formatDate(fm.updatedAt)}</span>
          </div>
        </div>

        <figure className="m-0">
          <Image
            src={hero.src}
            width={hero.width}
            height={hero.height}
            alt={hero.alt}
            sizes="(max-width: 1024px) 100vw, 520px"
            priority
            className="h-72 w-full rounded-2xl object-cover sm:h-96 lg:h-[32rem]"
          />
          <figcaption className="mt-2 text-xs text-text-secondary">
            <a href={hero.sourceUrl} rel="noopener" target="_blank" className="underline underline-offset-2">
              {hero.credit} ({hero.license})
            </a>
          </figcaption>
        </figure>
      </section>

      {/* The answer board: the four questions with their answers, not decorative stats. */}
      <section aria-label="The four decisions" className="border-y border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {DECISIONS.map((d) => (
              <a key={d.q} href={d.href} className="group bg-background p-6 transition-colors hover:bg-surface">
                <p className="font-heading text-sm font-semibold text-text-secondary">{d.q}</p>
                <p className="mt-3 font-heading text-2xl font-bold text-primary group-hover:underline">{d.a}</p>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">{d.note}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {cityHubs.length > 0 || countryHub ? (
        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <h2 className="font-heading text-2xl font-bold">Where to go</h2>
          <div className={`mt-6 grid gap-5 ${gridFor(cityHubs.length)}`}>
            {cityHubs.map((h) => {
              const img = h.fm.featuredImage ? getImage(h.fm.featuredImage) : null;
              return (
                <Link key={h.path} href={h.path} className="group block overflow-hidden rounded-xl border border-border transition-colors hover:border-primary">
                  {img ? (
                    <Image
                      src={img.src}
                      width={img.width}
                      height={img.height}
                      alt=""
                      sizes="(max-width: 640px) 100vw, 360px"
                      className="h-44 w-full object-cover"
                    />
                  ) : null}
                  <div className="p-5">
                    <p className="font-heading text-lg font-semibold group-hover:text-primary">{h.fm.title}</p>
                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-text-secondary">{h.fm.summary}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

      {/* The argument behind the board. Kept below it: readers scan first, read second. */}
      <section className="mx-auto max-w-6xl px-4 pb-14 sm:px-6">
        <div className="max-w-[68ch]">
          <Mdx source={body} sourceSlug="page-home" />
        </div>
      </section>

      {beforeYouGo.length > 0 || recent.length > 0 ? (
        <section className="border-t border-border bg-surface">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
            <h2 className="font-heading text-2xl font-bold">{beforeYouGo.length > 0 ? "Before you go" : "Recently updated"}</h2>
            <div className={`mt-6 grid gap-5 ${gridFor((beforeYouGo.length > 0 ? beforeYouGo : recent).length)}`}>
              {(beforeYouGo.length > 0 ? beforeYouGo : recent).map((a) => <ArticleCard key={a.path} article={a} />)}
            </div>
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
        <div className="max-w-[68ch]">
          <FAQ faqs={fm.faqs} />
          <SourceList sources={fm.sources} />
        </div>
      </section>
    </div>
  );
}
