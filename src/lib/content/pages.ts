import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";
import { faqSchema, sourceSchema } from "./schema";

export const STATIC_PAGES = [
  "about",
  "editorial-policy",
  "how-we-choose",
  "affiliate-disclosure",
  "privacy",
  "terms",
  "contact",
] as const;

export const pageSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(50),
  updatedAt: z.iso.date(),
  // Trust pages carry no facts, but the home page argues from the same sourced
  // numbers the guides do, so it needs the same apparatus.
  faqs: z.array(faqSchema).default([]),
  sources: z.array(sourceSchema).default([]),
});

export type PageFrontmatter = z.infer<typeof pageSchema>;

const DIR = path.join(process.cwd(), "src/content/pages");

export function getStaticPage(slug: string, dir: string = DIR) {
  const file = path.join(dir, `${slug}.mdx`);
  const { data, content } = matter(fs.readFileSync(file, "utf-8"));
  const parsed = pageSchema.safeParse(data);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    throw new Error(`Invalid frontmatter in ${file}: ${issues}`);
  }
  return { fm: parsed.data, body: content };
}

/** Sources declared by non-content pages (the home page today), for the refresh worklist. */
export function staticPageSources(dir: string = DIR) {
  const slugs = ["home", ...STATIC_PAGES];
  return slugs.flatMap((slug) => {
    const file = path.join(dir, `${slug}.mdx`);
    if (!fs.existsSync(file)) return [];
    const { fm } = getStaticPage(slug, dir);
    if (fm.sources.length === 0) return [];
    return [{ slug, file: rel(file), title: fm.title, sources: fm.sources }];
  });
}

const rel = (file: string) => file.replace(process.cwd(), "").replace(/\\/g, "/").replace(/^\//, "");
