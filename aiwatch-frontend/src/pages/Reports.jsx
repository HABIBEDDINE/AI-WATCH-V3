import { useState, useEffect } from "react";
import { getReports, getReport } from "../services/api";

// Print styles
const printStyles = `
  @media print {
    body {
      margin: 0;
      padding: 0;
      background: white;
    }
    
    .report-print-container {
      page-break-after: always;
      padding: 40px;
      color: #111111;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
    }
    
    .report-header {
      border-bottom: 3px solid #6B2C94;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    
    .report-title {
      font-size: 28px;
      font-weight: 800;
      color: #111111;
      margin: 0 0 10px 0;
    }
    
    .report-meta {
      font-size: 12px;
      color: #666666;
      margin-bottom: 15px;
    }
    
    .report-section {
      margin-bottom: 30px;
    }
    
    .report-section-title {
      font-size: 16px;
      font-weight: 700;
      color: #111111;
      margin-bottom: 15px;
      border-left: 4px solid #6B2C94;
      padding-left: 12px;
    }
    
    .article-item {
      page-break-inside: avoid;
      margin-bottom: 20px;
      padding: 15px;
      border: 1px solid #d0d0d0;
      border-radius: 4px;
      background: #fafafa;
    }
    
    .article-number {
      display: inline-block;
      background: #6B2C94;
      color: white;
      padding: 4px 10px;
      border-radius: 3px;
      font-weight: 700;
      margin-right: 10px;
      font-size: 11px;
    }
    
    .article-title {
      font-size: 14px;
      font-weight: 700;
      color: #111111;
      margin: 10px 0;
    }
    
    .article-meta {
      font-size: 11px;
      color: #666666;
      margin-bottom: 10px;
    }
    
    .article-url {
      word-break: break-all;
      font-size: 10px;
      color: #6B2C94;
      font-weight: 600;
      margin-top: 8px;
    }
    
    ul {
      margin: 0;
      padding-left: 25px;
    }
    
    li {
      margin-bottom: 8px;
      color: #444444;
    }
    
    button, .report-controls {
      display: none;
    }
  }
`;

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

