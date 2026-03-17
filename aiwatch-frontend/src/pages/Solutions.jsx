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
  red: "#c0392b",
  redLight: "#fdf0ef",
  amber: "#b45309",
  amberLight: "#fef3e2",
  blue: "#1a5fa8",
  blueLight: "#e8f0fb",
  darkBg: "#0a0a0a",
};

const SOLUTIONS = [
  {
    id: 1,
    title: "AI Readiness Assessment",
    description: "Full AI maturity evaluation across data, infra & governance",
    fit: "Critical",
    fitColor: B.red,
    fitBg: B.redLight,
    score: 96,
    timeline: "1-3 weeks",
    tag: "Quick Start",
    tagColor: B.red,
  },
  {
    id: 2,
    title: "Agentic AI Accelerator",
    description: "Deploy autonomous workflows for supply chain operations",
    fit: "High",
    fitColor: B.amber,
    fitBg: B.amberLight,
    score: 90,
    timeline: "1-2 months",
    tag: "Competitive Edge",
    tagColor: B.amber,
  },
  {
    id: 3,
    title: "AI Use Case Radar",
    description: "Continuous sector-specific AI trend scanning & alerting",
    fit: "Strategic",
    fitColor: B.blue,
    fitBg: B.blueLight,
    score: 78,
    timeline: "2-3 weeks",
    tag: "Ongoing",
    tagColor: B.blue,
  },
];

function SolutionCard({ solution }) {
  return (
    <div
      style={{
        background: B.white,
        border: `1px solid ${B.gray100}`,
        borderRadius: 4,
        padding: "24px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: B.gray900, marginBottom: 4 }}>
            {solution.title}
          </h3>
        </div>
        <span
          style={{
            fontSize: 10,
            fontWeight: 800,
            color: solution.fitColor,
            background: solution.fitBg,
            border: `1px solid ${solution.fitColor}30`,
            padding: "3px 9px",
            borderRadius: 2,
            letterSpacing: 0.8,
            textTransform: "uppercase",
            whiteSpace: "nowrap",
            marginLeft: 12,
          }}
        >
          {solution.fit}
        </span>
      </div>

      {/* Description */}
      <p style={{ fontSize: 13, color: B.gray500, marginBottom: 16, lineHeight: 1.6 }}>
        {solution.description}
      </p>

      {/* Score Bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <div style={{ flex: 1, height: 4, background: B.gray200, borderRadius: 2, overflow: "hidden" }}>
          <div
            style={{
              width: `${solution.score}%`,
              height: "100%",
              background: B.purple,
              borderRadius: 2,
              transition: "width 0.6s ease",
            }}
          />
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, color: B.purple, minWidth: 34 }}>
          {solution.score}%
        </span>
      </div>

      {/* Footer */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 11, color: B.gray400, fontWeight: 600 }}>
          ⏱ {solution.timeline}
        </span>
        <span
          style={{
            fontSize: 10,
            fontWeight: 800,
            color: solution.tagColor,
            letterSpacing: 0.8,
            textTransform: "uppercase",
          }}
        >
          {solution.tag}
        </span>
      </div>
    </div>
  );
}

export default function Solutions() {
  return (
    <div style={{ minHeight: "100vh", background: B.white, padding: "24px" }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: B.gray900, marginBottom: 8 }}>
          DXC Solutions — Recommended for You
        </h1>
        <p style={{ fontSize: 13, color: B.gray500 }}>
          Matched to your sector signals and activity
        </p>
      </div>

      {/* Solutions Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 20,
          marginBottom: 32,
        }}
      >
        {SOLUTIONS.map(solution => (
          <SolutionCard key={solution.id} solution={solution} />
        ))}
      </div>

      {/* Bottom Banner */}
      <div
        style={{
          background: B.darkBg,
          border: `1px solid ${B.gray700}`,
          borderLeft: `4px solid ${B.purple}`,
          padding: "32px",
          borderRadius: 2,
        }}
      >
        <h2 style={{ fontSize: 18, fontWeight: 700, color: B.white, marginBottom: 12 }}>
          Ready to act on these signals?
        </h2>
        <p style={{ fontSize: 13, color: B.gray400, marginBottom: 24, lineHeight: 1.6 }}>
          Our DXC Data & AI team offers a tailored 30-min discovery session for your organization.
        </p>
        <div style={{ display: "flex", gap: 12 }}>
          <button
            style={{
              background: B.purple,
              color: B.white,
              border: `2px solid ${B.purple}`,
              borderRadius: 0,
              padding: "12px 28px",
              fontSize: 12,
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
            Book Discovery Call →
          </button>
          <button
            style={{
              background: "transparent",
              color: B.white,
              border: `2px solid ${B.white}`,
              borderRadius: 0,
              padding: "12px 28px",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              letterSpacing: 0.5,
              transition: "all 0.2s",
            }}
            onMouseEnter={e => {
              e.target.style.background = B.white;
              e.target.style.color = B.darkBg;
            }}
            onMouseLeave={e => {
              e.target.style.background = "transparent";
              e.target.style.color = B.white;
            }}
          >
            Download Sector Brief
          </button>
        </div>
      </div>
    </div>
  );
}
