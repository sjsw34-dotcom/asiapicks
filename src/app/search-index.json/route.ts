import { loadContent } from "@/lib/content/loader";
import { buildSearchIndex } from "@/lib/search/build-index";

export const dynamic = "force-static";

export function GET() {
  const index = buildSearchIndex(loadContent({ includeReview: false }));
  return Response.json(index, { headers: { "x-robots-tag": "noindex" } });
}
