import fs from "fs";
import path from "path";
import matter from "gray-matter";

const BLOG_DIR = path.join(process.cwd(), "src/content/blog");

export interface MDXFrontmatter {
  title: string;
  slug: string;
  description: string;
  date: string;
  updated?: string;
  category: "travel-guides" | "hotels-stays" | "activities-tours" | "travel-tips" | "saju-travel";
  city?: string;
  country?: string;
  tags: string[];
  image?: string;
  readTime: number;
  showHotels?: boolean;
  showActivities?: boolean;
  showSajuInsight?: boolean;
  sajuInsightText?: string;
}

export interface MDXPost {
  frontmatter: MDXFrontmatter;
  content: string;
  slug: string;
}

export function getMDXPosts(): MDXPost[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((filename) => {
      const slug = filename.replace(/\.mdx$/, "");
      const raw = fs.readFileSync(path.join(BLOG_DIR, filename), "utf-8");
      const { data, content } = matter(raw);
      return { frontmatter: data as MDXFrontmatter, content, slug };
    })
    .sort(
      (a, b) =>
        new Date(b.frontmatter.date).getTime() -
        new Date(a.frontmatter.date).getTime()
    );
}

export function getMDXPost(slug: string): MDXPost | null {
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  return { frontmatter: data as MDXFrontmatter, content, slug };
}

export function getMDXSlugs(): string[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

export function getMDXPostsByCategory(category: string): MDXPost[] {
  return getMDXPosts().filter((p) => p.frontmatter.category === category);
}

export function getRelatedMDXPosts(current: MDXPost, limit = 3): MDXPost[] {
  return getMDXPosts()
    .filter((p) => p.slug !== current.slug)
    .filter(
      (p) =>
        p.frontmatter.category === current.frontmatter.category ||
        p.frontmatter.city === current.frontmatter.city
    )
    .slice(0, limit);
}

export interface Heading {
  id: string;
  text: string;
  level: 2 | 3;
}

export function extractHeadings(content: string): Heading[] {
  const regex = /^(#{2,3})\s+(.+)$/gm;
  const headings: Heading[] = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    const level = match[1].length as 2 | 3;
    const text = match[2].trim().replace(/\*\*/g, ""); // strip bold
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .trim()
      .replace(/\s+/g, "-");
    headings.push({ id, text, level });
  }
  return headings;
}
