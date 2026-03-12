/**
 * scripts/generate-post.ts
 *
 * Reads content-queue.json, finds the next ungenerated slug,
 * calls Claude API to write an MDX travel post, fetches an
 * Unsplash hero image, then saves the result to src/content/blog/.
 *
 * Usage:
 *   npx tsx scripts/generate-post.ts
 *   npx tsx scripts/generate-post.ts --slug best-street-food-bangkok
 */

import fs from "fs";
import path from "path";
import Anthropic from "@anthropic-ai/sdk";

// ── Config ──────────────────────────────────────────────────────────────────
const QUEUE_PATH = path.resolve(__dirname, "content-queue.json");
const BLOG_DIR = path.resolve(__dirname, "../src/content/blog");
const DESTINATIONS_DIR = path.resolve(
  __dirname,
  "../src/data/destinations"
);

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

if (!ANTHROPIC_API_KEY) {
  console.error("❌  ANTHROPIC_API_KEY is not set");
  process.exit(1);
}

// ── Types ────────────────────────────────────────────────────────────────────
interface QueueItem {
  slug: string;
  title: string;
  city: string | null;
  country: string | null;
  category: string;
  tags: string[];
  showHotels: boolean;
  showActivities: boolean;
  showSajuInsight: boolean;
}

interface UnsplashResult {
  url: string;
  credit: { name: string; link: string };
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function getExistingSlugs(): Set<string> {
  const files = fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
  return new Set(files);
}

function loadCityData(country: string, city: string): object | null {
  try {
    const filePath = path.join(
      DESTINATIONS_DIR,
      country,
      `${city}.json`
    );
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return null;
  }
}

async function fetchUnsplashImage(
  query: string
): Promise<UnsplashResult | null> {
  if (!UNSPLASH_ACCESS_KEY) return null;
  try {
    const encoded = encodeURIComponent(query);
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encoded}&per_page=3&orientation=landscape`,
      {
        headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` },
      }
    );
    const data = (await res.json()) as {
      results: {
        urls: { regular: string };
        user: { name: string; links: { html: string } };
      }[];
    };
    const photo = data.results?.[0];
    if (!photo) return null;
    return {
      url: photo.urls.regular,
      credit: { name: photo.user.name, link: photo.user.links.html },
    };
  } catch {
    return null;
  }
}

