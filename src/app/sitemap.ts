import type { MetadataRoute } from "next";
import { getAllCitySlugs } from "@/lib/destinations";
import { getMDXPosts } from "@/lib/mdx";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://asiapicks.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // ── Static pages ────────────────────────────────────
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/destinations`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/saju-travel`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/deals`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // ── City pages ──────────────────────────────────────
  const citySlugs = getAllCitySlugs();
  const cityRoutes: MetadataRoute.Sitemap = citySlugs.map(
    ({ country, city }) => ({
      url: `${BASE_URL}/destinations/${country}/${city}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    })
  );

  // ── Blog category pages ──────────────────────────────
  const categories = [
    "travel-guides",
    "hotels-stays",
    "activities-tours",
    "travel-tips",
    "saju-travel",
  ];
  const categoryRoutes: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${BASE_URL}/blog/category/${cat}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  // ── MDX blog posts ───────────────────────────────────
  const mdxPosts = getMDXPosts();
  const mdxRoutes: MetadataRoute.Sitemap = mdxPosts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.frontmatter.updated ?? post.frontmatter.date),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  // ── DB blog posts ────────────────────────────────────
  let dbRoutes: MetadataRoute.Sitemap = [];
  try {
    const { getBlogPosts } = await import("@/lib/db");
    const dbPosts = await getBlogPosts(200);
    dbRoutes = dbPosts
      .filter((p) => !mdxPosts.some((m) => m.slug === p.slug))
      .map((post) => ({
        url: `${BASE_URL}/blog/${post.slug}`,
        lastModified: new Date(post.updated_at),
        changeFrequency: "monthly" as const,
        priority: 0.65,
      }));
  } catch {
    // DB not available at build time
  }

  return [
    ...staticRoutes,
    ...cityRoutes,
    ...categoryRoutes,
    ...mdxRoutes,
    ...dbRoutes,
  ];
}
