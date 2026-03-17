import { useState, useEffect, useCallback } from "react";
import { getReports, getReport } from "../services/api";

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

        {/* Recommendations */}
        {report.recommendations && report.recommendations.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: B.gray900, marginBottom: 12 }}>Recommendations</h2>
            <ul style={{ fontSize: 12, color: B.gray600, lineHeight: 1.8, paddingLeft: 20 }}>
              {report.recommendations.map((rec, idx) => (
                <li key={idx} style={{ marginBottom: 6 }}>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}

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
  );
}
