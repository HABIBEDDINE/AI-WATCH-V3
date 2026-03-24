import { useState, useEffect, useCallback } from "react";
import { getArticles, triggerIngest, saveReport } from "../services/api";
import { jsPDF } from "jspdf";
import { Search } from "lucide-react";
import { cleanText } from "../utils/cleanText";

const ACCENT   = "#6C47FF";
const ACCENT_BG = "#f0edff";

const B = {
  purple:    ACCENT,
  purplePale: ACCENT_BG,
  white:     "#ffffff",
  gray50:    "#fafafa",
  gray100:   "#f4f4f4",
  gray200:   "#e8e8e8",
  gray300:   "#d0d0d0",
  gray400:   "#999999",
  gray500:   "#666666",
  gray600:   "#444444",
  gray700:   "#222222",
  gray900:   "#111111",
  green:     "#1a8a4a",
  greenLight:"#e8f5ee",
  amber:     "#b45309",
  amberLight:"#fef3e2",
  blue:      "#1a5fa8",
};

const TOPICS  = ["All Industries", "AI", "Fintech", "HealthTech", "Cybersecurity", "CleanTech", "Robotics"];
const SIGNALS = ["All", "Strong", "Weak"];

function StatCard({ label, value }) {
  return (
    <div style={{
      background: B.white,
      border: `1px solid ${B.gray200}`,
      borderRadius: 6,
      padding: "18px 20px",
    }}>
      <div style={{ fontSize: 24, fontWeight: 800, color: ACCENT, marginBottom: 4, letterSpacing: -0.5 }}>{value}</div>
      <div style={{ fontSize: 13, color: B.gray500, fontWeight: 500 }}>{label}</div>
    </div>
  );
}

function ArticleCard({ article }) {
  const isStrong = article.signal_strength === "Strong";
  const title    = cleanText(article.title);
  const rawSum   = cleanText(article.summary || "");
  const summary  = !rawSum || rawSum === title ? "Summary not yet generated." : rawSum;
  const industry = article.topic || article.search_topic || article.industry || "General";
  const date     = article.published_at
    ? new Date(article.published_at).toLocaleDateString()
    : "";
  const url = article.url || article.link
    || `https://www.google.com/search?q=${encodeURIComponent(article.title)}`;

  return (
    <div
      onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)";
        e.currentTarget.style.borderColor = B.gray300;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.borderColor = B.gray200;
      }}
      style={{
        background: B.white,
        border: `1px solid ${B.gray200}`,
        borderRadius: 6,
        padding: "20px",
        cursor: "pointer",
        transition: "box-shadow 0.2s, border-color 0.2s",
      }}
    >
      {/* Title + Signal badge */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 14, marginBottom: 10 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: B.gray900, lineHeight: 1.4, flex: 1 }}>
          {title}
        </div>
        <span style={{
          flexShrink: 0,
          fontSize: 10,
          fontWeight: 700,
          padding: "4px 10px",
          borderRadius: 999,
          letterSpacing: 0.5,
          marginTop: 2,
          ...(isStrong
            ? { background: B.green, color: "#fff" }
            : { background: "transparent", color: B.gray400, border: `1px solid ${B.gray300}` }),
        }}>
          {isStrong ? "STRONG" : "WEAK"}
        </span>
      </div>

      {/* Summary */}
      <div style={{
        fontSize: 15,
        color: B.gray500,
        lineHeight: 1.65,
        marginBottom: 14,
        display: "-webkit-box",
        WebkitLineClamp: 3,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
      }}>
        {summary}
      </div>

      {/* Metadata footer */}
      <div style={{ fontSize: 13, color: B.gray400 }}>
        {industry} · {article.source} · {date}
      </div>
    </div>
  );
}

