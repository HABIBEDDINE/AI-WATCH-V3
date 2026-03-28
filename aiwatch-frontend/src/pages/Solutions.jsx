import { useState, useEffect } from "react";

const ACCENT    = "#1A4A9E";
const ACCENT_BG = "#e8eef8";

const B = {
  white:   "#ffffff",
  gray50:  "#fafafa",
  gray100: "#f4f4f4",
  gray200: "#e8e8e8",
  gray300: "#d0d0d0",
  gray400: "#999999",
  gray500: "#666666",
  gray600: "#444444",
  gray700: "#222222",
  gray900: "#111111",
  green:   "#1a8a4a",
};

const FIT_META = {
  High:      { dot: B.green,  label: "High Fit"  },
  Strategic: { dot: ACCENT,   label: "Strategic"  },
  Emerging:  { dot: B.gray400, label: "Emerging" },
};

const SOLUTIONS = [
  { id: 1,  title: "Assessment Advisor",         description: "Comprehensive evaluation of data & AI landscape with strategy, prioritization & alignment to standards.",              fit: "High",      score: 94, timeline: "2–3 weeks",  stage: "Delivery",      tag: "MVP"       },
  { id: 2,  title: "Data Health",                description: "End-to-end platform for data quality with automated validation, monitoring & compliance reporting.",                   fit: "High",      score: 92, timeline: "3–4 weeks",  stage: "Delivery",      tag: "MVP"       },
  { id: 3,  title: "Intelligent Analytics",      description: "Transform raw data into actionable insights using ML, NLP & advanced statistical models.",                            fit: "High",      score: 90, timeline: "4–6 weeks",  stage: "Delivery",      tag: "MVP"       },
  { id: 4,  title: "ROI Simulator",              description: "Measure & communicate business value of data & AI investments with proven financial models.",                         fit: "High",      score: 88, timeline: "2–3 weeks",  stage: "Delivery",      tag: "MVP"       },
  { id: 6,  title: "Marketing Agents",           description: "AI agents orchestration that automates marketing tasks like segmentation & personalized content generation.",         fit: "Strategic", score: 85, timeline: "6–8 weeks",  stage: "Delivery",      tag: "MVP"       },
  { id: 7,  title: "Incidents Management",       description: "Detect, manage & resolve technical incidents with AI anomaly detection & root cause analysis.",                       fit: "Strategic", score: 87, timeline: "4–6 weeks",  stage: "Delivery",      tag: "MVP"       },
  { id: 10, title: "AI Watch",                   description: "Strategic intelligence platform analyzing tech trends, startups & innovations for actionable insights.",              fit: "Strategic", score: 86, timeline: "4–6 weeks",  stage: "Sourcing",      tag: "MVP"       },
  { id: 5,  title: "AI Use Case Radar",          description: "Cross-industry intelligence tool that scans & prioritizes emerging AI trends and use cases.",                        fit: "Strategic", score: 82, timeline: "3–4 weeks",  stage: "Sourcing",      tag: "MVP"       },
  { id: 15, title: "AI Implementation Framework",description: "Scalable, responsible & business-aligned approach to developing & deploying AI/ML solutions.",                       fit: "Strategic", score: 81, timeline: "8–12 weeks", stage: "Sourcing",      tag: "MVP"       },
  { id: 8,  title: "AI Workbench",               description: "Modular architecture to build, manage & scale agent-based AI systems powered by LLMs.",                             fit: "Strategic", score: 80, timeline: "8–12 weeks", stage: "Sourcing",      tag: "Pilot"     },
  { id: 11, title: "AO Handler",                 description: "Intelligent solution discovering tenders, evaluating eligibility & auto-generating winning proposals.",              fit: "High",      score: 79, timeline: "6–8 weeks",  stage: "Delivery",      tag: "Prototype" },
  { id: 9,  title: "Sandbox AI",                 description: "Controlled environment to test AI models safely with limited access, risk analysis & audit trails.",                 fit: "Strategic", score: 84, timeline: "2–3 weeks",  stage: "Qualification", tag: "MVP"       },
  { id: 12, title: "StartUp Connect AI",         description: "AI-powered engine that discovers startups & matches them to business needs with fit scoring.",                       fit: "Emerging",  score: 78, timeline: "4–6 weeks",  stage: "Sourcing",      tag: "MVP"       },
  { id: 13, title: "POC Workflow Tool",          description: "AI platform that structures & manages the innovation cycle from needs identification to POC decisions.",             fit: "Emerging",  score: 77, timeline: "4–6 weeks",  stage: "Sourcing",      tag: "MVP"       },
  { id: 14, title: "HR Assistant",               description: "Conversational AI assistant that manages HR inquiries & integrates seamlessly with ERP/CRM systems.",               fit: "Strategic", score: 72, timeline: "6–8 weeks",  stage: "Sourcing",      tag: "Pilot"     },
];

const FILTERS = ["All", "High", "Strategic", "Emerging"];