function today(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

// ── Prompt builder ───────────────────────────────────────────────────────────

function buildPrompt(item: QueueItem, cityData: object | null): string {
  const cityContext = cityData
    ? `\n\nCity data (JSON — use for accurate details):\n${JSON.stringify(
        cityData,
        null,
        2
      )}`
    : "";

  return `You are an expert Asia travel editor writing for Asiapicks (asiapicks.com), an affiliate travel site targeting English-speaking travelers (US, Europe, Australia).

Write a comprehensive MDX blog post for the following topic:

Title: ${item.title}
Slug: ${item.slug}
Category: ${item.category}
Tags: ${item.tags.join(", ")}
City: ${item.city ?? "N/A"}
Country: ${item.country ?? "N/A"}
Show Hotels section: ${item.showHotels}
Show Activities section: ${item.showActivities}
Show Saju Insight: ${item.showSajuInsight}${cityContext}

Requirements:
1. Write 800–1200 words of engaging, practical travel content in English.
2. Use proper MDX formatting: ## for H2 headings, ### for H3, **bold**, *italic*, bullet lists, numbered lists.
3. Include 4–6 H2 sections with clear, SEO-friendly headings.
4. Naturally weave in the topic-specific details. Use specific names, places, prices from the city data when available.
5. Include a practical tips section near the end.
6. Use an <AffiliateCTA variant="${item.showHotels ? "hotel" : item.showActivities ? "activity" : "saju"}" /> component once in the middle of the article (just drop the JSX tag on its own line).
7. Do NOT invent hotel IDs or activity IDs — leave those to the auto-injected sections.
8. Keep the tone informative but conversational — like advice from a well-traveled friend.
9. Write a compelling meta description (150–155 chars) for the frontmatter.
10. Estimate a realistic read time (minutes).

Output ONLY the complete MDX file starting from the frontmatter fence, no extra commentary:

---
title: "${item.title}"
slug: "${item.slug}"
description: "<write 150-155 char description here>"
date: "${today()}"
updated: "${today()}"
category: "${item.category}"
city: "${item.city ?? ""}"
country: "${item.country ?? ""}"
tags: [${item.tags.map((t) => `"${t}"`).join(", ")}]
image: "PLACEHOLDER_IMAGE"
heroImageCredit: "PLACEHOLDER_CREDIT"
readTime: <number>
showHotels: ${item.showHotels}
showActivities: ${item.showActivities}
showSajuInsight: ${item.showSajuInsight}
sajuInsightText: ""
---

<actual MDX content here>`;
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  // Allow --slug override from CLI
  const slugArg = process.argv.find((a) => a.startsWith("--slug="))?.split("=")[1];

  const queue: QueueItem[] = JSON.parse(
    fs.readFileSync(QUEUE_PATH, "utf-8")
  );
  const existing = getExistingSlugs();

  let item: QueueItem | undefined;

  if (slugArg) {
    item = queue.find((q) => q.slug === slugArg);
    if (!item) {
      console.error(`❌  Slug "${slugArg}" not found in content-queue.json`);
      process.exit(1);
    }
  } else {
    // Pick the first slug that hasn't been generated yet
    item = queue.find((q) => !existing.has(q.slug));
  }

  if (!item) {
    console.log("✅  All queue items have already been generated.");
    process.exit(0);
  }

  console.log(`\n🚀  Generating: ${item.slug}`);
  console.log(`    Title: ${item.title}`);

  // Load city JSON for context (if available)
  const cityData =
    item.country && item.city
      ? loadCityData(item.country, item.city)
      : null;

  if (cityData) {
    console.log(`    City data loaded: ${item.city}, ${item.country}`);
  } else {
    console.log(`    No city data found — generating without context`);
  }

  // Fetch Unsplash image
  const imageQuery = item.city
    ? `${item.city} ${item.country} travel`
    : `${item.title} asia travel`;

  console.log(`    Fetching Unsplash image for: "${imageQuery}"`);
  const unsplash = await fetchUnsplashImage(imageQuery);

  if (unsplash) {
    console.log(`    Image: ${unsplash.url.slice(0, 60)}...`);
    console.log(`    Credit: ${unsplash.credit.name}`);
  } else {
    console.log(`    No Unsplash image found (key missing or API error)`);
  }

  // Call Claude API
  console.log(`\n🤖  Calling Claude API...`);
  const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

  const message = await client.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: buildPrompt(item, cityData),
      },
    ],
  });

  const rawContent = message.content[0];
  if (rawContent.type !== "text") {
    console.error("❌  Unexpected response type from Claude");
    process.exit(1);
  }

  let mdxContent = rawContent.text.trim();

  // Replace image placeholders with actual Unsplash data
  if (unsplash) {
    mdxContent = mdxContent
      .replace(/"PLACEHOLDER_IMAGE"/, `"${unsplash.url}"`)
      .replace(
        /"PLACEHOLDER_CREDIT"/,
        `"Photo by ${unsplash.credit.name} on Unsplash"`
      );
  } else {
    mdxContent = mdxContent
      .replace(/"PLACEHOLDER_IMAGE"/, `""`)
      .replace(/"PLACEHOLDER_CREDIT"/, `""`);
  }

  // Ensure the file starts with the frontmatter fence
  if (!mdxContent.startsWith("---")) {
    const fenceStart = mdxContent.indexOf("---");
    if (fenceStart !== -1) {
      mdxContent = mdxContent.slice(fenceStart);
    } else {
      console.error("❌  Claude response does not contain valid MDX frontmatter");
      console.error(mdxContent.slice(0, 300));
      process.exit(1);
    }
  }

  // Save to content/blog/
  const outPath = path.join(BLOG_DIR, `${item.slug}.mdx`);
  fs.writeFileSync(outPath, mdxContent, "utf-8");

  console.log(`\n✅  Saved to: ${outPath}`);
  console.log(`    Words: ~${mdxContent.split(/\s+/).length}`);
}

main().catch((err) => {
  console.error("❌  Fatal error:", err);
  process.exit(1);
});
