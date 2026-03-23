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
    title: "Assessment Advisor",
    description: "Comprehensive evaluation of data & AI landscape with strategy, prioritization & alignment to standards",
    fit: "High",
    fitColor: B.amber,
    fitBg: B.amberLight,
    score: 94,
    timeline: "2-3 weeks",
    tag: "MVP",
    tagColor: B.amber,
    ipmStage: "Delivery",
  },
  {
    id: 2,
    title: "Data Health",
    description: "End-to-end platform for data quality with automated validation, monitoring & compliance",
    fit: "High",
    fitColor: B.amber,
    fitBg: B.amberLight,
    score: 92,
    timeline: "3-4 weeks",
    tag: "MVP",
    tagColor: B.amber,
    ipmStage: "Delivery",
  },
  {
    id: 3,
    title: "Intelligent Analytics",
    description: "Transform raw data into actionable insights using ML, NLP & advanced statistical models",
    fit: "High",
    fitColor: B.amber,
    fitBg: B.amberLight,
    score: 90,
    timeline: "4-6 weeks",
    tag: "MVP",
    tagColor: B.amber,
    ipmStage: "Delivery",
  },
  {
    id: 4,
    title: "ROI Simulator",
    description: "Measure & communicate business value of data & AI investments with financial models",
    fit: "High",
    fitColor: B.amber,
    fitBg: B.amberLight,
    score: 88,
    timeline: "2-3 weeks",
    tag: "MVP",
    tagColor: B.amber,
    ipmStage: "Delivery",
  },
  {
    id: 5,
    title: "AI Use Case Radar",
    description: "Cross-industry intelligence tool that scans & prioritizes emerging AI trends and use cases",
    fit: "Strategic",
    fitColor: B.blue,
    fitBg: B.blueLight,
    score: 82,
    timeline: "3-4 weeks",
    tag: "MVP",
    tagColor: B.blue,
    ipmStage: "Sourcing",
  },
  {
    id: 6,
    title: "Marketing Agents",
    description: "AI agents orchestration that automates marketing tasks like segmentation & personalized content",
    fit: "Strategic",
    fitColor: B.blue,
    fitBg: B.blueLight,
    score: 85,
    timeline: "6-8 weeks",
    tag: "MVP",
    tagColor: B.blue,
    ipmStage: "Delivery",
  },
  {
    id: 7,
    title: "Incidents Management",
    description: "Detect, manage & resolve technical incidents with AI anomaly detection & root cause analysis",
    fit: "Strategic",
    fitColor: B.blue,
    fitBg: B.blueLight,
    score: 87,
    timeline: "4-6 weeks",
    tag: "MVP",
    tagColor: B.blue,
    ipmStage: "Delivery",
  },
  {
    id: 8,
    title: "AI Workbench",
    description: "Modular architecture to build, manage & scale agent-based AI systems powered by LLMs",
    fit: "Strategic",
    fitColor: B.blue,
    fitBg: B.blueLight,
    score: 80,
    timeline: "8-12 weeks",
    tag: "Pilot",
    tagColor: B.blue,
    ipmStage: "Sourcing",
  },
  {
    id: 9,
    title: "Sandbox AI",
    description: "Controlled environment to test AI models safely with limited access & risk analysis",
    fit: "Strategic",
    fitColor: B.blue,
    fitBg: B.blueLight,
    score: 84,
    timeline: "2-3 weeks",
    tag: "MVP",
    tagColor: B.blue,
    ipmStage: "Qualification",
  },
  {
    id: 10,
    title: "AI Watch",
    description: "Strategic intelligence platform analyzing tech trends, startups & innovations for insights",
    fit: "Strategic",
    fitColor: B.blue,
    fitBg: B.blueLight,
    score: 86,
    timeline: "4-6 weeks",
    tag: "MVP",
    tagColor: B.blue,
    ipmStage: "Sourcing",
  },
  {
    id: 11,
    title: "AO Handler",
    description: "Intelligent solution discovering tenders, evaluating eligibility & auto-generating proposals",
    fit: "High",
    fitColor: B.amber,
    fitBg: B.amberLight,
    score: 79,
    timeline: "6-8 weeks",
    tag: "Prototype",
    tagColor: B.amber,
    ipmStage: "Delivery",
  },
  {
    id: 12,
    title: "StartUp Connect AI",
    description: "AI-powered engine that discovers startups & matches them to business needs",
    fit: "Emerging",
    fitColor: B.purple,
    fitBg: B.purplePale,
    score: 78,
    timeline: "4-6 weeks",
    tag: "MVP",
    tagColor: B.purple,
    ipmStage: "Sourcing",
  },
  {
    id: 13,
    title: "POC Workflow Tool",
    description: "AI platform that structures & manages the innovation cycle from needs to POC decisions",
    fit: "Emerging",
    fitColor: B.purple,
    fitBg: B.purplePale,
    score: 77,
    timeline: "4-6 weeks",
    tag: "MVP",
    tagColor: B.purple,
    ipmStage: "Sourcing",
  },
  {
    id: 14,
    title: "HR Assistant",
    description: "Conversational AI assistant that manages inquiries, integrates with ERP/CRM systems",
    fit: "Strategic",
    fitColor: B.blue,
    fitBg: B.blueLight,
    score: 72,
    timeline: "6-8 weeks",
    tag: "Pilot",
    tagColor: B.blue,
    ipmStage: "Sourcing",
  },
  {
    id: 15,
    title: "AI Implementation Framework",
    description: "Scalable, responsible & business-aligned approach to developing & deploying AI/ML solutions",
    fit: "Strategic",
    fitColor: B.blue,
    fitBg: B.blueLight,
    score: 81,
    timeline: "8-12 weeks",
    tag: "MVP",
    tagColor: B.blue,
    ipmStage: "Sourcing",
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: B.gray900, marginBottom: 4 }}>
            {solution.title}
          </h3>
          <span style={{ fontSize: 10, fontWeight: 600, color: B.blue, letterSpacing: 0.5, textTransform: "uppercase" }}>
            📋 {solution.ipmStage}
          </span>
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
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

      {/* More Information Button */}
      <button
        style={{
          width: "100%",
          padding: "10px 12px",
          background: B.gray50,
          border: `1px solid ${B.gray200}`,
          borderRadius: 2,
          fontSize: 12,
          fontWeight: 600,
          color: B.purple,
          cursor: "pointer",
          transition: "all 0.2s",
        }}
        onMouseEnter={e => {
          e.target.style.background = B.purple;
          e.target.style.color = B.white;
        }}
        onMouseLeave={e => {
          e.target.style.background = B.gray50;
          e.target.style.color = B.purple;
        }}
      >
        Learn More →
      </button>
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
