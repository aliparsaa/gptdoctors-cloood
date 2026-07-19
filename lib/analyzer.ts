/**
 * AI Analyzer — sends scraped page content to an LLM for analysis.
 * Supports OpenAI-compatible APIs.
 */

import type { ScrapedPage } from "./scraper";

export interface AnalysisResult {
  overallScore: number;
  seoScore: number;
  contentScore: number;
  aiVisibilityScore: number;
  technicalScore: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  keywordSuggestions: string[];
  modelUsed: string;
}

interface AIProviderConfig {
  apiKey: string;
  baseURL?: string;
  model: string;
}

function getProviderConfig(): AIProviderConfig | null {
  // OpenAI
  if (process.env.OPENAI_API_KEY) {
    return {
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_BASE_URL || undefined,
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    };
  }
  return null;
}

function buildPrompt(page: ScrapedPage): string {
  return `You are an expert SEO and web content analyst. Analyze the following webpage and provide a detailed assessment.

URL: ${page.url}
Title: ${page.title}
Meta Description: ${page.description}
Word Count: ${page.wordCount}
Number of Headings: ${page.headings.length}
Headings: ${page.headings.slice(0, 20).join(" | ")}
Has Schema.org: ${page.hasSchemaOrg ? "Yes" : "No"}
Has OpenGraph: ${page.hasOpenGraph ? "Yes" : "No"}

---PAGE CONTENT (first 8000 chars)---
${page.bodyText}
---END CONTENT---

Provide your analysis in the following strict JSON format (no markdown, no extra text):

{
  "overallScore": <number 0-100>,
  "seoScore": <number 0-100>,
  "contentScore": <number 0-100>,
  "aiVisibilityScore": <number 0-100>,
  "technicalScore": <number 0-100>,
  "summary": "<2-3 sentence summary of the page quality and purpose>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "weaknesses": ["<weakness 1>", "<weakness 2>"],
  "recommendations": ["<actionable recommendation 1>", "<actionable recommendation 2>", "<actionable recommendation 3>"],
  "keywordSuggestions": ["<keyword 1>", "<keyword 2>", "<keyword 3>"]
}

Scoring guidelines:
- SEO Score: meta tags, heading structure, keyword usage, URL structure
- Content Score: readability, depth, grammar, value to reader
- AI Visibility Score: how likely AI models would reference this content (clear structure, factual claims, unique insights)
- Technical Score: structured data, page performance markers, mobile-friendliness indicators
- Overall: weighted average of above

Be honest and critical. Do not inflate scores. Return ONLY the JSON object.`;
}

export async function analyzeWithAI(
  page: ScrapedPage
): Promise<AnalysisResult> {
  const config = getProviderConfig();

  if (!config) {
    // Fallback: heuristic analysis when no AI key is configured
    return heuristicAnalysis(page);
  }

  try {
    const { default: OpenAI } = await import("openai");

    const client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL || undefined,
    });

    const completion = await client.chat.completions.create({
      model: config.model,
      messages: [
        { role: "system", content: "You are an expert SEO and content analyst. Always respond with valid JSON only." },
        { role: "user", content: buildPrompt(page) },
      ],
      temperature: 0.3,
      max_tokens: 1500,
    });

    const raw = completion.choices[0]?.message?.content || "";
    // Try to extract JSON from the response
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in AI response");
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      overallScore: clamp(parsed.overallScore, 0, 100),
      seoScore: clamp(parsed.seoScore, 0, 100),
      contentScore: clamp(parsed.contentScore, 0, 100),
      aiVisibilityScore: clamp(parsed.aiVisibilityScore, 0, 100),
      technicalScore: clamp(parsed.technicalScore, 0, 100),
      summary: parsed.summary || "No summary available.",
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
      weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses : [],
      recommendations: Array.isArray(parsed.recommendations)
        ? parsed.recommendations
        : [],
      keywordSuggestions: Array.isArray(parsed.keywordSuggestions)
        ? parsed.keywordSuggestions
        : [],
      modelUsed: config.model,
    };
  } catch (err: any) {
    console.error("AI analysis failed:", err.message);
    // Fall back to heuristic if AI fails
    const result = heuristicAnalysis(page);
    result.summary += " (Note: AI analysis failed, showing heuristic estimates.)";
    return result;
  }
}

/**
 * Heuristic analysis — used when no AI API key is available or AI call fails.
 * Computes scores based on measurable page attributes.
 */
