import { NextResponse, type NextRequest } from "next/server";
import { GONE_HTML, isGone } from "@/lib/legacy/legacy";

export function proxy(req: NextRequest) {
  const host = req.headers.get("host") ?? "";
  if (host.startsWith("www.")) {
    return NextResponse.redirect(`https://${host.slice(4)}${req.nextUrl.pathname}${req.nextUrl.search}`, 308);
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
  matcher: ["/((?!_next/|api/og|icon|favicon.ico|images/|sitemap.xml|robots.txt|feed.xml).*)"],
};
