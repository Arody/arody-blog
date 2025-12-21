import PostEditor from "@/components/admin/PostEditor";
import { getPostBySlug } from "@/lib/api";
import { notFound } from "next/navigation";

interface PageProps {
    params: {
        slug: string;
    }
}

export default async function EditPostPage({ params }: PageProps) {
    const { slug } = await params;
    const post = getPostBySlug(slug);

    if (!post) {
        notFound();
    }

    return (
        <div className="container mx-auto">
            <h1 className="text-3xl font-serif mb-8 text-center">Edit Story</h1>
            <PostEditor initialData={post} />
        </div>
    );
}
