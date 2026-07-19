/**
 * Page scraper — fetches a URL, extracts text content and metadata.
 * Runs server-side only (Node.js).
 */

export interface ScrapedPage {
  url: string;
  title: string;
  description: string;
  bodyText: string;
  headings: string[];
  wordCount: number;
  hasSchemaOrg: boolean;
  hasOpenGraph: boolean;
  metaTags: Record<string, string>;
  fetchDurationMs: number;
  error?: string;
}

export async function scrapePage(url: string): Promise<ScrapedPage> {
  const start = Date.now();
  const normalized = url.startsWith("http") ? url : `https://${url}`;

  let html: string;

  try {
    const res = await fetch(normalized, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; GPTDoctors/1.0; +https://gptdoctors.ai)",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      return {
        url: normalized,
        title: "",
        description: "",
        bodyText: "",
        headings: [],
        wordCount: 0,
        hasSchemaOrg: false,
        hasOpenGraph: false,
        metaTags: {},
        fetchDurationMs: Date.now() - start,
        error: `HTTP ${res.status}: ${res.statusText}`,
      };
    }

    html = await res.text();
  } catch (err: any) {
    return {
      url: normalized,
      title: "",
      description: "",
      bodyText: "",
      headings: [],
      wordCount: 0,
      hasSchemaOrg: false,
      hasOpenGraph: false,
      metaTags: {},
      fetchDurationMs: Date.now() - start,
      error: err.message || "Failed to fetch page",
    };
  }

  // Extract title
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : "";

  // Extract meta description
  const descMatch = html.match(
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i
  );
  const description = descMatch ? descMatch[1].trim() : "";

  // Extract all meta tags
  const metaTags: Record<string, string> = {};
  const metaRegex = /<meta[^>]+(?:name|property)=["']([^"']+)["'][^>]+content=["']([^"']*)["']/gi;
  let m;
  while ((m = metaRegex.exec(html)) !== null) {
    metaTags[m[1]] = m[2];
  }

  // Check structured data
  const hasSchemaOrg =
    /application\/ld\+json/.test(html) || /itemscope/.test(html);
  const hasOpenGraph = /og:/.test(html);

  // Extract headings
  const headings: string[] = [];
  const headingRegex = /<h[1-6][^>]*>([^<]*)<\/h[1-6]>/gi;
  let h;
  while ((h = headingRegex.exec(html)) !== null) {
    headings.push(h[1].trim().replace(/\s+/g, " "));
  }

  // Strip HTML tags for body text
  let bodyText = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Truncate for AI analysis (first ~8000 chars is usually enough for meaningful analysis)
  const maxLen = 8000;
  if (bodyText.length > maxLen) {
    bodyText = bodyText.substring(0, maxLen) + "...";
  }

  const wordCount = bodyText.split(/\s+/).length;

  return {
    url: normalized,
    title,
    description,
    bodyText,
    headings,
    wordCount,
    hasSchemaOrg,
    hasOpenGraph,
    metaTags,
    fetchDurationMs: Date.now() - start,
  };
}
