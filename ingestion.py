"""
AI Watch - Ingestion Layer
Fetches news articles from NewsAPI and Perplexity for tracked sectors.
V3: Added Perplexity integration for real-time web search.
"""
import os
import json
import re
import warnings
import requests
import urllib3
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Suppress SSL warnings for POC (corporate networks often have proxy issues)
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Preset sector queries for topic selection
PRESET_SECTORS = {
    "AI": "artificial intelligence OR machine learning OR deep learning OR LLM OR GPT OR generative AI",
    "Fintech": "fintech OR digital banking OR cryptocurrency OR blockchain OR payments technology",
    "HealthTech": "digital health OR medtech OR telemedicine OR biotech startup OR healthtech",
    "Cybersecurity": "cybersecurity OR data breach OR zero trust OR threat detection",
    "CleanTech": "renewable energy OR electric vehicle OR cleantech OR sustainability tech",
    "Robotics": "robotics OR automation OR industrial robots OR autonomous systems"
}


def get_api_key():
    """Get NewsAPI key from environment."""
    api_key = os.getenv('NEWS_API_KEY')
    if not api_key:
        raise ValueError("NEWS_API_KEY not found in environment variables")
    return api_key


def get_perplexity_api_key():
    """Get Perplexity API key from environment."""
    return os.getenv('PERPLEXITY_API_KEY')


def get_newsdata_api_key():
    """Get NewsData API key from environment."""
    return os.getenv('NEWSDATA_API_KEY')


def fetch_newsdata(query, days_back=7, max_results=10):
    """
    Fetch news articles from NewsData API.
    
    Args:
        query: Search query (e.g., "Artificial Intelligence")
        days_back: How many days back to search
        max_results: Maximum number of articles to return
    
    Returns:
        List of article dictionaries
    """
    api_key = get_newsdata_api_key()
    if not api_key:
        print("  ⚠️ NewsData API key not found, skipping...")
        return []
    
    # NewsData.io API endpoint
    url = "https://newsdata.io/api/1/news"
    
    # Calculate date range
    from_date = (datetime.now() - timedelta(days=days_back)).strftime('%Y-%m-%d')
    
    params = {
        'q': query,
        'language': 'en',
        'from': from_date,
        'size': max_results,
        'apikey': api_key
    }
    
    try:
        response = requests.get(url, params=params, verify=False, timeout=15)
        
        if response.status_code == 200:
            data = response.json()
            articles = data.get('results', [])
            
            # Clean and structure the data
            cleaned_articles = []
            for article in articles:
                cleaned_articles.append({
                    'title': article.get('title', 'No title'),
                    'description': article.get('description', ''),
                    'content': article.get('content', '') or article.get('description', ''),
                    'url': article.get('link', ''),
                    'source': article.get('source_id', 'NewsData'),
                    'published_at': article.get('pubDate', ''),
                    'image_url': article.get('image_url', ''),
                    'source_api': 'newsdata'
                })
            
            return cleaned_articles
        else:
            print(f"  ⚠️ NewsData API error: {response.status_code}")
            return []
    except Exception as e:
        print(f"  ⚠️ NewsData request failed: {e}")
        return []


def fetch_google_news_rss(query, max_results=15):
    """
    Fetch news from Google News RSS feed.
    
    Args:
        query: Search query (e.g., "artificial intelligence")
        max_results: Maximum number of articles to return
    
    Returns:
        List of article dictionaries
    """
    try:
        import feedparser
        from urllib.parse import quote
    except ImportError:
        print("  ⚠️ feedparser not installed. Run: pip install feedparser")
        return []
    
    # Google News RSS URL - properly URL encode the query
    base_url = "https://news.google.com/rss/search"
    encoded_query = quote(query)
    url = f"{base_url}?q={encoded_query}&hl=en-US&gl=US&ceid=US:en"
    
    try:
        feed = feedparser.parse(url)
        
        articles = []
        for entry in feed.entries[:max_results]:
            # Google News RSS has limited metadata, so we extract what we can
            title = entry.get('title', 'No title')
            
            # Extract description from summary if available
            description = entry.get('summary', '')
            
            # Clean HTML from description
            description = re.sub(r'<[^>]+>', '', description)
            
            articles.append({
                'title': title,
                'description': description[:200],  # Limit to 200 chars
                'content': description,
                'url': entry.get('link', ''),
                'source': 'Google News',
                'published_at': entry.get('published', ''),
                'image_url': '',
                'source_api': 'google_news_rss'
            })
        
        return articles
    except Exception as e:
        print(f"  ⚠️ Google News RSS request failed: {e}")
        return []


