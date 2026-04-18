/**
 * scripts/generate-post.ts
 *
 * GitHub Actions auto-blog script.
 * Picks the next topic (queue → auto-generate), calls Claude API,
 * fetches Unsplash images, and saves as MDX to src/content/blog/.
 *
 * Features ported from the former Vercel Cron /api/blog/generate route:
 *  - Category balancing (least-covered category first)
 *  - Auto-topic generation when queue is exhausted
 *  - Multiple Unsplash images embedded in body
 *  - MDX slug dedup
 *
 * Usage:
 *   npx tsx scripts/generate-post.ts
 *   npx tsx scripts/generate-post.ts --slug best-street-food-bangkok
 */

import fs from "fs";
import path from "path";
import Anthropic from "@anthropic-ai/sdk";

// ── Config ──────────────────────────────────────────────────────────────────
const QUEUE_PATH = path.resolve(__dirname, "../src/data/content-queue.json");
const BLOG_DIR = path.resolve(__dirname, "../src/content/blog");
const DESTINATIONS_DIR = path.resolve(__dirname, "../src/data/destinations");

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

if (!ANTHROPIC_API_KEY) {
  console.error("❌  ANTHROPIC_API_KEY is not set");
  process.exit(1);
}
if (!UNSPLASH_ACCESS_KEY) {
  console.error("❌  UNSPLASH_ACCESS_KEY is not set");
  process.exit(1);
}

const CATEGORIES = [
  "travel-guides",
  "hotels-stays",
  "activities-tours",
  "travel-tips",
  "saju-travel",
] as const;

// ── Types ────────────────────────────────────────────────────────────────────
interface QueueItem {
  slug: string;
  title: string;
  city: string | null;
  country: string | null;
  category: string;
  tags: string[];
}

interface UnsplashResult {
  url: string;
  alt: string;
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

/** Count MDX posts per category by reading frontmatter */
function getCategoryCounts(slugs: Set<string>): Record<string, number> {
  const counts: Record<string, number> = {};
  CATEGORIES.forEach((c) => (counts[c] = 0));

  for (const slug of slugs) {
    const filePath = path.join(BLOG_DIR, `${slug}.mdx`);
    try {
      const raw = fs.readFileSync(filePath, "utf-8");
      const match = raw.match(/^---[\s\S]*?category:\s*"?([^"\n]+)"?/m);
      if (match) {
        const cat = match[1].trim();
        counts[cat] = (counts[cat] ?? 0) + 1;
      }
    } catch { /* skip */ }
  }
  return counts;
}

function loadCityData(country: string, city: string): object | null {
  try {
    const filePath = path.join(DESTINATIONS_DIR, country, `${city}.json`);
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch {
    return null;
  }
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

// ── Unsplash ────────────────────────────────────────────────────────────────

async function fetchUnsplashImages(
  query: string,
  perPage = 3
): Promise<UnsplashResult[]> {
  try {
    const encoded = encodeURIComponent(query);
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encoded}&per_page=${perPage}&orientation=landscape`,
      { headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` } }
    );
    if (!res.ok) {
      console.error(`    Unsplash API error: ${res.status} ${res.statusText}`);
      return [];
    }
    const data = (await res.json()) as {
      results: {
        urls: { regular: string };
        alt_description: string | null;
        user: { name: string; links: { html: string } };
      }[];
    };
    return data.results.map((photo) => ({
      url: photo.urls.regular,
      alt: photo.alt_description || `${query} travel photo`,
      credit: {
        name: photo.user.name,
        link: `${photo.user.links.html}?utm_source=asiapicks&utm_medium=referral`,
      },
    }));
  } catch (err) {
    console.error(`    Unsplash fetch error:`, err);
    return [];
  }
}

async function fetchUnsplashWithRetries(
  queries: string[]
): Promise<UnsplashResult[]> {
  const images: UnsplashResult[] = [];
  const seen = new Set<string>();

  for (const query of queries) {
    console.log(`    Trying Unsplash query: "${query}"`);
    const results = await fetchUnsplashImages(query);
    for (const img of results) {
      if (!seen.has(img.url) && images.length < 5) {
        seen.add(img.url);
        images.push(img);
      }
    }
    if (images.length >= 3) break;
  }
  return images;
}

// ── Auto-topic generation ───────────────────────────────────────────────────