function heuristicAnalysis(page: ScrapedPage): AnalysisResult {
  // SEO scoring
  let seoScore = 50;
  if (page.title && page.title.length >= 10 && page.title.length <= 70)
    seoScore += 15;
  if (page.description && page.description.length >= 50)
    seoScore += 10;
  if (page.headings.length > 0) seoScore += 10;
  if (page.headings.some((h) => h.length > 5)) seoScore += 5;
  if (page.hasSchemaOrg) seoScore += 5;
  if (page.hasOpenGraph) seoScore += 5;

  // Content scoring
  let contentScore = 40;
  if (page.wordCount > 300) contentScore += 20;
  if (page.wordCount > 800) contentScore += 15;
  if (page.wordCount > 1500) contentScore += 10;
  if (page.headings.length >= 3) contentScore += 10;
  if (page.headings.length >= 6) contentScore += 5;

  // AI visibility
  let aiVisibilityScore = 35;
  if (page.headings.length >= 3) aiVisibilityScore += 15;
  if (page.hasSchemaOrg) aiVisibilityScore += 15;
  if (page.wordCount > 500) aiVisibilityScore += 15;
  if (page.description.length > 50) aiVisibilityScore += 10;
  if (page.headings.some((h) => h.toLowerCase().includes("what") || h.toLowerCase().includes("how")))
    aiVisibilityScore += 5;

  // Technical
  let technicalScore = 45;
  if (page.hasSchemaOrg) technicalScore += 20;
  if (page.hasOpenGraph) technicalScore += 15;
  if (page.metaTags["viewport"]) technicalScore += 10;
  if (page.fetchDurationMs < 3000) technicalScore += 10;

  // Overall
  const overallScore = Math.round(
    seoScore * 0.3 + contentScore * 0.3 + aiVisibilityScore * 0.25 + technicalScore * 0.15
  );

  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const recommendations: string[] = [];

  if (page.title.length >= 10 && page.title.length <= 70) {
    strengths.push(`Title tag is well-optimized (${page.title.length} chars)`);
  } else {
    weaknesses.push("Title tag needs optimization");
    recommendations.push("Keep title between 50-70 characters with primary keyword");
  }

  if (page.description.length >= 50) {
    strengths.push("Meta description is present and informative");
  } else {
    weaknesses.push("Missing or too short meta description");
    recommendations.push("Add a compelling meta description (120-160 chars)");
  }

  if (page.headings.length >= 3) {
    strengths.push(`Good heading structure (${page.headings.length} headings)`);
  } else {
    weaknesses.push("Insufficient heading structure");
    recommendations.push("Use H1-H3 headings to structure content clearly");
  }

  if (page.hasSchemaOrg) {
    strengths.push("Schema.org structured data detected");
  } else {
    weaknesses.push("No structured data markup found");
    recommendations.push("Add Schema.org JSON-LD markup for rich results");
  }

  if (page.hasOpenGraph) {
    strengths.push("Open Graph tags present for social sharing");
  } else {
    weaknesses.push("Missing Open Graph tags");
    recommendations.push("Add OG tags to improve social media sharing previews");
  }

  if (page.wordCount < 300) {
    weaknesses.push("Very thin content — page has low word count");
    recommendations.push("Expand page content to at least 500+ meaningful words");
  } else if (page.wordCount >= 800) {
    strengths.push(`Substantial content depth (${page.wordCount} words)`);
  }

  return {
    overallScore: clamp(overallScore, 0, 100),
    seoScore: clamp(seoScore, 0, 100),
    contentScore: clamp(contentScore, 0, 100),
    aiVisibilityScore: clamp(aiVisibilityScore, 0, 100),
    technicalScore: clamp(technicalScore, 0, 100),
    summary: `Analysis of ${page.url}. Page has ${page.wordCount} words, ${page.headings.length} headings. Title: "${page.title}".`,
    strengths,
    weaknesses,
    recommendations,
    keywordSuggestions: page.headings
      .filter((h) => h.length > 3 && h.length < 60)
      .slice(0, 5),
    modelUsed: "heuristic (no AI key configured)",
  };
}

function clamp(val: number, min: number, max: number): number {
  if (typeof val !== "number" || isNaN(val)) return Math.round((min + max) / 2);
  return Math.round(Math.max(min, Math.min(max, val)));
}
