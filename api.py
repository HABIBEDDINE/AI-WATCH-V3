from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from typing import List, Optional, Dict, Tuple
import time
import random
import csv
import io
from datetime import datetime, timedelta

from ingestion import fetch_sector_news
from summarizer import summarize_articles
from main import PRESET_SECTORS
import scheduler

app = FastAPI(title="AI Watch API")

# Configure CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React development server
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Mock DXC solutions mapping for the frontend 
# (Since the backend summarizer doesn't natively generate these yet)
DXC_SOLUTIONS = [
    {"name": "AI Readiness Assessment", "fit": 94, "timeline": "1–3 weeks", "cta": "Run Assessment"},
    {"name": "Agentic AI Accelerator", "fit": 88, "timeline": "1–2 months", "cta": "Book Assessment"},
    {"name": "AI Use Case Radar", "fit": 76, "timeline": "2–3 weeks", "cta": "Explore"},
    {"name": "Gen AI MVP", "fit": 85, "timeline": "6–10 weeks", "cta": "Schedule Workshop"},
    {"name": "Intelligent Analytics", "fit": 79, "timeline": "1–2 weeks", "cta": "Request Demo"},
    {"name": "Data Framework", "fit": 82, "timeline": "3–6 months", "cta": "Compliance Audit"},
    {"name": "ROI Simulator", "fit": 90, "timeline": "1–2 months", "cta": "Model ROI"},
]

PERSONA_TOPIC_MAP = {
    "cto": "AI",
    "innovation": "Fintech",
    "strategy": "Cybersecurity"
}

DEFAULT_PRODUCT_LIBRARY = {
    "cto": [
        {"name": "AI Readiness Assessment", "score": 94, "fit": "Critical", "desc": "Full AI maturity evaluation across data, infra & governance", "time": "1-3 weeks", "tag": "Quick Start"},
        {"name": "Agentic AI Accelerator", "score": 88, "fit": "High", "desc": "Deploy autonomous workflows for supply chain operations", "time": "1-2 months", "tag": "Competitive Edge"},
        {"name": "AI Use Case Radar", "score": 76, "fit": "Strategic", "desc": "Continuous sector-specific AI trend scanning and alerting", "time": "2-3 weeks", "tag": "Ongoing"},
    ],
    "innovation": [
        {"name": "AI Use Case Radar", "score": 97, "fit": "Critical", "desc": "Sector intelligence for competitive benchmarking", "time": "2-3 weeks", "tag": "Top Match"},
        {"name": "Gen AI MVP", "score": 85, "fit": "High", "desc": "Scalable Generative AI deployment framework with guardrails", "time": "6-10 weeks", "tag": "High Impact"},
        {"name": "Intelligent Analytics", "score": 79, "fit": "Strategic", "desc": "ML and NLP pipeline for market insights", "time": "1-2 weeks", "tag": "Quick Win"},
    ],
    "strategy": [
        {"name": "ROI Simulator", "score": 96, "fit": "Critical", "desc": "Quantify AI investment value with financial modeling", "time": "1-2 months", "tag": "Decision Ready"},
        {"name": "Data Framework", "score": 91, "fit": "Critical", "desc": "Unified governance and EU AI Act compliance architecture", "time": "3-6 months", "tag": "Foundation"},
        {"name": "AI Readiness Assessment", "score": 82, "fit": "High", "desc": "AI maturity benchmark and strategic roadmap", "time": "1-3 weeks", "tag": "Quick Start"},
    ],
}

CACHE_TTL_SECONDS = 180
_summary_cache: Dict[Tuple[str, int, int], dict] = {}


def get_topic_from_persona(persona: str) -> str:
    return PERSONA_TOPIC_MAP.get(persona, "AI")


def _get_cache_key(persona: str, max_articles: int, days_back: int) -> Tuple[str, int, int]:
    return (persona, max_articles, days_back)


def _get_cached_summary(persona: str, max_articles: int, days_back: int) -> Optional[List[dict]]:
    key = _get_cache_key(persona, max_articles, days_back)
    entry = _summary_cache.get(key)
    if not entry:
        return None

    if (time.time() - entry["ts"]) > CACHE_TTL_SECONDS:
        _summary_cache.pop(key, None)
        return None

    # Return shallow copies so callers do not mutate cache entries.
    return [dict(item) for item in entry["data"]]


