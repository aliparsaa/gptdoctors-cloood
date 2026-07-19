import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const postsDirectory = path.join(process.cwd(), 'content/articles');

function calculateReadingTime(text: string): number {
  const wordsPerMinute = 200;
  const numberOfWords = text.trim().split(/\s+/g).filter(Boolean).length;
  return Math.max(1, Math.ceil(numberOfWords / wordsPerMinute));
}

function createExcerpt(content: string, maxLength = 160): string {
  const cleanText = content
    .replace(/<[^>]*>/g, '')
    .replace(/[#>*_`~-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (cleanText.length <= maxLength) return cleanText;
  return cleanText.slice(0, maxLength).trim() + '...';
}

function slugToTitle(slug: string): string {
  return slug.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function normalizeStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function getPostFiles(): string[] {
  if (!fs.existsSync(postsDirectory)) return [];

  return fs
    .readdirSync(postsDirectory)
    .filter((fileName) => fileName.endsWith('.mdx') || fileName.endsWith('.md'));
}

function parsePostFile(fileName: string) {
  const fileSlug = fileName.replace(/\.(mdx|md)$/, '');
  const fullPath = path.join(postsDirectory, fileName);

  if (!fs.existsSync(fullPath)) return null;

  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

  const title = String(data.title || slugToTitle(fileSlug));
  const date = String(data.date || new Date().toISOString().split('T')[0]);
  const excerpt = String(data.excerpt || data.description || createExcerpt(content));
  const category = String(data.category || 'General');
  const tags = normalizeStringArray(data.tags);
  const author = String(data.author || 'Admin');
  const slug = String(data.slug || fileSlug);
  const readingTime = Number(data.readingTime) || calculateReadingTime(content);

  return {
    title,
    slug,
    fileSlug,
    date,
    excerpt,
    category,
    tags,
    author,
    readingTime,
    content,
    published: data.published !== undefined ? Boolean(data.published) : true,
    coverImage: data.coverImage || data.image || null,
    seoTitle: data.seoTitle || title,
    seoDescription: data.seoDescription || excerpt,
    keywords: normalizeStringArray(data.keywords),
    canonicalUrl: data.canonicalUrl || null,
  };
}

export type PostMeta = NonNullable<ReturnType<typeof parsePostFile>>;

export function getAllPosts(): PostMeta[] {
  return getPostFiles()
    .map(parsePostFile)
    .filter((post): post is PostMeta => post !== null)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostBySlug(slug: string) {
  const post = getPostFiles()
    .map(parsePostFile)
    .filter((item): item is PostMeta => item !== null)
    .find((item) => item.slug === slug || item.fileSlug === slug);

  if (!post) {
    throw new Error(`مقاله با مشخصه ${slug} پیدا نشد.`);
  }

  return {
    meta: post,
    content: post.content,
  };
}
