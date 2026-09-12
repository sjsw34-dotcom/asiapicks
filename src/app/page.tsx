import Link from "next/link";
import { getContent } from "@/lib/content/loader";
import { getStaticPage } from "@/lib/content/pages";
import { buildMetadata } from "@/lib/seo/metadata";
import { faqSchema } from "@/lib/seo/schema";
import { formatDate } from "@/lib/content/body";
import ArticleCard from "@/components/content/ArticleCard";
import JsonLd from "@/components/content/JsonLd";
import Mdx from "@/components/content/Mdx";
import FAQ from "@/components/content/FAQ";
import SourceList from "@/components/content/SourceList";

const home = () => getStaticPage("home");

export const metadata = buildMetadata({
  title: "South Korea Trip Planner: Costs, Transport and When to Go",
  description: home().fm.description,
  path: "/",
  absoluteTitle: true,
});

export default function HomePage() {
  const { fm, body } = home();
  const idx = getContent();
  const countryHub = idx.hubs.find((h) => h.country === "korea" && !h.city);
  const cityHubs = idx.hubs.filter((h) => h.country === "korea" && h.city);
  const beforeYouGo = idx.articles.filter((a) => a.country === "korea" && !a.city && a.fm.journeyStage === "planning").slice(0, 5);
  const recent = idx.articles.slice(0, 6);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      {fm.faqs.length > 0 ? <JsonLd data={faqSchema(fm.faqs)} /> : null}

      <div className="max-w-3xl">
        <h1 className="font-heading text-4xl font-bold leading-tight md:text-5xl">{fm.title}</h1>
        <p className="mt-3 text-sm text-text-secondary">Last updated {formatDate(fm.updatedAt)}</p>
        <Mdx source={body} sourceSlug="page-home" />
        {countryHub ? (
          <Link href={countryHub.path} className="mt-8 inline-flex rounded-lg bg-primary px-5 py-3 font-medium text-white hover:bg-primary-dark">
            Start with the South Korea travel guide
          </Link>
        ) : null}
      </div>

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

      <div className="max-w-3xl">
        <FAQ faqs={fm.faqs} />
        <SourceList sources={fm.sources} />
      </div>
    </div>
  );
}
