"use client";

import { useState } from "react";
import Link from "next/link";

export default function HomePage() {
  const [domain, setDomain] = useState("");
  const [status, setStatus] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain.trim()) {
      setStatus("لطفاً آدرس سایت را وارد کنید");
      return;
    }
    const url = domain.startsWith("http") ? domain : `https://${domain}`;
    window.location.href = `/ai-audit?url=${encodeURIComponent(url)}`;
  };

  return (
    <main className="relative min-h-screen bg-[#0a0a0a] text-white">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/30 via-black to-violet-950/20" />
        <div className="relative z-10 max-w-5xl mx-auto text-center px-6">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded-full px-4 py-1.5 text-sm text-blue-300 mb-6">
            <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
            تحلیل هوشمند سایت توسط هوش مصنوعی
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight">
            <span className="block">سئو و ثبت برند شما</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400 mt-2">
              در مدل‌های هوش مصنوعی
            </span>
          </h1>

          <p className="max-w-2xl mx-auto mt-8 text-white/60 text-lg leading-relaxed">
            ما سایت شما را با استفاده از مدل‌های پیشرفته تحلیل می‌کنیم تا بدانید چطور می‌توانید در پاسخ‌های هوش مصنوعی (مانند GPT و Gemini) بهتر دیده شوید.
          </p>

          <form onSubmit={handleSubmit} className="mt-12 max-w-md mx-auto bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-1 flex items-center gap-2">
            <input
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="آدرس سایت شما (مثال: example.com)"
              className="flex-1 bg-transparent text-white placeholder-white/40 px-4 py-3 outline-none text-sm"
            />
            <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-6 py-3 text-sm font-medium transition">
              تحلیل کن →
            </button>
          </form>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6 max-w-6xl mx-auto" dir="rtl">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">خدمات تخصصی ما</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: "امتیاز سئو (SEO)", desc: "بررسی دقیق متاتگ‌ها، ساختار هدینگ‌ها و بهینه‌سازی کلمات کلیدی برای موتورهای جستجو.", icon: "🔍" },
            { title: "کیفیت محتوا", desc: "تحلیل خوانایی، عمق محتوا و کیفیت نگارش برای درک بهتر توسط مدل‌های زبانی.", icon: "📝" },
            { title: "رؤیت‌پذیری در AI", desc: "سنجش احتمال پیشنهاد شدن سایت شما توسط هوش مصنوعی در پاسخ به سوالات کاربران.", icon: "🤖" },
          ].map((f) => (
            <div key={f.title} className="bg-[#111] border border-white/10 rounded-2xl p-6 hover:border-blue-500/30 transition-all">
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="text-lg font-bold mb-2">{f.title}</h3>
              <p className="text-white/60 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Knowledge/Papers Section */}
      <section className="py-24 px-6 bg-[#0c0c0c]">
        <div className="max-w-4xl mx-auto text-center" dir="rtl">
          <h2 className="text-3xl font-bold mb-8">مقالات و مستندات فنی</h2>
          <p className="text-white/60 mb-10">برای درک بهتر سازوکار مدل‌های زبانی (LLMs) و نحوه بهینه‌سازی برند در عصر هوش مصنوعی، مقالات ما را مطالعه کنید:</p>
          <div className="flex justify-center gap-4">
            <Link href="/articles" className="border border-blue-500/50 text-blue-400 px-8 py-3 rounded-xl hover:bg-blue-500/10 transition">
              مشاهده تمامی مقالات
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-16 px-6 text-center">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-left">
            <p className="font-bold text-xl">GPTDoctors</p>
            <p className="text-white/40 text-sm mt-1">پیشرو در تحلیل سئو برای عصر هوش مصنوعی</p>
          </div>
          <div className="flex flex-col gap-2">
            <a href="tel:09125976447" className="text-white hover:text-blue-400 transition text-lg font-semibold">
              تماس مستقیم: ۰۹۱۲۵۹۷۶۴۴۷
            </a>
            <p className="text-white/40 text-sm">آماده مشاوره برای پروژه‌های سازمانی</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
