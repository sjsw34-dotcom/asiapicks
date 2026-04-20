import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import { getMDXPost, getMDXSlugs, getRelatedMDXPosts, extractHeadings } from "@/lib/mdx";
import { getBlogPost } from "@/lib/db";
import { getCityBySlug } from "@/lib/destinations";
import { getRelatedMDXAsUnified } from "@/lib/blog";
import { generatePageMetadata, articleSchema, breadcrumbSchema } from "@/lib/seo";
import JsonLd from "@/components/common/JsonLd";
import { getMDXComponents } from "@/components/blog/MDXComponents";
import TableOfContents from "@/components/blog/TableOfContents";
import RelatedPosts from "@/components/blog/RelatedPosts";
import AffiliateDisclosure from "@/components/affiliate/AffiliateDisclosure";
import HotelSection from "@/components/affiliate/HotelSection";
import ActivitySection from "@/components/affiliate/ActivitySection";
import SajuInsightBox from "@/components/saju/SajuInsightBox";
import InArticleAd from "@/components/ads/InArticleAd";
import ReactMarkdown from "react-markdown";
import Image from "next/image";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const mdxSlugs = getMDXSlugs().map((slug) => ({ slug }));
  let dbSlugs: { slug: string }[] = [];
  try {
    const { getBlogPosts } = await import("@/lib/db");
    const posts = await getBlogPosts(100);
    dbSlugs = posts.map((p) => ({ slug: p.slug }));
  } catch {}
  // Merge, deduplicate
  const all = new Map<string, { slug: string }>();
  [...mdxSlugs, ...dbSlugs].forEach((s) => all.set(s.slug, s));
  return Array.from(all.values());
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const mdx = getMDXPost(slug);
  if (mdx) {
    return generatePageMetadata({
      title: mdx.frontmatter.title,
      description: mdx.frontmatter.description,
      path: `/blog/${slug}`,
      image: mdx.frontmatter.image,
    });
  }
  const db = await getBlogPost(slug).catch(() => null);
  if (db) {
    return generatePageMetadata({
      title: db.title,
      description: db.description,
      path: `/blog/${slug}`,
      image: db.image ?? undefined,
    });
  }
  return {};
}

