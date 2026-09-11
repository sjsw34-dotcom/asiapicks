import type { Article, ContentIndex } from "@/lib/content/loader";
import { relatedArticles, nextStep } from "@/lib/content/links";
import { usesAffiliateComponents } from "@/lib/content/body";
import { articleSchema, breadcrumbSchema, faqSchema } from "@/lib/seo/schema";
import { getImage } from "@/lib/images/registry";
import { absoluteUrl } from "@/lib/site";
import { getCategory } from "@/data/taxonomy";
import Figure from "@/components/media/Figure";
import Disclosure from "@/components/affiliate/Disclosure";
import OfferList from "@/components/affiliate/OfferList";
import JsonLd from "./JsonLd";
import Breadcrumbs, { breadcrumbsFor } from "./Breadcrumbs";
import AnswerBox from "./AnswerBox";
import ArticleMeta from "./ArticleMeta";
import Mdx from "./Mdx";
import FAQ from "./FAQ";
import SourceList from "./SourceList";
import NextStep from "./NextStep";
import RelatedGuides from "./RelatedGuides";

export default function ArticleLayout({ article, idx }: { article: Article; idx: ContentIndex }) {
  const { fm } = article;
  const crumbs = breadcrumbsFor(article);
  const hasAffiliate = fm.offers.length > 0 || usesAffiliateComponents(article.body);
  const image = fm.featuredImage ? getImage(fm.featuredImage) : null;
  const schemas: object[] = [articleSchema(article, image ? absoluteUrl(image.src) : undefined), breadcrumbSchema(crumbs)];
  if (fm.faqs.length > 0) schemas.push(faqSchema(fm.faqs));
  const category = getCategory(article.city ? "city" : "country", fm.category)!;

  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <JsonLd data={schemas} />
      <Breadcrumbs items={crumbs} />
      <header className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">{category.label}</p>
        <h1 className="mt-2 font-heading text-3xl font-bold leading-tight md:text-4xl">{fm.title}</h1>
        <ArticleMeta updatedAt={fm.updatedAt} factCheckedAt={fm.factCheckedAt} author={fm.author} />
      </header>
      {hasAffiliate ? <Disclosure /> : null}
      <AnswerBox summary={fm.summary} />
      {image ? <Figure id={image.id} priority /> : null}
      <Mdx source={article.body} sourceSlug={fm.slug} />
      {fm.offers.length > 0 ? (
        <section className="mt-12">
          <h2 className="font-heading text-2xl font-bold">Booking options</h2>
          <OfferList ids={fm.offers.join(",")} sourceSlug={fm.slug} />
        </section>
      ) : null}
      <FAQ faqs={fm.faqs} />
      <SourceList sources={fm.sources} />
      <NextStep article={nextStep(article, idx)} />
      <RelatedGuides articles={relatedArticles(article, idx, 4)} />
    </article>
  );
}