def _set_cached_summary(persona: str, max_articles: int, days_back: int, data: List[dict]) -> None:
    key = _get_cache_key(persona, max_articles, days_back)
    _summary_cache[key] = {
        "ts": time.time(),
        "data": [dict(item) for item in data],
    }


def get_summarized_articles(persona: str, max_articles: int, days_back: int = 3) -> List[dict]:
    """Fetch and summarize articles for a persona topic."""
    cached = _get_cached_summary(persona, max_articles, days_back)
    if cached is not None:
        return cached

    topic = get_topic_from_persona(persona)
    sector_queries = {topic: PRESET_SECTORS.get(topic, topic)}

    raw_news = fetch_sector_news(
        sector_queries,
        days_back=days_back,
        max_per_sector=max_articles,
        use_perplexity=False
    )

    articles = raw_news.get(topic, [])
    summarized = summarize_articles(articles) if articles else []
    filtered = [a for a in summarized if a.get('relevance_score', 0) >= 4]
    _set_cached_summary(persona, max_articles, days_back, filtered)
    return filtered


def get_trend_series(articles: List[dict]) -> List[int]:
    """Create a simple 7-day trend line from article relevance and recency."""
    if not articles:
        return [0, 0, 0, 0, 0, 0, 0]

    base = [max(1, len(articles) // 3)] * 7
    for i, a in enumerate(articles[:14]):
        idx = i % 7
        base[idx] += max(1, int(a.get('relevance_score', 5) / 2))
    return base


def get_top_topics(articles: List[dict]) -> List[dict]:
    """Build top topics from article metadata."""
    counts = {}
    for a in articles:
        labels = [
            a.get('industry', 'General'),
            a.get('market_segment', 'General'),
            a.get('signal_type', 'Signal')
        ]
        for label in labels:
            if not label or label in ["Other", "General", "No clear segment", "Unknown", "Signal"]:
                continue
            counts[label] = counts.get(label, 0) + 1

    ranked = sorted(counts.items(), key=lambda x: x[1], reverse=True)[:3]
    if not ranked:
        ranked = [("AI Intelligence", 1), ("Market Signals", 1), ("Competitive Watch", 1)]

    max_count = ranked[0][1] if ranked else 1
    topics = []
    for name, count in ranked:
        pct = min(99, 40 + int((count / max_count) * 59))
        topics.append({"topic": name, "pct": pct, "delta": f"+{max(1, count * 2)}%"})
    return topics


def get_journey(feed: List[dict], products: List[dict], sector_name: str) -> List[dict]:
    """Generate a lightweight journey timeline."""
    top_signal = feed[0]["title"][:55] + "..." if feed else "No signal opened yet"
    top_product = products[0] if products else {"name": "AI Readiness Assessment", "fit": "High", "score": 80}

    return [
        {"done": True, "title": "Platform Connected", "desc": f"Sector configured: {sector_name}", "time": "Today"},
        {"done": True, "title": "Intelligence Feed Active", "desc": f"{len(feed)} signals detected and filtered", "time": "Today"},
        {"done": len(feed) > 0, "title": "Signal Explored", "desc": top_signal, "time": "Today" if feed else "Pending"},
        {"done": len(products) > 0, "title": "DXC Solution Matched", "desc": f"{top_product['name']} - {top_product['fit']} fit ({top_product['score']}%)", "time": "Today" if products else "Pending"},
        {"done": False, "title": "Schedule Discovery Call", "desc": "30-min session with DXC Data and AI team", "time": "Pending"},
        {"done": False, "title": "Download Sector Brief", "desc": f"Full AI landscape report for {sector_name}", "time": "Pending"},
    ]

def map_article_to_frontend(article_id: int, a: dict) -> dict:
    """Map python backend article format to the React frontend format."""
    
    # Determine urgency based on relevance
    relevance = a.get('relevance_score', 5)
    urgency = "LOW"
    if relevance >= 8:
        urgency = "HIGH"
    elif relevance >= 6:
        urgency = "MEDIUM"
        
    # Generate mock DXC mapping based on the text (random selection for POC)
    random.seed(article_id) # Consistent per article
    dxc = random.choice(DXC_SOLUTIONS).copy()
    dxc['fit'] = min(99, relevance * 10 + random.randint(-5, 5))
    
    # Extract tags
    signals = []
    ind = a.get('industry')
    if ind and ind != "Other":
        signals.append(str(ind))
    
    seg = a.get('market_segment')
    if seg and seg != "General":
        signals.append(str(seg))
        
    sig = a.get('signal_type')
    if sig in ["Weak Signal", "Strong Signal"]:
        signals.append(str(sig))
        
    if not signals:
        signals = ["Tech News"]

    return {
        "id": article_id,
        "urgency": urgency,
        "tag": "Alert",
        "source": a.get("source", "Unknown"),
        "time": "Recent",
        "title": a.get("title", "No Title"),
        "summary": a.get("summary", ""),
        "signals": signals[:3],  # Limit to 3 tags
        "dxc": dxc
    }

@app.get("/api/feed")
def get_feed(persona: str = Query("cto"), max_articles: int = 5):
    """
    Get the intelligence feed for a specific persona or topic.
    Maps to the python backend's existing summarization pipeline.
    """
    
    summarized = get_summarized_articles(persona=persona, max_articles=max_articles, days_back=3)

    mapped_feed = []
    for i, a in enumerate(summarized, 1):
        mapped_feed.append(map_article_to_frontend(i, a))
            
    return {"feed": mapped_feed}


@app.get("/api/radar")
def get_radar(persona: str = Query("cto"), max_articles: int = 8):
    """Get recommended DXC solutions for the persona."""
    summarized = get_summarized_articles(persona=persona, max_articles=max_articles, days_back=5)
    base_products = DEFAULT_PRODUCT_LIBRARY.get(persona, DEFAULT_PRODUCT_LIBRARY["cto"])

    avg_relevance = int(sum(a.get('relevance_score', 5) for a in summarized) / max(1, len(summarized)))
    boost = max(-5, min(8, avg_relevance - 6))

    products = []
    for p in base_products:
        updated = p.copy()
        updated["score"] = max(50, min(99, int(p["score"]) + boost))
        products.append(updated)

    return {"products": products}


@app.get("/api/trends")
def get_trends(persona: str = Query("cto"), max_articles: int = 12):
    """Get trend chart and top topic data for the persona."""
    summarized = get_summarized_articles(persona=persona, max_articles=max_articles, days_back=7)
    series = get_trend_series(summarized)
    top_topics = get_top_topics(summarized)
    latest = series[-1] if series else 0
    baseline = max(1, sum(series[:-1]) / max(1, len(series) - 1))
    delta_pct = int(((latest - baseline) / baseline) * 100)

    return {
        "series": series,
        "latest": latest,
        "delta": f"{delta_pct:+d}%",
        "top_topics": top_topics
    }


@app.get("/api/journey")
def get_journey_data(persona: str = Query("cto"), max_articles: int = 6):
    """Get timeline milestones for journey tab."""
    topic = get_topic_from_persona(persona)
    sector_name = {
        "cto": "Automotive and Manufacturing",
        "innovation": "Banking and Finance",
        "strategy": "Public Sector"
    }.get(persona, topic)

    summarized = get_summarized_articles(persona=persona, max_articles=max_articles, days_back=4)
    feed = [map_article_to_frontend(i, a) for i, a in enumerate(summarized, 1)]

    radar_products = get_radar(persona=persona, max_articles=max_articles).get("products", [])
    journey = get_journey(feed=feed, products=radar_products, sector_name=sector_name)
    return {"steps": journey}


@app.get("/health")
def health_check():
    """Simple backend health endpoint for frontend status indicator."""
    return {
        "status": "ok",
        "service": "ai-watch-api",
        "cache_entries": len(_summary_cache),
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }


# ==================== NEW ENDPOINTS FOR FRONTEND ====================

# Global article cache (replace with database in production)
_articles_cache: List[dict] = []
_last_ingest_time = None


@app.get("/api/articles")
def get_articles(
    topic: Optional[str] = Query(None),
    signal: Optional[str] = Query(None),  # Strong/Weak/All
    industry: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    date_from: Optional[str] = Query(None),
    date_to: Optional[str] = Query(None),
):
    """
    Get articles with filtering and pagination.
    
    Query params:
        - topic: Filter by topic (AI, Fintech, etc.)
        - signal: Filter by signal strength (Strong/Weak/All)
        - industry: Filter by industry
        - search: Full-text search in title/summary
        - page: Page number (1-indexed)
        - page_size: Items per page (1-100)
        - date_from: ISO date format (YYYY-MM-DD)
        - date_to: ISO date format (YYYY-MM-DD)
    """
    
    # Start with all cached articles
    filtered = _articles_cache.copy()
    
    # Apply filters
    if topic:
        filtered = [a for a in filtered if a.get('topic', '').lower() == topic.lower()]
    
    if signal and signal != "All":
        filtered = [a for a in filtered if a.get('signal_strength') == signal]
    
    if industry:
        filtered = [a for a in filtered if industry.lower() in a.get('industry', '').lower()]
    
    if search:
        search_lower = search.lower()
        filtered = [
            a for a in filtered 
            if search_lower in a.get('title', '').lower() 
            or search_lower in a.get('summary', '').lower()
        ]
    
    if date_from:
        filtered = [a for a in filtered if a.get('published_at', '') >= date_from]
    
    if date_to:
        filtered = [a for a in filtered if a.get('published_at', '') <= date_to]
    
    # Pagination
    total = len(filtered)
    start = (page - 1) * page_size
    end = start + page_size
    paginated = filtered[start:end]
    
    return {
        "items": paginated,
        "total": total,
        "page": page,
        "page_size": page_size,
        "pages": (total + page_size - 1) // page_size,
    }


@app.get("/api/articles/{article_id}")
def get_article_detail(article_id: str):
    """Get detailed view of a single article."""
    for article in _articles_cache:
        if article.get('id') == article_id:
            return article
    
    return {"error": "Article not found"}, 404


@app.get("/api/signals/live")
def get_live_signals():
    """Get current live signals metrics."""
    # Count signal types from cached articles
    strong_count = sum(1 for a in _articles_cache if a.get('signal_strength') == 'Strong')
    weak_count = sum(1 for a in _articles_cache if a.get('signal_strength') == 'Weak')
    
    return {
        "agentic_ai": strong_count,
        "patent_filings": strong_count // 2,
        "funding_rounds": weak_count // 3,
        "regulatory_updates": (strong_count + weak_count) // 4,
    }


@app.get("/api/sectors/top")
def get_top_sectors():
    """Get top performing sectors based on article activity."""
    sector_scores = {}
    
    for article in _articles_cache:
        industry = article.get('industry', 'General')
        relevance = article.get('relevance', 5)
        sector_scores[industry] = sector_scores.get(industry, 0) + relevance
    
    # Sort and convert to TopSector format
    sorted_sectors = sorted(sector_scores.items(), key=lambda x: x[1], reverse=True)
    
    return [
        {
            "name": name,
            "score": min(100, int(score / len(_articles_cache) * 10)) if _articles_cache else 50,
        }
        for name, score in sorted_sectors[:10]
    ]


# Mock reports data
MOCK_REPORTS = [
    {
        "id": "1",
        "title": "AI Intelligence Report - Week of Mar 10, 2026",
        "generated_date": "2026-03-16T14:22:00Z",
        "article_count": 12,
        "funding_count": 3,
        "summary": "This week marked significant advances in enterprise AI adoption, with major corporations deploying autonomous agents across supply chains. Patent activity surged 45% year-over-year for AI-hardware integration, while regulatory frameworks solidified with EU AI Act enforcement timelines confirmed. Three major funding rounds totaling $1.2B were announced in autonomous systems, indicating strong market confidence.",
        "key_points": [
            "Agentic AI systems gaining adoption in enterprise supply chain management",
            "Patent filings for LiDAR + Gen AI synthesis increased 45% YoY",
            "EU AI Act enforcement timeline confirmed for Q3 2026",
            "Three major funding rounds announced in autonomous systems space",
            "Regulatory compliance tools emerging as fastest-growing market segment"
        ],
        "recommendations": [
            "Begin AI readiness assessment within next 30 days",
            "Establish data governance framework for compliance",
            "Evaluate autonomous agent solutions for supply chain optimization"
        ],
        "articles": [
            {
                "id": 1,
                "number": "1",
                "title": "Toyota deploys Agentic AI for autonomous supply chain",
                "source": "TechCrunch",
                "date": "2026-03-15",
                "signal": "strong",
                "relevance": 9,
                "industry": "Automotive",
                "summary": "Toyota deployed autonomous AI agent network managing 340+ suppliers globally, achieving 23% cost reduction and cutting decision latency from 4 hours to 8 minutes.",
                "url": "https://techcrunch.com/2026/03/15/toyota-ai-supply-chain/"
            },
            {
                "id": 2,
                "number": "2",
                "title": "EU AI Act enforcement begins Q3 as tech giants prepare compliance",
                "source": "Reuters",
                "date": "2026-03-14",
                "signal": "strong",
                "relevance": 8,
                "industry": "Regulatory",
                "summary": "European regulatory bodies confirm Q3 2026 enforcement date for the comprehensive AI Act, requiring all vendors to implement risk classification and audit frameworks.",
                "url": "https://reuters.com/2026/03/14/eu-ai-act-enforcement/"
            },
            {
                "id": 3,
                "number": "3",
                "title": "LiDAR-Gen AI patent filings surge 45% in Q1 2026",
                "source": "WIPO Patent Review",
                "date": "2026-03-10",
                "signal": "strong",
                "relevance": 7,
                "industry": "Autonomous Systems",
                "summary": "World Intellectual Property Organization reports unprecedented surge in combined LiDAR sensor and generative AI patent applications, signaling major innovation in autonomous vehicle perception.",
                "url": "https://wipo.org/2026/03/10/patent-trends/"
            }
        ]
    },
    {
        "id": "2",
        "title": "Strategic Intelligence Brief - Fintech & Payments",
        "generated_date": "2026-03-15T09:45:00Z",
        "article_count": 8,
        "funding_count": 2,
        "summary": "The fintech sector experienced rapid AI integration with fraud detection systems reducing transaction failures by 40%. European sovereign AI initiatives are reshaping the competitive landscape, while payment processing infrastructure continues to advance toward sub-millisecond latency goals. Market consolidation continues as major players acquire specialized AI providers.",
        "key_points": [
            "Real-time fraud detection AI reducing transaction failures by 40%",
            "European LLM regulation driving sovereign AI adoption",
            "Payment processing latency down to sub-millisecond levels",
            "Cross-border payment settlement accelerated with AI routing",
            "Compliance cost reduction of 35% through automated monitoring"
        ],
        "recommendations": [
            "Implement advanced fraud detection systems immediately",
            "Prepare for sovereign AI infrastructure requirements in EU markets",
            "Invest in latency optimization for payment infrastructure"
        ],
        "articles": [
            {
                "id": 4,
                "number": "1",
                "title": "Stripe launches AI fraud detection system reducing false positives by 60%",
                "source": "VentureBeat",
                "date": "2026-03-13",
                "signal": "strong",
                "relevance": 9,
                "industry": "Fintech",
                "summary": "Stripe announced breakthrough AI model for real-time fraud detection, reducing false positive rates to near-zero while catching 99.8% of fraudulent transactions.",
                "url": "https://venturebeat.com/2026/03/13/stripe-ai-fraud/"
            },
            {
                "id": 5,
                "number": "2",
                "title": "European sovereign AI initiative launched - €2B investment",
                "source": "EU Commission Press",
                "date": "2026-03-12",
                "signal": "strong",
                "relevance": 8,
                "industry": "Policy",
                "summary": "European Commission announces €2 billion investment in indigenous AI development to reduce technology dependence and support fintech compliance with new regulatory frameworks.",
                "url": "https://ec.europa.eu/2026/03/12/sovereign-ai-initiative/"
            }
        ]
    },
    {
        "id": "3",
        "title": "Market Deep Dive - Enterprise AI Adoption 2026",
        "generated_date": "2026-03-14T16:30:00Z",
        "article_count": 15,
        "funding_count": 5,
        "summary": "Enterprise AI adoption accelerated dramatically in Q1 2026, with Fortune 500 companies allocating average 18% increase in AI budgets. Autonomous agents proved most effective in operational tasks, while concerns about regulation and data privacy remain top challenges. Market consolidation continues with mega-deals reshaping the competitive landscape.",
        "key_points": [
            "Fortune 500 average AI budget increase: 18% QoQ",
            "Autonomous agents approved for 45% of operational workflows",
            "Data privacy concerns cited by 73% of enterprises",
            "Hybrid AI-human teams showing 32% productivity gains",
            "ROI realization timeline shortened to 8-12 months on average"
        ],
        "recommendations": [
            "Establish clear AI governance and risk management frameworks",
            "Invest in hybrid AI-human team training programs",
            "Plan for 24-month AI transformation roadmap"
        ],
        "articles": [
            {
                "id": 6,
                "number": "1",
                "title": "Fortune 500 AI spending surges: average 18% increase confirmed",
                "source": "McKinsey & Company",
                "date": "2026-03-11",
                "signal": "strong",
                "relevance": 9,
                "industry": "Enterprise",
                "summary": "McKinsey's latest enterprise AI survey confirms sustained momentum in AI investments with Fortune 500 companies committing record budgets to autonomous systems and decision support platforms.",
                "url": "https://mckinsey.com/2026/03/11/fortune-500-ai-spending/"
            }
        ]
    }
]


@app.get("/api/reports")
def get_reports(page: int = Query(1, ge=1), page_size: int = Query(10, ge=1, le=100)):
    """Get list of all reports with pagination."""
    total = len(MOCK_REPORTS)
    start = (page - 1) * page_size
    end = start + page_size
    paginated = MOCK_REPORTS[start:end]
    
    return {
        "items": paginated,
        "total": total,
        "page": page,
        "page_size": page_size,
        "pages": (total + page_size - 1) // page_size,
    }


@app.get("/api/reports/{report_id}")
def get_report_detail(report_id: str):
    """Get detailed view of a single report."""
    for report in MOCK_REPORTS:
        if report.get('id') == report_id:
            return report
    
    return {"error": "Report not found"}, 404


@app.post("/api/ingest")
def trigger_ingest(topic: Optional[str] = Query(None)):
    """
    Manually trigger data ingestion from NEWS_API and/or PERPLEXITY.
    
    Query params:
        - topic: Specific topic to ingest (AI, Fintech, etc.)
                 If not specified, ingests all 6 topics
    
    Behavior:
        1. CLEARS existing cache
        2. Fetches fresh data from NEWS_API for specified topic(s)
        3. Processes articles through summarizer
        4. Returns new articles count and timestamp
    """
    from ingestion import run_ingestion, PRESET_SECTORS
    import logging
    
    logger = logging.getLogger(__name__)
    
    global _articles_cache, _last_ingest_time
    
    results = []
    
    try:
        # CLEAR existing cache to replace with fresh data
        _articles_cache.clear()
        logger.info(f"🔄 Cleared cache. Fetching fresh data from NEWS_API...")
        
        if topic:
            # Ingest specific topic
            if topic not in PRESET_SECTORS:
                return {"error": f"Unknown topic: {topic}"}, 400
            
            logger.info(f"📡 Fetching articles for topic: {topic}")
            articles = run_ingestion(topic=topic, limit=20)
            results.extend(articles)
            _articles_cache.extend(articles)
            
        else:
            # Ingest all 6 topics
            logger.info(f"📡 Fetching articles for all 6 topics...")
            for t in PRESET_SECTORS.keys():
                articles = run_ingestion(topic=t, limit=20)
                results.extend(articles)
                _articles_cache.extend(articles)
        
        _last_ingest_time = datetime.now().isoformat()
        
        logger.info(f"✅ Ingest complete. Total articles: {len(results)}")
        
        return {
            "status": "success",
            "count": len(results),
            "timestamp": _last_ingest_time,
            "message": f"Fetched {len(results)} fresh articles from NEWS_API"
        }
        
    except Exception as e:
        logger.error(f"❌ Ingestion error: {e}", exc_info=True)
        return {"error": str(e)}, 500


@app.get("/api/funding")
def get_funding_rounds(page: int = Query(1, ge=1), page_size: int = Query(25, ge=1, le=100)):
    """Get all detected funding rounds from articles."""
    # Extract funding rounds from articles
    funding_rounds = []
    
    for article in _articles_cache:
        if 'funding_rounds' in article:
            funding_rounds.extend(article['funding_rounds'])
    
    # Pagination
    total = len(funding_rounds)
    start = (page - 1) * page_size
    end = start + page_size
    
    return {
        "items": funding_rounds[start:end],
        "total": total,
        "page": page,
        "page_size": page_size,
    }


@app.get("/api/actors")
def get_key_actors(page: int = Query(1, ge=1), page_size: int = Query(25, ge=1, le=100)):
    """Get all detected key actors from articles."""
    # Extract and deduplicate actors
    actors_map = {}
    
    for article in _articles_cache:
        if 'key_actors' in article:
            for actor in article['key_actors']:
                key = f"{actor['name']}_{actor['type']}"
                if key not in actors_map:
                    actors_map[key] = {**actor, 'mentions': 0}
                actors_map[key]['mentions'] += 1
    
    # Sort by mentions
    actors_list = sorted(actors_map.values(), key=lambda x: x['mentions'], reverse=True)
    
    # Pagination
    total = len(actors_list)
    start = (page - 1) * page_size
    end = start + page_size
    
    return {
        "items": actors_list[start:end],
        "total": total,
        "page": page,
        "page_size": page_size,
    }


@app.get("/api/export/csv")
def export_articles_csv(topic: Optional[str] = Query(None), signal: Optional[str] = Query(None)):
    """
    Export current filtered articles as CSV.
    Returns CSV file download.
    """
    import csv
    import io
    from fastapi.responses import StreamingResponse
    
    # Get filtered articles
    filtered = _articles_cache.copy()
    
    if topic:
        filtered = [a for a in filtered if a.get('topic', '').lower() == topic.lower()]
    
    if signal and signal != "All":
        filtered = [a for a in filtered if a.get('signal_strength') == signal]
    
    # Create CSV
    output = io.StringIO()
    writer = csv.DictWriter(
        output,
        fieldnames=['title', 'source', 'published_at', 'signal_strength', 'relevance', 'industry', 'url']
    )
    writer.writeheader()
    
    for article in filtered:
        writer.writerow({
            'title': article.get('title', ''),
            'source': article.get('source', ''),
            'published_at': article.get('published_at', ''),
            'signal_strength': article.get('signal_strength', ''),
            'relevance': article.get('relevance', ''),
            'industry': article.get('industry', ''),
            'url': article.get('url', ''),
        })
    
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=articles_export.csv"}
    )


# Mock article data for initial cache population
MOCK_ARTICLES_DATA = [
    {
        "id": "1",
        "title": "Toyota deploys Agentic AI for autonomous supply chain — 23% cost reduction",
        "source": "TechCrunch",
        "published_at": "2026-03-15",
        "signal_strength": "Strong",
        "relevance": 9,
        "industry": "Automotive",
        "topic": "AI",
        "summary": "Toyota's new AI agent network autonomously manages 340+ suppliers, reducing costs by 23%.",
        "url": "https://techcrunch.com/example"
    },
    {
        "id": "2",
        "title": "HSBC launches real-time AI fraud detection — 99.2% accuracy",
        "source": "Financial Times",
        "published_at": "2026-03-14",
        "signal_strength": "Strong",
        "relevance": 8,
        "industry": "Banking",
        "topic": "Fintech",
        "summary": "HSBC deploys AI-native fraud detection processing 2.3M transactions/second.",
        "url": "https://ft.com/example"
    },
    {
        "id": "3",
        "title": "EU AI Act enforcement begins — first fines expected by Q2",
        "source": "EUR-Lex",
        "published_at": "2026-03-13",
        "signal_strength": "Weak",
        "relevance": 7,
        "industry": "Legal & Compliance",
        "topic": "Regulation",
        "summary": "European Commission announces enforcement framework with first fines in Q2.",
        "url": "https://eur-lex.europa.eu/example"
    },
    {
        "id": "4",
        "title": "Synthesia raises €40M for AI video generation platform",
        "source": "Dealroom",
        "published_at": "2026-03-12",
        "signal_strength": "Strong",
        "relevance": 8,
        "industry": "Media & Entertainment",
        "topic": "AI",
        "summary": "London-based Synthesia closes €40M Series C for AI video synthesis.",
        "url": "https://dealroom.co/example"
    },
    {
        "id": "5",
        "title": "Moderna partners with Genentech on AI-designed therapeutics",
        "source": "BiopharmGuy",
        "published_at": "2026-03-11",
        "signal_strength": "Strong",
        "relevance": 8,
        "industry": "Healthcare",
        "topic": "HealthTech",
        "summary": "Collaboration aims to accelerate drug development cycles by 30%.",
        "url": "https://biopharmaguy.com/example"
    }
]


def initialize_mock_cache():
    """Initialize cache with mock articles at startup."""
    # DISABLED: Now using real data from NEWS_API instead of mock data
    # global _articles_cache
    # _articles_cache.extend(MOCK_ARTICLES_DATA)
    pass


# Startup event to initialize scheduler
@app.on_event("startup")
async def startup():
    """Initialize background scheduler on app startup."""
    # Removed mock data initialization - using real NEWS_API data only
    scheduler.start()


# Shutdown event to stop scheduler
@app.on_event("shutdown")
async def shutdown():
    """Stop background scheduler on app shutdown."""
    scheduler.stop()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
