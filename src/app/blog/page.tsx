import { getAllPosts } from "@/lib/api";
import Link from "next/link";
import Image from "next/image";

export const dynamic = 'force-dynamic';

export default async function BlogIndex() {
  const posts = await getAllPosts();

  return (
    <div className="container py-12">
      <h1 className="text-4xl text-center mb-12">All Stories</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
        {posts.map((post) => (
          <article key={post.slug} className="group cursor-pointer">
            <Link href={`/blog/${post.slug}`}>
              <div className="aspect-[4/5] bg-gray-100 mb-6 overflow-hidden relative">
                {post.coverImage ? (
                  <Image 
                    src={post.coverImage} 
                    alt={post.title} 
                    fill 
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[var(--border)] uppercase tracking-widest">
                    No Image
                  </div>
                )}
              </div>
              
              <div className="text-center">
                <p className="text-xs uppercase tracking-widest text-[var(--accent)] mb-2">
                    {post.date}
                </p>
                <h3 className="text-2xl mb-3 group-hover:underline decoration-1 underline-offset-4">
                    {post.title}
                </h3>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