def fetch_news(query, days_back=7, max_results=10):
    """
    Fetch news articles from NewsAPI.
    
    Args:
        query: Search query (e.g., "Artificial Intelligence")
        days_back: How many days back to search
        max_results: Maximum number of articles to return
    
    Returns:
        List of article dictionaries with title, description, url, source, published date
    """
    api_key = get_api_key()
    
    # NewsAPI 'Everything' endpoint
    url = "https://newsapi.org/v2/everything"
    
    # Calculate date range
    from_date = (datetime.now() - timedelta(days=days_back)).strftime('%Y-%m-%d')
    
    params = {
        'q': query,
        'sortBy': 'publishedAt',
        'language': 'en',
        'from': from_date,
        'pageSize': max_results,
        'apiKey': api_key
    }
    
    # verify=False for POC due to corporate proxy/SSL issues
    response = requests.get(url, params=params, verify=False)
    
    if response.status_code == 200:
        data = response.json()
        articles = data.get('articles', [])
        
        # Clean and structure the data
        cleaned_articles = []
        for article in articles:
            cleaned_articles.append({
                'title': article.get('title', 'No title'),
                'description': article.get('description', ''),
                'content': article.get('content', ''),
                'url': article.get('url', ''),
                'source': article.get('source', {}).get('name', 'Unknown'),
                'published_at': article.get('publishedAt', ''),
                'image_url': article.get('urlToImage', '')
            })
        
        return cleaned_articles
    else:
        print(f"Error fetching news: {response.status_code} - {response.text}")
        return []


