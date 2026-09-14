import Link from "next/link";
import type { AreaPage, ContentIndex } from "@/lib/content/loader";
import { breadcrumbSchema } from "@/lib/seo/schema";
import { needsDisclosure } from "@/lib/content/body";
import { bodyImageIds } from "@/lib/checks/content";
import { groupByCategory } from "@/lib/content/grouping";
import { getCity } from "@/data/taxonomy";
import Disclosure from "@/components/affiliate/Disclosure";
import Figure from "@/components/media/Figure";
import ImageCredits from "@/components/media/ImageCredits";
import JsonLd from "./JsonLd";
import Breadcrumbs, { breadcrumbsFor } from "./Breadcrumbs";
import AnswerBox from "./AnswerBox";
import Mdx from "./Mdx";
import ArticleGroups from "./ArticleGroups";
import { cardImageIds } from "./ArticleCard";
import SourcesDisclosure from "./SourcesDisclosure";

/** A neighbourhood inside a city: its own intro, then every guide tagged with it, by category. */
export default function AreaLayout({ page, idx }: { page: AreaPage; idx: ContentIndex }) {
  const crumbs = breadcrumbsFor(page);
  const city = getCity(page.country, page.city)!;
  const siblings = idx.areas.filter((a) => a.country === page.country && a.city === page.city && a.path !== page.path);
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <Breadcrumbs items={crumbs} />
      <p className="mt-6 text-xs font-semibold uppercase tracking-wide text-primary">{city.name} neighbourhood</p>
      <h1 className="mt-2 font-heading text-3xl font-bold md:text-4xl">{page.fm.title}</h1>
      {needsDisclosure(page.body) ? <Disclosure /> : null}
      <AnswerBox summary={page.fm.summary} />
      {page.fm.featuredImage ? <Figure id={page.fm.featuredImage} priority /> : null}
      <Mdx source={page.body} sourceSlug={`area-${page.city}-${page.area}`} />
      <ArticleGroups groups={groupByCategory(page)} />
      {siblings.length > 0 ? (
        <nav aria-label={`Other ${city.name} neighbourhoods`} className="mt-12">
          <h2 className="font-heading text-xl font-bold">Other {city.name} neighbourhoods</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {siblings.map((s) => (
              <Link key={s.path} href={s.path} className="rounded-full border border-border px-3 py-1 text-sm hover:border-primary">{s.fm.title}</Link>
            ))}
          </div>
        </nav>
      ) : null}
      <SourcesDisclosure count={0}>
        <ImageCredits ids={[page.fm.featuredImage, ...bodyImageIds(page.body), ...cardImageIds(page.articles)]} />
      </SourcesDisclosure>
    </div>
  );
}
