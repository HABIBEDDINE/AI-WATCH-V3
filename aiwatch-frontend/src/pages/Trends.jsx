import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { getTrends } from "../services/api";

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
  gray900: "#111111",
  green: "#1a8a4a",
  greenLight: "#e8f5ee",
  amber: "#b45309",
};

export default function Trends() {
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [persona, setPersona] = useState("cto");

  const PERSONAS = [
    { id: "cto", label: "CTO (Ahmed)" },
    { id: "innovation", label: "Innovation Manager (Camille)" },
    { id: "strategy", label: "Strategy Director (Omar)" },
  ];

  // Fetch trends data
  const fetchTrends = async (selectedPersona) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getTrends(selectedPersona, 10);
      setTrends(response);
    } catch (err) {
      setError(err.message);
      setTrends(null);
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount and when persona changes
  useEffect(() => {
    fetchTrends(persona);
  }, [persona]);

  // Prepare chart data
  const chartData = trends && trends.series ? trends.series.map((value, index) => ({
    day: index + 1,
    "Trend Index": value,
  })) : [];

  return (
    <div style={{ background: B.white, padding: "24px 28px", minHeight: "100%" }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: B.gray900, marginBottom: 4 }}>Trends</h2>
        <p style={{ fontSize: 12, color: B.gray500 }}>Emerging patterns and trajectories across key topics (Last 10 Trends)</p>
      </div>

      {/* Persona Selector */}
      <div style={{ marginBottom: 24, display: "flex", gap: 8, flexWrap: "wrap" }}>
        {PERSONAS.map((p) => (
          <button
            key={p.id}
            onClick={() => setPersona(p.id)}
            style={{
              padding: "8px 14px",
              border: persona === p.id ? `2px solid ${B.purple}` : `1px solid ${B.gray200}`,
              background: persona === p.id ? B.purple : B.gray50,
              color: persona === p.id ? B.white : B.gray600,
              fontSize: 11,
              fontWeight: persona === p.id ? 700 : 500,
              cursor: "pointer",
              borderRadius: 4,
              transition: "all 0.2s",
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Error Message */}
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

      {/* Loading State */}
      {loading && (
        <div style={{
          textAlign: "center",
          padding: "40px 20px",
          fontSize: 14,
          color: B.gray500,
        }}>
          Loading trends...
        </div>
      )}

      {/* Main Content */}
      {!loading && trends && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 24 }}>
          {/* Trend Stats Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
            <div style={{
              background: B.gray50,
              border: `1px solid ${B.gray100}`,
              borderRadius: 4,
              padding: "16px 20px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}>
              <div style={{ fontSize: 11, color: B.gray500, fontWeight: 600, marginBottom: 4 }}>Latest Trend</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: B.purple, marginBottom: 4 }}>{trends.latest || 0}</div>
              <div style={{
                fontSize: 11,
                color: trends.delta.includes("+") ? B.green : B.gray500,
                fontWeight: 700,
              }}>
                {trends.delta} vs. baseline
              </div>
            </div>

            <div style={{
              background: B.purplePale,
              border: `1px solid ${B.purple}`,
              borderRadius: 4,
              padding: "16px 20px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}>
              <div style={{ fontSize: 11, color: B.purple, fontWeight: 600, marginBottom: 4 }}>Series Points</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: B.purple, marginBottom: 4 }}>{trends.series.length}</div>
              <div style={{ fontSize: 11, color: B.gray500, fontWeight: 500 }}>7-day trend window</div>
            </div>
          </div>

          {/* Trend Chart */}
          <div style={{
            background: B.white,
            border: `1px solid ${B.gray100}`,
            borderRadius: 4,
            padding: "20px 24px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: B.gray900, marginBottom: 16 }}>7-Day Trend Index</h3>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={B.gray200} />
                  <XAxis dataKey="day" stroke={B.gray400} style={{ fontSize: 11 }} />
                  <YAxis stroke={B.gray400} style={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      background: B.white,
                      border: `1px solid ${B.gray200}`,
                      borderRadius: 4,
                      fontSize: 11,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line
                    type="monotone"
                    dataKey="Trend Index"
                    stroke={B.purple}
                    dot={{ fill: B.purple, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ textAlign: "center", padding: "20px", color: B.gray500, fontSize: 12 }}>No trend data available</div>
            )}
          </div>

          {/* Top Topics */}
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: B.gray900, marginBottom: 12 }}>Top Topics (Last 10)</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
              {trends.top_topics && trends.top_topics.length > 0 ? (
                trends.top_topics.map((topic, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: B.gray50,
                      border: `1px solid ${B.gray100}`,
                      borderRadius: 4,
                      padding: "16px 20px",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: B.gray900 }}>
                        {topic.topic}
                      </div>
                      <div style={{
                        fontSize: 10,
                        color: topic.delta.includes("+") ? B.green : B.gray500,
                        fontWeight: 700,
                      }}>
                        {topic.delta}
                      </div>
                    </div>
                    <div style={{
                      fontSize: 11,
                      color: B.gray500,
                      marginBottom: 8,
                    }}>
                      Prevalence: {topic.pct}%
                    </div>
                    <div style={{
                      height: 6,
                      background: B.gray200,
                      borderRadius: 3,
                      overflow: "hidden",
                    }}>
                      <div style={{
                        width: `${Math.min(100, topic.pct)}%`,
                        height: "100%",
                        background: B.purple,
                        transition: "width 0.3s ease",
                      }} />
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ color: B.gray500, fontSize: 12 }}>No topics available</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
