import { getPostBySlug } from "@/lib/api";
import { notFound } from "next/navigation";
import Image from "next/image";

interface PageProps {
    params: {
        slug: string;
    }
}

export default async function BlogPost({ params }: PageProps) {
    const { slug } = await params;
    const post = getPostBySlug(slug);

    if (!post) {
        notFound();
    }

    return (
        <article className="container max-w-4xl py-12">
            <header className="text-center mb-16">
                <p className="text-xs uppercase tracking-widest text-[var(--accent)] mb-4">
                    {post.date} — Photography
                </p>
                <h1 className="text-5xl md:text-6xl mb-8 leading-tight">
                    {post.title}
                </h1>
                
                {post.coverImage && (
                    <div className="aspect-video relative w-full overflow-hidden mt-12 bg-gray-100">
                         <Image 
                            src={post.coverImage} 
                            alt={post.title} 
                            fill 
                            className="object-cover"
                            priority
                          />
                    </div>
                )}
            </header>

            <div 
                className="prose prose-lg mx-auto font-serif first-letter:text-5xl first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:mt-[-10px]"
                dangerouslySetInnerHTML={{ __html: post.content }}
            />
            
        </article>
    );
}
