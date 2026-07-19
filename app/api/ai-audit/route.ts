import { NextRequest, NextResponse } from "next/server";
import { scrapePage } from "@/lib/scraper";
import { analyzeWithAI } from "@/lib/analyzer";

export const runtime = "nodejs";
export const maxDuration = 60; // Allow up to 60s for AI analysis

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }

    // Validate URL format
    let normalized = url.trim();
    if (!/^https?:\/\//i.test(normalized)) {
      normalized = `https://${normalized}`;
    }

    try {
      new URL(normalized);
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      );
    }

    // Step 1: Scrape the page
    const page = await scrapePage(normalized);

    if (page.error) {
      return NextResponse.json(
        {
          error: `Failed to fetch page: ${page.error}`,
          url: normalized,
        },
        { status: 422 }
      );
    }

    // Step 2: Analyze with AI (or heuristic fallback)
    const analysis = await analyzeWithAI(page);

    return NextResponse.json({
      url: page.url,
      page: {
        title: page.title,
        description: page.description,
        wordCount: page.wordCount,
        headingCount: page.headings.length,
        headings: page.headings.slice(0, 10),
        hasSchema: page.hasSchemaOrg,
        hasOpenGraph: page.hasOpenGraph,
      },
      analysis,
      meta: {
        fetchMs: page.fetchDurationMs,
        analyzedAt: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    console.error("Audit error:", err);
    return NextResponse.json(
      { error: "Internal server error", detail: err.message },
      { status: 500 }
    );
  }
}
