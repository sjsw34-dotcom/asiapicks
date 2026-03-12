import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { neon, NeonQueryFunction } from "@neondatabase/serverless";
import contentQueue from "@/data/content-queue.json";
import { getCityImage } from "@/lib/unsplash";

const client = new Anthropic();

const CATEGORIES = [
  "travel-guides",
  "hotels-stays",
  "activities-tours",
  "travel-tips",
  "saju-travel",
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Sql = NeonQueryFunction<any, any>;

function getDb(): Sql {
  return neon(process.env.DATABASE_URL!) as Sql;
}

async function getExistingSlugs(sql: Sql): Promise<string[]> {
  const rows = (await sql`SELECT slug FROM blog_posts`) as Record<string, unknown>[];
  return rows.map((r) => r.slug as string);
}

async function getCategoryCount(sql: Sql): Promise<Record<string, number>> {
  const rows = (await sql`
    SELECT category, COUNT(*)::int as count
    FROM blog_posts
    GROUP BY category
  `) as Record<string, unknown>[];
  const counts: Record<string, number> = {};
  CATEGORIES.forEach((c) => (counts[c] = 0));
  rows.forEach((r) => {
    counts[r.category as string] = r.count as number;
  });
  return counts;
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
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sql = await getDb();
    const existingSlugs = await getExistingSlugs(sql);
    const categoryCounts = await getCategoryCount(sql);

    // 아직 생성 안 된 항목만 필터
    const remaining = contentQueue.filter(
      (item) => !existingSlugs.includes(item.slug)
    );

    if (remaining.length === 0) {
      return NextResponse.json({ message: "All topics already generated" });
    }

    // 카테고리별 포스트 수가 적은 순서로 정렬 → 그 카테고리의 첫 번째 항목 선택
    const sortedCategories = [...CATEGORIES].sort(
      (a, b) => (categoryCounts[a] ?? 0) - (categoryCounts[b] ?? 0)
    );

    let next = null;
    for (const category of sortedCategories) {
      next = remaining.find((item) => item.category === category);
      if (next) break;
    }

    // 모든 카테고리 소진 시 queue 순서대로
    if (!next) next = remaining[0];

    // Claude로 생성
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4000,
      messages: [
        {
          role: "user",
          content: `You are an expert Asia travel writer for Asiapicks.com, targeting English-speaking travelers (US, Europe, Australia).

Write a comprehensive, SEO-optimized travel blog post for the following topic:

Title: ${next.title}
City: ${next.city ?? "Multiple destinations"}
Country: ${next.country ?? "Asia"}
Category: ${next.category}
Tags: ${next.tags.join(", ")}

Requirements:
- 800-1200 words
- Practical, actionable advice with specific recommendations
- Natural mentions of booking hotels on Agoda and activities on Klook where relevant
- Engaging, conversational tone for Gen Z / Millennial travelers
- Use markdown formatting (## headings, **bold**, bullet lists, tables)
- End with a brief call-to-action paragraph

Return ONLY a valid JSON object with these exact fields:
{
  "description": "155-char meta description",
  "content": "full markdown blog post content",
  "read_time": estimated reading time in minutes as a number
}`,
        },
      ],
    });

    const rawText =
      message.content[0].type === "text" ? message.content[0].text : "";

    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Failed to parse Claude response");

    const parsed = JSON.parse(jsonMatch[0]);

    // Fetch hero image from Unsplash
    let heroImage: string | null = null;
    if (next.city && next.country) {
      const images = await getCityImage(next.city, next.country).catch(() => []);
      heroImage = images[0]?.url ?? null;
    }

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
    });
  } catch (error) {
    console.error("Blog generation error:", error);
    return NextResponse.json(
      { error: "Generation failed", detail: String(error) },
      { status: 500 }
    );
  }
}
