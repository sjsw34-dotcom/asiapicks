import { z } from "zod";

const isoDate = z.iso.date();

export const sourceSchema = z.object({
  title: z.string().min(1),
  url: z.url(),
  publisher: z.string().min(1),
  checkedAt: isoDate,
});

export const faqSchema = z.object({ q: z.string().min(1), a: z.string().min(1) });

export const statusSchema = z.enum(["draft", "review", "published"]);

export const articleSchema = z.object({
  title: z.string().min(1),
  seoTitle: z.string().min(1).optional(),
  description: z.string().min(50),
  slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  category: z.string().min(1),
  template: z.enum(["guide", "comparison", "best-of", "itinerary", "where-to-stay"]),
  journeyStage: z.enum(["discovery", "planning", "comparison", "booking", "on-trip"]),
  searchIntent: z.enum(["informational", "commercial", "transactional"]),
  primaryKeyword: z.string().min(1),
  secondaryKeywords: z.array(z.string()).default([]),
  summary: z.string().min(1),
  faqs: z.array(faqSchema).default([]),
  relatedArticles: z.array(z.string()).default([]),
  attractions: z.array(z.string()).default([]),
  offers: z.array(z.string()).default([]),
  featuredImage: z.string().optional(),
  gallery: z.array(z.string()).default([]),
  sources: z.array(sourceSchema).default([]),
  publishedAt: isoDate,
  updatedAt: isoDate,
  factCheckedAt: isoDate.optional(),
  status: statusSchema,
  author: z.string().default("editorial"),
  canonical: z.url().optional(),
  noindex: z.boolean().default(false),
});

export const hubSchema = z.object({
  title: z.string().min(1),
  seoTitle: z.string().min(1).optional(),
  description: z.string().min(50),
  summary: z.string().min(1),
  featuredImage: z.string().optional(),
  faqs: z.array(faqSchema).default([]),
  sources: z.array(sourceSchema).default([]),
  publishedAt: isoDate,
  updatedAt: isoDate,
  status: statusSchema,
  author: z.string().default("editorial"),
});

export const categorySchema = z.object({
  title: z.string().min(1),
  seoTitle: z.string().min(1).optional(),
  description: z.string().min(50),
  summary: z.string().min(1),
});

export type ArticleFrontmatter = z.infer<typeof articleSchema>;
export type HubFrontmatter = z.infer<typeof hubSchema>;
export type CategoryFrontmatter = z.infer<typeof categorySchema>;
export type ContentStatus = z.infer<typeof statusSchema>;
