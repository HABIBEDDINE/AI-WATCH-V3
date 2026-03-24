import { useState, useEffect, useCallback } from "react";
import { getArticles, triggerIngest, saveReport } from "../services/api";
import { jsPDF } from "jspdf";

const B = {
  purple: "#6B2C94",
  purpleDeep: "#4a1870",
  purplePale: "#f5eefb",
  white: "#ffffff",
  gray50: "#fafafa",
  gray100: "#f4f4f4",
  gray200: "#e8e8e8",
  gray300: "#d0d0d0",
  gray400: "#999999",
  gray500: "#666666",
  gray600: "#444444",
  gray700: "#222222",
  gray900: "#111111",
  green: "#1a8a4a",
  greenLight: "#e8f5ee",
  amber: "#b45309",
  amberLight: "#fef3e2",
  blue: "#1a5fa8",
  darkBg: "#0a0a0a",
};

const TOPICS = ["All Industries", "AI", "Fintech", "HealthTech", "Cybersecurity", "CleanTech", "Robotics"];
const SIGNALS = ["All", "Strong", "Weak"];

function StatCard({ label, value, delta, icon }) {
  return (
    <div style={{
      background: B.gray50,
      border: `1px solid ${B.gray100}`,
      borderRadius: 4,
      padding: "16px 18px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: B.green, letterSpacing: 0.5 }}>
          ▲ {delta}
        </span>
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color: B.purple, marginBottom: 4, letterSpacing: -0.5 }}>{value}</div>
      <div style={{ fontSize: 11, color: B.gray400, fontWeight: 600, letterSpacing: 0.3 }}>{label}</div>
    </div>
  );
}

function ArticleCard({ article, expanded, onToggle, isSelected, onSelectChange }) {
  return (
    <div
      style={{
        background: isSelected ? B.purplePale : (expanded ? B.gray50 : B.white),
        border: isSelected ? `2px solid ${B.purple}` : `1px solid ${B.gray100}`,
        borderLeft: expanded ? `4px solid ${B.purple}` : "4px solid transparent",
        borderRadius: 4,
        padding: "20px 24px",
        cursor: "pointer",
        transition: "all 0.2s",
        minHeight: 280,
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        position: "relative",
      }}
    >
      {/* Checkbox */}
      <div style={{ position: "absolute", top: 12, left: 12 }}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => {
            e.stopPropagation();
            onSelectChange();
          }}
          style={{ cursor: "pointer", width: 18, height: 18 }}
        />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10, marginLeft: 20 }}>
        <span style={{ fontSize: 10, color: B.gray400, fontWeight: 600 }}>{article.source}</span>
        <span style={{ fontSize: 9, color: B.gray400 }}>{new Date(article.published_at).toLocaleDateString()}</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: 9, background: B.purple, color: B.white, padding: "2px 8px", borderRadius: 4, fontWeight: 700 }}>{article.topic}</span>
        <span style={{
          fontSize: 9,
          background: article.signal_strength === "Strong" ? B.green : B.amber,
          color: B.white,
          padding: "2px 8px",
          borderRadius: 4,
          fontWeight: 700,
          textTransform: "uppercase",
        }}>
          {article.signal_strength}
        </span>
      </div>

      <div 
        onClick={onToggle}
        style={{ cursor: "pointer", flex: 1 }}
      >
        <div style={{ fontSize: 14, fontWeight: 700, color: B.gray900, lineHeight: 1.45, marginBottom: 12, flex: 1 }}>
          {article.title}
        </div>

        <div style={{ fontSize: 13, color: B.gray600, lineHeight: 1.6, marginBottom: 12, flex: 1 }}>
          {(article.summary || "").substring(0, 120)}...
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontSize: 10, color: B.gray500 }}>
          {article.industry}
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 9, color: B.gray400 }}>Relevance</span>
        <div style={{ flex: 1, height: 3, background: B.gray200, borderRadius: 2 }}>
          <div style={{ width: `${(article.relevance || 5) * 10}%`, height: "100%", background: B.purple, borderRadius: 2 }} />
        </div>
        <span style={{ fontSize: 10, fontWeight: 700, color: B.purple, minWidth: 20 }}>{article.relevance || 5}/10</span>
      </div>

      <a 
        onClick={(e) => {
          e.preventDefault();
          const articleUrl = article.url || article.link || `https://www.google.com/search?q=${encodeURIComponent(article.title)}`;
          window.open(articleUrl, "_blank", "noopener,noreferrer");
        }}
        style={{ fontSize: 11, color: B.purple, fontWeight: 700, cursor: "pointer", textDecoration: "none" }}>
        Read more →
      </a>
    </div>
  );
}

