/**
 * Unified blog post type used in listing pages.
 * Sources: MDX files (static) + Neon DB (auto-generated)
 */

import { getMDXPosts, getMDXPostsByCategory, getRelatedMDXPosts, type MDXPost } from "@/lib/mdx";
import { getBlogPosts, type BlogPost } from "@/lib/db";

export interface UnifiedPost {
  slug: string;
  title: string;
  description: string;
  category: string;
  city?: string | null;
  country?: string | null;
  tags: string[];
  image?: string | null;
  readTime: number;
  date: string;
  source: "mdx" | "db";
}

function mdxToUnified(p: MDXPost): UnifiedPost {
  return {
    slug: p.slug,
    title: p.frontmatter.title,
    description: p.frontmatter.description,
    category: p.frontmatter.category,
    city: p.frontmatter.city,
    country: p.frontmatter.country,
    tags: p.frontmatter.tags,
    image: p.frontmatter.image,
    readTime: p.frontmatter.readTime,
    date: p.frontmatter.date,
    source: "mdx",
  };
}

function dbToUnified(p: BlogPost): UnifiedPost {
  return {
    slug: p.slug,
    title: p.title,
    description: p.description,
    category: p.category,
    city: p.city,
    country: p.country,
    tags: p.tags ?? [],
    image: p.image,
    readTime: p.read_time,
    date: p.published_at,
    source: "db",
  };
}

export async function getAllPosts(limit = 30): Promise<UnifiedPost[]> {
  const mdx = getMDXPosts().map(mdxToUnified);

  let db: UnifiedPost[] = [];
  try {
    const dbPosts = await getBlogPosts(limit);
    db = dbPosts
      .filter((p) => !mdx.some((m) => m.slug === p.slug)) // no duplicates
      .map(dbToUnified);
  } catch {
    // DB not available yet
  }

  return [...mdx, ...db].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export async function getPostsByCategory(category: string): Promise<UnifiedPost[]> {
  const all = await getAllPosts();
  return all.filter((p) => p.category === category);
}

export function getRelatedMDXAsUnified(current: MDXPost): UnifiedPost[] {
  return getRelatedMDXPosts(current, 3).map(mdxToUnified);
}

export const CATEGORIES = [
  { id: "travel-guides", label: "Travel Guides" },
  { id: "hotels-stays", label: "Hotels & Stays" },
  { id: "activities-tours", label: "Activities & Tours" },
  { id: "travel-tips", label: "Travel Tips" },
  { id: "saju-travel", label: "Saju Travel" },
];
