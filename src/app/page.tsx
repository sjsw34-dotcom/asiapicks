import Link from "next/link";
import Image from "next/image";
import { getContent } from "@/lib/content/loader";
import { getStaticPage } from "@/lib/content/pages";
import { getImage } from "@/lib/images/registry";
import { buildMetadata } from "@/lib/seo/metadata";
import { faqSchema } from "@/lib/seo/schema";
import { formatDate } from "@/lib/content/body";
import ArticleCard, { cardImageIds } from "@/components/content/ArticleCard";
import JsonLd from "@/components/content/JsonLd";
import Mdx from "@/components/content/Mdx";
import FAQ from "@/components/content/FAQ";
import SourceList from "@/components/content/SourceList";
import SourcesDisclosure from "@/components/content/SourcesDisclosure";
import ImageCredits from "@/components/media/ImageCredits";

const home = () => getStaticPage("home");

/** Keep a set of four destinations balanced, with room to grow. */
const gridFor = (n: number) => n <= 1 ? "grid-cols-1" : n <= 4 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3";
const HERO = "seoul-bukchon-hanok-street";

/**
 * The four decisions a first trip turns on. Each answer is stated here and
 * argued in the matching section below, so the anchors point into the prose.
 */
const DECISIONS = [
  { q: "How long do you need?", a: "5 days", note: "Covers Seoul properly. Eight to ten adds Busan or Jeju.", href: "#how-many-days-do-you-need" },
  { q: "Which month?", a: "October", note: "Seoul highs average 20.2°C (68°F), with less rain than summer.", href: "#which-month-should-you-pick" },
  { q: "Paperwork before you fly?", a: "One free form", note: "Most visitors skip the K-ETA, which is what makes the e-Arrival Card theirs to file.", href: "#do-you-need-a-visa-or-a-k-eta" },
  { q: "What is a subway ride?", a: "KRW 1,550", note: "Seoul, on a transit card. Busan runs KRW 1,600 to 1,800.", href: "#what-does-getting-around-cost" },
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
  const planningGuides = beforeYouGo.length > 0 ? beforeYouGo : recent;
  const cardImages = cityHubs.map((h) => h.fm.featuredImage).filter((id): id is string => !!id);
  const creditIds = [HERO, ...cardImages, ...cardImageIds(planningGuides)];

  return (
    <div>
      {fm.faqs.length > 0 ? <JsonLd data={faqSchema(fm.faqs)} /> : null}

      {/* Hero: the headline and a real place, side by side, so neither waits for a scroll. */}
      <section className="mx-auto grid max-w-7xl items-center gap-8 px-5 pt-8 pb-10 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:py-14">
        <div>
          <h1 className="font-heading text-4xl font-bold leading-[1.15] tracking-tight md:text-5xl md:leading-[1.08]">{fm.title}</h1>
          <p className="mt-5 max-w-[52ch] text-lg leading-relaxed text-text-secondary">
            Choose your cities, work out the costs and check what you need before you fly.
            Practical guides with sources and clear next steps.
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

        {/* Uncaptioned on purpose: the credit lives in the image credits at the foot. */}
        <Image
          src={hero.src}
          width={hero.width}
          height={hero.height}
          alt={hero.alt}
          sizes="(max-width: 1024px) 100vw, 520px"
          priority
          className="h-64 w-full rounded-2xl object-cover sm:h-80 lg:h-[26rem]"
        />
      </section>

      {/* The answer board: the four questions with their answers, not decorative stats. */}
      <section aria-label="The four decisions" className="border-y border-border bg-surface">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6">
          <div className="grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            {DECISIONS.map((d) => (
              <a key={d.q} href={d.href} className="group bg-background p-6 transition-colors hover:bg-surface focus-visible:-outline-offset-4">
                <p className="font-heading text-sm font-semibold text-text-secondary">{d.q}</p>
                <p className="mt-3 font-heading text-xl font-bold text-primary group-hover:underline">{d.a}</p>
                <p className="mt-2 text-sm leading-relaxed text-text-secondary">{d.note}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {cityHubs.length > 0 || countryHub ? (
        <section className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:py-12">
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
                      sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 616px"
                      className="h-44 w-full object-cover sm:h-48"
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

      {/* A short planning overview; the answer board links directly to its headings. */}
      <section className="mx-auto max-w-3xl px-5 pb-10 sm:px-6">
        <Mdx source={body} sourceSlug="page-home" />
      </section>

      {planningGuides.length > 0 ? (
        <section className="mx-auto max-w-5xl px-5 sm:px-6">
          <div className={`rounded-2xl bg-surface p-6 sm:p-8 ${planningGuides.length === 1 ? "grid items-center gap-6 md:grid-cols-[1fr_2fr]" : ""}`}>
            <div>
              <h2 className="font-heading text-2xl font-bold">{beforeYouGo.length > 0 ? "Before you go" : "Recently updated"}</h2>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">A closer look at the details that shape your trip.</p>
            </div>
            <div className={`grid gap-5 ${planningGuides.length === 1 ? "" : `mt-6 ${gridFor(planningGuides.length)}`}`}>
              {planningGuides.map((a) => <ArticleCard key={a.path} article={a} />)}
            </div>
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-3xl px-5 pb-4 sm:px-6">
        <FAQ faqs={fm.faqs} collapsible />
        <SourcesDisclosure count={fm.sources.length}>
          <SourceList sources={fm.sources} />
          <ImageCredits ids={creditIds} />
        </SourcesDisclosure>
      </section>
    </div>
  );
}
