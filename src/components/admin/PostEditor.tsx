"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import BlockEditor from "./BlockEditor";

interface PostEditorProps {
    initialData?: {
        id?: string;
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
    const [uploadStatus, setUploadStatus] = useState<string>("");
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
        setUploadStatus("Optimizando imagen...");

        try {
            // Dynamic import to avoid SSR issues with browser libraries
            const imageCompression = (await import("browser-image-compression")).default;

            const options = {
                maxSizeMB: 0.5, // Max 500KB
                maxWidthOrHeight: 1920,
                useWebWorker: true,
                fileType: "image/webp"
            };

            const compressedFile = await imageCompression(file, options);

            // Generate unique filename with .webp extension
            const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9]/g, '')}.webp`;

            setUploadStatus("Subiendo a la nube...");

            const { createClient } = await import("@/utils/supabase/client");
            const supabase = createClient();

            const { data, error } = await supabase.storage
                .from('uploads')
                .upload(filename, compressedFile, {
                    contentType: 'image/webp',
                    upsert: false // Don't overwrite
                });

            if (error) throw error;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('uploads')
                .getPublicUrl(filename);

            setFormData(prev => ({ ...prev, coverImage: publicUrl }));
            setUploadStatus(""); // Clear status on success

        } catch (err: any) {
            console.error("Upload error details:", err);
            setUploadStatus(""); // Clear status on error

            let message = err.message || "Error desconocido";
            if (err.statusCode === 0) message = "Error de Red/CORS. Revisa Supabase.";
            if (err.statusCode === 403) message = "Permiso Denegado.";
            if (err.statusCode === 404) message = "Bucket no encontrado.";

            alert(`Fallo en la subida: ${message}`);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { createClient } = await import("@/utils/supabase/client");
        const supabase = createClient();

        // 1. Check if image changed and delete old one
        if (initialData?.coverImage && formData.coverImage !== initialData.coverImage) {
            try {
                // Extract filename from URL: .../uploads/filename.webp
                const oldUrlParts = initialData.coverImage.split('/');
                const oldFilename = oldUrlParts[oldUrlParts.length - 1];

                if (oldFilename) {
                    console.log("Deleting old image:", oldFilename);
                    await supabase.storage.from('uploads').remove([oldFilename]);
                }
            } catch (cleanupErr) {
                console.warn("Failed to cleanup old image:", cleanupErr);
                // Continue saving even if cleanup fails
            }
        }

        const postPayload = {
            title: formData.title,
            slug: formData.slug,
            excerpt: formData.excerpt,
            date: formData.date,
            content: formData.content,
            cover_image: formData.coverImage, // Ensure Snake case for DB
            updated_at: new Date().toISOString()
        };

        try {
            let error;

            if (initialData?.id) {
                // UPDATE
                const result = await supabase
                    .from('posts')
                    .update(postPayload)
                    .eq('id', initialData.id);
                error = result.error;
            } else {
                // CREATE
                const result = await supabase
                    .from('posts')
                    .insert(postPayload);
                error = result.error;
            }

            if (error) throw error;

            router.push('/admin');
            router.refresh();
        } catch (err: any) {
            console.error(err);
            alert("Error al guardar: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("¿Estás seguro de que deseas eliminar esta historia?")) return;

        const { createClient } = await import("@/utils/supabase/client");
        const supabase = createClient();

        // Use ID if available, otherwise slug (fallback, though ID is safer)
        const query = supabase.from('posts').delete();

        const { error } = initialData?.id
            ? await query.eq('id', initialData.id) 
            : await query.eq('slug', formData.slug);

        if (!error) {
            // Cleanup image on delete as well
            if (formData.coverImage) {
                const parts = formData.coverImage.split('/');
                const filename = parts[parts.length - 1];
                if (filename) await supabase.storage.from('uploads').remove([filename]);
            }

            router.push('/admin');
            router.refresh();
        } else {
            alert("Error al eliminar: " + error.message);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8 bg-white p-8 border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                    <label>Título</label>
                    <input name="title" value={formData.title} onChange={handleChange} required className="w-full bg-transparent border-b border-gray-300 py-2 focus:outline-none focus:border-black transition font-serif text-2xl" placeholder="El Principio" />
                </div>
                <div className="space-y-4">
                    <label>Slug (URL Link)</label>
                    <input name="slug" value={formData.slug} onChange={handleChange} required className="w-full bg-transparent border-b border-gray-300 py-2 focus:outline-none focus:border-black transition text-gray-500" placeholder="el-principio" />
                </div>
            </div>

            <div className="space-y-4">
                <label>Fecha</label>
                <input type="date" name="date" value={formData.date} onChange={handleChange} required className="w-full bg-transparent border-b border-gray-300 py-2 focus:outline-none focus:border-black transition" />
            </div>

            <div className="space-y-4">
                <label>Extracto (Resumen)</label>
                <textarea name="excerpt" value={formData.excerpt} onChange={handleChange} rows={3} className="w-full bg-transparent border border-gray-200 p-4 focus:outline-none focus:border-black transition resize-none" placeholder="La primera entrada del blog" />
            </div>

            <div className="space-y-4">
                <label>Contenido</label>
                <div className="border border-gray-200 rounded-lg p-4 min-h-[400px]">
                    <BlockEditor
                        initialContent={initialData?.content || ""}
                        onChange={useCallback((html: string) => setFormData((prev: any) => ({ ...prev, content: html })), [])}
                    />
                </div>
            </div>

            <div className="space-y-4">
                <label>Imagen de Portada</label>
                <div className="border border-dashed p-8 text-center relative hover:bg-gray-50 transition cursor-pointer">
                    <input type="file" onChange={handleImageUpload} accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" />
                    {formData.coverImage ? (
                        <img src={formData.coverImage} className="max-h-48 mx-auto shadow-sm" alt="Vista Previa" />
                    ) : (
                            <div className="space-y-2">
                                <span className="text-gray-400 text-sm">Clic para subir imagen</span>
                                <p className="text-xs text-gray-300">Max 1920px. Auto-optimizado a WebP</p>
                            </div>
                    )}
                    {uploadStatus && (
                        <div className="absolute inset-0 bg-white/90 flex items-center justify-center font-bold text-sm text-[var(--accent)] animate-pulse">
                            {uploadStatus}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex justify-end gap-4 pt-8 border-t border-gray-100">
                {initialData && (
                    <button type="button" onClick={handleDelete} className="px-8 py-3 bg-red-50 text-red-500 hover:bg-red-100 transition text-sm tracking-widest uppercase">
                        Eliminar
                    </button>
                )}
                <button type="submit" disabled={loading} className="bg-black text-white px-8 py-3 hover:bg-gray-800 transition text-sm tracking-widest uppercase disabled:opacity-50">
                    {loading ? "Guardando..." : "Guardar Historia"}
                </button>
            </div>
        </form>
    );
}
