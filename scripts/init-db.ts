import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const sql = neon(process.env.DATABASE_URL!);

async function init() {
  console.log("Initializing database...");

  await sql`
    CREATE TABLE IF NOT EXISTS blog_posts (
      id SERIAL PRIMARY KEY,
      slug VARCHAR(255) UNIQUE NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      category VARCHAR(100),
      city VARCHAR(100),
      country VARCHAR(100),
      tags TEXT[],
      content TEXT NOT NULL,
      image TEXT,
      read_time INTEGER DEFAULT 5,
      published_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published_at DESC)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category)`;

  console.log("✅ Table blog_posts created (or already exists)");

  // 현재 카테고리별 카운트 확인
  const counts = await sql`
    SELECT category, COUNT(*) as count
    FROM blog_posts
    GROUP BY category
    ORDER BY count ASC
  `;

  if (counts.length === 0) {
    console.log("📭 No posts yet — ready to generate!");
  } else {
    console.log("📊 Current posts by category:");
    counts.forEach((r) => console.log(`  ${r.category}: ${r.count}`));
  }
}

init().catch((e) => {
  console.error("❌ Init failed:", e);
  process.exit(1);
});
