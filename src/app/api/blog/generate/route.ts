import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { neon, NeonQueryFunction } from "@neondatabase/serverless";
import { getMDXPosts } from "@/lib/mdx";
import contentQueue from "@/data/content-queue.json";
import { getCityImage, UnsplashImage } from "@/lib/unsplash";

const CATEGORIES = [
  "travel-guides",
  "hotels-stays",
  "activities-tours",
  "travel-tips",
  "saju-travel",
] as const;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Sql = NeonQueryFunction<any, any>;

interface QueueItem {
  slug: string;
  title: string;
  city: string | null;
  country: string | null;
  category: string;
  tags: string[];
}

function getDb(): Sql {
  return neon(process.env.DATABASE_URL!) as Sql;
}

/** Get all slugs from DB to avoid duplicates */
async function getDbSlugs(sql: Sql): Promise<string[]> {
  const rows = (await sql`SELECT slug FROM blog_posts`) as Record<string, unknown>[];
  return rows.map((r) => r.slug as string);
}

/** Count posts per category in DB */
async function getDbCategoryCounts(sql: Sql): Promise<Record<string, number>> {
  const rows = (await sql`
    SELECT category, COUNT(*)::int as count
    FROM blog_posts
    GROUP BY category
  `) as Record<string, unknown>[];
  const counts: Record<string, number> = {};
  rows.forEach((r) => {
    counts[r.category as string] = r.count as number;
  });
  return counts;
}

/** Count MDX posts per category (static files) */
function getMdxCategoryCounts(): Record<string, number> {
  const posts = getMDXPosts();
  const counts: Record<string, number> = {};
  posts.forEach((p) => {
    const cat = p.frontmatter.category;
    counts[cat] = (counts[cat] ?? 0) + 1;
  });
  return counts;
}

/** Merge MDX + DB category counts */
function mergeCategoryCounts(
  mdxCounts: Record<string, number>,
  dbCounts: Record<string, number>
): Record<string, number> {
  const merged: Record<string, number> = {};
  CATEGORIES.forEach((cat) => {
    merged[cat] = (mdxCounts[cat] ?? 0) + (dbCounts[cat] ?? 0);
  });
  return merged;
}

/** Get all existing slugs (MDX + DB) */
function getMdxSlugs(): Set<string> {
  return new Set(getMDXPosts().map((p) => p.slug));
}

/** Use Claude to generate a topic for the least-covered category */
async function generateTopic(
  client: Anthropic,
  category: string,
  existingSlugs: Set<string>
): Promise<QueueItem> {
  const categoryDescriptions: Record<string, string> = {
    "travel-guides": "City itineraries, area guides, food guides for specific Asian destinations",
    "hotels-stays": "Best hotels/hostels/ryokan by city or area, where-to-stay guides",
    "activities-tours": "Specific attractions, tours, day trips, experiences with booking info",
    "travel-tips": "Practical tips: visa, budget, transport, packing, eSIM, safety",
    "saju-travel": "Korean astrology (Saju/Five Elements) meets travel: zodiac destinations, birth element guides, astrology travel trends",
  };

  const existingList = [...existingSlugs].slice(0, 30).join(", ");

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 500,
    messages: [
      {
        role: "user",
        content: `You are a content strategist for Asiapicks.com, an Asia travel affiliate site.

Generate ONE new blog post topic for the "${category}" category.
Category description: ${categoryDescriptions[category] ?? category}

Target audience: English-speaking travelers (US, Europe, Australia), aged 25-40, interested in Asia travel.
Focus countries: Japan, Thailand, Korea, Vietnam, plus Indonesia, Philippines, Taiwan, Cambodia, Malaysia.

Already published slugs (avoid duplicates): ${existingList}

Return ONLY a valid JSON object:
{
  "slug": "kebab-case-url-slug",
  "title": "SEO-optimized title (50-60 chars)",
  "city": "city-slug or null",
  "country": "country-name or null",
  "category": "${category}",
  "tags": ["tag1", "tag2", "tag3", "tag4"]
}`,
      },
    ],
  });

  const rawText = message.content[0].type === "text" ? message.content[0].text : "";
  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Failed to parse topic generation response");
  return JSON.parse(jsonMatch[0]) as QueueItem;
}

async function insertBlogPost(
  sql: Sql,
  post: {
    slug: string;
    title: string;
    description: string;
    category: string;
    city: string | null;
    country: string | null;
    tags: string[];
    content: string;
    image: string | null;
    read_time: number;
  }
) {
  await sql`
    INSERT INTO blog_posts (slug, title, description, category, city, country, tags, content, image, read_time)
    VALUES (
      ${post.slug}, ${post.title}, ${post.description}, ${post.category},
      ${post.city}, ${post.country}, ${post.tags}, ${post.content},
      ${post.image}, ${post.read_time}
    )
  `;
}

