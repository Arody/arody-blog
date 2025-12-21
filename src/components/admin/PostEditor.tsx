"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface PostEditorProps {
    initialData?: {
        title: string;
        slug: string;
        excerpt: string;
        date: string;
        content: string;
        coverImage: string;
    }
}

export default function PostEditor({ initialData }: PostEditorProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: initialData?.title || "",
        slug: initialData?.slug || "",
        excerpt: initialData?.excerpt || "",
        date: initialData?.date || new Date().toISOString().split('T')[0],
        content: initialData?.content || "",
        coverImage: initialData?.coverImage || "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: value,
            // Auto-slugify title if slug is empty
            slug: name === 'title' && !initialData ? value.toLowerCase().replace(/[^a-z0-9]+/g, '-') : prev.slug
        }));
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0]) return;
        
        const file = e.target.files[0];
        const data = new FormData();
        data.append('file', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: data
            });
            const json = await res.json();
            if (json.success) {
                setFormData(prev => ({ ...prev, coverImage: json.url }));
            }
        } catch (err) {
            alert("Upload failed");
            console.error(err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const method = initialData ? 'PUT' : 'POST';
        const url = initialData ? `/api/posts/${initialData.slug}` : '/api/posts';

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            
            if (res.ok) {
                router.push('/admin');
                router.refresh();
            } else {
                alert("Error saving post");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this post?")) return;
        
        const res = await fetch(`/api/posts/${formData.slug}`, { method: 'DELETE' });
        if (res.ok) {
            router.push('/admin');
            router.refresh();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8 bg-white p-8 border">
            <div className="grid grid-cols-2 gap-8">
                <div className="space-y-4">
                    <div>
                        <label>Title</label>
                        <input name="title" value={formData.title} onChange={handleChange} required className="text-2xl font-serif" />
                    </div>
                    <div>
                        <label>Slug</label>
                        <input name="slug" value={formData.slug} onChange={handleChange} required />
                    </div>
                    <div>
                        <label>Date</label>
                        <input type="date" name="date" value={formData.date} onChange={handleChange} required />
                    </div>
                    <div>
                        <label>Excerpt</label>
                        <textarea name="excerpt" value={formData.excerpt} onChange={handleChange} rows={3} />
                    </div>
                </div>

                <div className="space-y-4">
                     <label>Cover Image</label>
                     <div className="border border-dashed p-8 text-center relative hover:bg-gray-50 transition cursor-pointer">
                        <input type="file" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                        {formData.coverImage ? (
                            <img src={formData.coverImage} className="max-h-48 mx-auto" alt="Preview"/>
                        ) : (
                            <span className="text-gray-400 text-sm">Click to upload image</span>
                        )}
                     </div>
                </div>
            </div>

            <div>
                <label>Content (HTML support enabled)</label>
                <textarea 
                    name="content" 
                    value={formData.content} 
                    onChange={handleChange} 
                    rows={15} 
                    className="font-mono text-sm leading-relaxed"
                />
                <p className="text-xs text-gray-400 mt-2">Use plain HTML tags for formatting. &lt;p&gt;, &lt;h2&gt;, &lt;img src="..."&gt;</p>
            </div>

            <div className="flex justify-between pt-8 border-t">
                {initialData ? (
                    <button type="button" onClick={handleDelete} className="text-red-500 hover:text-red-700 text-sm uppercase">Delete Post</button>
                ) : <div />}
                
                <button type="submit" disabled={loading} className="btn bg-black text-white px-8">
                    {loading ? 'Saving...' : 'Save Story'}
                </button>
            </div>
        </form>
    );
}
