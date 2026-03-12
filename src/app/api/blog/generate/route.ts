import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getExistingSlugs, insertBlogPost } from "@/lib/db";
import contentQueue from "@/data/content-queue.json";

const client = new Anthropic();

export async function GET(req: NextRequest) {
  // Cron secret validation
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Pick next ungenerated topic
    const existingSlugs = await getExistingSlugs();
    const next = contentQueue.find((item) => !existingSlugs.includes(item.slug));

    if (!next) {
      return NextResponse.json({ message: "All topics already generated" });
    }

    // Generate with Claude
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
- Practical, actionable advice
- Include specific recommendations (places, food, tips)
- Natural mentions of booking hotels on Agoda and activities on Klook where relevant
- Engaging, conversational tone for Gen Z / Millennial travelers
- Use markdown formatting (## headings, **bold**, bullet lists)
- End with a brief call-to-action paragraph

Return a JSON object with these exact fields:
{
  "description": "155-char meta description",
  "content": "full markdown blog post content",
  "read_time": estimated reading time in minutes (number)
}`,
        },
      ],
    });

    const rawText = message.content[0].type === "text" ? message.content[0].text : "";

    // Parse JSON from Claude's response
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Failed to parse Claude response");

    const parsed = JSON.parse(jsonMatch[0]);

    await insertBlogPost({
      slug: next.slug,
      title: next.title,
      description: parsed.description,
      category: next.category,
      city: next.city ?? null,
      country: next.country ?? null,
      tags: next.tags,
      content: parsed.content,
      image: null,
      read_time: parsed.read_time ?? 5,
    });

    return NextResponse.json({
      success: true,
      slug: next.slug,
      title: next.title,
    });
  } catch (error) {
    console.error("Blog generation error:", error);
    return NextResponse.json(
      { error: "Generation failed", detail: String(error) },
      { status: 500 }
    );
  }
}