export async function GET(req: NextRequest) {
  // Auth check
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sql = getDb();
    const client = new Anthropic();

    // Gather existing slugs from both sources
    const mdxSlugs = getMdxSlugs();
    const dbSlugs = await getDbSlugs(sql);
    const allSlugs = new Set([...mdxSlugs, ...dbSlugs]);

    // Count posts per category (MDX + DB combined)
    const mdxCounts = getMdxCategoryCounts();
    const dbCounts = await getDbCategoryCounts(sql);
    const categoryCounts = mergeCategoryCounts(mdxCounts, dbCounts);

    // Sort categories by fewest posts first
    const sortedCategories = [...CATEGORIES].sort(
      (a, b) => (categoryCounts[a] ?? 0) - (categoryCounts[b] ?? 0)
    );

    // Find next queue item, prioritizing least-covered category
    const remaining = (contentQueue as QueueItem[]).filter(
      (item) => !allSlugs.has(item.slug)
    );

    let next: QueueItem | null = null;

    for (const category of sortedCategories) {
      next = remaining.find((item) => item.category === category) ?? null;
      if (next) break;
    }

    // If queue is exhausted, auto-generate a topic for the least-covered category
    if (!next) {
      const targetCategory = sortedCategories[0];
      console.log(`Queue exhausted. Auto-generating topic for: ${targetCategory}`);
      next = await generateTopic(client, targetCategory, allSlugs);

      // Prevent duplicate slug collision
      if (allSlugs.has(next.slug)) {
        next.slug = `${next.slug}-${Date.now().toString(36).slice(-4)}`;
      }
    }

    console.log(`Generating: ${next.slug} (${next.category})`);

    // Fetch Unsplash images BEFORE content generation so we can embed them
    // Try multiple fallback queries to guarantee at least 1 image
    const imageQueries: [string, string][] = [
      [next.city ?? next.tags[0] ?? "asia", next.country ?? "asia"],
      ...(next.tags.length > 0
        ? [[next.tags[0], next.country ?? next.city ?? "asia"] as [string, string]]
        : []),
      ...(next.city ? [[next.city, "cityscape"] as [string, string]] : []),
      ...(next.country ? [[next.country, "travel"] as [string, string]] : []),
      ["asia", "travel destination"],
    ];

    let unsplashImages: UnsplashImage[] = [];
    for (const [city, country] of imageQueries) {
      try {
        console.log(`Trying Unsplash query: "${city} ${country} travel"`);
        const images = await getCityImage(city, country);
        if (images.length > 0) {
          const existingUrls = new Set(unsplashImages.map((i) => i.url));
          for (const img of images) {
            if (!existingUrls.has(img.url) && unsplashImages.length < 5) {
              unsplashImages.push(img);
            }
          }
        }
        if (unsplashImages.length >= 3) break;
      } catch {
        console.warn(`Unsplash query failed for "${city} ${country}"`);
      }
    }

    // HARD REQUIREMENT: at least 1 image must be available
    if (unsplashImages.length === 0) {
      console.error("All Unsplash queries failed — aborting post generation");
      return NextResponse.json(
        {
          error: "Image fetch failed",
          detail: "Could not fetch any Unsplash images after multiple queries. Check UNSPLASH_ACCESS_KEY and API rate limits.",
        },
        { status: 500 }
      );
    }

    // Build image info for the prompt
    const imageList = unsplashImages
      .map(
        (img, i) =>
          `[IMAGE_${i + 1}]: url="${img.url}" alt="${img.alt}" credit="${img.credit.name}"`
      )
      .join("\n");

    const imageInstruction = unsplashImages.length > 0
      ? `\n\nIMAGES — You MUST embed these images in the content using markdown syntax. Place them naturally between sections (after introductory paragraphs, between H2 sections, etc.). Use ALL provided images:
${imageList}

Format each as: ![descriptive alt text](url)
After each image, add a small credit line: *Photo by Credit Name*
Place the first image right after the opening paragraph (before the first H2).`
      : "";

    // Build the content generation prompt based on category
    const isSajuCategory = next.category === "saju-travel";
    const sajuAngle = isSajuCategory
      ? `\n- This is a Saju (Korean astrology) x Travel post. Introduce Western zodiac/astrology trends first, then transition naturally: "But Korea has its own ancient system called Saju..." Frame Saju as the Eastern alternative to Western zodiac.
- Include a CTA to sajumuse.com for free Saju reading.`
      : `\n- At the end, add one subtle line: "Curious which destinations match your birth energy? Discover your travel element at sajumuse.com"`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: `You are an expert Asia travel writer for Asiapicks.com, targeting English-speaking travelers (US, Europe, Australia, ages 25-40).

Write a comprehensive, SEO-optimized travel blog post:

Title: ${next.title}
City: ${next.city ?? "Multiple destinations"}
Country: ${next.country ?? "Asia"}
Category: ${next.category}
Tags: ${next.tags.join(", ")}

Requirements:
- 1000-1500 words of engaging, practical content
- Use markdown: ## for H2 (4-6 sections), ### for H3, **bold**, bullet/numbered lists, tables where useful
- Include specific names, prices (USD), addresses, transport details
- Conversational but authoritative tone — like a well-traveled friend giving advice
- Naturally mention booking hotels on Agoda and activities/tours on Klook where relevant (don't force it)
- Include a practical tips section near the end${sajuAngle}${imageInstruction}

Return ONLY a valid JSON object with these exact fields:
{
  "description": "155-char meta description for SEO",
  "content": "full markdown blog post content (no frontmatter)",
  "read_time": number
}`,
        },
      ],
    });

    const rawText =
      message.content[0].type === "text" ? message.content[0].text : "";

    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Failed to parse Claude response as JSON");

    const parsed = JSON.parse(jsonMatch[0]);

    // Use first Unsplash image as hero
    const heroImage = unsplashImages[0]?.url ?? null;

    // Save to DB
    await insertBlogPost(sql, {
      slug: next.slug,
      title: next.title,
      description: parsed.description,
      category: next.category,
      city: next.city ?? null,
      country: next.country ?? null,
      tags: next.tags,
      content: parsed.content,
      image: heroImage,
      read_time: parsed.read_time ?? 5,
    });

    return NextResponse.json({
      success: true,
      slug: next.slug,
      title: next.title,
      category: next.category,
      categoryCounts,
      queueRemaining: remaining.length,
      autoGenerated: remaining.length === 0,
    });
  } catch (error) {
    console.error("Blog generation error:", error);
    return NextResponse.json(
      { error: "Generation failed", detail: String(error) },
      { status: 500 }
    );
  }
}
