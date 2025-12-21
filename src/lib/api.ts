import fs from 'fs';
import path from 'path';

const postsDirectory = path.join(process.cwd(), 'src/content/posts');

export interface Post {
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string;
  date: string;
  content: string; // HTML or Markdown content
}

export function getPostSlugs() {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }
  return fs.readdirSync(postsDirectory).filter(file => file.endsWith('.json'));
}

export function getPostBySlug(slug: string): Post | null {
  const realSlug = slug.replace(/\.json$/, '');
  const fullPath = path.join(postsDirectory, `${realSlug}.json`);
  
  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const post = JSON.parse(fileContents);
  return { ...post, slug: realSlug };
}

export function getAllPosts(): Post[] {
  const slugs = getPostSlugs();
  const posts = slugs
    .map((slug) => getPostBySlug(slug))
    .filter((post): post is Post => post !== null)
    .sort((post1, post2) => (post1.date > post2.date ? -1 : 1));
  return posts;
}

export function createOrUpdatePost(post: Post) {
  if (!fs.existsSync(postsDirectory)) {
    fs.mkdirSync(postsDirectory, { recursive: true });
  }
  const fullPath = path.join(postsDirectory, `${post.slug}.json`);
  fs.writeFileSync(fullPath, JSON.stringify(post, null, 2), 'utf8');
}

export function deletePost(slug: string) {
    const fullPath = path.join(postsDirectory, `${slug}.json`);
    if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
    }
}