export default function Explore() {
  const [articles, setArticles]             = useState([]);
  const [loading,  setLoading]              = useState(false);
  const [error,    setError]                = useState(null);
  const [selectedTopic, setSelectedTopic]   = useState("All Industries");
  const [selectedSignal]                    = useState("All");
  const [searchQuery, setSearchQuery]       = useState("");
  const [currentPage, setCurrentPage]       = useState(1);
  const [itemsPerPage, setItemsPerPage]     = useState(10);
  const [totalCount, setTotalCount]         = useState(0);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedArticles, setSelectedArticles] = useState(new Set());
  const [reportFormat, setReportFormat]     = useState("md");
  const [searchTimeout, setSearchTimeout]   = useState(null);

  const fetchArticles = useCallback(async (page = 1, pageSize = itemsPerPage) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getArticles({
        topic:    selectedTopic === "All Industries" ? undefined : selectedTopic,
        signal:   selectedSignal === "All" ? undefined : selectedSignal,
        search:   searchQuery || undefined,
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

  useEffect(() => { fetchArticles(1, itemsPerPage); }, [fetchArticles, itemsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
    fetchArticles(1, itemsPerPage);
  }, [selectedTopic, selectedSignal, fetchArticles, itemsPerPage]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (searchTimeout) clearTimeout(searchTimeout);
    const timeout = setTimeout(() => {
      setCurrentPage(1);
      fetchArticles(1, itemsPerPage);
    }, 400);
    setSearchTimeout(timeout);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchArticles(page, itemsPerPage);
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const handleIngest = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await triggerIngest();
      if (response.status === "started") {
        let attempts = 0;
        const maxAttempts = 60;
        const pollInterval = setInterval(async () => {
          attempts++;
          try {
            const articlesResponse = await getArticles({ page: 1, pageSize: 50 });
            if (articlesResponse.items && articlesResponse.items.length > 0) {
              setArticles(articlesResponse.items);
              setTotalCount(articlesResponse.total || 0);
              setCurrentPage(1);
              clearInterval(pollInterval);
              setLoading(false);
            }
          } catch (err) {
            console.warn("Poll attempt failed:", err);
          }
          if (attempts >= maxAttempts) {
            clearInterval(pollInterval);
            setLoading(false);
          }
        }, 2000);
      } else {
        await fetchArticles(1, itemsPerPage);
        setLoading(false);
      }
    } catch (err) {
      setError("Ingestion failed: " + err.message);
      setLoading(false);
    }
  };

  const toggleArticleSelection = (articleId) => {
    const newSet = new Set(selectedArticles);
    if (newSet.has(articleId)) newSet.delete(articleId);
    else newSet.add(articleId);
    setSelectedArticles(newSet);
  };

  const toggleAllArticles = () => {
    if (selectedArticles.size === articles.length) setSelectedArticles(new Set());
    else setSelectedArticles(new Set(articles.map(a => a.id)));
  };

  const handleGenerateReport = async () => {
    if (selectedArticles.size === 0) { setError("Please select at least one article"); return; }
    const selected = articles.filter(a => selectedArticles.has(a.id));
    try {
      const reportData = {
        title:       `AI Report - ${new Date().toLocaleDateString()}`,
        summary:     `Report with ${selected.length} selected articles about ${selectedTopic}`,
        key_points:  selected.slice(0, 5).map(a => a.title),
        articles:    selected.map((a, idx) => ({
          number: idx + 1, title: a.title, source: a.source,
          date: new Date(a.published_at).toLocaleDateString(),
          signal: a.signal_strength?.toLowerCase(), relevance: a.relevance,
          url: a.url, summary: a.summary,
        })),
        funding_count: 0,
      };
      await saveReport(reportData);
      setShowReportModal(false);
      setSelectedArticles(new Set());
      setReportFormat("md");
    } catch (err) {
      setError(`Failed to save report: ${err.message}`);
    }
  };

  const handleDownloadReport = async () => {
    if (selectedArticles.size === 0) { setError("Please select at least one article"); return; }
    const selected = articles.filter(a => selectedArticles.has(a.id));
    let markdownContent = `# AI Watch Report\n\nGenerated: ${new Date().toLocaleString()}\n\n`;
    selected.forEach((article, idx) => {
      markdownContent += `## ${idx + 1}. ${article.title}\n\n`;
      markdownContent += `**Source:** ${article.source}\n**Signal:** ${article.signal_strength}\n**Relevance:** ${article.relevance}/10\n`;
      markdownContent += `**Published:** ${new Date(article.published_at).toLocaleDateString()}\n**URL:** ${article.url || "No URL available"}\n\n`;
      markdownContent += `${article.summary || "Summary not available"}\n\n---\n\n`;
    });
    try {
      if (reportFormat === "pdf") {
        const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
        const pageWidth  = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 15;
        const maxWidth = pageWidth - margin * 2;
        let y = margin;
        pdf.setFontSize(18); pdf.setTextColor(108, 71, 255);
        pdf.text("AI WATCH REPORT", margin, y); y += 10;
        pdf.setFontSize(10); pdf.setTextColor(102, 102, 102);
        pdf.text(`Generated: ${new Date().toLocaleString()}`, margin, y); y += 8;
        pdf.setDrawColor(108, 71, 255);
        pdf.line(margin, y, pageWidth - margin, y); y += 8;
        selected.forEach((article, idx) => {
          if (y > pageHeight - margin - 40) { pdf.addPage(); y = margin; }
          pdf.setFontSize(12); pdf.setTextColor(17, 17, 17); pdf.setFont(undefined, "bold");
          const titleLines = pdf.splitTextToSize(`${idx + 1}. ${article.title}`, maxWidth);
          pdf.text(titleLines, margin, y); y += titleLines.length * 6 + 2;
          pdf.setFontSize(9); pdf.setTextColor(102, 102, 102); pdf.setFont(undefined, "normal");
          pdf.text(`Source: ${article.source} | Signal: ${article.signal_strength} | Relevance: ${article.relevance}/10`, margin, y); y += 6;
          pdf.text(`Published: ${new Date(article.published_at).toLocaleDateString()}`, margin, y); y += 6;
          if (article.url) {
            pdf.setTextColor(108, 71, 255); pdf.setFont(undefined, "bold");
            const urlLines = pdf.splitTextToSize(`URL: ${article.url}`, maxWidth);
            pdf.text(urlLines, margin, y); y += urlLines.length * 5 + 2;
          }
          y += 2;
          pdf.setFontSize(10); pdf.setTextColor(68, 68, 68);
          const sumLines = pdf.splitTextToSize(article.summary || "Summary not available", maxWidth);
          pdf.text(sumLines, margin, y); y += sumLines.length * 5 + 6;
          pdf.setDrawColor(224, 224, 224);
          pdf.line(margin, y, pageWidth - margin, y); y += 6;
        });
        if (y < pageHeight - 10) {
          pdf.setFontSize(8); pdf.setTextColor(153, 153, 153);
          pdf.text("AI Watch v2.0 | Strategic Intelligence Platform", margin, pageHeight - 10);
        }
        pdf.save(`ai-watch-report-${new Date().toISOString().split("T")[0]}.pdf`);
      } else {
        const el = document.createElement("a");
        el.setAttribute("href", "data:text/markdown;charset=utf-8," + encodeURIComponent(markdownContent));
        el.setAttribute("download", `ai-watch-report-${new Date().toISOString().split("T")[0]}.md`);
        el.style.display = "none";
        document.body.appendChild(el);
        el.click();
        document.body.removeChild(el);
      }
    } catch (err) {
      setError(`Failed to download report: ${err.message}`);
    }
  };

  const strongCount  = articles.filter(a => a.signal_strength === "Strong").length;
  const avgRelevance = articles.length
    ? (articles.reduce((a, b) => a + (b.relevance || 5), 0) / articles.length).toFixed(1)
    : "—";

  return (
    <div style={{ background: B.white, padding: "24px 28px", minHeight: "100%" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* ── PAGE HEADER ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: B.gray900, letterSpacing: -0.3, margin: 0 }}>
          Explore Intelligence
        </h1>
        <button
          onClick={handleIngest}
          disabled={loading}
          onMouseEnter={e => { e.currentTarget.style.background = ACCENT_BG; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
          style={{
            display: "flex", alignItems: "center", gap: 7,
            background: "transparent",
            color: ACCENT,
            border: `1.5px solid ${ACCENT}`,
            padding: "7px 16px",
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
            transition: "background 0.15s",
          }}
        >
          {loading && (
            <span style={{
              width: 11, height: 11,
              border: `2px solid ${ACCENT}40`,
              borderTop: `2px solid ${ACCENT}`,
              borderRadius: "50%",
              display: "inline-block",
              animation: "spin 0.8s linear infinite",
              flexShrink: 0,
            }} />
          )}
          {loading ? "Refreshing..." : "Refresh Intelligence"}
        </button>
      </div>

      {/* ── KPI STRIP (3 cards) ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 20 }}>
        <StatCard label="Articles Today"  value={totalCount} />
        <StatCard label="Strong Signals"  value={strongCount} />
        <StatCard label="Avg Relevance"   value={articles.length ? `${avgRelevance}/10` : "—"} />
      </div>

      {/* ── MERGED TOOLBAR: search left, topic chips right ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        {/* Search */}
        <div style={{ position: "relative", flexShrink: 0, width: 260 }}>
          <Search
            size={14}
            strokeWidth={1.8}
            style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: B.gray400, pointerEvents: "none" }}
          />
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={e => { e.target.style.borderColor = ACCENT; e.target.style.boxShadow = `0 0 0 3px ${ACCENT}20`; }}
            onBlur={e => { e.target.style.borderColor = B.gray200; e.target.style.boxShadow = "none"; }}
            style={{
              width: "100%",
              padding: "9px 12px 9px 36px",
              border: `1px solid ${B.gray200}`,
              borderRadius: 6,
              fontSize: 13,
              outline: "none",
              transition: "border-color 0.15s, box-shadow 0.15s",
              background: B.white,
            }}
          />
        </div>

        {/* Topic filter chips — scrollable */}
        <div style={{ flex: 1, overflowX: "auto", display: "flex", gap: 6, minWidth: 0, paddingBottom: 2 }}>
          {TOPICS.map(topic => {
            const active = selectedTopic === topic;
            return (
              <button
                key={topic}
                onClick={() => setSelectedTopic(topic)}
                style={{
                  flexShrink: 0,
                  padding: "6px 14px",
                  border: active ? `1.5px solid ${ACCENT}` : `1px solid ${B.gray200}`,
                  background: active ? ACCENT_BG : "transparent",
                  color: active ? ACCENT : B.gray600,
                  fontSize: 12,
                  fontWeight: active ? 700 : 400,
                  cursor: "pointer",
                  borderRadius: 999,
                  transition: "all 0.15s",
                  whiteSpace: "nowrap",
                }}
              >
                {topic}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── ERROR ── */}
      {error && (
        <div style={{
          background: B.amberLight,
          border: `1px solid ${B.amber}`,
          color: B.amber,
          padding: "12px 16px",
          marginBottom: 16,
          borderRadius: 6,
          fontSize: 12,
        }}>
          {error}
        </div>
      )}

      {/* ── LOADING ── */}
      {loading && (
        <div style={{ textAlign: "center", padding: "60px 40px", fontSize: 12, color: B.gray500 }}>
          <div style={{
            width: 36, height: 36,
            margin: "0 auto 16px",
            border: `3px solid ${B.gray200}`,
            borderTop: `3px solid ${ACCENT}`,
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }} />
          <div style={{ fontSize: 14, fontWeight: 700, color: B.gray900, marginBottom: 6 }}>
            Loading articles...
          </div>
          <div style={{ fontSize: 12, color: B.gray400, lineHeight: 1.6 }}>
            Fetching intelligence from NewsAPI, Google News and Perplexity
          </div>
        </div>
      )}

      {/* ── EMPTY STATE ── */}
      {!loading && articles.length === 0 && (
        <div style={{
          textAlign: "center",
          padding: "60px 40px",
          background: B.gray50,
          border: `1px solid ${B.gray200}`,
          borderRadius: 6,
          marginBottom: 24,
        }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: B.gray900, marginBottom: 8 }}>
            No articles yet
          </div>
          <div style={{ fontSize: 13, color: B.gray500, marginBottom: 24, lineHeight: 1.6 }}>
            Click "Refresh Intelligence" above to fetch the latest tech news across all sectors.
          </div>
          <button
            onClick={handleIngest}
            disabled={loading}
            style={{
              background: ACCENT,
              color: B.white,
              border: "none",
              padding: "10px 24px",
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
            }}>
            Refresh Intelligence
          </button>
        </div>
      )}

      {/* ── ARTICLE LIST (single column) ── */}
      {!loading && articles.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
          {articles.map(article => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}

      {/* ── PAGINATION ── */}
      {!loading && articles.length > 0 && (
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          border: `1px solid ${B.gray200}`,
          borderRadius: 6,
          padding: "14px 20px",
          background: B.white,
        }}>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <span style={{ fontSize: 12, color: B.gray500, marginRight: 4 }}>Show:</span>
            {[10, 25, 50, 100].map(count => (
              <button
                key={count}
                onClick={() => { setItemsPerPage(count); handlePageChange(1); }}
                style={{
                  padding: "4px 10px",
                  border: itemsPerPage === count ? `2px solid ${ACCENT}` : `1px solid ${B.gray200}`,
                  background: itemsPerPage === count ? ACCENT_BG : B.white,
                  color: itemsPerPage === count ? ACCENT : B.gray600,
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

          <span style={{ fontSize: 12, color: B.gray500 }}>
            Page {currentPage} of {totalPages}
          </span>

          <div style={{ display: "flex", gap: 6 }}>
            <button
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              style={{
                padding: "6px 14px",
                border: `1px solid ${B.gray200}`,
                background: B.white,
                borderRadius: 4,
                cursor: currentPage === 1 ? "not-allowed" : "pointer",
                opacity: currentPage === 1 ? 0.4 : 1,
                fontSize: 12,
                color: B.gray600,
              }}
            >
              Prev
            </button>
            <button
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              style={{
                padding: "6px 14px",
                border: `1px solid ${B.gray200}`,
                background: B.white,
                borderRadius: 4,
                cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                opacity: currentPage === totalPages ? 0.4 : 1,
                fontSize: 12,
                color: B.gray600,
              }}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* ── REPORT MODAL ── */}
      {showReportModal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000,
        }}>
          <div style={{
            background: B.white,
            borderRadius: 8,
            boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
            maxWidth: 560,
            width: "90%",
            maxHeight: "80vh",
            overflow: "auto",
          }}>
            <div style={{
              padding: "20px 24px",
              borderBottom: `1px solid ${B.gray200}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: B.gray900, margin: 0 }}>Generate Report</h2>
              <button
                onClick={() => { setShowReportModal(false); setSelectedArticles(new Set()); }}
                style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: B.gray400 }}
              >
                x
              </button>
            </div>
            <div style={{ padding: "24px" }}>
              <div style={{ fontSize: 13, color: B.gray600, marginBottom: 16 }}>
                {selectedArticles.size} article{selectedArticles.size !== 1 ? "s" : ""} selected
              </div>
              <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
                {["md", "pdf"].map(fmt => (
                  <button
                    key={fmt}
                    onClick={() => setReportFormat(fmt)}
                    style={{
                      padding: "8px 20px",
                      border: reportFormat === fmt ? `2px solid ${ACCENT}` : `1px solid ${B.gray200}`,
                      background: reportFormat === fmt ? ACCENT_BG : B.white,
                      color: reportFormat === fmt ? ACCENT : B.gray600,
                      fontWeight: reportFormat === fmt ? 700 : 400,
                      fontSize: 12, cursor: "pointer", borderRadius: 4,
                    }}
                  >
                    {fmt.toUpperCase()}
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={handleGenerateReport}
                  style={{
                    background: ACCENT, color: B.white, border: "none",
                    padding: "10px 20px", borderRadius: 4, fontSize: 13,
                    fontWeight: 700, cursor: "pointer", flex: 1,
                  }}
                >
                  Save to My Reports
                </button>
                <button
                  onClick={handleDownloadReport}
                  style={{
                    background: B.white, color: ACCENT,
                    border: `1.5px solid ${ACCENT}`,
                    padding: "10px 20px", borderRadius: 4, fontSize: 13,
                    fontWeight: 700, cursor: "pointer", flex: 1,
                  }}
                >
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
