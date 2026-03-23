import { useState, useEffect } from "react";
import { getReports, getReport, deleteReport } from "../services/api";
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

function ReportsList({ onSelectReport, refreshKey }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getReports(1, 50)
      .then(response => {
        setReports(response.items || []);
      })
      .catch(err => {
        setError(err.message);
        setReports([]);
      })
      .finally(() => setLoading(false));
  }, [refreshKey]);

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
        <h2 style={{ fontSize: 16, fontWeight: 800, color: B.gray900, marginBottom: 4 }}>Available Reports</h2>
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
          <div style={{ padding: "40px 20px", textAlign: "center", color: B.gray400 }}>
            <p style={{ fontSize: 14, marginBottom: 12 }}>No reports available yet</p>
            <p style={{ fontSize: 12 }}>Go to Explore page and click "Generate Reports →" to create one</p>
          </div>
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
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = B.purple;
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(107, 44, 148, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = B.gray100;
                e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)";
              }}
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

function ReportDetail({ reportId, onClose, onDelete }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getReport(reportId)
      .then(response => setReport(response))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [reportId]);

  const handleDelete = async () => {
    if (window.confirm(`Delete report "${report?.title}"? This action cannot be undone.`)) {
      setDeleting(true);
      try {
        await deleteReport(reportId);
        // Trigger callback to refresh list and close detail
        onDelete(reportId);
      } catch (err) {
        setError("Failed to delete report: " + err.message);
      } finally {
        setDeleting(false);
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleGeneratePDF = async () => {
    try {
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const maxWidth = pageWidth - (margin * 2);
      let yPosition = margin;

      // Title
      pdf.setFontSize(28);
      pdf.setTextColor(107, 44, 148);
      pdf.setFont(undefined, "bold");
      pdf.text(report.title, margin, yPosition);
      yPosition += 12;

      // Date
      pdf.setFontSize(11);
      pdf.setTextColor(102, 102, 102);
      pdf.setFont(undefined, "normal");
      pdf.text(formatDate(report.generated_date || new Date()), margin, yPosition);
      yPosition += 8;

      // Divider
      pdf.setDrawColor(107, 44, 148);
      pdf.setLineWidth(0.5);
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      yPosition += 12;

      // Summary
      if (report.summary) {
        pdf.setFontSize(10);
        pdf.setTextColor(68, 68, 68);
        pdf.setFont(undefined, "bold");
        pdf.text("Summary", margin, yPosition);
        yPosition += 6;

        pdf.setFont(undefined, "normal");
        const summaryLines = pdf.splitTextToSize(report.summary, maxWidth);
        pdf.text(summaryLines, margin, yPosition);
        yPosition += summaryLines.length * 4 + 8;
      }

      // Key Findings
      if (report.key_points && report.key_points.length > 0) {
        if (yPosition > pageHeight - margin - 40) {
          pdf.addPage();
          yPosition = margin;
        }

        pdf.setFontSize(10);
        pdf.setTextColor(17, 17, 17);
        pdf.setFont(undefined, "bold");
        pdf.text("Key Findings", margin, yPosition);
        yPosition += 8;

        pdf.setFont(undefined, "normal");
        pdf.setFontSize(9);
        pdf.setTextColor(68, 68, 68);

        report.key_points.forEach((point) => {
          if (yPosition > pageHeight - margin - 20) {
            pdf.addPage();
            yPosition = margin;
          }
          const pointLines = pdf.splitTextToSize("• " + point, maxWidth - 5);
          pdf.text(pointLines, margin + 5, yPosition);
          yPosition += pointLines.length * 4 + 2;
        });
        yPosition += 6;
      }

      // Articles
      if (report.articles && report.articles.length > 0) {
        if (yPosition > pageHeight - margin - 40) {
          pdf.addPage();
          yPosition = margin;
        }

        pdf.setFontSize(10);
        pdf.setTextColor(17, 17, 17);
        pdf.setFont(undefined, "bold");
        pdf.text("Articles & Sources", margin, yPosition);
        yPosition += 10;

        report.articles.forEach((article, idx) => {
          if (yPosition > pageHeight - margin - 30) {
            pdf.addPage();
            yPosition = margin;
          }

          // Article number and title
          pdf.setFontSize(9);
          pdf.setTextColor(17, 17, 17);
          pdf.setFont(undefined, "bold");
          const titleLines = pdf.splitTextToSize(`${article.number || idx + 1}. ${article.title}`, maxWidth);
          pdf.text(titleLines, margin, yPosition);
          yPosition += titleLines.length * 4 + 2;

          // Metadata
          pdf.setFontSize(8);
          pdf.setTextColor(102, 102, 102);
          pdf.setFont(undefined, "normal");
          pdf.text(`${article.source} | ${article.date} | Signal: ${article.signal?.toUpperCase()} | Relevance: ${article.relevance}/10`, margin, yPosition);
          yPosition += 5;

          // Summary
          if (article.summary) {
            pdf.setFontSize(8);
            pdf.setTextColor(68, 68, 68);
            const summaryLines = pdf.splitTextToSize(article.summary, maxWidth);
            pdf.text(summaryLines, margin, yPosition);
            yPosition += summaryLines.length * 3.5 + 3;
          }

          // URL
          if (article.url) {
            pdf.setTextColor(107, 44, 148);
            pdf.setFont(undefined, "bold");
            const urlLines = pdf.splitTextToSize(`URL: ${article.url}`, maxWidth);
            pdf.text(urlLines, margin, yPosition);
            yPosition += urlLines.length * 3 + 6;
          } else {
            yPosition += 4;
          }
        });
      }

      // Save PDF
      const filename = `${report.title.replace(/\s+/g, "-").toLowerCase()}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(filename);
    } catch (err) {
      setError("Failed to generate PDF: " + err.message);
    }
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
          className="no-print"
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

      {/* Body - Screen Display Only */}
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
                <div style={{ display: "flex", gap: 8, marginLeft: 12, flexDirection: "column" }}>
                  <button
                    onClick={handleGeneratePDF}
                    style={{
                      padding: "8px 14px",
                      background: B.purple,
                      border: `1px solid ${B.purple}`,
                      color: B.white,
                      borderRadius: 4,
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = B.purpleDeep;
                      e.target.style.borderColor = B.purpleDeep;
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = B.purple;
                      e.target.style.borderColor = B.purple;
                    }}
                  >
                    ⬇️ Download PDF
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    style={{
                      padding: "8px 14px",
                      background: "#fdf0ef",
                      border: `1px solid #f5d4cc`,
                      color: B.amber,
                      borderRadius: 4,
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: deleting ? "not-allowed" : "pointer",
                      transition: "all 0.2s",
                      opacity: deleting ? 0.6 : 1,
                    }}
                    onMouseEnter={(e) => {
                      if (!deleting) {
                        e.target.style.background = B.amber;
                        e.target.style.color = B.white;
                        e.target.style.borderColor = B.amber;
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = "#fdf0ef";
                      e.target.style.color = B.amber;
                      e.target.style.borderColor = "#f5d4cc";
                    }}
                  >
                    {deleting ? "Deleting..." : "🗑️ Delete"}
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
  const [refreshKey, setRefreshKey] = useState(0);

  const handleReportDeleted = (reportId) => {
    setSelectedReportId(null);
    // Refresh the list by incrementing key
    setRefreshKey(prev => prev + 1);
  };

  return (
    <>
      <div style={{ background: B.white, padding: "24px 28px", minHeight: "100vh" }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: B.gray900, marginBottom: 8 }}>Reports</h1>
          <p style={{ fontSize: 12, color: B.gray500 }}>Analysis and insights from your data</p>
        </div>

        {selectedReportId ? (
          <ReportDetail
            reportId={selectedReportId}
            onClose={() => setSelectedReportId(null)}
            onDelete={handleReportDeleted}
          />
        ) : (
          <ReportsList onSelectReport={setSelectedReportId} refreshKey={refreshKey} />
        )}
      </div>
    </>
  );
}