function SolutionCard({ solution, rank }) {
  const [hovered, setHovered] = useState(false);
  const fit = FIT_META[solution.fit] || FIT_META.Emerging;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: B.white,
        border: `1px solid ${hovered ? ACCENT : B.gray200}`,
        borderRadius: 10,
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: 0,
        transition: "border-color 0.2s, box-shadow 0.2s",
        boxShadow: hovered ? "0 6px 24px rgba(108,71,255,0.1)" : "0 1px 4px rgba(0,0,0,0.05)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Top accent line on hover */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 3,
        background: hovered ? ACCENT : "transparent",
        transition: "background 0.2s",
        borderRadius: "10px 10px 0 0",
      }} />

      {/* Row 1: rank + fit badge */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: B.gray300, letterSpacing: 0.5 }}>
          #{String(rank).padStart(2, "0")}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 7, height: 7, borderRadius: "50%", background: fit.dot, display: "inline-block", flexShrink: 0 }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: fit.dot, letterSpacing: 0.3 }}>
            {fit.label}
          </span>
        </div>
      </div>

      {/* Title */}
      <h3 style={{ fontSize: 17, fontWeight: 800, color: B.gray900, marginBottom: 8, lineHeight: 1.3, letterSpacing: -0.2 }}>
        {solution.title}
      </h3>

      {/* Description */}
      <p style={{ fontSize: 13, color: B.gray500, lineHeight: 1.65, marginBottom: 20, flex: 1 }}>
        {solution.description}
      </p>

      {/* Metadata */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
        <span style={{ fontSize: 11, color: B.gray500, background: B.gray100, padding: "3px 10px", borderRadius: 999 }}>
          {solution.timeline}
        </span>
        <span style={{ fontSize: 11, color: B.gray500, background: B.gray100, padding: "3px 10px", borderRadius: 999 }}>
          {solution.stage}
        </span>
        <span style={{ fontSize: 11, color: ACCENT, background: ACCENT_BG, padding: "3px 10px", borderRadius: 999, fontWeight: 600 }}>
          {solution.tag}
        </span>
      </div>

      {/* CTA */}
      <button
        style={{
          width: "100%",
          padding: "11px",
          background: hovered ? ACCENT : "transparent",
          border: `1.5px solid ${hovered ? ACCENT : B.gray200}`,
          borderRadius: 6,
          fontSize: 13,
          fontWeight: 700,
          color: hovered ? B.white : B.gray600,
          cursor: "pointer",
          transition: "all 0.2s",
          letterSpacing: 0.2,
        }}
      >
        Learn More
      </button>
    </div>
  );
}

export default function Solutions() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  const filtered = activeFilter === "All"
    ? SOLUTIONS
    : SOLUTIONS.filter(s => s.fit === activeFilter);

  const counts = FILTERS.reduce((acc, f) => {
    acc[f] = f === "All" ? SOLUTIONS.length : SOLUTIONS.filter(s => s.fit === f).length;
    return acc;
  }, {});

  return (
    <div style={{ background: B.white, padding: isMobile ? "16px 16px 40px" : "28px 28px 48px", minHeight: "100%" }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: B.gray900, letterSpacing: -0.3, marginBottom: 6 }}>
          Solutions
        </h1>
        <p style={{ fontSize: 13, color: B.gray500 }}>
          {SOLUTIONS.length} DXC solutions matched to your sector signals and activity.
        </p>
      </div>

      {/* ── Filter bar ── */}
      <div style={{ display: "flex", gap: 6, marginBottom: 28, flexWrap: "wrap" }}>
        {FILTERS.map(f => {
          const active = activeFilter === f;
          return (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              style={{
                padding: "7px 16px",
                border: active ? `1.5px solid ${ACCENT}` : `1px solid ${B.gray200}`,
                borderRadius: 999,
                background: active ? ACCENT_BG : "transparent",
                color: active ? ACCENT : B.gray600,
                fontSize: 12,
                fontWeight: active ? 700 : 500,
                cursor: "pointer",
                transition: "all 0.15s",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {f}
              <span style={{
                fontSize: 11,
                fontWeight: 700,
                color: active ? ACCENT : B.gray400,
                background: active ? `${ACCENT}18` : B.gray100,
                padding: "1px 7px",
                borderRadius: 999,
              }}>
                {counts[f]}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Solutions grid ── */}
      <div className="solutions-grid" style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: 18,
        marginBottom: 40,
      }}>
        {filtered.map((solution, idx) => (
          <SolutionCard key={solution.id} solution={solution} rank={idx + 1} />
        ))}
      </div>

      {/* ── CTA section ── */}
      <div className="cta-section" style={{
        border: `1px solid ${B.gray200}`,
        borderRadius: 10,
        padding: "32px 36px",
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 20,
        background: B.gray50,
      }}>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: B.gray900, marginBottom: 6 }}>
            Ready to act on these signals?
          </h2>
          <p style={{ fontSize: 13, color: B.gray500, lineHeight: 1.6, maxWidth: 480 }}>
            Our DXC Data & AI team offers a tailored 30-minute discovery session to align the right solutions with your priorities.
          </p>
        </div>
        <div className="cta-buttons" style={{ display: "flex", flexDirection: "row", gap: 10 }}>
          <button
            onMouseEnter={e => { e.currentTarget.style.background = "#5535e0"; }}
            onMouseLeave={e => { e.currentTarget.style.background = ACCENT; }}
            style={{
              padding: "11px 24px",
              background: ACCENT,
              color: B.white,
              border: "none",
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              transition: "background 0.15s",
              whiteSpace: "nowrap",
            }}
          >
            Book Discovery Call
          </button>
          <button
            onMouseEnter={e => { e.currentTarget.style.background = B.gray200; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
            style={{
              padding: "11px 24px",
              background: "transparent",
              color: B.gray700,
              border: `1.5px solid ${B.gray300}`,
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              transition: "background 0.15s",
              whiteSpace: "nowrap",
            }}
          >
            Download Sector Brief
          </button>
        </div>
      </div>
    </div>
  );
}
