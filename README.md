# AI Watch – V3

> Strategic technology intelligence platform powered by multi-source news aggregation and AI analysis

**AI Watch** continuously monitors technology trends, startup activity, funding rounds, and market signals. It fetches real news from four live APIs, analyzes each article with LLM-powered summarization, and surfaces actionable intelligence for technology leaders through an interactive React dashboard.

**Built for**: CTOs, Innovation Managers, Strategy Directors

**Branch**: ABDO

---

## What's New in V3

### Backend
- **Multi-LLM fallback chain** — OpenAI GPT-4o-mini → Anthropic Claude Haiku. If OpenAI fails or is not configured, Anthropic is used automatically. Both work through corporate SSL proxies (`httpx verify=False`)
- **Strategic AI prompts** — Summaries now follow a structured 4-point format: WHAT happened, WHY it matters strategically, WHO is affected, WHAT to watch next
- **Stateless `/api/summarize` endpoint** — Frontend sends article data directly; no cache lookup required
- **Auto-startup ingestion** — Server pre-populates article cache on startup via background thread
- **Hot reload** — `uvicorn` runs with `reload=True`; code changes are picked up without manual restart
- **Keyword extraction** — Every ingested article gets up to 6 SEO-style keywords extracted from title + description
- **Source API tracking** — Each article records which data source it came from (Perplexity, NewsAPI, NewsData, Google News)
- **Mock data removed** — All hardcoded fake articles, fallback feeds, and placeholder products deleted
- **`/api/test-llm` endpoint** — Diagnoses both OpenAI and Anthropic connectivity and key presence
- **`/api/debug/sources` endpoint** — Returns article counts broken down by source API

### Frontend — Explore Page
- **Article Detail page** (`/article/:id`) — Full detail view with signal badge, industry tag, source badge, Summary section, Key Info table, Key Actors, Funding, and Read Full Article button
- **Summary auto-generation** — ArticleDetail auto-calls `/api/summarize` on load when no summary exists
- **Keywords row** — Key Info table shows extracted keyword pills in purple
- **Refresh Intelligence** — Appends the next page of articles to the existing list (sorted newest-first)
- **Category combobox** — Industry filter is now a dropdown combobox replacing the overflow chip buttons
- **Grid / List toggle** — Switch between single-column list and two-column grid layouts
- **Empty state auto-ingest** — If the cache is empty on load, ingestion triggers automatically (once per session)

### Frontend — Reports Page
- **Professional PDF design** — Purple header banner, meta grid, executive summary, key findings pills, table of contents, per-article category colour bar, keywords pills, clickable "Read Full Article" links, purple page-number footers
- **Shared PDF utility** — `src/utils/generatePDF.js` — single source of truth used by both the Reports page and the Explore page download button
- **Daily Brief modal** — Clean white minimal design with stats cards, topic pills, article list with left-border signal indicator, and footer action buttons
- **STRONG/WEAK signal** appended inline on the article meta line (source | date | Relevance | STRONG)
- **Title overflow fix** — Font set to 10.5pt before `splitTextToSize` so wrapping is calculated at the correct character width (154mm max)

### Frontend — Data Preview Page
- **Real funding data** — Funding Rounds table fetches from `/api/funding`
- **Real actors data** — News Sources table fetches from `/api/actors`
- **Empty states** — Both tables show a descriptive message when no data is available yet

### Mobile / Responsive
- Sidebar collapses to a drawer on mobile (≤768px) with hamburger toggle and backdrop overlay
- Sidebar padding set to `0` so nav items start flush at the top
- CSS utility classes: `grid-2col`, `grid-4col`, `stack-mobile`, `hide-mobile`, `full-mobile`, `pad-mobile`, `filter-chips`, `pagination-bar`

---

## Tech Stack

**Backend**: FastAPI · Python 3.10+ · APScheduler · httpx · OpenAI SDK · Anthropic SDK

**Data Sources**: NewsAPI · NewsData · Google News RSS · Perplexity API

**Frontend**: React 19 · React Router v6 · Recharts · jsPDF · Lucide React

---

## Project Structure

