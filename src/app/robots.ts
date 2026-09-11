import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  if (process.env.VERCEL_ENV === "preview") {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }
  return {
    // /api/og is the default og:image; it must stay crawlable while the rest of /api/ is blocked.
    rules: [{ userAgent: "*", allow: ["/", "/api/og"], disallow: ["/api/"] }],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
