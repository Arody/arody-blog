import { getAllPosts, createOrUpdatePost } from "@/lib/api";
import { NextResponse } from "next/server";

export async function GET() {
  const posts = getAllPosts();
  return NextResponse.json(posts);
}

export async function POST(request: Request) {
  // In a real app, verify Auth here
  try {
    const json = await request.json();
    createOrUpdatePost(json);
    return NextResponse.json({ success: true, slug: json.slug });
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
  }
}