```
ai-watch-V3/
├── api.py                    # FastAPI app — all REST endpoints
├── ingestion.py              # Multi-source news fetching + keyword extraction
├── summarizer.py             # LLM summarization (OpenAI → Anthropic fallback)
├── report_generator.py       # Markdown + PDF report generation
├── newsletter.py             # HTML email digest generation
├── powerbi_export.py         # CSV/JSON exports for Power BI
├── scheduler.py              # APScheduler daily ingestion job
├── .env                      # API keys (DO NOT COMMIT)
├── .env.example              # Key template
├── requirements.txt
│
└── aiwatch-frontend/
    └── src/
        ├── pages/
        │   ├── Explore.jsx         # News feed — filter, search, paginate, navigate
        │   ├── ArticleDetail.jsx   # Full article view with AI summary
        │   ├── DataPreview.jsx     # Charts, data table, funding & actors
        │   ├── Reports.jsx         # Saved reports with PDF export
        │   ├── Solutions.jsx       # DXC solution catalog
        │   ├── Matching.jsx        # AI readiness quiz + solution matching
        │   ├── Newsletter.jsx      # Weekly digest viewer
        │   └── Trends.jsx          # Market trend charts
        ├── components/
        │   └── CategoryCombobox.jsx  # Reusable industry filter dropdown
        ├── utils/
        │   └── generatePDF.js      # Shared professional PDF builder (jsPDF)
        └── services/
            └── api.js              # All API calls with retry + timeout
```

---

## API Keys

Copy `.env.example` to `.env` and fill in your keys:

```env
# Required (at least one LLM key)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# News sources (at least one recommended)
NEWS_API_KEY=...
NEWSDATA_API_KEY=...

# AI Trends (required for Trends page)
PERPLEXITY_API_KEY=pplx-...

# Newsletter email delivery (optional — saves HTML file if not set)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your@gmail.com
SMTP_PASSWORD=your_gmail_app_password   # Gmail App Password (16 chars, no spaces)
SMTP_FROM_EMAIL=your@gmail.com
NEWSLETTER_RECIPIENTS=recipient@example.com
```

The system works with any combination — if OpenAI is missing, Anthropic handles all summarization. If a news API key is missing, the other sources fill in. Without `PERPLEXITY_API_KEY` the Trends page will not load data. Without SMTP vars the newsletter is saved as an HTML file in `/reports/`.

---

## Get Started

### 1. Backend

```bash
python -m venv .venv
.venv\Scripts\activate        # Windows
source .venv/bin/activate     # macOS/Linux

pip install -r requirements.txt
cp .env.example .env          # add your API keys

python api.py
# → http://localhost:8000
# → auto-reloads on code changes
```

### 2. Frontend

