import React from 'react';
import { MDXRemote } from "next-mdx-remote/rsc";

// تعریف کامپوننت‌های اختصاصی شما که می‌خواهید درون MDX رندر شوند
const mdxComponents = {
  Callout: ({ children, type = 'info' }: { children: React.ReactNode; type?: 'info' | 'warning' | 'danger' }) => {
    const bgColors = {
      info: 'bg-blue-50 border-blue-500 text-blue-800 dark:bg-blue-950/30 dark:border-blue-500/50 dark:text-blue-200',
      warning: 'bg-yellow-50 border-yellow-500 text-yellow-800 dark:bg-yellow-950/30 dark:border-yellow-500/50 dark:text-yellow-200',
      danger: 'bg-red-50 border-red-500 text-red-800 dark:bg-red-950/30 dark:border-red-500/50 dark:text-red-200',
    };

    return (
      <div className={`my-6 border-r-4 p-4 rounded-l-md ${bgColors[type]}`} dir="rtl">
        {children}
      </div>
    );
  },
  // می‌توانید کامپوننت‌های دیگری مثل VideoPlayer یا Gallery نیز در اینجا اضافه کنید.
};

interface MDXRendererProps {
  source: string;
}

export function MDXRenderer({ source }: MDXRendererProps) {
  return (
    <div className="prose prose-zinc max-w-none dark:prose-invert" dir="rtl">
      <MDXRemote source={source} components={mdxComponents} />
    </div>
  );
}
