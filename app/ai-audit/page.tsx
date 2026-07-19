"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

interface AuditResult {
  url: string;
  page: {
    title: string;
    description: string;
    wordCount: number;
    headingCount: number;
    headings: string[];
    hasSchema: boolean;
    hasOpenGraph: boolean;
  };
  analysis: {
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
  };
  meta: {
    fetchMs: number;
    analyzedAt: string;
  };
}

function ScoreBar({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-sm">
        <span className="text-white/70">{label}</span>
        <span className="font-semibold" style={{ color }}>
          {score}/100
        </span>
      </div>
      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: `${score}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
}

function AuditContent() {
  const searchParams = useSearchParams();
  const initialUrl = searchParams.get("url") || "";

  const [url, setUrl] = useState(initialUrl);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialUrl) {
      runAudit(initialUrl);
    }
  }, [initialUrl]);

  async function runAudit(u?: string) {
    const target = u || url;
    if (!target.trim()) {
      setError("Please enter a URL");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/ai-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: target }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Analysis failed");
        return;
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  }

  const scoreColor = (s: number) => {
    if (s >= 80) return "#10b981";
    if (s >= 60) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path
                d="M14 2L2 8v12l12 6 12-6V8L14 2z"
                stroke="#3b82f6"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="14" cy="14" r="4" fill="#3b82f6" />
            </svg>
            <span className="font-semibold text-lg">GPTDoctors</span>
          </a>
          <span className="text-sm text-white/50">AI Audit Tool</span>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Input form */}
        <div className="max-w-2xl mx-auto mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
            Website AI Analysis
          </h1>
          <p className="text-center text-white/60 mb-8">
            Enter any URL to get a comprehensive AI-powered audit
          </p>
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-1.5 flex items-center gap-2">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && runAudit()}
              placeholder="https://example.com"
              className="flex-1 bg-transparent text-white placeholder-white/40 px-4 py-3 outline-none text-sm"
            />
            <button
              onClick={() => runAudit()}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl px-6 py-3 text-sm font-medium transition whitespace-nowrap"
            >
              {loading ? "Analyzing..." : "Analyze →"}
            </button>
          </div>
          {error && (
            <p className="mt-4 text-red-400 text-sm text-center">{error}</p>
          )}
        </div>

        {/* Loading state */}
        {loading && (
          <div className="text-center py-20">
            <div className="inline-block w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4" />
            <p className="text-white/60">Fetching and analyzing page...</p>
            <p className="text-white/30 text-sm mt-2">This may take up to 30 seconds</p>
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div className="space-y-8 animate-fade-in-up">
            {/* Score cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { label: "Overall", score: result.analysis.overallScore, color: "#3b82f6" },
                { label: "SEO", score: result.analysis.seoScore, color: "#8b5cf6" },
                { label: "Content", score: result.analysis.contentScore, color: "#10b981" },
                { label: "AI Visibility", score: result.analysis.aiVisibilityScore, color: "#f59e0b" },
                { label: "Technical", score: result.analysis.technicalScore, color: "#ec4899" },
              ].map((card) => (
                <div
                  key={card.label}
                  className="bg-[#111] border border-white/10 rounded-2xl p-6 text-center"
                >
                  <div
                    className="text-4xl font-bold mb-2"
                    style={{ color: card.color }}
                  >
                    {card.score}
                  </div>
                  <div className="text-sm text-white/60">{card.label}</div>
                </div>
              ))}
            </div>

            {/* Score bars + summary */}
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-[#111] border border-white/10 rounded-2xl p-6 space-y-4">
                <h2 className="text-lg font-semibold mb-4">Score Breakdown</h2>
                <ScoreBar label="SEO" score={result.analysis.seoScore} color="#8b5cf6" />
                <ScoreBar label="Content Quality" score={result.analysis.contentScore} color="#10b981" />
                <ScoreBar label="AI Visibility" score={result.analysis.aiVisibilityScore} color="#f59e0b" />
                <ScoreBar label="Technical" score={result.analysis.technicalScore} color="#ec4899" />
              </div>

              <div className="bg-[#111] border border-white/10 rounded-2xl p-6">
                <h2 className="text-lg font-semibold mb-3">Page Summary</h2>
                <p className="text-white/70 leading-relaxed text-sm mb-4">
                  {result.analysis.summary}
                </p>
                <div className="text-xs text-white/40 space-y-1">
                  <p>URL: {result.url}</p>
                  <p>Title: {result.page.title || "N/A"}</p>
                  <p>Words: {result.page.wordCount} | Headings: {result.page.headingCount}</p>
                  <p>Schema: {result.page.hasSchema ? "✅" : "❌"} | OG: {result.page.hasOpenGraph ? "✅" : "❌"}</p>
                  <p>Model: {result.analysis.modelUsed}</p>
                </div>
              </div>
            </div>

            {/* Strengths & Weaknesses */}
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-[#111] border border-green-500/20 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-green-400 mb-4">
                  ✅ Strengths
                </h2>
                {result.analysis.strengths.length > 0 ? (
                  <ul className="space-y-2">
                    {result.analysis.strengths.map((s, i) => (
                      <li key={i} className="flex gap-2 text-sm text-white/70">
                        <span className="text-green-400 flex-shrink-0">•</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-white/40 text-sm">No significant strengths detected.</p>
                )}
              </div>

              <div className="bg-[#111] border border-red-500/20 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-red-400 mb-4">
                  ⚠️ Weaknesses
                </h2>
                {result.analysis.weaknesses.length > 0 ? (
                  <ul className="space-y-2">
                    {result.analysis.weaknesses.map((w, i) => (
                      <li key={i} className="flex gap-2 text-sm text-white/70">
                        <span className="text-red-400 flex-shrink-0">•</span>
                        {w}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-white/40 text-sm">No significant weaknesses detected.</p>
                )}
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-[#111] border border-blue-500/20 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-blue-400 mb-4">
                💡 Recommendations
              </h2>
              {result.analysis.recommendations.length > 0 ? (
                <ul className="space-y-3">
                  {result.analysis.recommendations.map((r, i) => (
                    <li
                      key={i}
                      className="flex gap-3 text-sm text-white/70 bg-blue-500/5 rounded-xl p-3"
                    >
                      <span className="text-blue-400 font-bold flex-shrink-0">
                        {i + 1}.
                      </span>
                      {r}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-white/40 text-sm">No specific recommendations generated.</p>
              )}
            </div>

            {/* Keywords */}
            {result.analysis.keywordSuggestions.length > 0 && (
              <div className="bg-[#111] border border-white/10 rounded-2xl p-6">
                <h2 className="text-lg font-semibold mb-4">
                  🔑 Suggested Keywords
                </h2>
                <div className="flex flex-wrap gap-2">
                  {result.analysis.keywordSuggestions.map((kw, i) => (
                    <span
                      key={i}
                      className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-white/70"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AIAuditPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        </div>
      }
    >
      <AuditContent />
    </Suspense>
  );
}