export const revalidate = 3600;

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;

  // ── Try MDX first ──────────────────────────────────
  const mdxPost = getMDXPost(slug);

  if (mdxPost) {
    const { frontmatter, content } = mdxPost;
    const headings = extractHeadings(content);
    const related = getRelatedMDXAsUnified(mdxPost);

    // Optional city-linked sections
    const city =
      frontmatter.city && frontmatter.country
        ? getCityBySlug(frontmatter.country, frontmatter.city)
        : null;

    const schemas = [
      articleSchema({
        title: frontmatter.title,
        description: frontmatter.description,
        slug,
        date: frontmatter.date,
        updated: frontmatter.updated,
        image: frontmatter.image,
        tags: frontmatter.tags,
        readTime: frontmatter.readTime,
      }),
      breadcrumbSchema([
        { name: "Home", href: "/" },
        { name: "Blog", href: "/blog" },
        ...(frontmatter.category
          ? [{ name: frontmatter.category.replace(/-/g, " "), href: `/blog/category/${frontmatter.category}` }]
          : []),
        { name: frontmatter.title, href: `/blog/${slug}` },
      ]),
    ];

    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <JsonLd schema={schemas} />
        <div className="lg:grid lg:grid-cols-[1fr_220px] lg:gap-12">
          {/* Main Content */}
          <article>
            {/* Hero Image */}
            {frontmatter.image && (
              <div className="relative w-full h-64 md:h-96 rounded-2xl overflow-hidden mb-8">
                <Image
                  src={frontmatter.image}
                  alt={frontmatter.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 800px"
                  priority
                />
              </div>
            )}

            {/* Header */}
            <header className="mb-8">
              <span className="text-xs font-medium text-primary uppercase tracking-wide">
                {frontmatter.category.replace(/-/g, " ")}
              </span>
              <h1 className="mt-2 text-3xl md:text-4xl font-bold font-heading text-text-primary leading-tight">
                {frontmatter.title}
              </h1>
              <p className="mt-4 text-lg text-text-secondary leading-relaxed">
                {frontmatter.description}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-text-secondary">
                <span>{frontmatter.readTime} min read</span>
                <span>·</span>
                <span>
                  {new Date(frontmatter.date).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                {frontmatter.city && (
                  <>
                    <span>·</span>
                    <span className="capitalize">{frontmatter.city}</span>
                  </>
                )}
              </div>
            </header>

            {/* FTC Disclosure */}
            <AffiliateDisclosure variant="post" />

            {/* MDX Body */}
            <div className="mdx-content">
              <MDXRemote
                source={content}
                components={getMDXComponents()}
                options={{
                  mdxOptions: {
                    remarkPlugins: [remarkGfm],
                    rehypePlugins: [rehypeSlug],
                  },
                }}
              />
            </div>

            {/* In-article ad after main content */}
            <InArticleAd />

            {/* Auto-injected sections from frontmatter */}
            {frontmatter.showHotels && city && (
              <HotelSection hotels={city.hotels} cityName={city.name} />
            )}
            {frontmatter.showActivities && city && (
              <ActivitySection activities={city.activities} cityName={city.name} />
            )}
            {frontmatter.showSajuInsight && (
              <SajuInsightBox
                text={frontmatter.sajuInsightText}
                campaign={`blog-${slug}`}
              />
            )}

            {/* Tags */}
            {frontmatter.tags?.length > 0 && (
              <div className="mt-10 pt-6 border-t border-border flex flex-wrap gap-2">
                {frontmatter.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full bg-surface text-xs text-text-secondary border border-border"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            <RelatedPosts posts={related} />
          </article>

          {/* Sidebar TOC */}
          <aside className="hidden lg:block">
            <TableOfContents headings={headings} />
          </aside>
        </div>
      </div>
    );
  }

  // ── Fallback: DB post ──────────────────────────────
  const dbPost = await getBlogPost(slug).catch(() => null);
  if (!dbPost) notFound();

  const dbSchemas = [
    articleSchema({
      title: dbPost.title,
      description: dbPost.description,
      slug,
      date: dbPost.published_at,
      updated: dbPost.updated_at,
      image: dbPost.image ?? undefined,
      tags: dbPost.tags ?? [],
      readTime: dbPost.read_time,
    }),
    breadcrumbSchema([
      { name: "Home", href: "/" },
      { name: "Blog", href: "/blog" },
      { name: dbPost.category.replace(/-/g, " "), href: `/blog/category/${dbPost.category}` },
      { name: dbPost.title, href: `/blog/${slug}` },
    ]),
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <JsonLd schema={dbSchemas} />
      <div className="lg:grid lg:grid-cols-[1fr_220px] lg:gap-12">
        <article>
          {/* Hero Image */}
          {dbPost.image && (
            <div className="relative w-full h-64 md:h-96 rounded-2xl overflow-hidden mb-8">
              <Image
                src={dbPost.image}
                alt={dbPost.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 800px"
                priority
              />
            </div>
          )}

          <header className="mb-8">
            <span className="text-xs font-medium text-primary uppercase tracking-wide">
              {dbPost.category.replace(/-/g, " ")}
            </span>
            <h1 className="mt-2 text-3xl md:text-4xl font-bold font-heading text-text-primary leading-tight">
              {dbPost.title}
            </h1>
            <p className="mt-4 text-lg text-text-secondary leading-relaxed">
              {dbPost.description}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-text-secondary">
              <span>{dbPost.read_time} min read</span>
              <span>·</span>
              <span>
                {new Date(dbPost.published_at).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              {dbPost.city && (
                <>
                  <span>·</span>
                  <span className="capitalize">{dbPost.city}</span>
                </>
              )}
            </div>
          </header>

          <AffiliateDisclosure variant="post" />

          <div className="mdx-content">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              components={getMDXComponents() as any}
            >
              {dbPost.content}
            </ReactMarkdown>
          </div>

          <InArticleAd />

          {dbPost.tags?.length > 0 && (
            <div className="mt-10 pt-6 border-t border-border flex flex-wrap gap-2">
              {dbPost.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full bg-surface text-xs text-text-secondary border border-border"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </article>
      </div>
    </div>
  );
}