async function generateTopic(
  client: Anthropic,
  category: string,
  existingSlugs: Set<string>
): Promise<QueueItem> {
  const categoryDescriptions: Record<string, string> = {
    "travel-guides":
      "City itineraries, area guides, food guides for specific Asian destinations",
    "hotels-stays":
      "Best hotels/hostels/ryokan by city or area, where-to-stay guides",
    "activities-tours":
      "Specific attractions, tours, day trips, experiences with booking info",
    "travel-tips":
      "Practical tips: visa, budget, transport, packing, eSIM, safety",
    "saju-travel":
      "Korean astrology (Saju/Five Elements) meets travel: zodiac destinations, birth element guides, astrology travel trends",
  };

  const existingList = [...existingSlugs].slice(0, 50).join(", ");

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

  const rawText =
    message.content[0].type === "text" ? message.content[0].text : "";
  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Failed to parse topic generation response");
  return JSON.parse(jsonMatch[0]) as QueueItem;
}

// ── Content prompt builder ──────────────────────────────────────────────────

function buildContentPrompt(
  item: QueueItem,
  cityData: object | null,
  images: UnsplashResult[]
): string {
  const cityContext = cityData
    ? `\n\nCity data (JSON — use for accurate prices, names, transport):\n${JSON.stringify(cityData, null, 2)}`
    : "";

  const isSajuCategory = item.category === "saju-travel";
  const sajuAngle = isSajuCategory
    ? `\n- This is a Saju (Korean astrology) x Travel post. Introduce Western zodiac/astrology trends first, then transition naturally: "But Korea has its own ancient system called Saju..." Frame Saju as the Eastern alternative to Western zodiac.
- Include a CTA to sajumuse.com for free Saju reading.`
    : `\n- At the end, add one subtle line: "Curious which destinations match your birth energy? Discover your travel element at [sajumuse.com](https://sajumuse.com?ref=tripmuse-asia)"`;

  const imageList = images
    .map(
      (img, i) =>
        `[IMAGE_${i + 1}]: url="${img.url}" alt="${img.alt}" credit="${img.credit.name}" credit_link="${img.credit.link}"`
    )
    .join("\n");

  const imageInstruction =
    images.length > 0
      ? `\n\nIMAGES — You MUST embed these images in the content using markdown syntax. Place them naturally between sections (after introductory paragraphs, between H2 sections, etc.). Use ALL provided images:
${imageList}

Format each as: ![descriptive alt text](url)
After each image, add a small credit line: *Photo by [Credit Name](credit_link) on Unsplash*
Place the first image right after the opening paragraph (before the first H2).`
      : "";

  return `You are an expert Asia travel writer for Asiapicks.com, targeting English-speaking travelers (US, Europe, Australia, ages 25-40).

Write a comprehensive, SEO-optimized travel blog post:

Title: ${item.title}
City: ${item.city ?? "Multiple destinations"}
Country: ${item.country ?? "Asia"}
Category: ${item.category}
Tags: ${item.tags.join(", ")}${cityContext}

Requirements:
- 1000-1500 words of engaging, practical content
- Use proper MDX formatting: ## for H2 (4-6 sections), ### for H3, **bold**, *italic*, bullet lists, numbered lists, tables where useful
- Include specific names, prices (USD), addresses, transport details
- Conversational but authoritative tone — like a well-traveled friend giving advice
- Naturally mention booking hotels on Agoda and activities/tours on Klook where relevant (don't force it)
- Include a practical tips section near the end
- Use an <AffiliateCTA variant="${item.category === "hotels-stays" ? "hotel" : item.category === "activities-tours" ? "activity" : "saju"}" /> component once in the middle of the article (just drop the JSX tag on its own line)${sajuAngle}${imageInstruction}

Write a compelling meta description (150-155 chars).
Estimate a realistic read time (minutes).

Output ONLY the complete MDX file starting from the frontmatter fence, no extra commentary:

---
title: "${item.title}"
slug: "${item.slug}"
description: "<write 150-155 char meta description>"
date: "${today()}"
updated: "${today()}"
category: "${item.category}"
city: ${item.city ? `"${item.city}"` : "null"}
country: ${item.country ? `"${item.country}"` : "null"}
tags: [${item.tags.map((t) => `"${t}"`).join(", ")}]
image: "${images[0]?.url ?? ""}"
heroImageCredit: "Photo by ${images[0]?.credit.name ?? "Unsplash"} on Unsplash"
readTime: <number>
showHotels: ${item.category === "hotels-stays" || item.category === "travel-guides"}
showActivities: ${item.category === "activities-tours" || item.category === "travel-guides"}
showSajuInsight: ${isSajuCategory}
sajuInsightText: ""
---

<actual MDX content here>`;
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const slugArg = process.argv
    .find((a) => a.startsWith("--slug="))
    ?.split("=")[1];

  const queue: QueueItem[] = JSON.parse(fs.readFileSync(QUEUE_PATH, "utf-8"));
  const existingSlugs = getExistingSlugs();
  const categoryCounts = getCategoryCounts(existingSlugs);

  console.log("\n📊  Category counts:");
  Object.entries(categoryCounts).forEach(([cat, count]) =>
    console.log(`    ${cat}: ${count}`)
  );

  const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

  let item: QueueItem | undefined;

  if (slugArg) {
    // Manual override
    item = queue.find((q) => q.slug === slugArg);
    if (!item) {
      console.error(`❌  Slug "${slugArg}" not found in content-queue.json`);
      process.exit(1);
    }
  } else {
    // Category-balanced selection: sort categories by fewest posts first
    const sortedCategories = [...CATEGORIES].sort(
      (a, b) => (categoryCounts[a] ?? 0) - (categoryCounts[b] ?? 0)
    );
    const remaining = queue.filter((q) => !existingSlugs.has(q.slug));

    for (const category of sortedCategories) {
      item = remaining.find((q) => q.category === category);
      if (item) break;
    }

    // Queue exhausted → auto-generate topic
    if (!item) {
      const targetCategory = sortedCategories[0];
      console.log(
        `\n🔄  Queue exhausted. Auto-generating topic for: ${targetCategory}`
      );
      const generated = await generateTopic(
        client,
        targetCategory,
        existingSlugs
      );

      // Prevent slug collision
      if (existingSlugs.has(generated.slug)) {
        generated.slug = `${generated.slug}-${Date.now().toString(36).slice(-4)}`;
      }

      item = generated;
      console.log(`    Generated: "${item.title}" (${item.slug})`);
    }
  }

  if (existingSlugs.has(item.slug)) {
    console.log(`⏭️  "${item.slug}" already exists. Skipping.`);
    process.exit(0);
  }

  console.log(`\n🚀  Generating: ${item.slug}`);
  console.log(`    Title: ${item.title}`);
  console.log(`    Category: ${item.category}`);

  // Load city JSON context
  const cityData =
    item.country && item.city
      ? loadCityData(item.country, item.city)
      : null;

  if (cityData) {
    console.log(`    City data loaded: ${item.city}, ${item.country}`);
  }

  // Fetch Unsplash images (multiple fallback queries)
  const imageQueries: string[] = [];
  if (item.city && item.country) {
    imageQueries.push(`${item.city} ${item.country} travel`);
    imageQueries.push(`${item.city} ${item.country}`);
    imageQueries.push(`${item.city} cityscape`);
  }
  if (item.country) imageQueries.push(`${item.country} travel`);
  imageQueries.push(`${item.title} asia travel`);
  imageQueries.push("asia travel destination");

  console.log(`\n🖼️  Fetching Unsplash images...`);
  const images = await fetchUnsplashWithRetries(imageQueries);

  if (images.length === 0) {
    console.error("❌  Failed to fetch any Unsplash images. Aborting.");
    process.exit(1);
  }
  console.log(`    ✅ ${images.length} image(s) fetched`);

  // Call Claude API
  console.log(`\n🤖  Calling Claude API...`);
  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: buildContentPrompt(item, cityData, images),
      },
    ],
  });

  const rawContent = message.content[0];
  if (rawContent.type !== "text") {
    console.error("❌  Unexpected response type from Claude");
    process.exit(1);
  }

  let mdxContent = rawContent.text.trim();

  // Ensure starts with frontmatter
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

  // Save
  const outPath = path.join(BLOG_DIR, `${item.slug}.mdx`);
  fs.writeFileSync(outPath, mdxContent, "utf-8");

  console.log(`\n✅  Saved to: ${outPath}`);
  console.log(`    Words: ~${mdxContent.split(/\s+/).length}`);
}

main().catch((err) => {
  console.error("❌  Fatal error:", err);
  process.exit(1);
});
