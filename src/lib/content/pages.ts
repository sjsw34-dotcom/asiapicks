import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";

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
});

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
