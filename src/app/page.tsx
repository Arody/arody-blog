import { getAllPosts } from "@/lib/api";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  const posts = getAllPosts();

  return (
    <div className="container">
      {/* Featured / Hero Section */}
      <section className="mb-20 text-center">
        <div className="relative w-full h-[60vh] bg-gray-100 flex items-center justify-center overflow-hidden mb-8 group">
           {/* Placeholder for a hero image if we had one. For now, a typographic hero. */}
           <div className="z-10 bg-white/80 p-12 backdrop-blur-sm border border-[var(--foreground)]">
              <h2 className="text-5xl md:text-7xl mb-4 italic">The September Issue</h2>
              <p className="uppercase tracking-widest text-sm">Curated visual stories</p>
           </div>
        </div>
      </section>

      {/* Post Grid */}
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
                <p className="text-[var(--accent)] text-sm line-clamp-2">
                    {post.excerpt}
                </p>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
