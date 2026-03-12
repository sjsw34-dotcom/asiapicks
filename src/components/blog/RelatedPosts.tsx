import Link from "next/link";
import type { UnifiedPost } from "@/lib/blog";

interface RelatedPostsProps {
  posts: UnifiedPost[];
}

export default function RelatedPosts({ posts }: RelatedPostsProps) {
  if (posts.length === 0) return null;

  return (
    <section className="mt-14 pt-8 border-t border-border">
      <h2 className="text-xl font-bold font-heading text-text-primary mb-6">
        Related Articles
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group block rounded-xl border border-border bg-white p-5 hover:shadow-md hover:border-primary/30 transition-all"
          >
            <span className="text-xs font-medium text-primary uppercase tracking-wide">
              {post.category.replace(/-/g, " ")}
            </span>
            <h3 className="mt-1.5 text-sm font-semibold font-heading text-text-primary group-hover:text-primary transition-colors line-clamp-2 leading-snug">
              {post.title}
            </h3>
            <p className="mt-2 text-xs text-text-secondary">
              {post.readTime} min read
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
