import { NextResponse, type NextRequest } from "next/server";
import { GONE_HTML, isGone } from "@/lib/legacy/legacy";
import { SITE } from "@/lib/site";

export function proxy(req: NextRequest) {
  const host = (req.headers.get("host") ?? "").toLowerCase();
  if (host.startsWith("www.")) {
    // Build the target from the canonical base URL, never from the raw Host header.
    return NextResponse.redirect(`${SITE.baseUrl}${req.nextUrl.pathname}${req.nextUrl.search}`, 308);
  }
  if (isGone(req.nextUrl.pathname)) {
    return new NextResponse(GONE_HTML, {
      status: 410,
      headers: { "content-type": "text/html; charset=utf-8", "x-robots-tag": "noindex" },
    });
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/|api/og|favicon.ico|images/|sitemap.xml|robots.txt|feed.xml).*)"],
};
