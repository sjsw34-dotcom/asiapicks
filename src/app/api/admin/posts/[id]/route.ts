import { NextRequest, NextResponse } from "next/server";
import { getBlogPostById, updateBlogPost } from "@/lib/db";

interface Props {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: Props) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const post = await getBlogPostById(Number(id));
  if (!post) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ post });
}

export async function PATCH(req: NextRequest, { params }: Props) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  await updateBlogPost(Number(id), {
    title: body.title,
    description: body.description,
    category: body.category,
    city: body.city,
    country: body.country,
    tags: body.tags,
    content: body.content,
    image: body.image,
    read_time: body.read_time,
  });

  const updated = await getBlogPostById(Number(id));
  return NextResponse.json({ post: updated });
}
