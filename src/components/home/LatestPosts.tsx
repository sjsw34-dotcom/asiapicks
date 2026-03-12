import Link from "next/link";
import Image from "next/image";
import { getMDXPosts } from "@/lib/mdx";

export default function LatestPosts() {
  const posts = getMDXPosts().slice(0, 4);

  if (posts.length === 0) return null;

  const [featured, ...rest] = posts;

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold font-heading text-text-primary">
            Latest from the Blog
          </h2>
          <p className="mt-1 text-text-secondary">
            Guides, tips, and inspiration for your next trip
          </p>
        </div>
        <Link
          href="/blog"
          className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-dark transition-colors"
        >
          All articles →
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Featured Post */}
        <Link
          href={`/blog/${featured.slug}`}
          className="group lg:col-span-2 relative rounded-2xl overflow-hidden bg-slate-800 min-h-[340px] flex flex-col justify-end"
        >
          {featured.frontmatter.image && (
            <Image
              src={featured.frontmatter.image}
              alt={featured.frontmatter.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 1024px) 100vw, 66vw"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="relative p-6 md:p-8">
            <span className="inline-block px-3 py-1 rounded-full bg-primary text-white text-xs font-medium mb-3">
              {featured.frontmatter.category.replace(/-/g, " ")}
            </span>
            <h3 className="text-xl md:text-2xl font-bold font-heading text-white leading-snug group-hover:text-primary/90 transition-colors">
              {featured.frontmatter.title}
            </h3>
            <p className="mt-2 text-white/70 text-sm line-clamp-2 leading-relaxed">
              {featured.frontmatter.description}
            </p>
            <p className="mt-3 text-white/50 text-xs">
              {featured.frontmatter.readTime} min read ·{" "}
              {new Date(featured.frontmatter.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        </Link>

        {/* Side Posts */}
        <div className="flex flex-col gap-4">
          {rest.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex gap-4 rounded-xl border border-border bg-white p-4 hover:shadow-md hover:border-primary/30 transition-all"
            >
              {post.frontmatter.image && (
                <div className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-surface">
                  <Image
                    src={post.frontmatter.image}
                    alt={post.frontmatter.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="80px"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <span className="text-[11px] font-medium text-primary uppercase tracking-wide">
                  {post.frontmatter.category.replace(/-/g, " ")}
                </span>
                <h3 className="mt-0.5 text-sm font-semibold font-heading text-text-primary group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                  {post.frontmatter.title}
                </h3>
                <p className="mt-1 text-[11px] text-text-secondary">
                  {post.frontmatter.readTime} min read
                </p>
              </div>
            </Link>
          ))}

          <Link
            href="/blog"
            className="mt-auto inline-flex items-center justify-center gap-2 py-3 rounded-xl border border-border text-sm text-text-secondary hover:border-primary hover:text-primary transition-colors"
          >
            View all articles →
          </Link>
        </div>
      </div>
    </section>
  );
}
