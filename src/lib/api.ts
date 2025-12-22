import { supabase } from './supabase';

export interface Post {
  id?: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string;
  date: string;
  content: string; // HTML or Markdown content
}

export const getPostSlugs = async () => {
  const { data } = await supabase.from('posts').select('slug');
  return data?.map(p => p.slug) || [];
}

export const getPostBySlug = async (slug: string): Promise<Post | null> => {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    slug: data.slug,
    title: data.title,
    excerpt: data.excerpt,
    coverImage: data.cover_image, // Map snake_case to camelCase
    date: data.date,
    content: data.content,
  };
}

export const getAllPosts = async (): Promise<Post[]> => {
  const { data } = await supabase
    .from('posts')
    .select('*')
    .order('date', { ascending: false });

  return (data || []).map(p => ({
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    coverImage: p.cover_image,
    date: p.date,
    content: p.content,
  }));
}

export const createOrUpdatePost = async (post: Post) => {
  const dbPost = {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    cover_image: post.coverImage,
    date: post.date,
    content: post.content,
  };

  // Upsert based on slug? no, slug is unique index.
  const { error } = await supabase
    .from('posts')
    .upsert(dbPost, { onConflict: 'slug' });

  if (error) throw error;
}

export const deletePost = async (slug: string) => {
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('slug', slug);

  if (error) throw error;
}
