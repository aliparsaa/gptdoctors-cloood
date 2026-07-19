import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GPTDoctors — AI Website Analysis & GEO Audit",
  description:
    "Analyze any website with AI models. Get SEO scores, content quality ratings, and AI visibility metrics powered by GPT.",
  keywords: ["AI audit", "SEO", "GEO", "website analysis", "GPT", "AI models"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr">
      <body className="antialiased min-h-screen">{children}</body>
    </html>
  );
}
