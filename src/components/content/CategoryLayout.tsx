import type { CategoryPage, ContentIndex } from "@/lib/content/loader";
import { groupByArea } from "@/lib/content/grouping";
import { breadcrumbSchema } from "@/lib/seo/schema";
import { needsDisclosure } from "@/lib/content/body";
import Disclosure from "@/components/affiliate/Disclosure";
import JsonLd from "./JsonLd";
import Breadcrumbs, { breadcrumbsFor } from "./Breadcrumbs";
import AnswerBox from "./AnswerBox";
import Mdx from "./Mdx";
import { cardImageIds } from "./ArticleCard";
import ArticleGroups from "./ArticleGroups";
import SourcesDisclosure from "./SourcesDisclosure";
import ImageCredits from "@/components/media/ImageCredits";
import { bodyImageIds } from "@/lib/checks/content";

export default function CategoryLayout({ page, idx }: { page: CategoryPage; idx: ContentIndex }) {
  const crumbs = breadcrumbsFor(page);
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <JsonLd data={breadcrumbSchema(crumbs)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 font-heading text-3xl font-bold md:text-4xl">{page.fm.title}</h1>
      {needsDisclosure(page.body) ? <Disclosure /> : null}
      <AnswerBox summary={page.fm.summary} />
      <Mdx source={page.body} sourceSlug={`category-${page.category}`} />
      <ArticleGroups groups={groupByArea(page.articles, idx)} />
      <SourcesDisclosure count={0}>
        <ImageCredits ids={[...bodyImageIds(page.body), ...cardImageIds(page.articles)]} />
      </SourcesDisclosure>
    </div>
  );
}
