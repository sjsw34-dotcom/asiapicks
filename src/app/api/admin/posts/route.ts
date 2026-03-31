import { NextRequest, NextResponse } from "next/server";
import { getBlogPosts } from "@/lib/db";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const posts = await getBlogPosts(200);
  return NextResponse.json({ posts });
}
