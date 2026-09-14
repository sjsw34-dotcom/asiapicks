import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { z } from "zod";
import {
  articleSchema, hubSchema, categorySchema, areaSchema,
  type ArticleFrontmatter, type HubFrontmatter, type CategoryFrontmatter, type AreaFrontmatter, type ContentStatus,
} from "./schema";
import { areaPath, articlePath, categoryPath, hubPath } from "./paths";
import { COUNTRIES, CITIES, getArea, getCategory } from "@/data/taxonomy";
import { loadFacts, resolveDeep, resolveFacts, type Fact } from "@/lib/facts/registry";

/** What a page says before fact tokens are resolved: the refresh scan reads this, so registry facts are not re-listed per page. */
export type RawText = { summary: string; faqs: string; body: string };
type Base = {
  body: string; country: string; city: string | null; path: string; file: string;
  /** Registry fact ids the page uses. */
  facts: string[];
  raw: RawText;
};
export type Article = Base & { kind: "article"; fm: ArticleFrontmatter };
export type Hub = Base & { kind: "hub"; fm: HubFrontmatter };
export type CategoryPage = Base & { kind: "category"; fm: CategoryFrontmatter; category: string; articles: Article[] };
/** A neighbourhood page: `_areas/{area}.mdx` intro plus the city's articles tagged with that area. */
export type AreaPage = Base & { kind: "area"; fm: AreaFrontmatter; area: string; city: string; articles: Article[] };
export type ContentNode = Article | Hub | CategoryPage | AreaPage;
export type ContentIndex = {
  articles: Article[];
  hubs: Hub[];
  categories: CategoryPage[];
  areas: AreaPage[];
  byPath: Map<string, ContentNode>;
  /** Approved articles whose publishedAt is still ahead: hidden now, live on that date. Path -> publishedAt. */
  scheduled: Map<string, string>;
};

const DEFAULT_ROOT = path.join(process.cwd(), "src/content");
const cache = new Map<string, ContentIndex>();

/** Today's date in Korea (UTC+9), the calendar the site publishes on. CONTENT_TODAY overrides it for checks and tests. */
export function contentToday(env: Record<string, string | undefined> = process.env, now = Date.now()): string {
  const fixed = env.CONTENT_TODAY?.trim();
  if (fixed) return fixed;
  return new Date(now + 9 * 3_600_000).toISOString().slice(0, 10);
}

export function includeReviewByDefault(): boolean {
  return process.env.VERCEL_ENV === "preview" || process.env.NODE_ENV === "development";
}

export function readWithFacts<T extends z.ZodType>(file: string, schema: T, facts: Map<string, Fact> = loadFacts()) {
  const { data, content } = matter(fs.readFileSync(file, "utf-8"));
  const used = new Set<string>();
  const resolved = resolveDeep(data, facts, file, used);
  const body = resolveFacts(content, facts, file, used);
  const parsed = schema.safeParse(resolved);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    throw new Error(`Invalid frontmatter in ${file}: ${issues}`);
  }
  const fm = parsed.data as z.infer<T>;
  // A page restates its facts, so a fact that changed after the page was written changes the page.
  if (fm && typeof fm === "object" && "updatedAt" in fm) {
    const latest = [...used].map((id) => facts.get(id)!.updatedAt).reduce((a, b) => (b > a ? b : a), (fm as { updatedAt: string }).updatedAt);
    (fm as { updatedAt: string }).updatedAt = latest;
  }
  const rawData = data as { summary?: unknown; faqs?: unknown };
  const raw: RawText = {
    summary: typeof rawData.summary === "string" ? rawData.summary : "",
    faqs: Array.isArray(rawData.faqs) ? rawData.faqs.map((f: { a?: string }) => f?.a ?? "").join("\n") : "",
    body: content,
  };
  return { fm, body, facts: [...used].sort(), raw };
}


const byUpdatedDesc = (a: Article, b: Article) => b.fm.updatedAt.localeCompare(a.fm.updatedAt);

const visible = (status: ContentStatus, includeReview: boolean) =>
  status === "published" || (includeReview && status === "review");

const mdxFiles = (dir: string) =>
  fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith(".mdx") && !f.startsWith("_")) : [];

/**
 * An article goes live on its publishedAt date, so an approved week of posts can
 * sit in the repo and appear one a day as the daily rebuild runs. Previews show
 * future-dated articles unless `asOf` is given; `asOf` makes a check see the site
 * exactly as it will build on that date.
 */
