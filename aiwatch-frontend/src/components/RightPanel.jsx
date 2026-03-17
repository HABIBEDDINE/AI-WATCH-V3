import { useState, useEffect } from "react";
import { getLiveSignals, getTopSectors } from "../services/api";

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
  blue: "#1a5fa8",
  darkBg: "#0a0a0a",
};

export default function RightPanel() {
  const [liveSignals, setLiveSignals] = useState([
    { label: "Agentic AI mentions", value: "+3", color: B.purple },
    { label: "Patent filings", value: "+1", color: "#b45309" },
    { label: "Funding rounds", value: "+2", color: B.blue },
    { label: "Regulatory updates", value: "+1", color: "#c0392b" },
  ]);

  const [sectors, setSectors] = useState([
    { name: "All Industries", pct: 82 },
    { name: "Deep Tech / AI", pct: 65 },
    { name: "Policy & Reg.", pct: 41 },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [signalsResponse, sectorsResponse] = await Promise.all([
        getLiveSignals().catch(() => ({ signals: [] })),
        getTopSectors().catch(() => ({ sectors: [] })),
      ]);

      // Process signals
      if (signalsResponse && signalsResponse.signals) {
        const processedSignals = signalsResponse.signals.map(sig => ({
          label: sig.name || "Unknown signal",
          value: `+${sig.count || 0}`,
          color: B.purple,
        }));
        if (processedSignals.length > 0) setLiveSignals(processedSignals);
      }

      // Process sectors
      if (sectorsResponse && sectorsResponse.sectors) {
        const processedSectors = sectorsResponse.sectors.map(sec => ({
          name: sec.name || "Unknown",
          pct: Math.min(100, Math.max(0, Math.round((sec.count || 0) / 10 * 100))),
        }));
        if (processedSectors.length > 0) setSectors(processedSectors);
      }

      setLastUpdate(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, []);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchData();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const getUpdateTimeDisplay = () => {
    if (!lastUpdate) return "Never";
    const seconds = Math.floor((new Date() - lastUpdate) / 1000);
    if (seconds < 60) return "Just now";
    if (seconds < 120) return "1m ago";
    return `${Math.floor(seconds / 60)}m ago`;
  };

  return (
    <div
      style={{
        width: 220,
        background: B.white,
        borderLeft: `1px solid ${B.gray200}`,
        padding: "20px 0",
        overflowY: "auto",
        flexShrink: 0,
      }}
    >
      {/* SECTION 1 — Live Signals */}
      <div style={{ padding: "0 16px 16px", borderBottom: `1px solid ${B.gray200}`, marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: B.gray400, letterSpacing: 1.5, textTransform: "uppercase" }}>
            Live Signals
          </div>
          <div style={{ fontSize: 8, color: B.gray400, fontStyle: "italic" }}>
            {loading ? "..." : getUpdateTimeDisplay()}
          </div>
        </div>
        {liveSignals.map((signal, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "7px 10px",
              background: B.gray50,
              border: `1px solid ${B.gray200}`,
              marginBottom: 5,
              borderRadius: 2,
              animation: loading ? "pulse 1s infinite" : "none",
            }}
          >
            <span style={{ fontSize: 10, color: B.gray500, lineHeight: 1.4 }}>
              {signal.label}
            </span>
            <span style={{ fontSize: 12, color: signal.color, fontWeight: 800 }}>
              {signal.value}
            </span>
          </div>
        ))}
      </div>

      {/* SECTION 2 — Top Sectors */}
      <div style={{ padding: "0 16px 16px", borderBottom: `1px solid ${B.gray200}`, marginBottom: 16 }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: B.gray400, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 10 }}>
          Top Sectors
        </div>
        {sectors.map((sector, i) => (
          <div key={i} style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 10, color: B.gray600, lineHeight: 1.4 }}>
                {sector.name}
              </span>
              <span style={{ fontSize: 10, color: B.purple, fontWeight: 700 }}>
                {sector.pct}%
              </span>
            </div>
            <div style={{ height: 3, background: B.gray200, borderRadius: 1 }}>
              <div
                style={{
                  width: `${sector.pct}%`,
                  height: "100%",
                  background: B.purple,
                  borderRadius: 1,
                  transition: "width 0.6s ease",
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* SECTION 3 — Talk to DXC */}
      <div style={{ padding: "0 16px" }}>
        <div
          style={{
            background: B.darkBg,
            padding: 14,
            borderLeft: `4px solid ${B.purple}`,
            borderRadius: 2,
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, color: B.white, marginBottom: 4 }}>
            Talk to DXC
          </div>
          <div style={{ fontSize: 10, color: B.gray400, marginBottom: 12, lineHeight: 1.5 }}>
            Free 30-min AI strategy session
          </div>
          <button
            style={{
              width: "100%",
              padding: "8px 0",
              background: B.purple,
              color: B.white,
              border: `2px solid ${B.purple}`,
              borderRadius: 0,
              fontSize: 10,
              fontWeight: 700,
              cursor: "pointer",
              letterSpacing: 0.5,
              transition: "all 0.2s",
            }}
            onMouseEnter={e => {
              e.target.style.background = B.purpleDeep;
              e.target.style.borderColor = B.purpleDeep;
            }}
            onMouseLeave={e => {
              e.target.style.background = B.purple;
              e.target.style.borderColor = B.purple;
            }}
          >
            Contact Us →
          </button>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.6; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