def fetch_news_perplexity(query, max_results=5):
    """
    Fetch latest news using Perplexity's sonar model with real-time web search.
    
    Args:
        query: Search query (e.g., "latest AI news")
        max_results: Maximum number of articles to extract
    
    Returns:
        List of article dictionaries
    """
    api_key = get_perplexity_api_key()
    if not api_key:
        print("  ⚠️ Perplexity API key not found, skipping...")
        return []
    
    url = "https://api.perplexity.ai/chat/completions"
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    # Craft prompt to get structured news data
    system_prompt = """You are a news aggregator. Search for the latest news articles on the given topic.
Return ONLY a JSON array with news items. Each item must have these exact fields:
- title: Article headline
- description: 2-3 sentence summary
- source: Publication name
- url: Article URL
- published_at: Publication date (YYYY-MM-DD format)

Return ONLY valid JSON, no markdown, no explanation. Example:
[{"title": "...", "description": "...", "source": "...", "url": "...", "published_at": "..."}]"""
    
    user_prompt = f"""Find the {max_results} most recent and relevant news articles about: {query}

Focus on:
- Breaking news from the last 24-48 hours
- Major announcements and developments
- Credible sources (TechCrunch, Reuters, Bloomberg, etc.)

Return JSON array only."""
    
    payload = {
        "model": "sonar",  # Real-time search model
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        "temperature": 0.1,
        "max_tokens": 2000
    }
    
    try:
        response = requests.post(url, headers=headers, json=payload, verify=False, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            content = data.get('choices', [{}])[0].get('message', {}).get('content', '[]')
            
            # Parse JSON from response
            # Clean up potential markdown formatting
            content = content.strip()
            if content.startswith('```'):
                content = re.sub(r'^```json?\n?', '', content)
                content = re.sub(r'\n?```$', '', content)
            
            try:
                articles = json.loads(content)
                if isinstance(articles, list):
                    # Add source identifier
                    for article in articles:
                        article['source_api'] = 'perplexity'
                        article['content'] = article.get('description', '')
                        article['image_url'] = ''
                    return articles
            except json.JSONDecodeError as e:
                print(f"  ⚠️ Perplexity JSON parse error: {e}")
                return []
        else:
            print(f"  ⚠️ Perplexity API error: {response.status_code}")
            return []
            
    except Exception as e:
        print(f"  ⚠️ Perplexity request failed: {e}")
        return []


def fetch_news_combined(query, days_back=7, max_newsapi=10, max_perplexity=5):
    """
    Fetch news from both NewsAPI and Perplexity, combining results.
    
    Args:
        query: Search query
        days_back: Days back for NewsAPI
        max_newsapi: Max articles from NewsAPI
        max_perplexity: Max articles from Perplexity
    
    Returns:
        List of combined articles (deduplicated)
    """
    all_articles = []
    
    # Fetch from NewsAPI
    newsapi_articles = fetch_news(query, days_back, max_newsapi)
    for article in newsapi_articles:
        article['source_api'] = 'newsapi'
    all_articles.extend(newsapi_articles)
    
    # Fetch from Perplexity (real-time)
    perplexity_articles = fetch_news_perplexity(query, max_perplexity)
    all_articles.extend(perplexity_articles)
    
    # Deduplicate by title similarity
    seen_titles = set()
    unique_articles = []
    for article in all_articles:
        title_key = article.get('title', '').lower()[:50]  # First 50 chars
        if title_key not in seen_titles:
            seen_titles.add(title_key)
            unique_articles.append(article)
    
    return unique_articles


def fetch_sector_news(sector_queries, days_back=7, max_per_sector=10, use_perplexity=False):
    """
    Fetch news for multiple sector queries.
    
    Args:
        sector_queries: Dict of {sector_name: search_query}
        days_back: How many days back to search
        max_per_sector: Maximum articles per sector
        use_perplexity: Also fetch from Perplexity API
    
    Returns:
        Dict of {sector_name: [articles]}
    """
    all_news = {}
    
    for sector, query in sector_queries.items():
        print(f"Fetching news for: {sector}...")
        
        if use_perplexity:
            # Combined fetch from both APIs
            articles = fetch_news_combined(
                query, 
                days_back=days_back, 
                max_newsapi=max_per_sector, 
                max_perplexity=5
            )
            newsapi_count = sum(1 for a in articles if a.get('source_api') == 'newsapi')
            perplexity_count = sum(1 for a in articles if a.get('source_api') == 'perplexity')
            print(f"  Found {len(articles)} articles (NewsAPI: {newsapi_count}, Perplexity: {perplexity_count})")
        else:
            # NewsAPI only
            articles = fetch_news(query, days_back, max_per_sector)
            for article in articles:
                article['source_api'] = 'newsapi'
            print(f"  Found {len(articles)} articles")
        
        all_news[sector] = articles
    
    return all_news



def run_ingest_fast(topic: str = None, limit: int = 20):
    """
    Fast ingest from MULTIPLE SOURCES WITHOUT summarization:
    - NewsAPI 
    - NewsData API
    - Google News RSS
    
    This is optimized for quick data refresh - fetches from all sources and
    returns articles immediately without calling expensive OpenAI summarizer.
    
    Args:
        topic: Topic name (AI, Fintech, HealthTech, Cybersecurity, CleanTech, Robotics)
        limit: Number of articles to fetch per source (default 20)
    
    Returns:
        List of articles with basic metadata (combined from all sources, deduplicated)
    """
    import logging
    logger = logging.getLogger(__name__)
    
    if not topic or topic not in PRESET_SECTORS:
        logger.error(f"Invalid topic: {topic}")
        return []
    
    query = PRESET_SECTORS[topic]
    logger.info(f"⚡ Fast ingest from MULTIPLE SOURCES for topic: {topic}")
    
    try:
        all_raw_articles = []
        
        # 1. Fetch from NewsAPI (FAST)
        logger.info(f"   📡 Fetching from NewsAPI...")
        newsapi_articles = fetch_news(query, days_back=7, max_results=limit)
        all_raw_articles.extend(newsapi_articles)
        logger.info(f"      ✓ Got {len(newsapi_articles)} articles from NewsAPI")
        
        # 2. Fetch from NewsData API (FAST)
        logger.info(f"   📡 Fetching from NewsData API...")
        newsdata_articles = fetch_newsdata(query, days_back=7, max_results=limit)
        all_raw_articles.extend(newsdata_articles)
        logger.info(f"      ✓ Got {len(newsdata_articles)} articles from NewsData")
        
        # 3. Fetch from Google News RSS (FAST)
        logger.info(f"   📡 Fetching from Google News RSS...")
        google_articles = fetch_google_news_rss(query, max_results=limit)
        all_raw_articles.extend(google_articles)
        logger.info(f"      ✓ Got {len(google_articles)} articles from Google News RSS")
        
        if not all_raw_articles:
            logger.warning(f"   ⚠️  No articles found for {topic}")
            return []
        
        # Deduplicate by title (simple approach)
        seen_titles = set()
        deduplicated = []
        for article in all_raw_articles:
            title = article.get('title', '').lower()
            if title and title not in seen_titles:
                seen_titles.add(title)
                deduplicated.append(article)
        
        logger.info(f"   ✓ Deduplicated: {len(all_raw_articles)} → {len(deduplicated)}")
        
        # 2. Quick formatting WITHOUT summarization
        processed_articles = []
        for idx, article in enumerate(deduplicated[:limit * 2], 1):  # Keep more articles after dedup
            try:
                # Generate a unique ID
                import hashlib
                article_id = hashlib.md5(
                    f"{article.get('title', '')}{article.get('url', '')}".encode()
                ).hexdigest()[:12]
                
                # Basic relevance score (random for now, can be improved)
                import random
                relevance = random.randint(6, 10)
                
                # Determine source API
                source_api = article.get('source_api', 'Unknown')
                
                formatted_article = {
                    'id': article_id,
                    'title': article.get('title', 'No title'),
                    'description': article.get('description', '')[:200],
                    'summary': article.get('description', '')[:200],
                    'url': article.get('url', ''),
                    'link': article.get('url', ''),
                    'source': article.get('source', 'Unknown'),
                    'published_at': article.get('published_at', ''),
                    'image_url': article.get('image_url', ''),
                    'topic': topic,
                    'signal_strength': 'Strong' if relevance >= 7 else 'Weak',
                    'relevance': relevance,
                    'relevance_score': relevance,
                    'ingestion_date': datetime.now().isoformat(),
                    'ingestion_source': f'Multi-Source ({source_api})',
                    'industry': topic,
                    'market_segment': topic,
                }
                
                processed_articles.append(formatted_article)
                
            except Exception as e:
                logger.error(f"   ⚠️  Error processing article {idx}: {e}")
                continue
        
        logger.info(f"   ✅ Fast ingest complete: {len(processed_articles)} articles from multiple sources")
        return processed_articles
        
    except Exception as e:
        logger.error(f"❌ Fast ingest failed for {topic}: {e}")
        return []


def run_ingestion(topic: str = None, limit: int = 20):
    """
    Fetch articles from NEWS_API + PERPLEXITY.
    Uses FAST ingestion (no OpenAI summarization) for immediate results.
    
    Called by:
        - scheduler.py (daily at 00:00 UTC)
        - /api/ingest endpoint (manual trigger)
    
    Args:
        topic: Topic name (AI, Fintech, HealthTech, Cybersecurity, CleanTech, Robotics)
        limit: Number of articles to fetch (default 20)
    
    Workflow:
        1. Fetch articles from NEWS_API
        2. Format with topic metadata
        3. Return immediately (NO slow OpenAI summarization)
    
    Note:
        For full OpenAI summarization, enable the slow path in run_ingest_fast()
    """
    import logging
    logger = logging.getLogger(__name__)
    
    if not topic:
        logger.warning("run_ingestion called without topic")
        return []
    
    if topic not in PRESET_SECTORS:
        logger.error(f"Unknown topic: {topic}")
        return []
    
    # Use fast ingestion (NEWS_API only, no OpenAI calls)
    return run_ingest_fast(topic, limit)


# Default sectors to track
SECTORS = {
    "AI & Machine Learning": "artificial intelligence OR machine learning OR deep learning OR LLM OR GPT"
}


if __name__ == "__main__":
    # Test the ingestion
    news = fetch_sector_news(SECTORS, days_back=7, max_per_sector=5)
    
    for sector, articles in news.items():
        print(f"\n{'='*50}")
        print(f"SECTOR: {sector}")
        print('='*50)
        for i, art in enumerate(articles, 1):
            print(f"\n{i}. {art['title']}")
            print(f"   Source: {art['source']}")
            print(f"   URL: {art['url']}")