export function loadContent(opts: { root?: string; includeReview?: boolean; asOf?: string; factsDir?: string } = {}): ContentIndex {
  const root = opts.root ?? DEFAULT_ROOT;
  const includeReview = opts.includeReview ?? includeReviewByDefault();
  const enforceDates = opts.asOf !== undefined || !includeReview;
  const asOf = opts.asOf ?? contentToday();
  const key = `${root}|${includeReview}|${enforceDates ? asOf : "any"}|${opts.factsDir ?? ""}`;
  const factMap = loadFacts(opts.factsDir);
  const read = <T extends z.ZodType>(file: string, schema: T) => readWithFacts(file, schema, factMap);
  const hit = cache.get(key);
  if (hit) return hit;

  const articles: Article[] = [];
  const hubs: Hub[] = [];
  const categories: CategoryPage[] = [];
  const areas: AreaPage[] = [];
  const scheduled = new Map<string, string>();

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
      const { fm, body, facts, raw } = read(hubFile, hubSchema);
      if (visible(fm.status, includeReview)) {
        hubs.push({ kind: "hub", fm, body, facts, raw, country, city, path: hubPath(country, city), file: hubFile });
      }
    }
    for (const name of mdxFiles(dir)) {
      const file = path.join(dir, name);
      const { fm, body, facts, raw } = read(file, articleSchema);
      if (fm.slug !== name.replace(/\.mdx$/, "")) {
        throw new Error(`Slug "${fm.slug}" does not match file name in ${file}`);
      }
      if (!getCategory(city ? "city" : "country", fm.category)) {
        throw new Error(`Unknown category "${fm.category}" for ${city ? "city" : "country"} article in ${file}`);
      }
      if (fm.area && (!city || !getArea(country, city, fm.area))) {
        throw new Error(`Unknown area "${fm.area}" for ${city ? `city ${city}` : "a country-level"} article in ${file}`);
      }
      if (!visible(fm.status, includeReview)) continue;
      const p = articlePath(country, city, fm.slug);
      if (enforceDates && fm.publishedAt > asOf) {
        scheduled.set(p, fm.publishedAt);
        continue;
      }
      articles.push({ kind: "article", fm, body, facts, raw, country, city, path: p, file });
    }
    const catDir = path.join(dir, "_categories");
    if (fs.existsSync(catDir)) {
      for (const name of fs.readdirSync(catDir).filter((f) => f.endsWith(".mdx"))) {
        const category = name.replace(/\.mdx$/, "");
        const file = path.join(catDir, name);
        const { fm, body, facts, raw } = read(file, categorySchema);
        const members = articles
          .filter((a) => a.country === country && a.city === city && a.fm.category === category)
          .sort(byUpdatedDesc);
        if (members.length === 0) continue;
        categories.push({
          kind: "category", fm, body, facts, raw, country, city, category,
          path: categoryPath(country, city, category), file, articles: members,
        });
      }
    }

    const areaDir = path.join(dir, "_areas");
    if (city && fs.existsSync(areaDir)) {
      for (const name of fs.readdirSync(areaDir).filter((f) => f.endsWith(".mdx"))) {
        const area = name.replace(/\.mdx$/, "");
        const file = path.join(areaDir, name);
        if (!getArea(country, city, area)) throw new Error(`Unknown area "${area}" for city ${city} in ${file}`);
        const { fm, body, facts, raw } = read(file, areaSchema);
        const members = articles
          .filter((a) => a.country === country && a.city === city && a.fm.area === area)
          .sort(byUpdatedDesc);
        if (members.length === 0) continue;
        areas.push({
          kind: "area", fm, body, facts, raw, country, city, area,
          path: areaPath(country, city, area), file, articles: members,
        });
      }
    }
  }

  articles.sort(byUpdatedDesc);
  const byPath = new Map<string, ContentNode>();
  for (const node of [...hubs, ...categories, ...areas, ...articles]) {
    if (byPath.has(node.path)) throw new Error(`Duplicate path ${node.path} (${node.file})`);
    byPath.set(node.path, node);
  }
  const index = { articles, hubs, categories, areas, byPath, scheduled };
  cache.set(key, index);
  return index;
}

export const getContent = () => loadContent({ includeReview: includeReviewByDefault() });
