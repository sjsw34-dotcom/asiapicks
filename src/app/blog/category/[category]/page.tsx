import { notFound } from "next/navigation";
import { getPostsByCategory, CATEGORIES } from "@/lib/blog";
import { generatePageMetadata } from "@/lib/seo";
import BlogPostCard from "@/components/cards/BlogPostCard";
import CategoryFilter from "@/components/blog/CategoryFilter";

interface Props {
  params: Promise<{ category: string }>;
}

export async function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.id }));
}

export async function generateMetadata({ params }: Props) {
  const { category } = await params;
  const cat = CATEGORIES.find((c) => c.id === category);
  if (!cat) return {};
  return generatePageMetadata({
    title: `${cat.label} — Asia Travel Blog`,
    description: `Browse all ${cat.label.toLowerCase()} articles on Asiapicks — expert guides, tips, and recommendations.`,
    path: `/blog/category/${category}`,
  });
}

export const revalidate = 3600;

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  const cat = CATEGORIES.find((c) => c.id === category);
  if (!cat) notFound();

  const posts = await getPostsByCategory(category);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <p className="text-sm text-text-secondary mb-1">Category</p>
        <h1 className="text-3xl md:text-4xl font-bold font-heading text-text-primary">
          {cat.label}
        </h1>
        <p className="mt-2 text-text-secondary">{posts.length} articles</p>
      </div>

      <CategoryFilter categories={CATEGORIES} activeCategory={category} />

      {posts.length === 0 ? (
        <div className="mt-16 text-center text-text-secondary">
          <p>No posts in this category yet.</p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <BlogPostCard
              key={post.slug}
              post={{
                slug: post.slug,
                title: post.title,
                description: post.description,
                category: post.category,
                image: post.image ?? null,
                read_time: post.readTime,
                published_at: post.date,
                id: 0,
                city: post.city ?? null,
                country: post.country ?? null,
                tags: post.tags,
                content: "",
                updated_at: post.date,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
