import { useState, useEffect } from "react";
import { getJourney } from "../services/api";

export default function Journey() {
  const B = {
    purple: "#6B2C94",
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

  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJourney = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getJourney("cto", 6);
        setSteps(data.steps || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchJourney();
  }, []);

  if (loading) {
    return (
      <div style={{ background: B.white, padding: "24px 28px", minHeight: "100%" }}>
        <div style={{ textAlign: "center", padding: "40px", color: B.gray500 }}>Loading journey...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ background: B.white, padding: "24px 28px", minHeight: "100%" }}>
        <div style={{ textAlign: "center", padding: "40px", color: B.amber }}>Error: {error}</div>
      </div>
    );
  }

  return (
    <div style={{ background: B.white, padding: "24px 28px", minHeight: "100vh" }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: B.gray900, marginBottom: 8 }}>Your AI Discovery Journey</h1>
        <p style={{ fontSize: 12, color: B.gray500 }}>Track your progress through key milestones and next steps</p>
      </div>

      {/* Timeline */}
      <div style={{ maxWidth: 800 }}>
        {steps.map((step, index) => (
          <div key={index} style={{ display: "flex", gap: 24, marginBottom: 28, position: "relative" }}>
            {/* Timeline connector */}
            {index < steps.length - 1 && (
              <div style={{
                position: "absolute",
                left: 15,
                top: 40,
                bottom: -42,
                width: 2,
                background: step.done ? B.purple : B.gray200,
              }} />
            )}

            {/* Step circle and content */}
            <div style={{ display: "flex", gap: 20, flex: 1, position: "relative", zIndex: 1 }}>
              {/* Circle indicator */}
              <div style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                background: step.done ? B.purple : B.gray200,
                border: `2px solid ${step.done ? B.purple : B.gray300}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                color: B.white,
                fontSize: 16,
                fontWeight: 700,
              }}>
                {step.done ? "✓" : index + 1}
              </div>

              {/* Content */}
              <div style={{ paddingTop: 4, flex: 1 }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 8 }}>
                  <div>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: B.gray900, margin: 0 }}>
                      {step.title}
                    </h3>
                  </div>
                  <span style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: step.done ? B.green : B.amber,
                    background: step.done ? B.greenLight : "#fef3e2",
                    padding: "4px 10px",
                    borderRadius: 12,
                    whiteSpace: "nowrap",
                  }}>
                    {step.time}
                  </span>
                </div>
                <p style={{
                  fontSize: 12,
                  color: B.gray600,
                  margin: 0,
                  lineHeight: 1.5,
                }}>
                  {step.desc}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div style={{ marginTop: 40, paddingTop: 24, borderTop: `1px solid ${B.gray100}` }}>
        <div style={{ display: "flex", gap: 12 }}>
          <button style={{
            padding: "10px 20px",
            background: B.purple,
            color: B.white,
            border: "none",
            borderRadius: 4,
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => e.target.style.background = "#4a1870"}
          onMouseLeave={(e) => e.target.style.background = B.purple}
          >
            Schedule Discovery Call
          </button>
          <button style={{
            padding: "10px 20px",
            background: B.purplePale,
            color: B.purple,
            border: `1px solid ${B.purple}`,
            borderRadius: 4,
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.target.style.background = B.purple;
            e.target.style.color = B.white;
          }}
          onMouseLeave={(e) => {
            e.target.style.background = B.purplePale;
            e.target.style.color = B.purple;
          }}
          >
            View Report
          </button>
        </div>
      </div>
    </div>
  );
}
