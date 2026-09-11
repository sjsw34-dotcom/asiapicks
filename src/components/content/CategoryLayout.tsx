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