```bash
cd aiwatch-frontend
npm install
npm start
# → http://localhost:3000
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server health + cache stats |
| GET | `/api/articles` | Paginated article list with filters |
| GET | `/api/articles/{id}` | Single article by ID |
| POST | `/api/summarize` | Generate AI summary for any article (English-only, caches result) |
| POST | `/api/ingest` | Trigger fresh news ingestion |
| GET | `/api/trends` | Get cached trends (all or filtered by category) |
| POST | `/api/trends/refresh` | Fetch fresh trends from Perplexity + re-cluster with GPT |
| GET | `/api/trends/saved` | Get watchlisted trends |
| GET | `/api/trends/top` | Top 3 trends by score |
| POST | `/api/trends/{id}/deepdive` | Generate deep-dive analysis for a trend |
| POST | `/api/trends/{id}/save` | Save trend to watchlist |
| DELETE | `/api/trends/{id}/save` | Remove trend from watchlist |
| GET | `/test-perplexity` | Debug: raw Perplexity API connection test |
| GET | `/api/funding` | Extracted funding rounds |
| GET | `/api/actors` | Key actors mentioned in articles |
| GET | `/api/reports` | Saved reports |
| POST | `/api/reports` | Save a new report |
| DELETE | `/api/reports/{id}` | Delete a saved report |
| GET | `/api/export/csv` | Download articles as CSV |
| GET | `/api/signals/live` | Live signal breakdown |
| GET | `/api/newsletter/status` | SMTP config + last send status |
| POST | `/api/newsletter/send` | Trigger manual newsletter send |
| POST | `/api/newsletter/subscribe` | Add email subscriber |
| DELETE | `/api/newsletter/unsubscribe` | Remove email subscriber |
| GET | `/api/debug/sources` | Articles count per source API |
| GET | `/api/test-llm` | Test OpenAI + Anthropic connectivity |

---

## Data Sources

| Source | Type | Cost | Key Required |
|--------|------|------|-------------|
| **Google News RSS** | RSS Feed | Free | No |
| **NewsAPI** | REST API | Free tier | `NEWS_API_KEY` |
| **NewsData** | REST API | Free tier | `NEWSDATA_API_KEY` |
| **Perplexity** | AI Search | Paid | `PERPLEXITY_API_KEY` |

---

## Dashboard Pages

| Page | Route | Description |
|------|-------|-------------|
| **Explore** | `/explore` | Browse articles, filter by industry, search, grid/list toggle, floating FAB |
| **Article Detail** | `/article/:id` | Full article with English AI summary (cached), key actors, funding |
| **AI Trends** | `/trends` | Live Perplexity trend intelligence, Deep Dive, watchlist, category tabs |
| **Data Preview** | `/data` | Charts, stats, data table, funding rounds, news sources |
| **Reports** | `/reports` | Saved intelligence reports with PDF/Markdown download |
| **Solutions** | `/solutions` | DXC solution catalog with fit scoring |
| **Matching** | `/matching` | AI readiness quiz → recommended solutions |
| **Newsletter** | `/newsletter` | Weekly digest with SMTP delivery and subscription management |

---

## Roadmap

### V1 — POC (done)
- News collection from NewsAPI
- AI article summarization
- Industry categorization + weak signal detection
- Startup extraction + newsletter digest

### V2 — MVP (done)
- Industry & market classification taxonomy
- Key actors and funding round extraction
- Auto-generated weekly newsletter
- Real-time BI dashboard with charts
- PDF report export

### V3 — MVP+ (current — branch: ABDO / main)
- Multi-source ingestion (4 APIs in parallel)
- OpenAI → Anthropic fallback chain
- Strategic AI prompts (WHAT / WHY / WHO / WHAT NEXT)
- Article Detail page with full context
- Keyword extraction per article
- Category combobox filter
- Append-on-refresh (load more without losing current articles)
- Mock data fully removed — 100% real API data
- Hot reload server
- Shared PDF utility (`generatePDF.js`) — one design, used everywhere
- Professional PDF: purple header, meta grid, TOC, category colour bars, keyword pills, clickable links
- Mobile-responsive sidebar drawer with hamburger toggle
- Daily Brief modal redesigned (white minimal, stats cards, signal left-border)

#### Latest updates (March 2026)
- **AI Trends page** (`/trends`) — live trend intelligence via Perplexity `sonar-pro` across 6 categories (LLM Models, Dev & Coding AI, AI Agents, Open Source AI, AI Infrastructure, Enterprise AI Apps). Strategic scoring, momentum indicators, Deep Dive modal, watchlist save/unsave
- **Trends client-side filtering** — all trends fetched once; category tabs filter locally with no server round-trip. LLM category values normalized to snake_case IDs after parsing
- **Trends auto-refresh** — background scheduler refreshes trends every 6 hours
- **`/test-perplexity` debug endpoint** — hits Perplexity directly and returns raw response, HTTP status, key preview and error details
- **Summary language enforcement** — `system` message role added to both OpenAI and Anthropic calls forcing English-only output regardless of article source language. French input context removed from summarize prompt
- **Summary caching** — generated summaries written back to `_articles_cache`; same article never re-summarised on repeat visits
- **ArticleDetail fetch fix** — page always fetches fresh from `GET /api/articles/{id}` on mount to pick up cached summaries; navstate used only for instant initial render
- **`load_dotenv()` in `api.py`** — fixes silent env key failure: `.env` file was present but keys were never loaded into the process, causing all Perplexity and OpenAI calls to return `None`
- **`asyncio.to_thread()`** — all synchronous OpenAI/Anthropic SDK calls wrapped to prevent blocking the uvicorn event loop (was causing intermittent "API DOWN" in navbar during LLM calls)
- **Health check debounce** — frontend flips to "API DOWN" only after 2 consecutive failures, eliminating false positives
- **Explore grid/list toggle** — `LayoutGrid` / `List` icon buttons at top-right of toolbar; grid is 3-col desktop → 2-col tablet → 1-col mobile
- **Floating Refresh button (FAB)** — `position: fixed; bottom: 28px; right: 28px` pill button, always visible while scrolling, replaces header button
- **SMTP newsletter delivery** — `SMTP_HOST/PORT/USERNAME/PASSWORD/FROM_EMAIL/NEWSLETTER_RECIPIENTS` env vars wired; Gmail App Password supported. Status visible at `/api/newsletter/status`
- **Verbose trend logging** — every step in `trends_service.py` prints to terminal: key preview, HTTP status, raw response, category normalization mapping, clustering output

### V4 — Planned
- Competitive radar (interactive map of market players)
- Technology maturity scoring per sector
- Trend prediction (6–12 month horizon)
- Investment opportunity scoring
- Saved filters and personalized watchlists
- Email alerts for high-relevance articles
- Multi-language support

---

**Version**: 3.1.0 | **Branch**: ABDO → main | **Status**: Active Development | **Last Updated**: March 28, 2026
