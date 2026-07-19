# GPTDoctors — AI Website Analysis Tool

An AI-powered website analysis platform that evaluates any URL and provides comprehensive SEO, content quality, and AI visibility scores.

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔧 Tech Stack

- **Next.js 14** — App Router, TypeScript
- **Tailwind CSS** — Dark theme, responsive design
- **OpenAI API** — GPT-4o-mini powered analysis (optional)

## 📊 Features

- **AI-Powered Analysis** — Uses GPT models to evaluate any website
- **Score Dashboard** — Overall, SEO, Content, AI Visibility, Technical scores
- **Strengths & Weaknesses** — Detailed breakdown of what's working and what's not
- **Actionable Recommendations** — Step-by-step improvement suggestions
- **Heuristic Fallback** — Works without an API key using built-in heuristics
- **Keyword Suggestions** — AI-generated keyword recommendations

## 🔑 API Key Setup (Optional)

For AI-powered analysis, create a `.env.local` file:

```bash
OPENAI_API_KEY=sk-your-key-here
# Optional: custom endpoint
# OPENAI_BASE_URL=https://your-endpoint.com/v1
# Optional: model override (default: gpt-4o-mini)
# OPENAI_MODEL=gpt-4
```

Without an API key, the tool uses heuristic analysis based on measurable page attributes (still useful, just not AI-powered).

## 📁 Project Structure

```
gptdoctors/
├── app/
│   ├── api/ai-audit/route.ts    # API endpoint for analysis
│   ├── ai-audit/page.tsx        # Audit tool UI
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Landing page
│   └── globals.css              # Global styles
├── lib/
│   ├── scraper.ts               # URL fetching & content extraction
│   └── analyzer.ts              # AI & heuristic analysis logic
├── components/                  # (extend here)
├── public/                      # Static assets
├── index.html                   # Original landing page (Aramis GEO AI)
├── tailwind.config.ts
├── next.config.js
└── package.json
```

## 🧪 API Endpoint

**POST** `/api/ai-audit`

```json
{
  "url": "https://example.com"
}
```

Returns scored analysis with strengths, weaknesses, and recommendations.
