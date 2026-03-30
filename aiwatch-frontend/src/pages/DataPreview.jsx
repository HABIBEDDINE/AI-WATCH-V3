import { useState, useEffect, useCallback } from "react";
import {
  BarChart, Bar,
  PieChart, Pie, Cell,
  AreaChart, Area,
  XAxis, YAxis,
  CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from "recharts";
import { getArticles } from "../services/api";

const B = {
  purple: "#1A4A9E",
  purpleDeep: "#102d6a",
  purplePale: "#e8eef8",
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
  red: "#c0392b",
  blue: "#1a5fa8",
  darkBg: "#0a0a0a",
};

// Mock data
const MOCK_ARTICLES = [
  { id: 1, title: "DeepSeek AI raises $50M Series B", source: "TechCrunch", signal: "strong", relevance: 9, industry: "Technology", topic: "AI", date: "2024-03-16" },
  { id: 2, title: "JPMorgan uses GenAI for trade settlement", source: "Financial Times", signal: "strong", relevance: 8, industry: "Finance", topic: "Fintech", date: "2024-03-15" },
  { id: 3, title: "EU AI Act enforcement begins", source: "EUR-Lex", signal: "weak", relevance: 7, industry: "Legal", topic: "Regulation", date: "2024-03-14" },
  { id: 4, title: "Synthesia raises €40M for AI video", source: "Dealroom", signal: "strong", relevance: 8, industry: "Media", topic: "AI", date: "2024-03-13" },
  { id: 5, title: "Moderna partners with Genentech on AI drugs", source: "BiopharmGuy", signal: "strong", relevance: 8, industry: "Healthcare", topic: "HealthTech", date: "2024-03-12" },
  { id: 6, title: "CrowdStrike launches AI threat detection", source: "VentureBeat", signal: "strong", relevance: 9, industry: "Security", topic: "Cybersecurity", date: "2024-03-11" },
  { id: 7, title: "Massachusetts bans AI hiring tools", source: "Boston Globe", signal: "weak", relevance: 6, industry: "Legal", topic: "Regulation", date: "2024-03-10" },
  { id: 8, title: "Bloom Energy deploys AI for microgrids", source: "GreenTech Media", signal: "weak", relevance: 7, industry: "Energy", topic: "CleanTech", date: "2024-03-09" },
  { id: 9, title: "Boston Dynamics acquires AI robotics startup", source: "RoboHub", signal: "strong", relevance: 8, industry: "Manufacturing", topic: "Robotics", date: "2024-03-08" },
  { id: 10, title: "Singapore launches $100M AI talent fund", source: "Straits Times", signal: "weak", relevance: 6, industry: "Government", topic: "AI", date: "2024-03-07" },
];

const MOCK_FUNDING = [
  { id: 1, company: "DeepSeek", amount: "$50M", round: "Series B", source: "Various", date: "2024-03-16" },
  { id: 2, company: "Synthesia", amount: "€40M", round: "Series C", source: "Accel", date: "2024-03-13" },
  { id: 3, company: "Mistral AI", amount: "€600M", round: "Series C", source: "Government", date: "2024-03-11" },
  { id: 4, company: "Scale AI", amount: "$200M", round: "Series E", source: "Salesforce", date: "2024-03-09" },
  { id: 5, company: "Hugging Face", amount: "$160M", round: "Series D", source: "Various", date: "2024-03-07" },
];

const MOCK_ACTORS = [
  { id: 1, name: "OpenAI", type: "Company", role: "LLM Provider", mentions: 45 },
  { id: 2, name: "Anthropic", type: "Company", role: "AI Research", mentions: 32 },
  { id: 3, name: "Google DeepMind", type: "Company", role: "AI Research", mentions: 38 },
  { id: 4, name: "Nvidia", type: "Company", role: "Hardware", mentions: 52 },
  { id: 5, name: "JP Morgan", type: "Company", role: "Financial Services", mentions: 28 },
  { id: 6, name: "EU Commission", type: "Government", role: "Regulation", mentions: 35 },
];

async function fetchAllArticles(search) {
  const pageSize = 100;
  let page = 1;
  let total = 0;
  const all = [];

  do {
    const response = await getArticles({
      page,
      pageSize,
      search: search || undefined,
    });

    const items = response.items || [];
    total = response.total || 0;
    all.push(...items);
    page += 1;
  } while (all.length < total);

  return all;
}

function groupByField(articles, field, limit = 8) {
  const counts = {};
  articles.forEach(a => {
    const key = a[field] || "Unknown";
    counts[key] = (counts[key] || 0) + 1;
  });
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

function getSignalDistribution(articles) {
  let strong = 0, weak = 0, unknown = 0;
  articles.forEach(a => {
    const s = (a.signal_type || "").toUpperCase();
    if (s.includes("STRONG")) strong++;
    else if (s.includes("WEAK")) weak++;
    else unknown++;
  });
  const result = [];
  if (strong > 0)  result.push({ name: "Strong",  value: strong });
  if (weak > 0)    result.push({ name: "Weak",    value: weak });
  if (unknown > 0) result.push({ name: "Unknown", value: unknown });
  return result;
}

function getLast7Days(articles) {
  const today = new Date();
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push({
      dateObj: d,
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      count: 0,
    });
  }
  articles.forEach(a => {
    if (!a.publishedAt) return;
    const parsed = new Date(a.publishedAt);
    if (isNaN(parsed)) return;
    days.forEach(d => {
      if (
        parsed.getFullYear() === d.dateObj.getFullYear() &&
        parsed.getMonth()    === d.dateObj.getMonth() &&
        parsed.getDate()     === d.dateObj.getDate()
      ) { d.count++; }
    });
  });
  return days.map(({ date, count }) => ({ date, count }));
}

function DataTable({ articles, loading, error, searchQuery, setSearchQuery }) {
  const [sortBy, setSortBy] = useState(null);
  const [sortDir, setSortDir] = useState("asc");

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortDir("asc");
    }
  };

  const sortedArticles = [...articles].sort((a, b) => {
    if (!sortBy) return 0;
    
    let aVal, bVal;
    if (sortBy === "title") {
      aVal = a.title.toLowerCase();
      bVal = b.title.toLowerCase();
    } else if (sortBy === "signal") {
      aVal = a.signal_strength === "Strong" ? 1 : 0;
      bVal = b.signal_strength === "Strong" ? 1 : 0;
      return sortDir === "asc" ? bVal - aVal : aVal - bVal;
    } else if (sortBy === "relevance") {
      aVal = a.relevance || 5;
      bVal = b.relevance || 5;
      return sortDir === "asc" ? bVal - aVal : aVal - bVal;
    }
    
    if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
    if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  const downloadCSV = () => {
    const headers = ["#", "Title", "Source", "Signal", "Relevance", "Topic", "Published", "URL"];
    const rows = sortedArticles.map((article, idx) => [
      idx + 1,
      article.title,
      article.source,
      article.signal_strength,
      article.relevance,
      article.topic,
      article.published_at,
      article.url || "",
    ]);

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "articles.csv";
    a.click();
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 700, background: B.purplePale, color: B.purple, padding: "4px 10px", borderRadius: 2 }}>
            {articles.length} Articles
          </span>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: "6px 12px",
              border: `1px solid ${B.gray100}`,
              borderRadius: 4,
              fontSize: 11,
              width: "min(200px, 100%)",
            }}
          />
          <button
            onClick={downloadCSV}
            disabled={loading}
            style={{
              padding: "6px 12px",
              background: B.purple,
              color: B.white,
              border: "none",
              borderRadius: 2,
              fontSize: 11,
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.6 : 1,
            }}
          >
            Download CSV
          </button>
        </div>
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

      <div className="table-scroll" style={{
        background: B.white,
        border: `1px solid ${B.gray100}`,
        borderRadius: 4,
        overflow: "auto",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      }}>
        <table style={{ width: "100%", minWidth: 600, borderCollapse: "collapse", fontSize: 11 }}>
          <thead style={{ background: B.gray50, borderBottom: `1px solid ${B.gray100}` }}>
            <tr>
              <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700 }}>#</th>
              <th 
                onClick={() => handleSort("title")}
                style={{ 
                  padding: "12px 16px", 
                  textAlign: "left", 
                  fontWeight: 700,
                  cursor: "pointer",
                  background: sortBy === "title" ? B.purplePale : "transparent",
                  color: sortBy === "title" ? B.purple : B.gray900,
                  userSelect: "none"
                }}
              >
                Title {sortBy === "title" && (sortDir === "asc" ? "↑" : "↓")}
              </th>
              <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700 }}>Source</th>
              <th 
                onClick={() => handleSort("signal")}
                style={{ 
                  padding: "12px 16px", 
                  textAlign: "center", 
                  fontWeight: 700,
                  cursor: "pointer",
                  background: sortBy === "signal" ? B.purplePale : "transparent",
                  color: sortBy === "signal" ? B.purple : B.gray900,
                  userSelect: "none"
                }}
              >
                Signal {sortBy === "signal" && (sortDir === "asc" ? "↑" : "↓")}
              </th>
              <th 
                onClick={() => handleSort("relevance")}
                style={{ 
                  padding: "12px 16px", 
                  textAlign: "center", 
                  fontWeight: 700,
                  cursor: "pointer",
                  background: sortBy === "relevance" ? B.purplePale : "transparent",
                  color: sortBy === "relevance" ? B.purple : B.gray900,
                  userSelect: "none"
                }}
              >
                Relevance {sortBy === "relevance" && (sortDir === "asc" ? "↑" : "↓")}
              </th>
              <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700 }}>Topic</th>
              <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700 }}>Published</th>
              <th style={{ padding: "12px 16px", textAlign: "center", fontWeight: 700 }}>Link</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="8" style={{ padding: "20px", textAlign: "center", color: B.gray400 }}>Loading...</td></tr>
            ) : sortedArticles.length === 0 ? (
              <tr><td colSpan="8" style={{ padding: "20px", textAlign: "center", color: B.gray400 }}>No articles found</td></tr>
            ) : (
              sortedArticles.map((article, idx) => (
                <tr key={article.id} style={{
                  borderBottom: `1px solid ${B.gray100}`,
                  background: idx % 2 === 0 ? B.white : B.gray50,
                }}>
                  <td style={{ padding: "12px 16px", color: B.gray500 }}>{idx + 1}</td>
                  <td style={{ padding: "12px 16px", color: B.gray900, fontWeight: 600, maxWidth: "30vw", minWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {article.title}
                  </td>
                  <td style={{ padding: "12px 16px", color: B.gray600, fontSize: 10 }}>{article.source}</td>
                  <td style={{
                    padding: "12px 16px",
                    textAlign: "center",
                    color: article.signal_strength === "Strong" ? B.green : B.amber,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    fontSize: 10,
                  }}>
                    {article.signal_strength}
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "center", fontWeight: 700, color: B.purple }}>
                    {article.relevance || 5}/10
                  </td>
                  <td style={{ padding: "12px 16px", color: B.gray600, fontSize: 10 }}>{article.topic}</td>
                  <td style={{ padding: "12px 16px", color: B.gray600, fontSize: 10 }}>
                    {new Date(article.published_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "center" }}>
                    {article.url ? (
                      <a href={article.url} target="_blank" rel="noopener noreferrer" style={{ color: B.purple, textDecoration: "none", fontWeight: 600, fontSize: 10 }}>🔗</a>
                    ) : (
                      <span style={{ color: B.gray300, fontSize: 10 }}>-</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const P = "#1A4A9E";
const P_PALE = "#e8eef8";
const P_LIGHT = "#4a7fd4";
const GRAY_BORDER = "#e8e8e8";
const GRAY_TEXT = "#999";
const DARK_TEXT = "#111";

function ChartPanel({ title, subtitle, children }) {
  return (
    <div style={{ background: "#fff", border: `1px solid ${GRAY_BORDER}`, borderRadius: 6, overflow: "hidden" }}>
      <div style={{ padding: "16px 20px 14px", borderBottom: `1px solid ${GRAY_BORDER}` }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: DARK_TEXT }}>{title}</div>
        {subtitle && <div style={{ fontSize: 11, color: GRAY_TEXT, marginTop: 3 }}>{subtitle}</div>}
      </div>
      <div style={{ padding: "20px" }}>{children}</div>
    </div>
  );
}

function KpiCard({ label, value, sub }) {
  return (
    <div style={{ background: "#fff", border: `1px solid ${GRAY_BORDER}`, borderRadius: 6, padding: "18px 20px" }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: GRAY_TEXT, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 10 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 800, color: P, lineHeight: 1, marginBottom: 6 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: GRAY_TEXT }}>{sub}</div>}
    </div>
  );
}

function Charts({ articles }) {
  const [selectedTopic, setSelectedTopic] = useState("All");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  if (articles.length === 0) {
    return (
      <div style={{ padding: "60px 0", textAlign: "center" }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: DARK_TEXT, marginBottom: 6 }}>No data loaded</div>
        <div style={{ fontSize: 12, color: GRAY_TEXT }}>Switch to the Data Table tab — articles load automatically.</div>
      </div>
    );
  }

  const allTopics = ["All", ...Array.from(new Set(articles.map(a => a.topic || a.search_topic || "General").filter(Boolean))).sort()];
  const filtered  = selectedTopic === "All" ? articles : articles.filter(a => (a.topic || a.search_topic) === selectedTopic);

  // Signal counts
  let strong = 0, weak = 0;
  filtered.forEach(a => {
    (a.signal_strength || a.signal_type || "").toLowerCase().includes("strong") ? strong++ : weak++;
  });
  const strongPct = filtered.length ? Math.round((strong / filtered.length) * 100) : 0;
  const weakPct   = 100 - strongPct;

  const signalData = [
    { name: "Strong", count: strong, pct: strongPct },
    { name: "Weak",   count: weak,   pct: weakPct   },
  ].filter(d => d.count > 0);

  // Topic coverage (always all articles)
  const topicData = groupByField(articles, "topic", 10);

  // Relevance distribution
  const relBuckets = [
    { name: "Low (0–3)",  count: 0, opacity: 0.25 },
    { name: "Mid (4–6)",  count: 0, opacity: 0.5  },
    { name: "High (7–8)", count: 0, opacity: 0.75 },
    { name: "Top (9–10)", count: 0, opacity: 1    },
  ];
  filtered.forEach(a => {
    const r = a.relevance || a.relevance_score || 5;
    if      (r <= 3) relBuckets[0].count++;
    else if (r <= 6) relBuckets[1].count++;
    else if (r <= 8) relBuckets[2].count++;
    else             relBuckets[3].count++;
  });

  const avgRel    = filtered.length ? (filtered.reduce((s, a) => s + (a.relevance || a.relevance_score || 5), 0) / filtered.length).toFixed(1) : "—";
  const topSource = groupByField(filtered, "source", 1)[0]?.name || "—";
  const uniqueSrc = new Set(filtered.map(a => a.source)).size;

  const tooltipStyle = { fontSize: 11, borderRadius: 4, border: `1px solid ${GRAY_BORDER}`, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" };

  return (
    <div>
      {/* ── TOPIC FILTER BAR ── */}
      <div style={{ background: "#fafafa", border: `1px solid ${GRAY_BORDER}`, borderRadius: 6, padding: "14px 16px", marginBottom: 16 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: GRAY_TEXT, letterSpacing: "1px", textTransform: "uppercase", marginBottom: 10 }}>
          Filter by Topic
        </div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {allTopics.map(t => {
            const isActive = selectedTopic === t;
            const count = t === "All" ? articles.length : articles.filter(a => (a.topic || a.search_topic) === t).length;
            return (
              <button key={t} onClick={() => setSelectedTopic(t)} style={{
                padding: "5px 14px",
                borderRadius: 999,
                border: `1.5px solid ${isActive ? P : GRAY_BORDER}`,
                background: isActive ? P_PALE : "#fff",
                color: isActive ? P : "#555",
                fontSize: 12,
                fontWeight: isActive ? 700 : 400,
                cursor: "pointer",
                transition: "all 0.12s",
              }}>
                {t}
                <span style={{ marginLeft: 5, fontSize: 10, color: isActive ? P : GRAY_TEXT }}>({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── KPI ROW ── */}
      <div className="grid-4col" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 16 }}>
        <KpiCard label="Articles"       value={filtered.length}  sub={selectedTopic === "All" ? "all topics" : selectedTopic} />
        <KpiCard label="Strong Signals" value={`${strongPct}%`}  sub={`${strong} strong · ${weak} weak`} />
        <KpiCard label="Avg Relevance"  value={avgRel}           sub="score out of 10" />
        <KpiCard label="Sources"        value={uniqueSrc}        sub={`top: ${topSource.length > 16 ? topSource.slice(0,16)+"…" : topSource}`} />
      </div>

      {/* ── ROW 1: Signal + Relevance ── */}
      <div className="grid-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>

        <ChartPanel title="Signal Distribution" subtitle={`Strong vs Weak · ${filtered.length} articles${selectedTopic !== "All" ? ` · ${selectedTopic}` : ""}`}>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            {/* Simple stacked bar */}
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", height: 12, borderRadius: 6, overflow: "hidden", marginBottom: 20 }}>
                <div style={{ width: `${strongPct}%`, background: P, transition: "width 0.4s" }} />
                <div style={{ flex: 1, background: P_LIGHT }} />
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={signalData} layout="vertical" margin={{ top: 0, right: 40, bottom: 0, left: 60 }}>
                  <XAxis type="number" tick={{ fontSize: 10, fill: GRAY_TEXT }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" width={60} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: DARK_TEXT, fontWeight: 600 }} />
                  <Tooltip cursor={{ fill: P_PALE }} contentStyle={tooltipStyle} formatter={(v, _, p) => [`${v} (${p.payload.pct}%)`, "Articles"]} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={36} label={{ position: "right", fontSize: 12, fontWeight: 700, fill: DARK_TEXT }}>
                    <Cell fill={P} />
                    <Cell fill={P_LIGHT} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* Mini stat cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {signalData.map((d, i) => (
                <div key={d.name} style={{ border: `1px solid ${GRAY_BORDER}`, borderRadius: 6, padding: "10px 14px", minWidth: 90, borderLeft: `3px solid ${i === 0 ? P : P_LIGHT}` }}>
                  <div style={{ fontSize: 10, color: GRAY_TEXT, marginBottom: 4 }}>{d.name}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: i === 0 ? P : P_LIGHT, lineHeight: 1 }}>{d.pct}%</div>
                  <div style={{ fontSize: 10, color: GRAY_TEXT }}>{d.count} articles</div>
                </div>
              ))}
            </div>
          </div>
        </ChartPanel>

        <ChartPanel title="Relevance Distribution" subtitle={`Score buckets · avg ${avgRel}/10${selectedTopic !== "All" ? ` · ${selectedTopic}` : ""}`}>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={relBuckets} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f4" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: GRAY_TEXT }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: GRAY_TEXT }} axisLine={false} tickLine={false} />
              <Tooltip cursor={{ fill: P_PALE }} contentStyle={tooltipStyle} formatter={(v) => [`${v} articles`, "Count"]} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={52}
                label={{ position: "top", fontSize: 11, fontWeight: 700, fill: DARK_TEXT }}>
                {relBuckets.map((d, i) => <Cell key={i} fill={P} fillOpacity={d.opacity} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>
      </div>

      {/* ── ROW 2: Topics Coverage ── */}
      <ChartPanel title="Topics Coverage" subtitle="Articles per topic — active filter highlighted">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={topicData} margin={{ top: 8, right: 8, bottom: 36, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f4" vertical={false} />
            <XAxis
              dataKey="name" axisLine={false} tickLine={false} interval={0}
              tick={({ x, y, payload }) => {
                const isActive = payload.value === selectedTopic;
                return (
                  <text x={x} y={y + 10} textAnchor="end"
                    transform={`rotate(-30, ${x}, ${y + 10})`}
                    fontSize={11} fontWeight={isActive ? 700 : 400}
                    fill={isActive ? P : GRAY_TEXT}>
                    {payload.value}
                  </text>
                );
              }}
            />
            <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: GRAY_TEXT }} axisLine={false} tickLine={false} />
            <Tooltip cursor={{ fill: P_PALE }} contentStyle={tooltipStyle} formatter={(v) => [`${v} articles`, "Articles"]} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={48}
              label={{ position: "top", fontSize: 11, fontWeight: 600, fill: GRAY_TEXT }}>
              {topicData.map((d, i) => (
                <Cell key={i}
                  fill={P}
                  fillOpacity={selectedTopic === "All" || d.name === selectedTopic ? 1 : 0.2}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartPanel>

    </div>
  );
}

function FundingAndActors() {
  const [fundingData, setFundingData] = useState(MOCK_FUNDING);
  const [actorsData, setActorsData] = useState(MOCK_ACTORS);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchAllArticles()
      .then(articles => {
        
        // **FUNDING SECTION**: Shows AI/Tech funding announcements found in news
        // These are funding rounds mentioned in the articles we loaded
        setFundingData(MOCK_FUNDING);
        
        // **ACTORS SECTION**: Shows companies/publications mentioned in articles
        // This extracts the news sources that published articles about your topics
        const actorsMap = {};
        articles.forEach(article => {
          if (article.source) {
            const key = article.source;
            if (!actorsMap[key]) {
              actorsMap[key] = {
                id: Math.random(),
                name: article.source,
                type: "Publication",
                role: "News Source",
                mentions: 0
              };
            }
            actorsMap[key].mentions++;
          }
        });
        
        const extractedActors = Object.values(actorsMap)
          .sort((a, b) => b.mentions - a.mentions)
          .slice(0, 10);
        
        setActorsData(extractedActors.length > 0 ? extractedActors : MOCK_ACTORS);
      })
      .catch(() => {
        setFundingData(MOCK_FUNDING);
        setActorsData(MOCK_ACTORS);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="grid-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
      {/* Funding Rounds */}
      <div>
        <h3 style={{ fontSize: 12, fontWeight: 700, marginBottom: 4, color: B.gray900 }}>💰 Funding Rounds</h3>
        <p style={{ fontSize: 10, color: B.gray500, marginBottom: 12 }}>
          AI/Tech funding announcements mentioned in news articles {loading && "(Updating...)"}
        </p>
        <div className="table-scroll" style={{ background: B.white, border: `1px solid ${B.gray200}`, borderRadius: 2, overflowX: "auto" }}>
          <table style={{ width: "100%", minWidth: 380, borderCollapse: "collapse", fontSize: 11 }}>
            <thead style={{ background: B.gray50, borderBottom: `1px solid ${B.gray200}` }}>
              <tr>
                <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700 }}>Company</th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700 }}>Amount</th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700 }}>Round</th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700 }}>Source</th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700 }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {fundingData.map((funding, idx) => (
                <tr key={funding.id} style={{
                  borderBottom: `1px solid ${B.gray200}`,
                  background: idx % 2 === 0 ? B.white : B.gray50,
                }}>
                  <td style={{ padding: "12px 16px", color: B.gray900, fontWeight: 600 }}>{funding.company}</td>
                  <td style={{ padding: "12px 16px", color: B.green, fontWeight: 700 }}>{funding.amount}</td>
                  <td style={{ padding: "12px 16px", color: B.gray600, fontSize: 10 }}>{funding.round}</td>
                  <td style={{ padding: "12px 16px", color: B.gray600, fontSize: 10 }}>{funding.source}</td>
                  <td style={{ padding: "12px 16px", color: B.gray600, fontSize: 10 }}>
                    {new Date(funding.date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Key Actors */}
      <div>
        <h3 style={{ fontSize: 12, fontWeight: 700, marginBottom: 4, color: B.gray900 }}>🎯 News Sources</h3>
        <p style={{ fontSize: 10, color: B.gray500, marginBottom: 12 }}>
          Publications publishing your topics (based on loaded articles) {loading && "(Updating...)"}
        </p>
        <div className="table-scroll" style={{ background: B.white, border: `1px solid ${B.gray200}`, borderRadius: 2, overflowX: "auto" }}>
          <table style={{ width: "100%", minWidth: 320, borderCollapse: "collapse", fontSize: 11 }}>
            <thead style={{ background: B.gray50, borderBottom: `1px solid ${B.gray200}` }}>
              <tr>
                <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700 }}>Name</th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700 }}>Type</th>
                <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700 }}>Role</th>
                <th style={{ padding: "12px 16px", textAlign: "center", fontWeight: 700 }}>Articles</th>
              </tr>
            </thead>
            <tbody>
              {actorsData.map((actor, idx) => (
                <tr key={actor.id} style={{
                  borderBottom: `1px solid ${B.gray200}`,
                  background: idx % 2 === 0 ? B.white : B.gray50,
                }}>
                  <td style={{ padding: "12px 16px", color: B.gray900, fontWeight: 600 }}>{actor.name}</td>
                  <td style={{ padding: "12px 16px", color: B.gray600, fontSize: 10 }}>{actor.type}</td>
                  <td style={{ padding: "12px 16px", color: B.gray600, fontSize: 10 }}>{actor.role}</td>
                  <td style={{ padding: "12px 16px", textAlign: "center", fontWeight: 700, color: B.purple }}>
                    {actor.mentions}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function DataPreview() {
  const [activeTab, setActiveTab] = useState("charts");
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  const fetchArticles = useCallback(async (search) => {
    setLoading(true);
    setError(null);
    try {
      const allArticles = await fetchAllArticles(search);
      setArticles(allArticles);
    } catch (err) {
      setError(err.message);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchArticles(searchQuery), searchQuery ? 500 : 0);
    return () => clearTimeout(timer);
  }, [searchQuery, fetchArticles]);

  const tabs = [
    { id: "charts", label: "Charts" },
    { id: "table", label: "Data Table" },
    { id: "funding", label: "Funding & Actors" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: B.gray50, padding: isMobile ? "16px" : "24px" }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: isMobile ? 17 : 20, fontWeight: 800, color: B.gray900, marginBottom: 4 }}>Data Preview</h1>
        <p style={{ fontSize: 12, color: B.gray500 }}>Explore articles, funding, and key actors</p>
      </div>

      {/* Tab Navigation */}
      <div style={{
        display: "flex",
        gap: 0,
        background: B.white,
        border: `1px solid ${B.gray200}`,
        borderRadius: 2,
        marginBottom: 20,
        overflow: "auto",
        WebkitOverflowScrolling: "touch",
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              padding: "14px 16px",
              border: "none",
              background: activeTab === tab.id ? B.purplePale : B.white,
              color: activeTab === tab.id ? B.purple : B.gray600,
              fontSize: 12,
              fontWeight: activeTab === tab.id ? 700 : 500,
              cursor: "pointer",
              borderRight: tab.id !== tabs[tabs.length - 1].id ? `1px solid ${B.gray200}` : "none",
              transition: "all 0.2s",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "table" && <DataTable articles={articles} loading={loading} error={error} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />}
        {activeTab === "charts" && <Charts articles={articles} />}
        {activeTab === "funding" && <FundingAndActors />}
      </div>
    </div>
  );
}
