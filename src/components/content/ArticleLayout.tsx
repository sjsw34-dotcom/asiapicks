import type { Article, ContentIndex } from "@/lib/content/loader";
import { relatedArticles, nextStep } from "@/lib/content/links";
import { needsDisclosure, headings } from "@/lib/content/body";
import { bodyImageIds, guideCardPaths, primaryOfferId } from "@/lib/checks/content";
import TopOffer from "@/components/affiliate/TopOffer";
import SidebarOffer from "@/components/affiliate/SidebarOffer";
import { answerLabel, leadsWithStandfirst } from "@/lib/content/templates";
import { articleSchema, breadcrumbSchema, faqSchema } from "@/lib/seo/schema";
import { getImage } from "@/lib/images/registry";
import { absoluteUrl } from "@/lib/site";
import { getCategory } from "@/data/taxonomy";
import { withFactSources } from "@/lib/facts/registry";
import Figure from "@/components/media/Figure";
import ImageCredits from "@/components/media/ImageCredits";
import Disclosure from "@/components/affiliate/Disclosure";
import OfferList from "@/components/affiliate/OfferList";
import JsonLd from "./JsonLd";
import Breadcrumbs, { breadcrumbsFor } from "./Breadcrumbs";
import AnswerBox from "./AnswerBox";
import ArticleMeta from "./ArticleMeta";
import Mdx from "./Mdx";
import Outline, { WithOutline } from "./Outline";
import FAQ from "./FAQ";
import SourceList from "./SourceList";
import NextStep from "./NextStep";
import RelatedGuides from "./RelatedGuides";
import SourcesDisclosure from "./SourcesDisclosure";
import { cardImageIds } from "./ArticleCard";

export default function ArticleLayout({ article, idx }: { article: Article; idx: ContentIndex }) {
  const { fm } = article;
  const crumbs = breadcrumbsFor(article);
  const hasAffiliate = needsDisclosure(article.body, fm.offers);
  const image = fm.featuredImage ? getImage(fm.featuredImage) : null;
  const schemas: object[] = [articleSchema(article, image ? absoluteUrl(image.src) : undefined), breadcrumbSchema(crumbs)];
  if (fm.faqs.length > 0) schemas.push(faqSchema(fm.faqs));
  const category = getCategory(article.city ? "city" : "country", fm.category)!;
  const next = nextStep(article, idx);
  const primary = primaryOfferId(article.body);
  const related = relatedArticles(article, idx, 5).filter((a) => a.path !== next?.path).slice(0, 4);

  return (
    <article className="mx-auto max-w-7xl px-5 py-10 sm:px-6">
      <JsonLd data={schemas} />
      <Breadcrumbs items={crumbs} />
      <header className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">{category.label}</p>
        <h1 className="mt-2 font-heading text-3xl font-bold leading-tight md:text-4xl">{fm.title}</h1>
        <ArticleMeta updatedAt={fm.updatedAt} factCheckedAt={fm.factCheckedAt} author={fm.author} />
      </header>
      {hasAffiliate ? <Disclosure /> : null}
      {leadsWithStandfirst(fm.template) ? (
        <p className="mt-6 text-xl leading-relaxed text-text-secondary">{fm.summary}</p>
      ) : (
        <AnswerBox summary={fm.summary} label={answerLabel(fm.template)} />
      )}
      {primary ? <TopOffer id={primary} sourceSlug={fm.slug} /> : null}
      {image ? <Figure id={image.id} priority /> : null}
      <WithOutline outline={<Outline headings={headings(article.body)} checkedAt={fm.sources.length > 0 ? (fm.factCheckedAt ?? fm.updatedAt) : undefined} aside={primary ? <SidebarOffer id={primary} sourceSlug={fm.slug} /> : null} />}>
        <Mdx source={article.body} sourceSlug={fm.slug} />
      </WithOutline>
      {fm.offers.length > 0 ? (
        <section className="mt-12">
          <h2 className="font-heading text-2xl font-bold">Booking options</h2>
          <OfferList ids={fm.offers.join(",")} sourceSlug={fm.slug} />
        </section>
      ) : null}
      <FAQ faqs={fm.faqs} />
      <NextStep article={next} />
      <RelatedGuides articles={related} />
      <SourcesDisclosure count={withFactSources(fm.sources, article.facts).length}>
        <SourceList sources={withFactSources(fm.sources, article.facts)} />
        <ImageCredits ids={[fm.featuredImage, ...bodyImageIds(article.body), ...cardImageIds(related), ...guideCardPaths(article.body).map((p) => { const n = idx.byPath.get(p); return n && n.kind !== "category" ? n.fm.featuredImage : undefined; })]} />
      </SourcesDisclosure>
    </article>
  );
}
