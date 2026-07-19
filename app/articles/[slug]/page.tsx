import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getAllPosts, getPostBySlug } from '@/lib/posts';
import { MDXRenderer } from '@/components/mdx-renderer';

interface Props {
  params: { slug: string };
}

// ۱. ساخت متادیتای پویا (SEO) برای موتورهای جستجو
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { meta } = getPostBySlug(params.slug);
    return {
      title: meta.seoTitle || meta.title,
      description: meta.seoDescription || meta.excerpt,
      openGraph: {
        title: meta.seoTitle || meta.title,
        description: meta.seoDescription || meta.excerpt,
        images: meta.coverImage ? [{ url: meta.coverImage }] : [],
      },
    };
  } catch {
    return {
      title: 'مقاله یافت نشد',
    };
  }
}

// ۲. تولید مسیرهای استاتیک در زمان Build برای سرعت لود فوق‌العاده بالا (SSG)
export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default function ArticlePage({ params }: Props) {
  try {
    const { meta, content } = getPostBySlug(params.slug);

    return (
      <main className="mx-auto max-w-3xl px-6 py-12" dir="rtl">
        <header className="mb-8 border-b border-zinc-200 dark:border-zinc-800 pb-8">
          <div className="flex items-center gap-3 text-sm text-zinc-500 mb-4">
            <span className="font-semibold text-blue-600 dark:text-blue-400">{meta.category}</span>
            <span>•</span>
            <span>{meta.date}</span>
            <span>•</span>
            <span>زمان مطالعه: {meta.readingTime} دقیقه</span>
          </div>
          <h1 className="text-4xl font-extrabold text-zinc-950 dark:text-white leading-tight mb-4">
            {meta.title}
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 text-lg leading-relaxed">
            {meta.excerpt}
          </p>
        </header>

        {/* رندر محتوای MDX */}
        <article className="prose prose-lg dark:prose-invert max-w-none">
          <MDXRenderer source={content} />
        </article>
      </main>
    );
  } catch {
    notFound();
  }
}
