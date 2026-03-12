import Link from "next/link";
import Image from "next/image";
import type { BlogPost } from "@/lib/db";

interface BlogPostCardProps {
  post: BlogPost;
}

export default function BlogPostCard({ post }: BlogPostCardProps) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block rounded-xl overflow-hidden border border-border bg-white hover:shadow-lg transition-all"
    >
      {/* Thumbnail */}
      {post.image && (
        <div className="relative h-48 w-full bg-surface overflow-hidden">
          <Image
            src={post.image}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-5">
        <span className="text-xs font-medium text-primary uppercase tracking-wide">
          {post.category.replace("-", " ")}
        </span>
        <h3 className="mt-1.5 font-semibold font-heading text-text-primary group-hover:text-primary transition-colors line-clamp-2 leading-snug">
          {post.title}
        </h3>
        <p className="mt-2 text-sm text-text-secondary line-clamp-2 leading-relaxed">
          {post.description}
        </p>
        <div className="mt-3 flex items-center gap-2 text-xs text-text-secondary">
          <span>{post.read_time} min read</span>
          <span>·</span>
          <span>
            {new Date(post.published_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
      </div>
    </Link>
  );
}
