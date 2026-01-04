import { getPostBySlug } from "@/lib/api";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Metadata } from "next";
import PostReader from "@/components/PostReader";
import CommentSection from "@/components/CommentSection";



interface PageProps {
    params: Promise<any>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const post = await getPostBySlug(slug);

    if (!post) return {};

    const imageUrl = post.coverImage || '/arody-portrait.jpg';
    let finalUrl = imageUrl;
    if (finalUrl.startsWith('/')) {
        finalUrl = `https://arody.cloud${finalUrl}`;
    }

    // Attempt to use the _social variant ONLY if we detect the new naming convention (_main.jpg)
    // This prevents 404s on old images that don't have a social companion.
    let socialUrl = finalUrl;
    if (finalUrl.includes('_main.jpg')) {
        socialUrl = finalUrl.replace('_main.jpg', '_social.jpg');
    }

    return {
        title: post.title,
        description: post.excerpt,
        openGraph: {
            title: post.title,
            description: post.excerpt,
            url: `https://arody.cloud/blog/${slug}`,
            siteName: 'Arody Fotografía',
            images: [
                {
                    url: socialUrl, // Use the optimized 1200x630 variant
                    width: 1200,
                    height: 630,
                    type: 'image/jpeg',
                    alt: post.title,
                }
            ],
            locale: 'es_MX',
            type: 'article',
        },
        twitter: {
            card: 'summary_large_image',
            title: post.title,
            description: post.excerpt,
            images: [socialUrl],
        }
    };
}

export default async function BlogPost({ params }: PageProps) {
    const { slug } = await params;
    const post = await getPostBySlug(slug);

    if (!post) {
        notFound();
    }

    // Format date to Spanish Long Format
    const date = new Date(post.date).toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <article className="container max-w-4xl py-12">
            <header className="text-center mb-16">
                <p className="text-xs uppercase tracking-widest text-[var(--accent)] mb-4">
                    {date} — Fotografía
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

            <PostReader content={post.content} />

            {post.id && <CommentSection postId={post.id} />}



        </article>
    );
}
