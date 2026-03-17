# 🔍 AI Watch – V2

> Automated tech news analysis with AI-powered strategic intelligence

**AI Watch** is a strategic intelligence platform that continuously monitors technology trends, startups, breakthroughs, and sectoral innovations. It automatically fetches news, analyzes articles with AI, and generates actionable reports for technology leaders.

**Perfect for**: CTOs, Innovation Managers, Strategy Directors

---

## 💡 Project Overview

The platform combines **news aggregation**, **AI analysis**, and **interactive dashboards** to transform raw tech data into strategic intelligence. Get real-time market signals, funding trends, and competitive insights automatically.

### Key Capabilities
- 📰 **Automated News Collection** - NEWS_API + Perplexity real-time search
- 🧠 **AI-Powered Analysis** - OpenAI GPT-4o-mini summarization
- 📊 **Signal Detection** - Identify weak/strong market signals
- 📈 **Interactive Dashboard** - 7-page React frontend with charts
- 📄 **Report Generation** - PDF exports for stakeholders
- 📧 **Weekly Newsletter** - Auto-generated email digests

---

## 📊 Tech Stack

**Backend**: FastAPI (Python 3.8+), Perplexity API, NEWS_API, OpenAI GPT-4o-mini, APScheduler

**Frontend**: React 19.2.4, Recharts, Axios, React Router v6

---

## 🎯 Strategic Value

| Feature | Business Impact |
|---------|-----------------|
| **Real-time Monitoring** | 24/7 market trend tracking |
| **AI Summarization** | Convert information volume to insights |
| **Signal Detection** | Identify emerging opportunities early |
| **Relevance Scoring** | Prioritize intelligence for leadership |
| **Executive Reports** | Professional PDF exports for sharing |
| **Power BI Integration** | CSV/JSON data for analytics |

---

## 🏗️ Project Structure

```
ai-watch-V2/
├── Backend
│   ├── api.py                  # FastAPI main application
│   ├── ingestion.py            # News fetching (NewsAPI + Perplexity)
│   ├── summarizer.py           # AI analysis with GPT-4o-mini
│   ├── report_generator.py     # Markdown + PDF reports
│   ├── newsletter.py           # HTML email generation
│   ├── powerbi_export.py       # CSV/JSON exports
│   ├── scheduler.py            # APScheduler configuration
│   └── main.py                 # CLI entry point
│
├── Frontend (React)
│   └── aiwatch-frontend/
│       ├── src/pages/          # 7 dashboard pages (Explore, Reports, Trends, etc.)
│       ├── src/components/     # Reusable UI components
│       └── src/services/       # API client
│
├── reports/                    # Generated markdown reports
├── .env                        # API keys (DO NOT COMMIT)
├── .env.example                # Template for configuration
└── requirements.txt            # Python dependencies
```

---

## 🚀 Get Started

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm 8+
- API Keys: [NEWS_API](https://newsapi.org), [OpenAI](https://openai.com/api), (optional) [Perplexity](https://www.perplexity.ai)

### Installation (5 minutes)

**1. Clone the repository**
```bash
git clone https://github.com/abde0112/ai-watch-V2.git
cd ai-watch-V2
```

**2. Setup Backend**
```bash
# Create virtual environment
python -m venv .venv
.venv\Scripts\activate  # Windows
source .venv/bin/activate  # macOS/Linux

# Install dependencies
pip install -r requirements.txt
```

**3. Setup Frontend**
```bash
cd aiwatch-frontend
npm install
```

**4. Configure API Keys**
```bash
# Copy template to .env
copy .env.example .env

# Edit .env with your API keys
NEWS_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
```

### Running the Project

**Terminal 1 - Start Backend:**
```bash
python api.py
# Backend runs on http://localhost:8000
```

**Terminal 2 - Start Frontend:**
```bash
cd aiwatch-frontend
npm start
# Frontend opens at http://localhost:3000
```

✅ **Done!** Open http://localhost:3000 in your browser.

---

## 📖 Product Roadmap

### V1 - POC ✅ Complete
- Automatic news collection from NewsAPI
- AI article summarization
- Industry categorization
- Weak signal detection
- Emerging startup extraction
- Newsletter summarization

### V2 - MVP 🔄 Current
- Industry & market classification
- Auto-generated weekly newsletter
- Real-time BI dashboard
- Key actors mapping
- Funding rounds analysis
- Brief & publication tracking

### V3 - MVP+ 📋 Planned
- Competitive radar (interactive)
- Technology maturity scoring
- Sector-specific strategic analysis
- 6-12 month trend predictions
- Investment opportunities recommendations
- Full executive readiness

---

## 💻 Dashboard Pages

| Page | Purpose |
|------|---------|
| **🔝 Explore** | Browse & filter articles by topic and signal strength |
| **📈 Data Preview** | View charts, tables, and statistics |
| **📋 Reports** | Generated reports with PDF export |
| **🎯 Solutions** | DXC recommendations |
| **📈 Trends** | Market trend analysis |
| **🗺️ Journey** | Strategic roadmap & milestones |
| **📧 Newsletter** | Weekly digest viewer |

---

## 🎓 For Different Roles

- **👤 CTO**: Focus on AI/ML trends, infrastructure, new technology capabilities
- **👤 Innovation Manager**: Track fintech/HealthTech startups, funding rounds
- **👤 Strategy Director**: Monitor cybersecurity threats, regulations, market signals

---

## 📄 License

MIT License - Proprietary use for DXC Technology

---

**Version**: 2.0.0 | **Status**: ✅ Production Ready | **Last Updated**: March 17, 2026
