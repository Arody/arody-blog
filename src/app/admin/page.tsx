import { getAllPosts } from "@/lib/api";
import Link from "next/link";

// We force dynamic rendering so the list is always fresh on load
export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const posts = await getAllPosts();

  return (
    <div className="container max-w-5xl mx-auto">
      <header className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-serif">Dashboard</h1>
        <Link href="/admin/editor" className="btn">
          + New Story
        </Link>
      </header>

      <div className="bg-white border text-sm">
        <div className="grid grid-cols-12 p-4 border-b font-bold bg-gray-50 uppercase tracking-wide text-xs">
           <div className="col-span-6">Title</div>
           <div className="col-span-3">Date</div>
           <div className="col-span-3 text-right">Actions</div>
        </div>
        {posts.map((post) => (
            <div key={post.slug} className="grid grid-cols-12 p-4 border-b hover:bg-gray-50 items-center">
                <div className="col-span-6 font-medium truncate pr-4">{post.title}</div>
                <div className="col-span-3 text-gray-500">{post.date}</div>
                <div className="col-span-3 text-right space-x-4">
                    <Link href={`/admin/editor/${post.slug}`} className="hover:underline">Edit</Link>
                    {/* Delete would require a client component wrapper or form action. For now, simple text instructions. */}
                </div>
            </div>
        ))}
      </div>
    </div>
  );
}
