import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { z } from "zod";
import {
  articleSchema, hubSchema, categorySchema,
  type ArticleFrontmatter, type HubFrontmatter, type CategoryFrontmatter, type ContentStatus,
} from "./schema";
import { articlePath, categoryPath, hubPath } from "./paths";
import { COUNTRIES, CITIES, getCategory } from "@/data/taxonomy";

type Base = { body: string; country: string; city: string | null; path: string; file: string };
export type Article = Base & { kind: "article"; fm: ArticleFrontmatter };
export type Hub = Base & { kind: "hub"; fm: HubFrontmatter };
export type CategoryPage = Base & { kind: "category"; fm: CategoryFrontmatter; category: string; articles: Article[] };
export type ContentNode = Article | Hub | CategoryPage;
export type ContentIndex = {
  articles: Article[];
  hubs: Hub[];
  categories: CategoryPage[];
  byPath: Map<string, ContentNode>;
};

const DEFAULT_ROOT = path.join(process.cwd(), "src/content");
const cache = new Map<string, ContentIndex>();

export function includeReviewByDefault(): boolean {
  return process.env.VERCEL_ENV === "preview" || process.env.NODE_ENV === "development";
}

function read<T extends z.ZodType>(file: string, schema: T): { fm: z.infer<T>; body: string } {
  const raw = fs.readFileSync(file, "utf-8");
  const { data, content } = matter(raw);
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    throw new Error(`Invalid frontmatter in ${file}: ${issues}`);
  }
  return { fm: parsed.data, body: content };
}

const visible = (status: ContentStatus, includeReview: boolean) =>
  status === "published" || (includeReview && status === "review");

const mdxFiles = (dir: string) =>
  fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith(".mdx") && !f.startsWith("_")) : [];

export function loadContent(opts: { root?: string; includeReview?: boolean } = {}): ContentIndex {
  const root = opts.root ?? DEFAULT_ROOT;
  const includeReview = opts.includeReview ?? includeReviewByDefault();
  const key = `${root}|${includeReview}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const articles: Article[] = [];
  const hubs: Hub[] = [];
  const categories: CategoryPage[] = [];

  const scopes: { country: string; city: string | null; dir: string }[] = [];
  for (const country of COUNTRIES) {
    const countryDir = path.join(root, country.slug);
    if (!fs.existsSync(countryDir)) continue;
    scopes.push({ country: country.slug, city: null, dir: countryDir });
    for (const city of CITIES.filter((c) => c.country === country.slug)) {
      const cityDir = path.join(countryDir, city.slug);
      if (fs.existsSync(cityDir)) scopes.push({ country: country.slug, city: city.slug, dir: cityDir });
    }
  }

  for (const { country, city, dir } of scopes) {
    const hubFile = path.join(dir, "_hub.mdx");
    if (fs.existsSync(hubFile)) {
      const { fm, body } = read(hubFile, hubSchema);
      if (visible(fm.status, includeReview)) {
        hubs.push({ kind: "hub", fm, body, country, city, path: hubPath(country, city), file: hubFile });
      }
    }
    for (const name of mdxFiles(dir)) {
      const file = path.join(dir, name);
      const { fm, body } = read(file, articleSchema);
      if (fm.slug !== name.replace(/\.mdx$/, "")) {
        throw new Error(`Slug "${fm.slug}" does not match file name in ${file}`);
      }
      if (!getCategory(city ? "city" : "country", fm.category)) {
        throw new Error(`Unknown category "${fm.category}" for ${city ? "city" : "country"} article in ${file}`);
      }
      if (!visible(fm.status, includeReview)) continue;
      articles.push({ kind: "article", fm, body, country, city, path: articlePath(country, city, fm.slug), file });
    }
    const catDir = path.join(dir, "_categories");
    if (fs.existsSync(catDir)) {
      for (const name of fs.readdirSync(catDir).filter((f) => f.endsWith(".mdx"))) {
        const category = name.replace(/\.mdx$/, "");
        const file = path.join(catDir, name);
        const { fm, body } = read(file, categorySchema);
        const members = articles.filter((a) => a.country === country && a.city === city && a.fm.category === category);
        if (members.length === 0) continue;
        categories.push({
          kind: "category", fm, body, country, city, category,
          path: categoryPath(country, city, category), file, articles: members,
        });
      }
    }
  }

  articles.sort((a, b) => b.fm.updatedAt.localeCompare(a.fm.updatedAt));
  const byPath = new Map<string, ContentNode>();
  for (const node of [...hubs, ...categories, ...articles]) {
    if (byPath.has(node.path)) throw new Error(`Duplicate path ${node.path} (${node.file})`);
    byPath.set(node.path, node);
  }
  const index = { articles, hubs, categories, byPath };
  cache.set(key, index);
  return index;
}

export const getContent = () => loadContent({ includeReview: includeReviewByDefault() });
