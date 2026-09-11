import Link from "next/link";
import type { ContentIndex, Hub } from "@/lib/content/loader";
import { breadcrumbSchema, destinationSchema, faqSchema } from "@/lib/seo/schema";
import { getImage } from "@/lib/images/registry";
import { needsDisclosure } from "@/lib/content/body";
import Figure from "@/components/media/Figure";
import Disclosure from "@/components/affiliate/Disclosure";
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
      {needsDisclosure(hub.body) ? <Disclosure /> : null}
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
