import { loadContent } from "@/lib/content/loader";
import { SITE, absoluteUrl } from "@/lib/site";
import { escapeXml } from "@/lib/seo/feed";

export const dynamic = "force-static";

export function GET() {
  const items = loadContent({ includeReview: false }).articles.slice(0, 30).map((a) => `
    <item>
      <title>${escapeXml(a.fm.title)}</title>
      <link>${absoluteUrl(a.path)}</link>
      <guid>${absoluteUrl(a.path)}</guid>
      <description>${escapeXml(a.fm.description)}</description>
      <pubDate>${new Date(`${a.fm.publishedAt}T00:00:00Z`).toUTCString()}</pubDate>
    </item>`).join("");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
  <title>${SITE.name}</title>
  <link>${SITE.baseUrl}</link>
  <description>${escapeXml(SITE.description)}</description>
  <language>en</language>${items}
</channel></rss>`;
  return new Response(xml, { headers: { "content-type": "application/rss+xml; charset=utf-8" } });
}
