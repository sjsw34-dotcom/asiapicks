import { neon } from "@neondatabase/serverless";

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  return neon(url);
}

export const sql = getDb;

// Run once to initialize tables
export const INIT_SQL = `
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
  );
  CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
  CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published_at DESC);
`;

export interface BlogPost {
  id: number;
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
  published_at: string;
  updated_at: string;
}

export async function getBlogPosts(limit = 10, offset = 0): Promise<BlogPost[]> {
  const db = sql();
  const rows = await db`
    SELECT * FROM blog_posts
    ORDER BY published_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;
  return rows as BlogPost[];
}

export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const db = sql();
  const rows = await db`
    SELECT * FROM blog_posts WHERE slug = ${slug} LIMIT 1
  `;
  return (rows[0] as BlogPost) ?? null;
}

export async function getExistingSlugs(): Promise<string[]> {
  const db = sql();
  const rows = await db`SELECT slug FROM blog_posts`;
  return rows.map((r) => r.slug as string);
}

export async function getBlogPostById(id: number): Promise<BlogPost | null> {
  const db = sql();
  const rows = await db`SELECT * FROM blog_posts WHERE id = ${id} LIMIT 1`;
  return (rows[0] as BlogPost) ?? null;
}

export async function updateBlogPost(
  id: number,
  post: Partial<Omit<BlogPost, "id" | "published_at" | "updated_at">>
): Promise<void> {
  const db = sql();
  await db`
    UPDATE blog_posts SET
      title = COALESCE(${post.title ?? null}, title),
      description = COALESCE(${post.description ?? null}, description),
      category = COALESCE(${post.category ?? null}, category),
      city = COALESCE(${post.city ?? null}, city),
      country = COALESCE(${post.country ?? null}, country),
      tags = COALESCE(${post.tags ?? null}, tags),
      content = COALESCE(${post.content ?? null}, content),
      image = COALESCE(${post.image ?? null}, image),
      read_time = COALESCE(${post.read_time ?? null}, read_time),
      updated_at = NOW()
    WHERE id = ${id}
  `;
}

export async function deleteBlogPost(id: number): Promise<void> {
  const db = sql();
  await db`DELETE FROM blog_posts WHERE id = ${id}`;
}

export async function insertBlogPost(
  post: Omit<BlogPost, "id" | "published_at" | "updated_at">
): Promise<void> {
  const db = sql();
  await db`
    INSERT INTO blog_posts (slug, title, description, category, city, country, tags, content, image, read_time)
    VALUES (
      ${post.slug}, ${post.title}, ${post.description}, ${post.category},
      ${post.city}, ${post.country}, ${post.tags}, ${post.content},
      ${post.image}, ${post.read_time}
    )
  `;
}
