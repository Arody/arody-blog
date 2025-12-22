import { getPostBySlug, createOrUpdatePost, deletePost } from "@/lib/api";
import { NextResponse } from "next/server";

interface RouteProps {
    params: Promise<any>
}

export async function GET(request: Request, { params }: RouteProps) {
    const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }
  return NextResponse.json(post);
}

export async function PUT(request: Request, { params }: RouteProps) {
  // Verify Auth
  const { slug } = await params;
  const json = await request.json();
  if (json.slug !== slug) {
     return NextResponse.json({ error: "Slug mismatch" }, { status: 400 });
  }
  createOrUpdatePost(json);
  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request, { params }: RouteProps) {
  // Verify Auth
  const { slug } = await params;
  deletePost(slug);
  return NextResponse.json({ success: true });
}
