import { getAllPosts, CATEGORIES } from "@/lib/blog";
import { generatePageMetadata } from "@/lib/seo";
import BlogPostCard from "@/components/cards/BlogPostCard";
import CategoryFilter from "@/components/blog/CategoryFilter";

export const metadata = generatePageMetadata({
  title: "Travel Blog — Asia Guides, Tips & Itineraries",
  description:
    "Expert travel guides, hotel picks, and day-by-day itineraries for Japan, Thailand, South Korea, and Vietnam.",
  path: "/blog",
});

export const revalidate = 3600;

export default async function BlogPage() {
  const posts = await getAllPosts(50);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold font-heading text-text-primary">
          Travel Blog
        </h1>
        <p className="mt-3 text-text-secondary">
          Expert guides, itineraries, and tips for Asia travel
        </p>
      </div>

      {/* Category Filter (client) */}
      <CategoryFilter categories={CATEGORIES} />

      {/* Post Grid */}
      {posts.length === 0 ? (
        <div className="mt-16 text-center text-text-secondary">
          <p className="text-lg">Posts coming soon...</p>
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
                // unused fields required by type
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
