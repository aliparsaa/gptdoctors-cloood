import Link from 'next/link';
import { getAllPosts } from '@/lib/posts';

export const metadata = {
  title: 'مقالات علمی و آموزشی',
  description: 'آخرین مقالات و دستاوردهای حوزه سلامت و زیبایی پوست',
};

export default function ArticlesPage() {
  const posts = getAllPosts();

  return (
    <main className="mx-auto max-w-5xl px-6 py-12" dir="rtl">
      <h1 className="text-3xl font-black mb-10 text-zinc-900 dark:text-white">مقالات ما</h1>
      
      <div className="grid gap-8 md:grid-cols-2">
        {posts.map((post) => (
          <article 
            key={post.slug} 
            className="flex flex-col justify-between border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 hover:shadow-lg transition-shadow duration-200"
          >
            <div>
              <div className="flex gap-2 items-center text-xs text-zinc-500 mb-3">
                <span className="bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-full font-medium">
                  {post.category}
                </span>
                <span>•</span>
                <span>{post.date}</span>
              </div>
              <h2 className="text-xl font-bold mb-3 text-zinc-900 dark:text-white">
                <Link href={`/articles/${post.slug}`} className="hover:text-primary">
                  {post.title}
                </Link>
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed mb-4 line-clamp-3">
                {post.excerpt}
              </p>
            </div>
            
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-900">
              <span className="text-xs text-zinc-400">زمان مطالعه: {post.readingTime} دقیقه</span>
              <Link href={`/articles/${post.slug}`} className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                مطالعه مقاله ←
              </Link>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