function ReportsList({ onSelectReport }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getReports(1, 50)
      .then(response => setReports(response.items || []))
      .catch(err => {
        setError(err.message);
        setReports([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 800, color: B.gray900, marginBottom: 4 }}>Recent Reports</h2>
        <p style={{ fontSize: 11, color: B.gray500 }}>{reports.length} reports available</p>
      </div>

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

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
        {loading ? (
          <div style={{ padding: "20px", textAlign: "center", color: B.gray400 }}>Loading reports...</div>
        ) : reports.length === 0 ? (
          <div style={{ padding: "20px", textAlign: "center", color: B.gray400 }}>No reports found</div>
        ) : (
          reports.map(report => (
            <div
              key={report.id}
              onClick={() => onSelectReport(report.id)}
              style={{
                background: B.white,
                border: `1px solid ${B.gray100}`,
                borderRadius: 4,
                padding: "16px 20px",
                cursor: "pointer",
                transition: "all 0.2s",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                ":hover": { borderColor: B.purple, boxShadow: "0 2px 8px rgba(107, 44, 148, 0.15)" },
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = B.purple}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = B.gray100}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div>
                  <h3 style={{ fontSize: 13, fontWeight: 700, color: B.gray900, marginBottom: 4 }}>
                    {report.title}
                  </h3>
                  <p style={{ fontSize: 11, color: B.gray600 }}>
                    {report.summary || "No summary available"}
                  </p>
                </div>
                <span style={{ fontSize: 10, color: B.gray500, whiteSpace: "nowrap", marginLeft: 12 }}>
                  {formatDate(report.generated_date || new Date())}
                </span>
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                <span style={{
                  fontSize: 10,
                  background: B.purplePale,
                  color: B.purple,
                  padding: "4px 8px",
                  borderRadius: 3,
                  fontWeight: 600,
                }}>
                  📄 {report.article_count || 0} articles
                </span>
                <span style={{
                  fontSize: 10,
                  background: B.greenLight,
                  color: B.green,
                  padding: "4px 8px",
                  borderRadius: 3,
                  fontWeight: 600,
                }}>
                  🚀 {report.funding_count || 0} funding rounds
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function ReportDetail({ reportId, onClose }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getReport(reportId)
      .then(response => setReport(response))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [reportId]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div style={{ background: B.white, border: `1px solid ${B.gray100}`, borderRadius: 4, padding: 20 }}>
        <div style={{ textAlign: "center", color: B.gray400 }}>Loading report...</div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div style={{ background: B.white, border: `1px solid ${B.gray100}`, borderRadius: 4, padding: 20 }}>
        <div style={{ color: B.amber }}>Error loading report: {error}</div>
        <button
          onClick={onClose}
          style={{
            marginTop: 12,
            padding: "6px 12px",
            background: B.purple,
            color: B.white,
            border: "none",
            borderRadius: 2,
            fontSize: 11,
            cursor: "pointer",
          }}
        >
          Back to List
        </button>
      </div>
    );
  }

  return (
    <div style={{ background: B.white, border: `1px solid ${B.gray100}`, borderRadius: 4, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
      {/* Header */}
      <div style={{ background: B.purple, color: B.white, padding: "20px 24px" }}>
        <button
          onClick={onClose}
          style={{
            float: "right",
            background: "rgba(255,255,255,0.2)",
            color: B.white,
            border: "none",
            padding: "6px 12px",
            borderRadius: 2,
            cursor: "pointer",
            fontSize: 12,
          }}
        >
          ← Back
        </button>
        <h1 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8, clear: "both" }}>
          {report.title}
        </h1>
        <p style={{ fontSize: 11, opacity: 0.9, marginBottom: 12 }}>
          Generated on {formatDate(report.generated_date || new Date())}
        </p>
        <div style={{ display: "flex", gap: 12 }}>
          <span style={{ fontSize: 10, background: "rgba(255,255,255,0.2)", padding: "4px 8px", borderRadius: 2 }}>
            📄 {report.article_count || 0} articles
          </span>
          <span style={{ fontSize: 10, background: "rgba(255,255,255,0.2)", padding: "4px 8px", borderRadius: 2 }}>
            🚀 {report.funding_count || 0} funding rounds
          </span>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "24px" }}>
        {/* Summary */}
        {report.summary && (
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: B.gray900, marginBottom: 12 }}>Summary</h2>
            <p style={{ fontSize: 12, color: B.gray600, lineHeight: 1.6 }}>
              {report.summary}
            </p>
          </div>
        )}

        {/* Key Points */}
        {report.key_points && report.key_points.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: B.gray900, marginBottom: 12 }}>Key Findings</h2>
            <ul style={{ fontSize: 12, color: B.gray600, lineHeight: 1.8, paddingLeft: 20 }}>
              {report.key_points.map((point, idx) => (
                <li key={idx} style={{ marginBottom: 6 }}>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        )}

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                <div style={{ flex: 1 }}>
                  <h2 style={{ fontSize: 14, fontWeight: 700, color: B.gray900, marginBottom: 12 }}>Articles & Sources</h2>
                  {report.articles && report.articles.length > 0 ? (
                    <div style={{ display: "grid", gap: 12 }}>
                      {report.articles.map((article, idx) => (
                        <div key={idx} style={{
                          background: B.gray50,
                          border: `1px solid ${B.gray100}`,
                          borderRadius: 4,
                          padding: "12px 16px",
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = B.purple;
                          e.currentTarget.style.boxShadow = `0 2px 8px rgba(107, 44, 148, 0.15)`;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = B.gray100;
                          e.currentTarget.style.boxShadow = "none";
                        }}
                        >
                          <div style={{ display: "flex", gap: 12, marginBottom: 8 }}>
                            <span style={{
                              fontSize: 11,
                              fontWeight: 700,
                              color: B.purple,
                              background: B.purplePale,
                              padding: "4px 10px",
                              borderRadius: 3,
                              whiteSpace: "nowrap",
                            }}>#{article.number || idx + 1}</span>
                            <span style={{
                              fontSize: 10,
                              background: article.signal === "strong" ? B.greenLight : "#fef3e2",
                              color: article.signal === "strong" ? B.green : B.amber,
                              padding: "4px 8px",
                              borderRadius: 3,
                              fontWeight: 600,
                              whiteSpace: "nowrap",
                            }}>
                              {article.signal?.toUpperCase() || "SIGNAL"}
                            </span>
                          </div>
                          <h4 style={{ fontSize: 12, fontWeight: 700, color: B.gray900, margin: "8px 0", lineHeight: 1.4 }}>
                            {article.title}
                          </h4>
                          <div style={{ display: "flex", gap: 12, marginBottom: 10, fontSize: 11, color: B.gray600 }}>
                            <span>📰 {article.source}</span>
                            <span>📅 {article.date}</span>
                            <span>🎯 {article.relevance || article.score?.relevance || 0}/10 relevance</span>
                          </div>
                          {article.summary && (
                            <p style={{ fontSize: 11, color: B.gray600, margin: "8px 0", lineHeight: 1.5 }}>
                              {article.summary}
                            </p>
                          )}
                          {article.url && (
                            <a
                              href={article.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                fontSize: 11,
                                color: B.purple,
                                fontWeight: 600,
                                textDecoration: "none",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                                cursor: "pointer",
                              }}
                              onMouseEnter={(e) => e.target.style.textDecoration = "underline"}
                              onMouseLeave={(e) => e.target.style.textDecoration = "none"}
                            >
                              🔗 Read Full Article →
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontSize: 12, color: B.gray500 }}>No articles in this report</p>
                  )}
                </div>

                {/* Export/Print buttons */}
                <div style={{ display: "flex", gap: 8, marginLeft: 12 }}>
                  <button
                    onClick={() => window.print()}
                    style={{
                      padding: "8px 14px",
                      background: B.gray50,
                      border: `1px solid ${B.gray200}`,
                      color: B.gray700,
                      borderRadius: 4,
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = B.purple;
                      e.target.style.color = B.white;
                      e.target.style.borderColor = B.purple;
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = B.gray50;
                      e.target.style.color = B.gray700;
                      e.target.style.borderColor = B.gray200;
                    }}
                  >
                    🖨️ Print / PDF
                  </button>
                </div>
              </div>

        {/* Metadata */}
        <div style={{ borderTop: `1px solid ${B.gray100}`, paddingTop: 16, marginTop: 24 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <p style={{ fontSize: 10, color: B.gray500, fontWeight: 600, marginBottom: 4 }}>Report ID</p>
              <p style={{ fontSize: 11, color: B.gray700, fontFamily: "monospace" }}>{report.id}</p>
            </div>
            <div>
              <p style={{ fontSize: 10, color: B.gray500, fontWeight: 600, marginBottom: 4 }}>Generated</p>
              <p style={{ fontSize: 11, color: B.gray700 }}>{formatDate(report.generated_date || new Date())}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Reports() {
  const [selectedReportId, setSelectedReportId] = useState(null);

  return (
    <>
      <style>{printStyles}</style>
      <div style={{ background: B.white, padding: "24px 28px", minHeight: "100vh" }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: B.gray900, marginBottom: 8 }}>Reports</h1>
          <p style={{ fontSize: 12, color: B.gray500 }}>Analysis and insights from your data</p>
        </div>

        {selectedReportId ? (
          <ReportDetail
            reportId={selectedReportId}
            onClose={() => setSelectedReportId(null)}
          />
        ) : (
          <ReportsList onSelectReport={setSelectedReportId} />
        )}
      </div>
    </>
  );
}
