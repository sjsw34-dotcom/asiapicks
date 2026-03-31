/**
 * Fix existing DB blog posts that have no images.
 * Fetches Unsplash images and injects them into the content.
 *
 * Usage: npx tsx scripts/fix-post-images.ts [slug]
 * Example: npx tsx scripts/fix-post-images.ts osaka-castle-guide
 * Without slug: fixes ALL posts missing images.
 */

import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
config({ path: ".env.local" });

interface UnsplashPhoto {
  urls: { regular: string; small: string };
  blur_hash: string;
  alt_description: string | null;
  user: {
    name: string;
    links: { html: string };
  };
}

interface UnsplashImage {
  url: string;
  alt: string;
  credit: string;
}

async function fetchImages(query: string): Promise<UnsplashImage[]> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) throw new Error("UNSPLASH_ACCESS_KEY not set");

  const res = await fetch(
    `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=5&orientation=landscape`,
    { headers: { Authorization: `Client-ID ${accessKey}` } }
  );

  if (!res.ok) throw new Error(`Unsplash API error: ${res.status}`);
  const data = await res.json();

  return data.results.map((photo: UnsplashPhoto) => ({
    url: photo.urls.regular,
    alt: photo.alt_description || query,
    credit: photo.user.name,
  }));
}

function injectImagesIntoContent(
  content: string,
  images: UnsplashImage[]
): string {
  if (images.length === 0) return content;

  const lines = content.split("\n");
  const h2Indices: number[] = [];

  lines.forEach((line, i) => {
    if (line.startsWith("## ")) h2Indices.push(i);
  });

  // Insert images at strategic positions:
  // - After first paragraph (before first H2)
  // - Between H2 sections
  const insertPoints: number[] = [];

  // First: after the opening paragraph (before first H2)
  if (h2Indices.length > 0) {
    insertPoints.push(h2Indices[0]);
  }

  // Then between every other H2
  for (let i = 1; i < h2Indices.length; i += 2) {
    insertPoints.push(h2Indices[i]);
  }

  // Insert images in reverse order to preserve indices
  let imgIdx = 0;
  const sortedPoints = insertPoints.sort((a, b) => b - a);
  for (const point of sortedPoints) {
    if (imgIdx >= images.length) break;
    const img = images[imgIdx];
    const imgMarkdown = `\n![${img.alt}](${img.url})\n*Photo by ${img.credit}*\n`;
    lines.splice(point, 0, imgMarkdown);
    imgIdx++;
  }

  return lines.join("\n");
}

async function main() {
  const sql = neon(process.env.DATABASE_URL!);
  const targetSlug = process.argv[2];

  let posts: Record<string, unknown>[];

  if (targetSlug) {
    posts = (await sql`
      SELECT id, slug, title, city, country, tags, content, image
      FROM blog_posts WHERE slug = ${targetSlug}
    `) as Record<string, unknown>[];
  } else {
    // Fix all posts that have no hero image OR whose content has no images
    posts = (await sql`
      SELECT id, slug, title, city, country, tags, content, image
      FROM blog_posts
      WHERE image IS NULL OR content NOT LIKE '%![%'
    `) as Record<string, unknown>[];
  }

  console.log(`Found ${posts.length} post(s) to fix`);

  for (const post of posts) {
    const slug = post.slug as string;
    const city = post.city as string | null;
    const country = post.country as string | null;
    const tags = post.tags as string[];
    const content = post.content as string;
    const currentImage = post.image as string | null;

    console.log(`\nFixing: ${slug}`);

    // Build search query
    const query = city && country
      ? `${city} ${country} travel`
      : tags.slice(0, 2).join(" ") + " asia travel";

    try {
      const images = await fetchImages(query);

      if (images.length === 0) {
        console.log(`  No images found for query: ${query}`);
        continue;
      }

      // Update hero image if missing
      const heroImage = currentImage || images[0].url;

      // Inject images into content if none exist
      const hasContentImages = content.includes("![");
      const updatedContent = hasContentImages
        ? content
        : injectImagesIntoContent(content, images);

      await sql`
        UPDATE blog_posts
        SET image = ${heroImage}, content = ${updatedContent}, updated_at = NOW()
        WHERE slug = ${slug}
      `;

      console.log(`  ✓ Hero image: ${heroImage ? "set" : "unchanged"}`);
      console.log(`  ✓ Content images: ${hasContentImages ? "already present" : `${images.length} injected`}`);
    } catch (err) {
      console.error(`  ✗ Error: ${err}`);
    }
  }

  console.log("\nDone!");
}

main().catch(console.error);
