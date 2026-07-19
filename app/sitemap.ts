import { MetadataRoute } from 'next';
import { getAllPosts } from '@/lib/posts';

// آدرس دامنه اصلی سایت را اینجا تنظیم کن
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cloood.ir';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = getAllPosts();
  
  return posts.map((post) => ({
    url: `${BASE_URL}/articles/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));
}