export default function Explore() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [viewMode, setViewMode] = useState("grid");
  const [selectedTopic, setSelectedTopic] = useState("All Industries");
  const [selectedSignal, setSelectedSignal] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCardId, setExpandedCardId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedArticles, setSelectedArticles] = useState(new Set());
  const [reportFormat, setReportFormat] = useState("md");

  // Debounce timer
  const [searchTimeout, setSearchTimeout] = useState(null);

  // Fetch articles
  const fetchArticles = useCallback(async (page = 1, pageSize = itemsPerPage) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getArticles({
        topic: selectedTopic === "All Industries" ? undefined : selectedTopic,
        signal: selectedSignal === "All" ? undefined : selectedSignal,
        search: searchQuery || undefined,
        page,
        pageSize,
      });
      setArticles(response.items || []);
      setTotalCount(response.total || 0);
      setCurrentPage(page);
    } catch (err) {
      setError(err.message);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, [selectedTopic, selectedSignal, searchQuery, itemsPerPage]);

  // Fetch on mount
  useEffect(() => {
    fetchArticles(1, itemsPerPage);
  }, [fetchArticles, itemsPerPage]);

  // Fetch when filters change
  useEffect(() => {
    setCurrentPage(1);
    fetchArticles(1, itemsPerPage);
  }, [selectedTopic, selectedSignal, fetchArticles, itemsPerPage]);

  // Debounced search
  const handleSearch = (query) => {
    setSearchQuery(query);
    if (searchTimeout) clearTimeout(searchTimeout);
    const timeout = setTimeout(() => {
      setCurrentPage(1);
      fetchArticles(1, itemsPerPage);
    }, 400);
    setSearchTimeout(timeout);
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchArticles(page, itemsPerPage);
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  // Handle ingest
  const handleIngest = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await triggerIngest();
      
      if (response.status === "started") {
        // Background task started - show message and poll for results
        console.log("Ingestion started in background. Polling for results...");
        
        // Poll every 2 seconds for up to 120 seconds (2 minutes)
        let attempts = 0;
        const maxAttempts = 60;
        
        const pollInterval = setInterval(async () => {
          attempts++;
          try {
            const articlesResponse = await getArticles({
              page: 1,
              pageSize: 50,
            });
            
            if (articlesResponse.items && articlesResponse.items.length > 0) {
              // Articles found! Update state and clear interval
              setArticles(articlesResponse.items);
              setTotalCount(articlesResponse.total || 0);
              setCurrentPage(1);
              clearInterval(pollInterval);
              setLoading(false);
              return;
            }
          } catch (err) {
            console.warn("Poll attempt failed:", err);
          }
          
          // Stop polling after max attempts
          if (attempts >= maxAttempts) {
            clearInterval(pollInterval);
            setLoading(false);
          }
        }, 2000);
      } else {
        // Inline ingestion completed immediately
        await fetchArticles(1, itemsPerPage);
        setLoading(false);
      }
    } catch (err) {
      setError("Ingestion failed: " + err.message);
      setLoading(false);
    }
  };

  // Toggle article selection
  const toggleArticleSelection = (articleId) => {
    const newSet = new Set(selectedArticles);
    if (newSet.has(articleId)) {
      newSet.delete(articleId);
    } else {
      newSet.add(articleId);
    }
    setSelectedArticles(newSet);
  };

  // Toggle all articles
  const toggleAllArticles = () => {
    if (selectedArticles.size === articles.length) {
      setSelectedArticles(new Set());
    } else {
      setSelectedArticles(new Set(articles.map(a => a.id)));
    }
  };

  // Generate report
  const handleGenerateReport = async () => {
    if (selectedArticles.size === 0) {
      setError("Please select at least one article");
      return;
    }

    const selected = articles.filter(a => selectedArticles.has(a.id));

    // Create markdown format
    let markdownContent = `# AI Watch Report\n\nGenerated: ${new Date().toLocaleString()}\n\n`;
    
    selected.forEach((article, idx) => {
      markdownContent += `## ${idx + 1}. ${article.title}\n\n`;
      markdownContent += `**Source:** ${article.source}\n`;
      markdownContent += `**Signal:** ${article.signal_strength}\n`;
      markdownContent += `**Relevance:** ${article.relevance}/10\n`;
      markdownContent += `**Published:** ${new Date(article.published_at).toLocaleDateString()}\n`;
      markdownContent += `**URL:** ${article.url || "No URL available"}\n\n`;
      markdownContent += `${article.summary || "Summary not available"}\n\n`;
      markdownContent += `---\n\n`;
    });

    try {
      // ✅ SAVE REPORT TO REPORTS PAGE
      const reportTitle = `AI Report - ${new Date().toLocaleDateString()}`;
      const reportData = {
        title: reportTitle,
        summary: `Report with ${selected.length} selected articles about ${selectedTopic}`,
        key_points: selected.slice(0, 5).map(a => a.title),
        articles: selected.map((a, idx) => ({
          number: idx + 1,
          title: a.title,
          source: a.source,
          date: new Date(a.published_at).toLocaleDateString(),
          signal: a.signal_strength?.toLowerCase(),
          relevance: a.relevance,
          url: a.url,
          summary: a.summary,
        })),
        funding_count: 0,
      };

      const saveResponse = await saveReport(reportData);

      // Reset
      setShowReportModal(false);
      setSelectedArticles(new Set());
      setReportFormat("md");
    } catch (err) {
      setError(`Failed to save report: ${err.message}`);
      console.error(err);
    }
  };

  // Download report
  const handleDownloadReport = async () => {
    if (selectedArticles.size === 0) {
      setError("Please select at least one article");
      return;
    }

    const selected = articles.filter(a => selectedArticles.has(a.id));

    // Create markdown format
    let markdownContent = `# AI Watch Report\n\nGenerated: ${new Date().toLocaleString()}\n\n`;
    
    selected.forEach((article, idx) => {
      markdownContent += `## ${idx + 1}. ${article.title}\n\n`;
      markdownContent += `**Source:** ${article.source}\n`;
      markdownContent += `**Signal:** ${article.signal_strength}\n`;
      markdownContent += `**Relevance:** ${article.relevance}/10\n`;
      markdownContent += `**Published:** ${new Date(article.published_at).toLocaleDateString()}\n`;
      markdownContent += `**URL:** ${article.url || "No URL available"}\n\n`;
      markdownContent += `${article.summary || "Summary not available"}\n\n`;
      markdownContent += `---\n\n`;
    });

    try {
      if (reportFormat === "pdf") {
      // Generate actual PDF using jsPDF
      try {
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "a4"
        });

        // Set up styles
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 15;
        const maxWidth = pageWidth - (margin * 2);
        let yPosition = margin;

        // Title
        pdf.setFontSize(18);
        pdf.setTextColor(107, 44, 148); // Purple
        pdf.text("AI WATCH REPORT", margin, yPosition);
        yPosition += 10;

        // Generated date
        pdf.setFontSize(10);
        pdf.setTextColor(102, 102, 102); // Gray
        pdf.text(`Generated: ${new Date().toLocaleString()}`, margin, yPosition);
        yPosition += 8;

        // Divider
        pdf.setDrawColor(107, 44, 148);
        pdf.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 8;

        // Articles
        selected.forEach((article, idx) => {
          // Check if we need a new page
          if (yPosition > pageHeight - margin - 40) {
            pdf.addPage();
            yPosition = margin;
          }

          // Article number and title
          pdf.setFontSize(12);
          pdf.setTextColor(17, 17, 17); // Dark gray
          pdf.setFont(undefined, "bold");
          
          const titleLines = pdf.splitTextToSize(`${idx + 1}. ${article.title}`, maxWidth);
          pdf.text(titleLines, margin, yPosition);
          yPosition += titleLines.length * 6 + 2;

          // Article metadata
          pdf.setFontSize(9);
          pdf.setTextColor(102, 102, 102);
          pdf.setFont(undefined, "normal");
          
          pdf.text(`Source: ${article.source} | Signal: ${article.signal_strength} | Relevance: ${article.relevance}/10`, margin, yPosition);
          yPosition += 6;
          pdf.text(`Published: ${new Date(article.published_at).toLocaleDateString()}`, margin, yPosition);
          yPosition += 6;

          // Article URL
          if (article.url) {
            pdf.setTextColor(107, 44, 148); // Purple for URL
            pdf.setFont(undefined, "bold");
            const urlLines = pdf.splitTextToSize(`URL: ${article.url}`, maxWidth);
            pdf.text(urlLines, margin, yPosition);
            yPosition += urlLines.length * 5 + 2;
          }

          yPosition += 2;

          // Summary
          pdf.setFontSize(10);
          pdf.setTextColor(68, 68, 68);
          const summaryLines = pdf.splitTextToSize(article.summary || "Summary not available", maxWidth);
          pdf.text(summaryLines, margin, yPosition);
          yPosition += summaryLines.length * 5 + 6;

          // Divider
          pdf.setDrawColor(224, 224, 224);
          pdf.line(margin, yPosition, pageWidth - margin, yPosition);
          yPosition += 6;
        });

        // Footer
        if (yPosition < pageHeight - 10) {
          pdf.setFontSize(8);
          pdf.setTextColor(153, 153, 153);
          pdf.text("AI Watch v2.0 | Strategic Intelligence Platform", margin, pageHeight - 10);
        }

        // Save PDF
        const filename = `ai-watch-report-${new Date().toISOString().split('T')[0]}.pdf`;
        pdf.save(filename);
      } catch (err) {
        setError("Failed to generate PDF: " + err.message);
        return;
      }
    } else {
      // Markdown format
      const filename = `ai-watch-report-${new Date().toISOString().split('T')[0]}.md`;
      const element = document.createElement('a');
      element.setAttribute('href', 'data:text/markdown;charset=utf-8,' + encodeURIComponent(markdownContent));
      element.setAttribute('download', filename);
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
    } catch (err) {
      setError(`Failed to download report: ${err.message}`);
      console.error(err);
    }
  };



  return (
    <div style={{ background: B.white, padding: "24px 28px", minHeight: "100%" }}>
      {/* ── TOP STATS ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 24 }}>
        <StatCard label="Articles" value={totalCount} delta="+12 today" icon="📄" />
        <StatCard label="Strong Signals" value={articles.filter(a => a.signal_strength === "Strong").length} delta="+5" icon="📡" />
        <StatCard label="Avg Relevance" value={articles.length ? (articles.reduce((a, b) => a + (b.relevance || 5), 0) / articles.length).toFixed(1) : "0"} delta="+0.3" icon="🎯" />
        <StatCard label="Weak Signals" value={articles.filter(a => a.signal_strength === "Weak").length} delta="+3" icon="💰" />
      </div>

      {/* ── CONTROLS BAR ── */}
      <div style={{ background: B.white, border: `1px solid ${B.gray100}`, padding: "16px 20px", marginBottom: 24, borderRadius: 4, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
          <button
            onClick={handleIngest}
            disabled={loading}
            style={{
              background: B.purple,
              color: B.white,
              border: "none",
              padding: "8px 16px",
              borderRadius: 2,
              fontSize: 12,
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
            }}>
            {loading ? "Loading..." : "Generate New Data →"}
          </button>

          <button
            onClick={() => setShowReportModal(true)}
            disabled={articles.length === 0}
            style={{
              background: B.green,
              color: B.white,
              border: "none",
              padding: "8px 16px",
              borderRadius: 2,
              fontSize: 12,
              fontWeight: 700,
              cursor: articles.length === 0 ? "not-allowed" : "pointer",
              opacity: articles.length === 0 ? 0.6 : 1,
            }}>
            📄 Generate Reports →
          </button>

          <div style={{ display: "flex", gap: 6 }}>
            {TOPICS.map(topic => (
              <button
                key={topic}
                onClick={() => setSelectedTopic(topic)}
                style={{
                  padding: "6px 12px",
                  border: selectedTopic === topic ? `2px solid ${B.purple}` : `1px solid ${B.gray100}`,
                  background: selectedTopic === topic ? B.purple : B.gray50,
                  color: selectedTopic === topic ? B.white : B.gray600,
                  fontSize: 11,
                  fontWeight: selectedTopic === topic ? 700 : 500,
                  cursor: "pointer",
                  borderRadius: 4,
                }}
              >
                {topic}
              </button>
            ))}
          </div>

          <select
            value={selectedSignal}
            onChange={(e) => setSelectedSignal(e.target.value)}
            style={{
              padding: "6px 10px",
              border: `1px solid ${B.gray100}`,
              background: B.white,
              fontSize: 11,
              cursor: "pointer",
              borderRadius: 4,
            }}>
            {SIGNALS.map(signal => (
              <option key={signal} value={signal}>{signal}</option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            style={{
              padding: "6px 12px",
              border: `1px solid ${B.gray100}`,
              borderRadius: 4,
              fontSize: 11,
              width: 200,
            }}
          />

          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            <button
              onClick={() => setViewMode("grid")}
              style={{
                padding: "6px 10px",
                border: viewMode === "grid" ? `2px solid ${B.purple}` : `1px solid ${B.gray100}`,
                background: viewMode === "grid" ? B.purple : B.gray50,
                color: viewMode === "grid" ? B.white : B.gray600,
                cursor: "pointer",
                fontSize: 14,
                borderRadius: 4,
              }}>
              ⊞
            </button>
            <button
              onClick={() => setViewMode("list")}
              style={{
                padding: "6px 10px",
                border: viewMode === "list" ? `2px solid ${B.purple}` : `1px solid ${B.gray100}`,
                background: viewMode === "list" ? B.purple : B.gray50,
                color: viewMode === "list" ? B.white : B.gray600,
                cursor: "pointer",
                fontSize: 14,
                borderRadius: 4,
              }}>
              ☰
            </button>
          </div>
        </div>
      </div>

      {/* ── ERROR MESSAGE ── */}
      {error && (
        <div style={{
          background: "#fdf0ef",
          border: `1px solid ${B.amber}`,
          color: B.amber,
          padding: "12px 16px",
          marginBottom: 16,
          borderRadius: 4,
          fontSize: 12,
        }}>
          Error: {error}
        </div>
      )}

      {/* ── LOADING SPINNER ── */}
      {loading && (
        <div style={{
          textAlign: "center",
          padding: "60px 40px",
          fontSize: 12,
          color: B.gray500,
        }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{
              width: 40,
              height: 40,
              margin: "0 auto 16px",
              border: `3px solid ${B.gray200}`,
              borderTop: `3px solid ${B.purple}`,
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }} />
            <style>{`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}</style>
            <div style={{ fontSize: 14, fontWeight: 700, color: B.gray900, marginBottom: 8 }}>
              Loading articles...
            </div>
            <div style={{ fontSize: 11, color: B.gray400, lineHeight: 1.6, marginBottom: 16 }}>
              Fetching intelligence from NewsAPI, Google News & Perplexity<br/>
              This typically takes 30-60 seconds
            </div>
            <div style={{ fontSize: 10, color: B.gray300, fontStyle: "italic" }}>
              Keep this page open - articles will appear as they load
            </div>
          </div>
        </div>
      )}

      {/* ── NO DATA STATE ── */}
      {!loading && articles.length === 0 && (
        <div style={{
          textAlign: "center",
          padding: "60px 40px",
          background: B.gray50,
          border: `1px solid ${B.gray100}`,
          borderRadius: 4,
          marginBottom: 24,
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: B.gray900, marginBottom: 8 }}>
            No articles yet
          </div>
          <div style={{ fontSize: 12, color: B.gray500, marginBottom: 24, lineHeight: 1.6 }}>
            Click "Generate New Data →" above to fetch the latest tech news from NewsAPI, Google News, and Perplexity across all sectors.
          </div>
          <button
            onClick={handleIngest}
            disabled={loading}
            style={{
              background: B.purple,
              color: B.white,
              border: "none",
              padding: "10px 24px",
              borderRadius: 2,
              fontSize: 13,
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
            }}>
            🚀 Generate Articles Now
          </button>
        </div>
      )}

      {/* ── GRID VIEW ── */}
      {!loading && viewMode === "grid" && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}>
          {articles.map(article => (
            <ArticleCard
              key={article.id}
              article={article}
              expanded={expandedCardId === article.id}
              onToggle={() => setExpandedCardId(expandedCardId === article.id ? null : article.id)}
              isSelected={selectedArticles.has(article.id)}
              onSelectChange={() => toggleArticleSelection(article.id)}
            />
          ))}
        </div>
      )}

      {/* ── LIST VIEW ── */}
      {!loading && viewMode === "list" && (
        <div style={{ background: B.white, border: `1px solid ${B.gray100}`, marginBottom: 24, borderRadius: 4, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead style={{ background: B.gray50, borderBottom: `1px solid ${B.gray100}` }}>
              <tr>
                <th style={{ padding: "12px 16px", textAlign: "center", fontWeight: 700, width: 40 }}>
                  <input
                    type="checkbox"
                    checked={selectedArticles.size === articles.length && articles.length > 0}
                    onChange={toggleAllArticles}
                    style={{ cursor: "pointer" }}
                  />
                </th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700 }}>#</th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700 }}>Title</th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700 }}>Source</th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700 }}>Signal</th>
                <th style={{ padding: "12px 16px", textAlign: "center", fontWeight: 700 }}>Relevance</th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700 }}>Published</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article, idx) => (
                <tr key={article.id} style={{
                  borderBottom: `1px solid ${B.gray100}`,
                  background: idx % 2 === 0 ? B.white : B.gray50,
                }}>
                  <td style={{ padding: "12px 16px", textAlign: "center" }}>
                    <input
                      type="checkbox"
                      checked={selectedArticles.has(article.id)}
                      onChange={() => toggleArticleSelection(article.id)}
                      style={{ cursor: "pointer" }}
                    />
                  </td>
                  <td style={{ padding: "12px 16px", color: B.gray500 }}>{idx + 1}</td>
                  <td style={{ padding: "12px 16px", color: B.gray900, fontWeight: 600, maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {article.title}
                  </td>
                  <td style={{ padding: "12px 16px", color: B.gray600 }}>{article.source}</td>
                  <td style={{
                    padding: "12px 16px",
                    color: article.signal_strength === "Strong" ? B.green : B.amber,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    fontSize: 10,
                  }}>
                    {article.signal_strength}
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "center", fontWeight: 700, color: B.purple }}>
                    {article.relevance || 5}/10
                  </td>
                  <td style={{ padding: "12px 16px", color: B.gray600 }}>
                    {new Date(article.published_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── PAGINATION ── */}
      {!loading && articles.length > 0 && (
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: B.white,
          border: `1px solid ${B.gray100}`,
          padding: "16px 20px",
          borderRadius: 4,
        }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 11, color: B.gray500, fontWeight: 600 }}>Show:</span>
            {[10, 25, 50, 100].map(count => (
              <button
                key={count}
                onClick={() => {
                  setItemsPerPage(count);
                  handlePageChange(1);
                }}
                style={{
                  padding: "4px 10px",
                  border: itemsPerPage === count ? `2px solid ${B.purple}` : `1px solid ${B.gray200}`,
                  background: itemsPerPage === count ? B.purplePale : B.white,
                  color: itemsPerPage === count ? B.purple : B.gray600,
                  fontSize: 11,
                  fontWeight: itemsPerPage === count ? 700 : 500,
                  cursor: "pointer",
                  borderRadius: 4,
                }}
              >
                {count}
              </button>
            ))}
          </div>

          <span style={{ fontSize: 11, color: B.gray500, fontWeight: 600 }}>
            Page {currentPage} of {totalPages}
          </span>

          <div style={{ display: "flex", gap: 6 }}>
            <button
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              style={{
                padding: "6px 12px",
                border: `1px solid ${B.gray100}`,
                background: B.white,
                borderRadius: 4,
                cursor: currentPage === 1 ? "not-allowed" : "pointer",
                opacity: currentPage === 1 ? 0.5 : 1,
                fontSize: 11,
              }}
            >
              ← Prev
            </button>
            <button
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              style={{
                padding: "6px 12px",
                border: `1px solid ${B.gray100}`,
                background: B.white,
                borderRadius: 4,
                cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                opacity: currentPage === totalPages ? 0.5 : 1,
                fontSize: 11,
              }}
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }}>
          <div style={{
            background: B.white,
            borderRadius: 8,
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
            maxWidth: 600,
            width: "90%",
            maxHeight: "80vh",
            overflow: "auto",
          }}>
            {/* Modal Header */}
            <div style={{
              padding: "24px",
              borderBottom: `1px solid ${B.gray100}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: B.gray900, margin: 0 }}>Generate Report</h2>
              <button
                onClick={() => {
                  setShowReportModal(false);
                  setSelectedArticles(new Set());
                }}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: 24,
                  cursor: "pointer",
                  color: B.gray400,
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: "24px" }}>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: B.gray900, marginBottom: 12 }}>
                  Select Articles ({selectedArticles.size}/{articles.length})
                </div>
                <button
                  onClick={toggleAllArticles}
                  style={{
                    fontSize: 11,
                    padding: "6px 12px",
                    background: selectedArticles.size === articles.length ? B.purple : B.gray50,
                    color: selectedArticles.size === articles.length ? B.white : B.gray600,
                    border: `1px solid ${B.gray200}`,
                    borderRadius: 4,
                    cursor: "pointer",
                    fontWeight: 600,
                    marginBottom: 12,
                  }}
                >
                  {selectedArticles.size === articles.length ? "Deselect All" : "Select All"}
                </button>
                <div style={{
                  border: `1px solid ${B.gray200}`,
                  borderRadius: 4,
                  maxHeight: 300,
                  overflow: "auto",
                }}>
                  {articles.map((article, idx) => (
                    <div
                      key={article.id}
                      onClick={() => toggleArticleSelection(article.id)}
                      style={{
                        padding: "12px 16px",
                        borderBottom: idx < articles.length - 1 ? `1px solid ${B.gray100}` : "none",
                        cursor: "pointer",
                        background: selectedArticles.has(article.id) ? B.purplePale : B.white,
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 10,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedArticles.has(article.id)}
                        onChange={() => {}}
                        style={{ marginTop: 2, cursor: "pointer" }}
                      />
                      <div style={{ flex: 1, fontSize: 12 }}>
                        <div style={{ fontWeight: 600, color: B.gray900 }}>{article.title.substring(0, 60)}...</div>
                        <div style={{ fontSize: 11, color: B.gray500, marginTop: 4 }}>
                          {article.source} • {new Date(article.published_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Format Selection */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: B.gray900, marginBottom: 12 }}>Report Format</div>
                <div style={{ display: "flex", gap: 12 }}>
                  <button
                    onClick={() => setReportFormat("md")}
                    style={{
                      flex: 1,
                      padding: "12px",
                      background: reportFormat === "md" ? B.purple : B.gray50,
                      color: reportFormat === "md" ? B.white : B.gray600,
                      border: `1px solid ${reportFormat === "md" ? B.purple : B.gray200}`,
                      borderRadius: 4,
                      cursor: "pointer",
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    📝 Markdown (.md)
                  </button>
                  <button
                    onClick={() => setReportFormat("pdf")}
                    style={{
                      flex: 1,
                      padding: "12px",
                      background: reportFormat === "pdf" ? B.purple : B.gray50,
                      color: reportFormat === "pdf" ? B.white : B.gray600,
                      border: `1px solid ${reportFormat === "pdf" ? B.purple : B.gray200}`,
                      borderRadius: 4,
                      cursor: "pointer",
                      fontSize: 12,
                      fontWeight: 600,
                    }}
                  >
                    📄 PDF (.pdf)
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: 12 }}>
                <button
                  onClick={() => {
                    setShowReportModal(false);
                    setSelectedArticles(new Set());
                  }}
                  style={{
                    flex: 1,
                    padding: "12px",
                    background: B.gray50,
                    color: B.gray600,
                    border: `1px solid ${B.gray200}`,
                    borderRadius: 4,
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerateReport}
                  disabled={selectedArticles.size === 0}
                  style={{
                    flex: 1,
                    padding: "12px",
                    background: selectedArticles.size === 0 ? B.gray300 : B.purple,
                    color: B.white,
                    border: "none",
                    borderRadius: 4,
                    cursor: selectedArticles.size === 0 ? "not-allowed" : "pointer",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  💾 Save Report
                </button>
                <button
                  onClick={handleDownloadReport}
                  disabled={selectedArticles.size === 0}
                  style={{
                    flex: 1,
                    padding: "12px",
                    background: selectedArticles.size === 0 ? B.gray300 : B.purple,
                    color: B.white,
                    border: "none",
                    borderRadius: 4,
                    cursor: selectedArticles.size === 0 ? "not-allowed" : "pointer",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  ⬇️ Download
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
