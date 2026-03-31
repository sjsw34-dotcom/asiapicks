import { NextRequest, NextResponse } from "next/server";
import { deleteBlogPost } from "@/lib/db";

interface Props {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: Props) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await deleteBlogPost(Number(id));
  return NextResponse.json({ success: true });
}
