import { useState, useEffect } from "react";

const B = {
  purple:      "#6B2C94",
  purpleDeep:  "#4a1870",
  purpleLight: "#8B3DB5",
  purplePale:  "#f5eefb",
  purpleMid:   "#ede0f7",
  white:       "#ffffff",
  gray50:      "#fafafa",
  gray100:     "#f4f4f4",
  gray200:     "#e8e8e8",
  gray300:     "#d0d0d0",
  gray400:     "#999999",
  gray500:     "#666666",
  gray600:     "#444444",
  gray700:     "#222222",
  gray900:     "#111111",
  green:       "#1a8a4a",
  greenLight:  "#e8f5ee",
  red:         "#c0392b",
  redLight:    "#fdf0ef",
  amber:       "#b45309",
  amberLight:  "#fef3e2",
  blue:        "#1a5fa8",
  blueLight:   "#e8f0fb",
  darkBg:      "#0a0a0a",
};

// ─── Solution catalog ────────────────────────────────────────────────────────

const SOLUTIONS = [
  {
    id: 1, title: "Assessment Advisor",
    description: "Comprehensive evaluation of your data & AI landscape with strategy, prioritization & alignment to standards.",
    tags: ["strategy", "assessment", "ai-readiness", "planning"],
    industries: ["all"],
    challenges: ["ai-adoption", "digital-transformation", "planning"],
    goals: ["competitive-advantage", "efficiency"],
    timelineFit: ["1-month", "3-months"],
    readiness: ["exploring", "planning"],
    baseScore: 88,
    roiRange: { low: 200, high: 600, unit: "K" },
    outcomes: [
      { metric: "AI strategy clarity", value: "100%", timeframe: "3 weeks" },
      { metric: "Initiative prioritization", value: "+60%", timeframe: "1 month" },
      { metric: "Stakeholder alignment", value: "+45%", timeframe: "1 month" },
    ],
    phases: [
      { n: 1, title: "Discovery & Audit", duration: "1 week", desc: "Map current data assets, AI capabilities, and governance maturity across your organization." },
      { n: 2, title: "Gap Analysis & Roadmap", duration: "1 week", desc: "Identify strategic gaps, benchmark against industry peers, and define prioritized AI initiatives." },
      { n: 3, title: "Roadmap Delivery", duration: "1 week", desc: "Present a board-ready roadmap with KPIs, budget estimates, and quick-win opportunities." },
    ],
  },
  {
    id: 2, title: "Data Health",
    description: "End-to-end platform for data quality with automated validation, monitoring & compliance.",
    tags: ["data-quality", "monitoring", "compliance"],
    industries: ["all"],
    challenges: ["data-quality", "compliance"],
    goals: ["compliance", "efficiency"],
    timelineFit: ["1-month", "3-months"],
    readiness: ["planning", "ready"],
    baseScore: 85,
    roiRange: { low: 300, high: 900, unit: "K" },
    outcomes: [
      { metric: "Data accuracy rate", value: "+40%", timeframe: "2 months" },
      { metric: "Compliance incidents", value: "-65%", timeframe: "3 months" },
      { metric: "Data pipeline failures", value: "-80%", timeframe: "6 weeks" },
    ],
    phases: [
      { n: 1, title: "Data Profiling", duration: "2 weeks", desc: "Automated scanning of all data sources to identify quality issues, duplicates, and missing values." },
      { n: 2, title: "Rules & Monitoring", duration: "3 weeks", desc: "Deploy validation rules, real-time quality dashboards, and automated alerting." },
      { n: 3, title: "Governance Framework", duration: "2 weeks", desc: "Implement data ownership policies, lineage tracking, and compliance reporting." },
    ],
  },
  {
    id: 3, title: "Intelligent Analytics",
    description: "Transform raw data into actionable insights using ML, NLP & advanced statistical models.",
    tags: ["analytics", "ml", "insights", "data"],
    industries: ["banking", "automotive", "retail", "technology"],
    challenges: ["data-quality", "innovation", "ai-adoption"],
    goals: ["revenue", "efficiency", "competitive-advantage"],
    timelineFit: ["3-months", "6-months"],
    readiness: ["planning", "ready"],
    baseScore: 83,
    roiRange: { low: 500, high: 2000, unit: "K" },
    outcomes: [
      { metric: "Decision speed", value: "3x faster", timeframe: "2 months" },
      { metric: "Revenue uplift", value: "+12–18%", timeframe: "6 months" },
      { metric: "Manual reporting effort", value: "-70%", timeframe: "3 months" },
    ],
    phases: [
      { n: 1, title: "Data Integration", duration: "3 weeks", desc: "Connect and normalize data sources into a unified analytics layer." },
      { n: 2, title: "Model Development", duration: "5 weeks", desc: "Build ML models for forecasting, segmentation, and anomaly detection tailored to your KPIs." },
      { n: 3, title: "Dashboard & Adoption", duration: "3 weeks", desc: "Deploy interactive dashboards and train your teams on self-service analytics." },
    ],
  },
  {
    id: 4, title: "ROI Simulator",
    description: "Measure & communicate the business value of data & AI investments with financial models.",
    tags: ["roi", "finance", "business-value", "reporting"],
    industries: ["all"],
    challenges: ["cost-reduction", "planning"],
    goals: ["cost-reduction", "revenue"],
    timelineFit: ["1-2-weeks", "1-month"],
    readiness: ["exploring", "planning"],
    baseScore: 80,
    roiRange: { low: 100, high: 400, unit: "K" },
    outcomes: [
      { metric: "Investment justification accuracy", value: "+85%", timeframe: "2 weeks" },
      { metric: "Budget approval speed", value: "2x faster", timeframe: "1 month" },
      { metric: "AI initiative success rate", value: "+35%", timeframe: "3 months" },
    ],
    phases: [
      { n: 1, title: "Value Mapping", duration: "3 days", desc: "Identify all cost drivers and revenue levers impacted by AI initiatives." },
      { n: 2, title: "Financial Modelling", duration: "1 week", desc: "Build customized ROI models with scenario analysis and sensitivity testing." },
      { n: 3, title: "Executive Reporting", duration: "3 days", desc: "Deliver board-ready ROI reports with risk-adjusted projections." },
    ],
  },
  {
    id: 5, title: "AI Use Case Radar",
    description: "Cross-industry intelligence tool that scans & prioritizes emerging AI trends and use cases.",
    tags: ["trends", "radar", "intelligence", "ai"],
    industries: ["all"],
    challenges: ["innovation", "ai-adoption"],
    goals: ["competitive-advantage"],
    timelineFit: ["1-month", "3-months"],
    readiness: ["exploring", "planning"],
    baseScore: 78,
    roiRange: { low: 150, high: 500, unit: "K" },
    outcomes: [
      { metric: "Competitor blind spots identified", value: "12–25 cases", timeframe: "1 month" },
      { metric: "Time to identify market trends", value: "-75%", timeframe: "ongoing" },
      { metric: "Innovation pipeline value", value: "+€2M", timeframe: "6 months" },
    ],
    phases: [
      { n: 1, title: "Sector Mapping", duration: "1 week", desc: "Define your competitive intelligence scope across sectors, geographies, and technologies." },
      { n: 2, title: "Radar Deployment", duration: "2 weeks", desc: "Activate automated monitoring of 500+ AI use cases and competitor moves." },
      { n: 3, title: "Strategic Briefings", duration: "Ongoing", desc: "Weekly AI signal reports delivered to leadership with prioritized action items." },
    ],
  },
  {
    id: 6, title: "Marketing Agents",
    description: "AI agents that automate marketing tasks like segmentation, personalized content, and campaign management.",
    tags: ["marketing", "automation", "ai-agents", "personalization"],
    industries: ["retail", "banking", "technology"],
    challenges: ["automation", "innovation"],
    goals: ["revenue", "efficiency"],
    timelineFit: ["3-months", "6-months"],
    readiness: ["planning", "ready"],
    baseScore: 76,
    roiRange: { low: 400, high: 1500, unit: "K" },
    outcomes: [
      { metric: "Campaign conversion rate", value: "+22%", timeframe: "3 months" },
      { metric: "Content production time", value: "-60%", timeframe: "6 weeks" },
      { metric: "Customer acquisition cost", value: "-28%", timeframe: "4 months" },
    ],
    phases: [
      { n: 1, title: "Audience Intelligence", duration: "2 weeks", desc: "Build AI-powered customer segmentation from your CRM and behavioral data." },
      { n: 2, title: "Agent Deployment", duration: "4 weeks", desc: "Deploy content generation and campaign orchestration agents with human-in-the-loop approval." },
      { n: 3, title: "Optimization Loop", duration: "Ongoing", desc: "Continuous A/B testing and performance optimization driven by AI feedback loops." },
    ],
  },
  {
    id: 7, title: "Incidents Management",
    description: "Detect, manage & resolve technical incidents with AI anomaly detection & root cause analysis.",
    tags: ["security", "operations", "automation", "monitoring"],
    industries: ["technology", "banking", "public"],
    challenges: ["security", "automation"],
    goals: ["efficiency", "compliance"],
    timelineFit: ["1-month", "3-months"],
    readiness: ["ready"],
    baseScore: 82,
    roiRange: { low: 350, high: 1200, unit: "K" },
    outcomes: [
      { metric: "Mean time to detect (MTTD)", value: "-82%", timeframe: "6 weeks" },
      { metric: "Incident resolution time", value: "-55%", timeframe: "2 months" },
      { metric: "False positive alerts", value: "-70%", timeframe: "1 month" },
    ],
    phases: [
      { n: 1, title: "Telemetry Integration", duration: "1 week", desc: "Connect logs, metrics, and traces from your entire infrastructure stack." },
      { n: 2, title: "AI Detection Models", duration: "3 weeks", desc: "Train anomaly detection models on your historical incident data." },
      { n: 3, title: "Response Automation", duration: "2 weeks", desc: "Deploy automated runbooks and escalation workflows for top incident categories." },
    ],
  },
  {
    id: 8, title: "AI Workbench",
    description: "Modular architecture to build, manage & scale agent-based AI systems powered by LLMs.",
    tags: ["platform", "llm", "ai-agents", "scalability"],
    industries: ["technology", "banking"],
    challenges: ["ai-adoption", "innovation"],
    goals: ["competitive-advantage", "efficiency"],
    timelineFit: ["6-months"],
    readiness: ["ready"],
    baseScore: 75,
    roiRange: { low: 800, high: 3000, unit: "K" },
    outcomes: [
      { metric: "AI deployment time", value: "-65%", timeframe: "3 months" },
      { metric: "Model reuse across teams", value: "+80%", timeframe: "6 months" },
      { metric: "AI product time-to-market", value: "3x faster", timeframe: "6 months" },
    ],
    phases: [
      { n: 1, title: "Architecture Design", duration: "3 weeks", desc: "Design your modular AI platform with governance, security, and scalability built in." },
      { n: 2, title: "Core Platform Build", duration: "8 weeks", desc: "Deploy the LLM orchestration layer, agent framework, and developer tooling." },
      { n: 3, title: "First Use Case Delivery", duration: "4 weeks", desc: "Launch first production AI agent with full monitoring and continuous improvement loop." },
    ],
  },
  {
    id: 9, title: "Sandbox AI",
    description: "Controlled environment to test AI models safely with limited access & risk analysis.",
    tags: ["testing", "security", "ai", "risk"],
    industries: ["all"],
    challenges: ["ai-adoption", "compliance", "security"],
    goals: ["compliance", "efficiency"],
    timelineFit: ["1-2-weeks", "1-month"],
    readiness: ["exploring", "planning"],
    baseScore: 79,
    roiRange: { low: 100, high: 350, unit: "K" },
    outcomes: [
      { metric: "AI model validation time", value: "-50%", timeframe: "2 weeks" },
      { metric: "Compliance risk exposure", value: "-90%", timeframe: "1 month" },
      { metric: "Failed AI deployments", value: "-75%", timeframe: "3 months" },
    ],
    phases: [
      { n: 1, title: "Environment Setup", duration: "3 days", desc: "Provision isolated sandbox environment with controlled data access and audit logging." },
      { n: 2, title: "Testing Framework", duration: "1 week", desc: "Deploy automated model evaluation, bias detection, and performance benchmarking tools." },
      { n: 3, title: "Risk Reporting", duration: "1 week", desc: "Generate compliance-ready AI risk reports for regulators and internal governance." },
    ],
  },
  {
    id: 10, title: "AI Watch",
    description: "Strategic intelligence platform analyzing tech trends, startups & innovations for insights.",
    tags: ["intelligence", "trends", "startups", "strategy"],
    industries: ["all"],
    challenges: ["innovation", "ai-adoption"],
    goals: ["competitive-advantage"],
    timelineFit: ["1-month", "3-months"],
    readiness: ["exploring", "planning"],
    baseScore: 77,
    roiRange: { low: 120, high: 400, unit: "K" },
    outcomes: [
      { metric: "Market intelligence coverage", value: "+500%", timeframe: "1 month" },
      { metric: "Analyst research time", value: "-60%", timeframe: "ongoing" },
      { metric: "Strategic opportunity identification", value: "10–20 per quarter", timeframe: "ongoing" },
    ],
    phases: [
      { n: 1, title: "Intelligence Setup", duration: "1 week", desc: "Configure topic tracking, competitor watchlists, and sector signal feeds." },
      { n: 2, title: "Dashboard Activation", duration: "1 week", desc: "Deploy real-time dashboards with AI-summarized news and signal scoring." },
      { n: 3, title: "Team Onboarding", duration: "1 week", desc: "Train strategy and innovation teams on weekly intelligence workflow and alerts." },
    ],
  },
  {
    id: 11, title: "AO Handler",
    description: "Intelligent solution discovering tenders, evaluating eligibility & auto-generating proposals.",
    tags: ["procurement", "automation", "proposals"],
    industries: ["public", "banking"],
    challenges: ["automation", "cost-reduction"],
    goals: ["efficiency", "revenue"],
    timelineFit: ["3-months", "6-months"],
    readiness: ["planning", "ready"],
    baseScore: 74,
    roiRange: { low: 250, high: 800, unit: "K" },
    outcomes: [
      { metric: "Tender response time", value: "-70%", timeframe: "2 months" },
      { metric: "Bid win rate", value: "+25%", timeframe: "6 months" },
      { metric: "Proposal preparation cost", value: "-50%", timeframe: "3 months" },
    ],
    phases: [
      { n: 1, title: "Tender Monitoring Setup", duration: "2 weeks", desc: "Configure automated scanning of tender portals and eligibility matching against your profile." },
      { n: 2, title: "Proposal Engine", duration: "4 weeks", desc: "Train proposal generation models on your past winning bids and compliance templates." },
      { n: 3, title: "Workflow Integration", duration: "2 weeks", desc: "Integrate with your CRM and document management for end-to-end proposal automation." },
    ],
  },
  {
    id: 12, title: "StartUp Connect AI",
    description: "AI-powered engine that discovers startups & matches them to your business needs.",
    tags: ["startups", "innovation", "matching", "ecosystem"],
    industries: ["all"],
    challenges: ["innovation", "ai-adoption"],
    goals: ["competitive-advantage", "revenue"],
    timelineFit: ["1-month", "3-months"],
    readiness: ["exploring", "planning"],
    baseScore: 73,
    roiRange: { low: 200, high: 700, unit: "K" },
    outcomes: [
      { metric: "Startup discovery time", value: "-85%", timeframe: "1 month" },
      { metric: "Partnership pipeline built", value: "20–40 per quarter", timeframe: "3 months" },
      { metric: "Innovation cycle time", value: "-40%", timeframe: "6 months" },
    ],
    phases: [
      { n: 1, title: "Needs Profiling", duration: "1 week", desc: "Define your innovation criteria, technology gaps, and partnership requirements." },
      { n: 2, title: "Ecosystem Scan", duration: "2 weeks", desc: "AI-powered scan of 50,000+ startups with relevance scoring and due diligence signals." },
      { n: 3, title: "Matchmaking & Outreach", duration: "Ongoing", desc: "Curated shortlists delivered monthly with automated first-contact facilitation." },
    ],
  },
  {
    id: 13, title: "HR Assistant",
    description: "Conversational AI assistant that manages HR inquiries & integrates with ERP/CRM systems.",
    tags: ["hr", "automation", "conversational-ai"],
    industries: ["all"],
    challenges: ["automation", "cost-reduction"],
    goals: ["efficiency", "cost-reduction"],
    timelineFit: ["3-months", "6-months"],
    readiness: ["planning", "ready"],
    baseScore: 71,
    roiRange: { low: 200, high: 600, unit: "K" },
    outcomes: [
      { metric: "HR query resolution time", value: "-80%", timeframe: "2 months" },
      { metric: "HR team capacity freed", value: "+35%", timeframe: "3 months" },
      { metric: "Employee satisfaction (eNPS)", value: "+20pts", timeframe: "6 months" },
    ],
    phases: [
      { n: 1, title: "Knowledge Base Build", duration: "2 weeks", desc: "Ingest your HR policies, FAQs, and procedures into the conversational AI." },
      { n: 2, title: "ERP/CRM Integration", duration: "3 weeks", desc: "Connect to your HRIS, payroll, and ticketing systems for live data access." },
      { n: 3, title: "Rollout & Training", duration: "2 weeks", desc: "Deploy to employees with escalation paths and feedback loop for continuous improvement." },
    ],
  },
];

// ─── Questionnaire steps ─────────────────────────────────────────────────────

const STEPS = [
  {
    id: "industry",
    title: "What is your industry?",
    subtitle: "We tailor recommendations using sector-specific benchmarks and case studies.",
    type: "single",
    options: [
      { id: "automotive", label: "Automotive & Manufacturing", icon: "🏭" },
      { id: "banking",    label: "Banking & Financial Services", icon: "🏦" },
      { id: "public",     label: "Public Sector & Government", icon: "🏛️" },
      { id: "healthcare", label: "Healthcare & Life Sciences", icon: "🏥" },
      { id: "retail",     label: "Retail & Consumer Goods", icon: "🛒" },
      { id: "technology", label: "Technology & Software", icon: "💻" },
      { id: "other",      label: "Other", icon: "🌐" },
    ],
  },
  {
    id: "size",
    title: "What is your organization size?",
    subtitle: "This helps us calibrate implementation complexity and resource estimates.",
    type: "single",
    options: [
      { id: "startup",    label: "Startup (< 50 employees)", icon: "🚀" },
      { id: "sme",        label: "SME (50–500 employees)", icon: "🏢" },
      { id: "midmarket",  label: "Mid-market (500–5,000 employees)", icon: "🏙️" },
      { id: "enterprise", label: "Enterprise (5,000+ employees)", icon: "🌍" },
    ],
  },
  {
    id: "challenges",
    title: "What are your main challenges?",
    subtitle: "Select all that apply — we use this to identify your most critical pain points.",
    type: "multi",
    options: [
      { id: "data-quality",           label: "Poor data quality or reliability", icon: "📊" },
      { id: "ai-adoption",            label: "Adopting AI & ML in operations", icon: "🤖" },
      { id: "cost-reduction",         label: "Reducing operational costs", icon: "💸" },
      { id: "digital-transformation", label: "Accelerating digital transformation", icon: "⚡" },
      { id: "security",               label: "Security & threat management", icon: "🔒" },
      { id: "compliance",             label: "Regulatory compliance & risk", icon: "⚖️" },
      { id: "innovation",             label: "Innovation & competitive intelligence", icon: "🔭" },
      { id: "automation",             label: "Automating manual processes", icon: "⚙️" },
    ],
  },
  {
    id: "goals",
    title: "What is your primary business goal?",
    subtitle: "Choose the outcome that matters most to your leadership right now.",
    type: "single",
    options: [
      { id: "cost-reduction",        label: "Reduce costs & improve margins", icon: "💰" },
      { id: "revenue",               label: "Grow revenue & market share", icon: "📈" },
      { id: "efficiency",            label: "Improve operational efficiency", icon: "⚡" },
      { id: "competitive-advantage", label: "Gain competitive advantage", icon: "🎯" },
      { id: "compliance",            label: "Ensure compliance & reduce risk", icon: "🛡️" },
    ],
  },
  {
    id: "timeline",
    title: "When do you need to deliver results?",
    subtitle: "We adjust our recommended approach and complexity based on your urgency.",
    type: "single",
    options: [
      { id: "1-2-weeks", label: "In 1–2 weeks (urgent)", icon: "🔥" },
      { id: "1-month",   label: "Within 1 month", icon: "📅" },
      { id: "3-months",  label: "Within 2–3 months", icon: "🗓️" },
      { id: "6-months",  label: "6+ months (strategic)", icon: "🔭" },
    ],
  },
  {
    id: "readiness",
    title: "How would you describe your AI maturity today?",
    subtitle: "Be honest — this helps us avoid over-engineering the recommendation.",
    type: "single",
    options: [
      { id: "exploring", label: "Exploring — AI is new to us, we need education & guidance", icon: "🌱" },
      { id: "planning",  label: "Planning — we have ideas and a roadmap but haven't started", icon: "📋" },
      { id: "ready",     label: "Ready — we have data infrastructure and want to implement now", icon: "🚀" },
    ],
  },
];

// ─── Analysis engine ─────────────────────────────────────────────────────────

const INDUSTRY_BENCHMARKS = {
  automotive:  { stat: "68% of automotive leaders now use AI for predictive maintenance and supply chain optimization.", peers: "BMW, Stellantis, Valeo" },
  banking:     { stat: "82% of tier-1 banks have deployed AI in fraud detection. 54% are expanding into customer intelligence.", peers: "BNP Paribas, Société Générale, Crédit Agricole" },
  public:      { stat: "61% of public sector organizations cite data fragmentation as the #1 barrier to AI adoption.", peers: "French Ministry of Economy, ANSSI, DGFIP" },
  healthcare:  { stat: "76% of healthcare organizations are actively piloting AI in diagnostics and clinical workflows.", peers: "AP-HP, Roche, Sanofi Digital" },
  retail:      { stat: "Retail AI adopters report 18–25% improvement in inventory accuracy and 22% higher customer retention.", peers: "Carrefour, LVMH, Leclerc" },
  technology:  { stat: "Tech companies that deploy AI infrastructure first generate 2.4x more revenue per employee within 3 years.", peers: "Capgemini, Sopra Steria, Thales" },
  other:       { stat: "Cross-industry AI adopters report 30% faster time-to-insight compared to traditional analytics approaches.", peers: "Various sectors" },
};

const CHALLENGE_INSIGHTS = {
  "data-quality":           { label: "Data Foundation Gap", risk: "high",   desc: "Poor data quality is the #1 cause of failed AI projects. Estimated cost: €150K–€500K per year in bad decisions." },
  "ai-adoption":            { label: "AI Adoption Barrier", risk: "medium", desc: "Organizations that delay AI adoption lose 3–5% market share per year to AI-native competitors." },
  "cost-reduction":         { label: "Cost Optimization Opportunity", risk: "medium", desc: "AI-driven process automation typically delivers 15–35% cost reduction within 12 months." },
  "digital-transformation": { label: "Transformation Urgency", risk: "high",   desc: "Digital laggards in your sector are being disrupted 2x faster than in 2020." },
  "security":               { label: "Security Risk Exposure", risk: "high",   desc: "The average cost of a data breach in your sector is €4.2M. AI-powered detection cuts response time by 82%." },
  "compliance":             { label: "Regulatory Pressure", risk: "high",   desc: "EU AI Act enforcement has begun. Non-compliance penalties can reach 3–6% of global annual turnover." },
  "innovation":             { label: "Competitive Intelligence Gap", risk: "medium", desc: "Companies monitoring competitor AI moves launch innovations 40% faster than peers who don't." },
  "automation":             { label: "Manual Process Cost", risk: "medium", desc: "Manual process cost is estimated at 2.5–4x the cost of equivalent automation at your organization size." },
};

const READINESS_PROFILES = {
  exploring: { score: 22, label: "AI Beginner",         color: B.amber, bg: B.amberLight, desc: "You are at the start of your AI journey. The priority is building foundations and quick wins to demonstrate value." },
  planning:  { score: 55, label: "AI Explorer",         color: B.blue,  bg: B.blueLight,  desc: "You have a strategic intent and roadmap. The priority is moving from planning to execution with the right first use case." },
  ready:     { score: 78, label: "AI Implementer",      color: B.green, bg: B.greenLight, desc: "You have the infrastructure and appetite. The priority is scaling AI with governance and measurable business impact." },
};

const SIZE_ROI_MULTIPLIERS = {
  startup:    0.4,
  sme:        0.7,
  midmarket:  1.0,
  enterprise: 2.2,
};

// ─── Scoring engine constants ─────────────────────────────────────────────────

// How much each challenge matters per industry (amplifier on challenge score)
const INDUSTRY_CHALLENGE_AMPLIFIERS = {
  banking:    { "compliance": 1.5, "security": 1.4, "data-quality": 1.3 },
  automotive: { "automation": 1.5, "cost-reduction": 1.3, "digital-transformation": 1.2 },
  public:     { "compliance": 1.6, "automation": 1.3, "cost-reduction": 1.2 },
  healthcare: { "compliance": 1.5, "data-quality": 1.4, "security": 1.3 },
  technology: { "ai-adoption": 1.4, "innovation": 1.3, "digital-transformation": 1.2 },
  retail:     { "automation": 1.3, "cost-reduction": 1.3, "innovation": 1.2 },
  other:      {},
};

// Extra points when a client has BOTH challenges simultaneously (synergy)
const CO_OCCURRENCE_BONUSES = {
  2:  [{ pair: ["data-quality", "compliance"],          bonus: 8 }],  // Data Health
  3:  [{ pair: ["data-quality", "ai-adoption"],         bonus: 7 },
       { pair: ["innovation",   "ai-adoption"],         bonus: 5 }],  // Intelligent Analytics
  1:  [{ pair: ["ai-adoption",  "digital-transformation"], bonus: 6 }], // Assessment Advisor
  7:  [{ pair: ["security",     "compliance"],          bonus: 8 },
       { pair: ["security",     "automation"],          bonus: 6 }],  // Incidents Management
  9:  [{ pair: ["ai-adoption",  "compliance"],          bonus: 7 },
       { pair: ["security",     "ai-adoption"],         bonus: 6 }],  // Sandbox AI
  5:  [{ pair: ["innovation",   "ai-adoption"],         bonus: 7 }],  // AI Use Case Radar
  10: [{ pair: ["innovation",   "ai-adoption"],         bonus: 6 }],  // AI Watch
  13: [{ pair: ["automation",   "cost-reduction"],      bonus: 7 }],  // HR Assistant
  11: [{ pair: ["automation",   "cost-reduction"],      bonus: 6 }],  // AO Handler
  6:  [{ pair: ["automation",   "innovation"],          bonus: 5 }],  // Marketing Agents
};

// Minimum org size for complex solutions (index into SIZE_ORDER)
const SIZE_ORDER = ["startup", "sme", "midmarket", "enterprise"];
const SIZE_COMPLEXITY_MIN = {
  8: "midmarket",  // AI Workbench — too complex for small orgs
  3: "sme",        // Intelligent Analytics — needs data infrastructure
  7: "sme",        // Incidents Management — needs existing infrastructure
  6: "sme",        // Marketing Agents — needs CRM/data stack
};


function generateProfile(answers) {
  const readiness = READINESS_PROFILES[answers.readiness] || READINESS_PROFILES.exploring;
  const challenges = answers.challenges || [];
  const industry = answers.industry || "other";
  const goal = answers.goals || "efficiency";
  const size = answers.size || "midmarket";

  // Maturity score adjustments
  let maturityScore = readiness.score;
  if (challenges.includes("data-quality")) maturityScore -= 8;
  if (challenges.includes("ai-adoption")) maturityScore -= 5;
  if (challenges.includes("compliance")) maturityScore += 3;
  if (size === "enterprise") maturityScore += 5;
  if (size === "startup") maturityScore -= 5;
  maturityScore = Math.max(10, Math.min(95, maturityScore));

  // Urgency
  const urgency = answers.timeline === "1-2-weeks" ? "Critical"
    : answers.timeline === "1-month" ? "High"
    : answers.timeline === "3-months" ? "Medium"
    : "Low";

  const urgencyColor = urgency === "Critical" ? B.red
    : urgency === "High" ? B.amber
    : urgency === "Medium" ? B.blue
    : B.green;

  // Top 3 risk findings from challenges
  const findings = challenges
    .filter(c => CHALLENGE_INSIGHTS[c])
    .map(c => CHALLENGE_INSIGHTS[c])
    .sort((a, b) => (b.risk === "high" ? 1 : 0) - (a.risk === "high" ? 1 : 0))
    .slice(0, 3);

  // Narrative
  const industryLabel = STEPS[0].options.find(o => o.id === industry)?.label || industry;
  const goalLabel = STEPS[3].options.find(o => o.id === goal)?.label || goal;
  const sizeLabel = STEPS[1].options.find(o => o.id === size)?.label || size;

  const narrative = buildNarrative(industryLabel, sizeLabel, goalLabel, readiness.label, challenges, answers.timeline, urgency);

  const benchmark = INDUSTRY_BENCHMARKS[industry] || INDUSTRY_BENCHMARKS.other;

  return {
    maturityScore,
    profile: readiness,
    urgency,
    urgencyColor,
    findings,
    narrative,
    benchmark,
    industryLabel,
    goalLabel,
    sizeLabel,
  };
}

function buildNarrative(industry, size, goal, profileLabel, challenges, timeline, urgency) {
  const challengeList = challenges.slice(0, 2).join(" and ").replace("-", " ");
  const urgencyAdverb = urgency === "Critical" || urgency === "High" ? "urgently needs" : "is positioned to";

  return `As a ${profileLabel} in the ${industry} sector, your ${size} organization ${urgencyAdverb} address ${challengeList || "key operational challenges"} to achieve your goal of ${goal.replace("-", " ")}. Based on your profile, we identified ${challenges.length} active pain point${challenges.length !== 1 ? "s" : ""} and matched them against 13 DXC solutions. The analysis below presents your personalized recommendations with expected outcomes, implementation roadmaps, and ROI projections calibrated to your organization size and timeline.`;
}

function generateMatchReasons(solution, answers, dims, matchedChallenges) {
  const reasons = [];
  const industry = answers.industry || "other";
  const industryLabel = STEPS[0].options.find(o => o.id === industry)?.label || industry;
  const amplifiers = INDUSTRY_CHALLENGE_AMPLIFIERS[industry] || {};

  // Industry fit
  if (dims.industry.score >= 12) {
    reasons.push(`Proven track record in the ${industryLabel} sector — highest-relevance profile for your context`);
  } else if (dims.industry.score >= 8) {
    reasons.push(`Cross-industry framework that adapts to ${industryLabel} with no sector-specific blockers`);
  }

  // Highlight challenges that are amplified for this industry (most critical ones first)
  const amplifiedMatches = matchedChallenges.filter(c => (amplifiers[c] || 1) > 1.2);
  const normalMatches = matchedChallenges.filter(c => !amplifiedMatches.includes(c));

  amplifiedMatches.forEach(c => {
    const opt = STEPS[2].options.find(o => o.id === c);
    const insight = CHALLENGE_INSIGHTS[c];
    if (opt && insight) {
      reasons.push(`High-priority for ${industryLabel}: tackles "${opt.label.toLowerCase()}" — ${insight.desc.split(".")[0]}`);
    }
  });

  normalMatches.slice(0, 2).forEach(c => {
    const opt = STEPS[2].options.find(o => o.id === c);
    if (opt) reasons.push(`Directly resolves your selected challenge: "${opt.label}"`);
  });

  // Co-occurrence bonus explanation
  const combos = CO_OCCURRENCE_BONUSES[solution.id] || [];
  const triggeredCombo = combos.find(({ pair }) => pair.every(c => (answers.challenges || []).includes(c)));
  if (triggeredCombo) {
    const pairLabels = triggeredCombo.pair
      .map(c => STEPS[2].options.find(o => o.id === c)?.label?.split(" ").slice(0, 2).join(" "))
      .join(" + ");
    reasons.push(`Synergy bonus: the combination of ${pairLabels} makes this solution significantly more effective`);
  }

  // Goal alignment
  if (dims.goal.score >= 18) {
    const opt = STEPS[3].options.find(o => o.id === answers.goals);
    if (opt) reasons.push(`Directly aligned to your primary goal: "${opt.label}"`);
  } else if (dims.goal.score >= 8) {
    reasons.push(`Partially supports your goal with adjacent business impact`);
  }

  // Timeline fit or warning
  if (dims.timeline.score >= 8) {
    const opt = STEPS[4].options.find(o => o.id === answers.timeline);
    if (opt) reasons.push(`Delivery fits your required timeline (${opt.label.split("(")[0].trim()})`);
  } else if (dims.timeline.score <= 2) {
    reasons.push(`Timeline note: this solution typically takes longer — a phased lite version can be scoped`);
  }

  // Readiness fit
  if (dims.readiness.score >= 12) {
    const opt = STEPS[5].options.find(o => o.id === answers.readiness);
    if (opt) reasons.push(`Matched to your AI maturity level (${opt.label.split("—")[0].trim()}) — no over-engineering`);
  }

  return reasons.slice(0, 5);
}


function scoreAnswers(answers) {
  const industry = answers.industry || "other";
  const challenges = answers.challenges || [];
  const goal = answers.goals;
  const timeline = answers.timeline;
  const readiness = answers.readiness;
  const size = answers.size || "midmarket";

  const amplifiers = INDUSTRY_CHALLENGE_AMPLIFIERS[industry] || {};
  const sizeIndex = SIZE_ORDER.indexOf(size);
  const READINESS_ORDER = ["exploring", "planning", "ready"];

  return SOLUTIONS.map(sol => {
    const dims = {};

    // ── 1. Challenge Alignment — weight 35 ───────────────────────────────────
    let challengeScore = 0;
    const matchedChallenges = challenges.filter(c => sol.challenges.includes(c));

    if (challenges.length > 0) {
      // What proportion of the client's challenges does this solution cover?
      const coverageRatio = matchedChallenges.length / challenges.length;
      // What proportion of this solution's scope is relevant to the client?
      const scopeRatio = matchedChallenges.length / Math.max(sol.challenges.length, 1);
      challengeScore = (coverageRatio * 0.6 + scopeRatio * 0.4) * 20;

      // Industry amplifier: challenges that are critical for this sector score higher
      const amplifierBonus = matchedChallenges.reduce((sum, c) => {
        return sum + ((amplifiers[c] || 1.0) - 1.0) * 3.5;
      }, 0);
      challengeScore += amplifierBonus;

      // Co-occurrence bonus: certain challenge pairs create extra synergy
      const combos = CO_OCCURRENCE_BONUSES[sol.id] || [];
      combos.forEach(({ pair, bonus }) => {
        if (pair.every(c => challenges.includes(c))) {
          challengeScore += bonus * 0.55;
        }
      });

      challengeScore = Math.min(challengeScore, 35);
    } else {
      challengeScore = 10;
    }
    dims.challenge = { score: +challengeScore.toFixed(1), max: 35, label: "Challenge Alignment", matched: matchedChallenges.length, total: challenges.length };

    // ── 2. Goal Alignment — weight 20 ────────────────────────────────────────
    let goalScore = 3;
    if (goal) {
      if (sol.goals.includes(goal)) {
        goalScore = 20;
      } else {
        // Adjacent goal mapping — partial credit
        const adjacent = {
          "cost-reduction":        ["efficiency"],
          "revenue":               ["competitive-advantage"],
          "efficiency":            ["cost-reduction"],
          "competitive-advantage": ["innovation", "revenue"],
          "compliance":            ["security", "efficiency"],
        };
        const adj = adjacent[goal] || [];
        if (sol.goals.some(g => adj.includes(g))) goalScore = 9;
      }
    }
    dims.goal = { score: goalScore, max: 20, label: "Goal Alignment" };

    // ── 3. Industry Fit — weight 15 ───────────────────────────────────────────
    let industryScore = 2;
    if (sol.industries.includes(industry)) industryScore = 15;
    else if (sol.industries.includes("all")) industryScore = 9;
    dims.industry = { score: industryScore, max: 15, label: "Industry Fit" };

    // ── 4. Readiness Fit — weight 15 ──────────────────────────────────────────
    let readinessScore = 1;
    if (readiness) {
      const rIdx = READINESS_ORDER.indexOf(readiness);
      const solMin = Math.min(...sol.readiness.map(r => READINESS_ORDER.indexOf(r)));
      const solMax = Math.max(...sol.readiness.map(r => READINESS_ORDER.indexOf(r)));
      if (rIdx >= solMin && rIdx <= solMax) readinessScore = 15;      // perfect
      else if (rIdx === solMax + 1)          readinessScore = 10;     // overqualified — still fine
      else if (rIdx === solMin - 1)          readinessScore = 6;      // slightly underqualified
      else                                   readinessScore = 1;      // too far off
    }
    dims.readiness = { score: readinessScore, max: 15, label: "Maturity Fit" };

    // ── 5. Timeline Fit — weight 10 ───────────────────────────────────────────
    let timelineScore = 1;
    if (timeline) {
      const T = ["1-2-weeks", "1-month", "3-months", "6-months"];
      const tIdx = T.indexOf(timeline);
      const solMin = Math.min(...sol.timelineFit.map(t => T.indexOf(t)));
      const solMax = Math.max(...sol.timelineFit.map(t => T.indexOf(t)));
      if (tIdx >= solMin && tIdx <= solMax)                  timelineScore = 10;
      else if (Math.abs(tIdx - solMin) === 1 || Math.abs(tIdx - solMax) === 1) timelineScore = 5;
      else                                                   timelineScore = 1;
    }
    dims.timeline = { score: timelineScore, max: 10, label: "Timeline Fit" };

    // ── Raw total (0–95) ──────────────────────────────────────────────────────
    const raw = dims.challenge.score + dims.goal.score + dims.industry.score +
                dims.readiness.score + dims.timeline.score;

    // ── Synergy bonus: reward when multiple dimensions all align strongly ─────
    const strongRatios = [
      dims.challenge.score / 35,
      dims.goal.score / 20,
      dims.industry.score / 15,
      dims.readiness.score / 15,
    ].filter(r => r >= 0.7).length;
    const synergyBonus = strongRatios >= 3 ? 5 : strongRatios >= 2 ? 2 : 0;

    // ── Size-complexity penalty ───────────────────────────────────────────────
    const complexMin = SIZE_COMPLEXITY_MIN[sol.id];
    let sizePenalty = 0;
    if (complexMin) {
      const minIdx = SIZE_ORDER.indexOf(complexMin);
      if (sizeIndex < minIdx - 1) sizePenalty = -10;
      else if (sizeIndex < minIdx) sizePenalty = -5;
    }

    // ── Final score: map adjusted 0–95 → display range 42–97 ────────────────
    const adjusted = Math.max(0, Math.min(95, raw + synergyBonus + sizePenalty));
    const matchScore = Math.round(42 + (adjusted / 95) * 55);

    const matchReasons = generateMatchReasons(sol, answers, dims, matchedChallenges);
    return { ...sol, matchScore, dims, matchReasons };
  }).sort((a, b) => b.matchScore - a.matchScore);
}

// ─── UI Components ────────────────────────────────────────────────────────────

function ProgressBar({ step, total }) {
  const pct = (step / total) * 100;
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: B.gray500, textTransform: "uppercase", letterSpacing: 0.5 }}>
          Step {step} of {total}
        </span>
        <span style={{ fontSize: 11, fontWeight: 700, color: B.purple }}>{Math.round(pct)}%</span>
      </div>
      <div style={{ height: 4, background: B.gray200, borderRadius: 2 }}>
        <div style={{ width: `${pct}%`, height: "100%", background: B.purple, borderRadius: 2, transition: "width 0.4s ease" }} />
      </div>
    </div>
  );
}

function QuestionStep({ step, answers, onChange, onNext, onBack, isFirst }) {
  const value = answers[step.id];
  const hasValue = step.type === "multi" ? (value && value.length > 0) : !!value;

  function toggleMulti(optId) {
    const current = value || [];
    const next = current.includes(optId) ? current.filter(x => x !== optId) : [...current, optId];
    onChange(step.id, next);
  }

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: B.gray900, marginBottom: 6 }}>{step.title}</h2>
      <p style={{ fontSize: 13, color: B.gray500, marginBottom: 24, lineHeight: 1.6 }}>{step.subtitle}</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 28 }}>
        {step.options.map(opt => {
          const selected = step.type === "multi" ? (value || []).includes(opt.id) : value === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => step.type === "multi" ? toggleMulti(opt.id) : onChange(step.id, opt.id)}
              style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "14px 18px",
                background: selected ? B.purplePale : B.white,
                border: `2px solid ${selected ? B.purple : B.gray200}`,
                borderRadius: 6,
                cursor: "pointer", textAlign: "left",
                transition: "all 0.15s",
              }}
            >
              <div style={{
                width: 18, height: 18,
                borderRadius: step.type === "multi" ? 3 : "50%",
                border: `2px solid ${selected ? B.purple : B.gray300}`,
                background: selected ? B.purple : B.white,
                flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {selected && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span style={{ fontSize: 14, fontWeight: selected ? 600 : 400, color: selected ? B.purple : B.gray700 }}>
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 12 }}>
        {!isFirst && (
          <button onClick={onBack} style={{ padding: "12px 24px", background: B.white, border: `2px solid ${B.gray200}`, borderRadius: 4, fontSize: 13, fontWeight: 600, color: B.gray600, cursor: "pointer" }}>
            Back
          </button>
        )}
        <button
          onClick={onNext}
          disabled={!hasValue}
          style={{
            flex: 1, padding: "13px 24px",
            background: hasValue ? B.purple : B.gray200,
            border: "none", borderRadius: 4, fontSize: 13, fontWeight: 700,
            color: hasValue ? B.white : B.gray400,
            cursor: hasValue ? "pointer" : "not-allowed",
            transition: "background 0.15s",
          }}
        >
          {step.id === "readiness" ? "Generate My Analysis" : "Continue"}
        </button>
      </div>
    </div>
  );
}

function AnalyzingScreen() {
  const [dots, setDots] = useState(0);
  const [phase, setPhase] = useState(0);
  const phases = [
    "Mapping your challenges to solution capabilities...",
    "Calculating industry-specific ROI estimates...",
    "Scoring 13 solutions against your profile...",
    "Generating your personalized roadmap...",
  ];

  useEffect(() => {
    const d = setInterval(() => setDots(x => (x + 1) % 4), 400);
    const p = setInterval(() => setPhase(x => Math.min(x + 1, phases.length - 1)), 700);
    return () => { clearInterval(d); clearInterval(p); };
  }, []);

  return (
    <div style={{ textAlign: "center", padding: "60px 24px" }}>
      <div style={{
        width: 64, height: 64, borderRadius: "50%",
        border: `4px solid ${B.purplePale}`, borderTopColor: B.purple,
        animation: "spin 0.9s linear infinite",
        margin: "0 auto 32px",
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: B.gray900, marginBottom: 12 }}>
        Analysing your needs{".".repeat(dots)}
      </h2>
      <p style={{ fontSize: 13, color: B.gray500 }}>{phases[phase]}</p>
    </div>
  );
}

function MaturityGauge({ score }) {
  const label = score < 30 ? "Beginner" : score < 55 ? "Explorer" : score < 75 ? "Implementer" : "Leader";
  const color = score < 30 ? B.amber : score < 55 ? B.blue : score < 75 ? B.purple : B.green;
  const circumference = 2 * Math.PI * 40;
  const strokeOffset = circumference - (score / 100) * circumference;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="40" fill="none" stroke={B.gray100} strokeWidth="10" />
        <circle
          cx="50" cy="50" r="40" fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={circumference} strokeDashoffset={strokeOffset}
          strokeLinecap="round" transform="rotate(-90 50 50)"
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
        <text x="50" y="46" textAnchor="middle" fontSize="18" fontWeight="800" fill={color}>{score}</text>
        <text x="50" y="60" textAnchor="middle" fontSize="8" fill={B.gray400} fontWeight="600">/100</text>
      </svg>
      <span style={{ fontSize: 11, fontWeight: 700, color, marginTop: 4, textTransform: "uppercase", letterSpacing: 0.6 }}>{label}</span>
    </div>
  );
}

function NeedsAnalysis({ profile, answers }) {
  const { maturityScore, urgency, urgencyColor, findings, narrative, benchmark, industryLabel, goalLabel, sizeLabel } = profile;

  return (
    <div style={{ marginBottom: 36 }}>
      {/* Header card */}
      <div style={{
        background: B.purplePale, borderRadius: 6, padding: "28px 32px", marginBottom: 20,
        border: `1px solid ${B.purple}22`, borderLeft: `4px solid ${B.purple}`,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 24, marginBottom: 20 }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: B.purple, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
              Client Needs Assessment
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: B.gray900, marginBottom: 6 }}>
              {industryLabel} · {sizeLabel}
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: urgencyColor, background: `${urgencyColor}18`, border: `1px solid ${urgencyColor}44`, padding: "2px 10px", borderRadius: 2 }}>
                {urgency} Urgency
              </span>
              <span style={{ fontSize: 11, fontWeight: 700, color: B.gray600, background: B.white, border: `1px solid ${B.gray200}`, padding: "2px 10px", borderRadius: 2 }}>
                Goal: {goalLabel}
              </span>
            </div>
          </div>
          <MaturityGauge score={maturityScore} />
        </div>

        <p style={{ fontSize: 13, color: B.gray600, lineHeight: 1.7, borderTop: `1px solid ${B.purple}20`, paddingTop: 16 }}>
          {narrative}
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        {/* Key findings */}
        <div style={{ background: B.white, border: `1px solid ${B.gray200}`, borderRadius: 6, padding: "20px 22px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: B.gray500, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 14 }}>
            Key Findings ({findings.length} risks identified)
          </div>
          {findings.length === 0 ? (
            <p style={{ fontSize: 13, color: B.gray400 }}>No critical risk areas identified from your selection.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {findings.map((f, i) => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <span style={{
                    flexShrink: 0, fontSize: 9, fontWeight: 800, letterSpacing: 0.5,
                    padding: "3px 7px", borderRadius: 2, textTransform: "uppercase",
                    color: f.risk === "high" ? B.red : B.amber,
                    background: f.risk === "high" ? B.redLight : B.amberLight,
                  }}>{f.risk}</span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: B.gray900, marginBottom: 2 }}>{f.label}</div>
                    <div style={{ fontSize: 11, color: B.gray500, lineHeight: 1.5 }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Industry benchmark */}
        <div style={{ background: B.white, border: `1px solid ${B.gray200}`, borderRadius: 6, padding: "20px 22px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: B.gray500, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 14 }}>
            Industry Benchmark
          </div>
          <div style={{
            background: B.purplePale, border: `1px solid ${B.purple}20`,
            borderRadius: 4, padding: "12px 14px", marginBottom: 14,
          }}>
            <p style={{ fontSize: 12, color: B.gray700, lineHeight: 1.6, fontStyle: "italic" }}>
              "{benchmark.stat}"
            </p>
          </div>
          <div style={{ fontSize: 11, fontWeight: 600, color: B.gray500, marginBottom: 6 }}>Reference peers:</div>
          <div style={{ fontSize: 12, color: B.purple, fontWeight: 600 }}>{benchmark.peers}</div>
        </div>
      </div>
    </div>
  );
}

function ScoreBreakdown({ dims }) {
  const dimList = [
    { key: "challenge", color: B.purple },
    { key: "goal",      color: B.blue },
    { key: "industry",  color: B.green },
    { key: "readiness", color: B.amber },
    { key: "timeline",  color: B.blue },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {dimList.map(({ key, color }) => {
        const d = dims?.[key];
        if (!d) return null;
        const pct = Math.round((d.score / d.max) * 100);
        const barColor = pct >= 70 ? color : pct >= 40 ? B.amber : B.gray300;
        return (
          <div key={key}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <div>
                <span style={{ fontSize: 12, fontWeight: 600, color: B.gray700 }}>{d.label}</span>
                {key === "challenge" && d.total > 0 && (
                  <span style={{ fontSize: 10, color: B.gray400, marginLeft: 8 }}>
                    {d.matched}/{d.total} challenges matched
                  </span>
                )}
              </div>
              <span style={{ fontSize: 12, fontWeight: 800, color: barColor }}>{pct}%</span>
            </div>
            <div style={{ height: 7, background: B.gray100, borderRadius: 4, overflow: "hidden" }}>
              <div style={{
                width: `${pct}%`, height: "100%", background: barColor,
                borderRadius: 4, transition: "width 0.9s ease",
              }} />
            </div>
          </div>
        );
      })}
      <p style={{ fontSize: 11, color: B.gray400, marginTop: 4, lineHeight: 1.5 }}>
        Weights: Challenge Alignment 35% · Goal 20% · Industry 15% · Maturity 15% · Timeline 10%
      </p>
    </div>
  );
}

function MatchCard({ solution, rank, answers }) {
  const [tab, setTab] = useState("overview");
  const isTop = rank === 0;

  const fitLabel = solution.matchScore >= 90 ? "Excellent Match"
    : solution.matchScore >= 80 ? "Strong Match"
    : solution.matchScore >= 70 ? "Good Match"
    : "Potential Match";

  const fitColor = solution.matchScore >= 90 ? B.green
    : solution.matchScore >= 80 ? B.purple
    : solution.matchScore >= 70 ? B.blue
    : B.amber;

  const fitBg = solution.matchScore >= 90 ? B.greenLight
    : solution.matchScore >= 80 ? B.purplePale
    : solution.matchScore >= 70 ? B.blueLight
    : B.amberLight;

  const TAB = ({ id, label }) => (
    <button
      onClick={() => setTab(id)}
      style={{
        padding: "6px 14px", border: "none", borderRadius: 3, cursor: "pointer",
        fontSize: 11, fontWeight: 700, letterSpacing: 0.3,
        background: tab === id ? B.purple : "transparent",
        color: tab === id ? B.white : B.gray400,
        transition: "all 0.15s",
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{
      background: B.white,
      border: `2px solid ${isTop ? B.purple : B.gray200}`,
      borderRadius: 6,
      overflow: "hidden",
      position: "relative",
      boxShadow: isTop ? "0 4px 20px rgba(107,44,148,0.12)" : "0 1px 6px rgba(0,0,0,0.04)",
    }}>
      {isTop && (
        <div style={{
          background: B.purple, padding: "6px 20px",
          fontSize: 10, fontWeight: 800, color: B.white, letterSpacing: 1, textTransform: "uppercase",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          Best Match for Your Profile
        </div>
      )}

      <div style={{ padding: "22px 24px" }}>
        {/* Header row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: B.gray400, marginBottom: 3 }}>#{rank + 1}</div>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: B.gray900 }}>{solution.title}</h3>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 16 }}>
            <div style={{ fontSize: 26, fontWeight: 900, color: fitColor, lineHeight: 1 }}>{solution.matchScore}%</div>
            <span style={{
              display: "inline-block", marginTop: 4,
              fontSize: 9, fontWeight: 800, color: fitColor, background: fitBg,
              border: `1px solid ${fitColor}33`, padding: "2px 8px", borderRadius: 2,
              textTransform: "uppercase", letterSpacing: 0.7,
            }}>
              {fitLabel}
            </span>
          </div>
        </div>

        {/* Score bar */}
        <div style={{ height: 6, background: B.gray100, borderRadius: 3, overflow: "hidden", marginBottom: 14 }}>
          <div style={{
            width: `${solution.matchScore}%`, height: "100%",
            background: `linear-gradient(90deg, ${fitColor}, ${fitColor}bb)`,
            borderRadius: 3, transition: "width 1s ease",
          }} />
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 16, background: B.gray100, borderRadius: 4, padding: 4, width: "fit-content", flexWrap: "wrap" }}>
          <TAB id="overview"  label="Overview" />
          <TAB id="why"       label="Why This Match" />
          <TAB id="outcomes"  label="Expected Outcomes" />
          <TAB id="roadmap"   label="Implementation" />
          <TAB id="breakdown" label="Score Breakdown" />
        </div>

        {/* Tab content */}
        {tab === "overview" && (
          <p style={{ fontSize: 13, color: B.gray600, lineHeight: 1.7 }}>{solution.description}</p>
        )}

        {tab === "why" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {solution.matchReasons.length === 0 ? (
              <p style={{ fontSize: 13, color: B.gray400 }}>General solution fit based on your profile.</p>
            ) : solution.matchReasons.map((r, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <span style={{ color: B.green, fontSize: 14, flexShrink: 0, marginTop: 1 }}>✓</span>
                <span style={{ fontSize: 13, color: B.gray700, lineHeight: 1.5 }}>{r}</span>
              </div>
            ))}
          </div>
        )}

        {tab === "outcomes" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {solution.outcomes.map((o, i) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "10px 14px", background: B.gray50, borderRadius: 4,
                border: `1px solid ${B.gray200}`,
              }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: B.gray700 }}>{o.metric}</div>
                  <div style={{ fontSize: 11, color: B.gray400 }}>Within {o.timeframe}</div>
                </div>
                <div style={{ fontSize: 16, fontWeight: 800, color: B.purple }}>{o.value}</div>
              </div>
            ))}
          </div>
        )}

        {tab === "breakdown" && (
          <ScoreBreakdown dims={solution.dims} />
        )}

        {tab === "roadmap" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {solution.phases.map((ph, i) => (
              <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{
                  width: 28, height: 28, borderRadius: "50%",
                  background: B.purple, color: B.white,
                  fontSize: 12, fontWeight: 800,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  {ph.n}
                </div>
                <div style={{ flex: 1, paddingBottom: i < solution.phases.length - 1 ? 10 : 0, borderBottom: i < solution.phases.length - 1 ? `1px solid ${B.gray100}` : "none" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: B.gray900 }}>{ph.title}</span>
                    <span style={{ fontSize: 11, color: B.purple, fontWeight: 600 }}>{ph.duration}</span>
                  </div>
                  <p style={{ fontSize: 12, color: B.gray500, lineHeight: 1.5, margin: 0 }}>{ph.desc}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
          <button
            style={{
              flex: 1, padding: "11px 16px",
              background: isTop ? B.purple : B.gray50,
              border: isTop ? "none" : `1px solid ${B.gray200}`,
              borderRadius: 4, fontSize: 12, fontWeight: 700,
              color: isTop ? B.white : B.purple, cursor: "pointer",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = B.purple; e.currentTarget.style.color = B.white; }}
            onMouseLeave={e => { e.currentTarget.style.background = isTop ? B.purple : B.gray50; e.currentTarget.style.color = isTop ? B.white : B.purple; }}
          >
            {isTop ? "Book Discovery Call" : "Request More Details"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── PDF Report Generator ─────────────────────────────────────────────────────

function buildReportHTML(answers, matches, profile) {
  const top5 = matches.slice(0, 5);
  const others = matches.slice(5);
  const date = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
  const industryLabel = profile.industryLabel || answers.industry || "—";
  const sizeLabel = profile.sizeLabel || answers.size || "—";
  const goalLabel = profile.goalLabel || answers.goals || "—";

  const scoreBar = (pct, color) =>
    `<div style="height:6px;background:#e8e8e8;border-radius:3px;margin:4px 0 0">
      <div style="width:${pct}%;height:100%;background:${color};border-radius:3px"></div>
     </div>`;

  const dimColors = { challenge:"#6B2C94", goal:"#1a5fa8", industry:"#1a8a4a", readiness:"#b45309", timeline:"#1a5fa8" };
  const dimLabels = { challenge:"Challenge Alignment", goal:"Goal Alignment", industry:"Industry Fit", readiness:"Maturity Fit", timeline:"Timeline Fit" };
  const dimWeights = { challenge:"35%", goal:"20%", industry:"15%", readiness:"15%", timeline:"10%" };

  const solutionBlocks = top5.map((sol, rank) => {
    const fitColor = sol.matchScore >= 90 ? "#1a8a4a" : sol.matchScore >= 80 ? "#6B2C94" : sol.matchScore >= 70 ? "#1a5fa8" : "#b45309";
    const fitLabel = sol.matchScore >= 90 ? "Excellent Match" : sol.matchScore >= 80 ? "Strong Match" : sol.matchScore >= 70 ? "Good Match" : "Potential Match";

    const outcomeRows = sol.outcomes.map(o =>
      `<tr>
        <td style="padding:7px 10px;border-bottom:1px solid #f0f0f0;font-size:12px;color:#444">${o.metric}</td>
        <td style="padding:7px 10px;border-bottom:1px solid #f0f0f0;font-size:12px;font-weight:700;color:#6B2C94;text-align:right">${o.value}</td>
        <td style="padding:7px 10px;border-bottom:1px solid #f0f0f0;font-size:11px;color:#999;text-align:right">${o.timeframe}</td>
      </tr>`
    ).join("");

    const phaseRows = sol.phases.map(ph =>
      `<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:10px">
        <tr>
          <td style="width:28px;vertical-align:top;padding-top:1px">
            <div style="width:22px;height:22px;border-radius:50%;background:#6B2C94;color:#fff;font-size:10px;font-weight:800;text-align:center;line-height:22px">${ph.n}</div>
          </td>
          <td style="vertical-align:top;padding-left:10px">
            <div style="font-size:12px;font-weight:700;color:#111;margin-bottom:2px">${ph.title} <span style="font-weight:400;color:#6B2C94">&mdash; ${ph.duration}</span></div>
            <div style="font-size:11px;color:#666;line-height:1.55">${ph.desc}</div>
          </td>
        </tr>
      </table>`
    ).join("");

    const dimBars = Object.keys(dimColors).map(k => {
      const d = sol.dims?.[k];
      if (!d) return "";
      const pct = Math.round((d.score / d.max) * 100);
      const c = pct >= 70 ? dimColors[k] : pct >= 40 ? "#b45309" : "#d0d0d0";
      return `<div style="margin-bottom:9px">
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:3px">
          <tr>
            <td style="font-size:11px;color:#555">${dimLabels[k]} <span style="color:#aaa">(${dimWeights[k]})</span></td>
            <td style="text-align:right;font-size:11px;font-weight:700;color:${c}">${pct}%</td>
          </tr>
        </table>
        ${scoreBar(pct, c)}
      </div>`;
    }).join("");

    const reasons = (sol.matchReasons || []).map(r =>
      `<div style="display:flex;gap:8px;margin-bottom:7px">
        <span style="color:#1a8a4a;font-size:13px;flex-shrink:0">✓</span>
        <span style="font-size:12px;color:#444;line-height:1.5">${r}</span>
      </div>`
    ).join("");

    return `
      <div style="margin-bottom:28px;border:2px solid ${rank === 0 ? "#6B2C94" : "#e8e8e8"};border-radius:5px;page-break-inside:avoid">
        ${rank === 0 ? `<div style="background:#6B2C94;padding:7px 20px;font-size:10px;font-weight:800;color:#fff;letter-spacing:1px;text-transform:uppercase">Best Match for Your Profile</div>` : ""}

        <!-- Solution header -->
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#fafafa;border-bottom:1px solid #e8e8e8">
          <tr>
            <td style="padding:16px 20px;vertical-align:top">
              <div style="font-size:10px;color:#aaa;margin-bottom:2px">#${rank + 1}</div>
              <div style="font-size:17px;font-weight:800;color:#111">${sol.title}</div>
              <div style="font-size:12px;color:#666;margin-top:4px;line-height:1.55;max-width:480px">${sol.description}</div>
            </td>
            <td style="padding:16px 20px;text-align:right;vertical-align:top;width:100px">
              <div style="font-size:28px;font-weight:900;color:${fitColor};line-height:1">${sol.matchScore}%</div>
              <div style="font-size:9px;font-weight:800;color:${fitColor};background:${fitColor}18;border:1px solid ${fitColor}44;padding:2px 8px;border-radius:2px;text-transform:uppercase;letter-spacing:0.6px;margin-top:4px;display:inline-block">${fitLabel}</div>
            </td>
          </tr>
          <tr>
            <td colspan="2" style="padding:0 20px 14px">
              <div class="score-bar-track">
                <div style="width:${sol.matchScore}%;height:100%;background:${fitColor};border-radius:3px"></div>
              </div>
            </td>
          </tr>
        </table>

        <!-- Why this match -->
        <div style="padding:16px 20px;border-bottom:1px solid #f4f4f4">
          <div style="font-size:10px;font-weight:700;color:#aaa;text-transform:uppercase;letter-spacing:0.6px;margin-bottom:10px">Why This Match</div>
          ${reasons || '<span style="font-size:12px;color:#aaa">General fit based on your profile.</span>'}
        </div>

        <!-- Expected outcomes + score breakdown side by side (table) -->
        <table width="100%" cellpadding="0" cellspacing="0" style="border-bottom:1px solid #f4f4f4">
          <tr>
            <td style="padding:16px 20px;vertical-align:top;width:55%">
              <div style="font-size:10px;font-weight:700;color:#aaa;text-transform:uppercase;letter-spacing:0.6px;margin-bottom:10px">Expected Outcomes</div>
              <table width="100%" cellpadding="0" cellspacing="0" class="data">${outcomeRows}</table>
            </td>
            <td style="padding:16px 20px;vertical-align:top;border-left:1px solid #f0f0f0">
              <div style="font-size:10px;font-weight:700;color:#aaa;text-transform:uppercase;letter-spacing:0.6px;margin-bottom:10px">Score Breakdown</div>
              ${dimBars}
            </td>
          </tr>
        </table>

        <!-- Roadmap -->
        <div style="padding:16px 20px">
          <div style="font-size:10px;font-weight:700;color:#aaa;text-transform:uppercase;letter-spacing:0.6px;margin-bottom:12px">Implementation Roadmap</div>
          ${phaseRows}
        </div>
      </div>`;
  }).join("");

  const otherCards = others.map(sol => {
    const c = sol.matchScore >= 70 ? "#6B2C94" : sol.matchScore >= 55 ? "#1a5fa8" : "#999";
    return `<table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e8e8e8;border-radius:4px;margin-bottom:12px">
      <tr>
        <td style="padding:13px 16px 6px;vertical-align:middle">
          <span style="font-size:13px;font-weight:700;color:#111">${sol.title}</span>
        </td>
        <td style="padding:13px 16px 6px;text-align:right;vertical-align:middle;width:60px">
          <span style="font-size:14px;font-weight:900;color:${c}">${sol.matchScore}%</span>
        </td>
      </tr>
      <tr>
        <td colspan="2" style="padding:0 16px 5px">
          <div class="score-bar-track">
            <div style="width:${sol.matchScore}%;height:100%;background:${c};border-radius:3px"></div>
          </div>
        </td>
      </tr>
      <tr>
        <td colspan="2" style="padding:0 16px 13px">
          <div style="font-size:11px;color:#666;line-height:1.5">${sol.description.slice(0, 100)}…</div>
        </td>
      </tr>
    </table>`;
  }).join("");

  const findingRows = profile.findings.map(f =>
    `<div style="display:flex;gap:12px;align-items:flex-start;margin-bottom:12px">
      <span style="font-size:9px;font-weight:800;padding:3px 7px;border-radius:2px;text-transform:uppercase;color:${f.risk === "high" ? "#c0392b" : "#b45309"};background:${f.risk === "high" ? "#fdf0ef" : "#fef3e2"};flex-shrink:0">${f.risk}</span>
      <div>
        <div style="font-size:12px;font-weight:700;color:#111;margin-bottom:2px">${f.label}</div>
        <div style="font-size:11px;color:#666;line-height:1.5">${f.desc}</div>
      </div>
    </div>`
  ).join("");

  const urgencyColor = profile.urgency === "Critical" ? "#c0392b" : profile.urgency === "High" ? "#b45309" : profile.urgency === "Medium" ? "#1a5fa8" : "#1a8a4a";

  const dxcLogo = `<svg width="120" height="34" viewBox="0 0 160 44" fill="none" xmlns="http://www.w3.org/2000/svg">
    <text x="0" y="36" font-family="Arial Black,Arial" font-weight="900" font-size="38" fill="#6B2C94">D</text>
    <text x="26" y="36" font-family="Arial Black,Arial" font-weight="900" font-size="38" fill="#6B2C94">X</text>
    <text x="54" y="36" font-family="Arial Black,Arial" font-weight="900" font-size="38" fill="#6B2C94">C</text>
    <text x="86" y="36" font-family="Arial,sans-serif" font-weight="400" font-size="13" fill="#666">Technology</text>
  </svg>`;

  const dxcLogoWhite = `<svg width="120" height="34" viewBox="0 0 160 44" fill="none" xmlns="http://www.w3.org/2000/svg">
    <text x="0" y="36" font-family="Arial Black,Arial" font-weight="900" font-size="38" fill="white">D</text>
    <text x="26" y="36" font-family="Arial Black,Arial" font-weight="900" font-size="38" fill="white">X</text>
    <text x="54" y="36" font-family="Arial Black,Arial" font-weight="900" font-size="38" fill="white">C</text>
    <text x="86" y="36" font-family="Arial,sans-serif" font-weight="400" font-size="13" fill="rgba(255,255,255,0.65)">Technology</text>
  </svg>`;

  const pageHeader = (section, title) =>
    `<table width="100%" cellpadding="0" cellspacing="0" style="border-bottom:2px solid #6B2C94;margin-bottom:28px">
      <tr>
        <td style="padding-bottom:12px;font-size:10px;font-weight:700;color:#6B2C94;text-transform:uppercase;letter-spacing:1.5px">${section}</td>
        <td style="padding-bottom:12px;font-size:17px;font-weight:800;color:#111;text-align:right">${title}</td>
      </tr>
    </table>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>DXC AI Solution Matching Report</title>
<style>
  * { box-sizing:border-box; margin:0; padding:0; }
  body { font-family:'Segoe UI',Arial,sans-serif; color:#111; background:#fff; width:794px; margin:0 auto; }
  .page { width:794px; padding:52px 60px; }
  .cover { width:794px; height:1123px; padding:60px; background:#fff; }
  .back-cover { width:794px; background:#6B2C94; padding:64px 60px; }
  .section-label { font-size:10px; font-weight:700; color:#6B2C94; text-transform:uppercase; letter-spacing:1.5px; margin-bottom:4px; }
  .section-title { font-size:17px; font-weight:800; color:#111; }
  .divider { height:2px; background:#6B2C94; margin-bottom:28px; }
  .card { border:1px solid #e8e8e8; border-radius:5px; padding:20px 22px; margin-bottom:20px; }
  .badge { display:inline-block; font-size:10px; font-weight:700; padding:3px 9px; border-radius:3px; text-transform:uppercase; letter-spacing:0.5px; }
  .tag { display:inline-block; font-size:10px; padding:2px 8px; border-radius:2px; background:#f5eefb; color:#6B2C94; margin:2px 2px 2px 0; }
  .score-bar-track { height:6px; background:#e8e8e8; border-radius:3px; }
  .sol-header { background:#fafafa; border-bottom:1px solid #e8e8e8; padding:16px 22px; }
  .sol-body { padding:20px 22px; }
  table.data td { padding:7px 10px; border-bottom:1px solid #f0f0f0; font-size:12px; }
</style>
</head>
<body>

<!-- ═══════════════════════════ COVER PAGE ═══════════════════════════ -->
<div class="cover">

  <!-- Top bar -->
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td>${dxcLogo}<div style="margin-top:6px;font-size:10px;color:#999;letter-spacing:1.5px;text-transform:uppercase">Data &amp; AI Advisory</div></td>
      <td style="text-align:right;vertical-align:top">
        <div style="font-size:11px;color:#999">Confidential</div>
        <div style="font-size:11px;color:#999;margin-top:3px">${date}</div>
      </td>
    </tr>
  </table>

  <!-- Hero area -->
  <div style="margin-top:120px">
    <div style="width:56px;height:4px;background:#6B2C94;margin-bottom:28px"></div>
    <div style="font-size:12px;font-weight:700;color:#6B2C94;letter-spacing:2.5px;text-transform:uppercase;margin-bottom:14px">AI Solution Matching Report</div>
    <div style="font-size:40px;font-weight:900;color:#111;line-height:1.15;margin-bottom:20px">Your Personalised<br/>AI Strategy Brief</div>
    <div style="font-size:15px;color:#555;line-height:1.8;max-width:520px">
      Based on your profile and stated priorities, DXC has evaluated <strong>${matches.length} solutions</strong> and identified <strong>${top5.length} top recommendations</strong> tailored to your organisation's context.
    </div>
  </div>

  <!-- Profile cards (table-based for reliable layout) -->
  <table width="100%" cellpadding="0" cellspacing="10" style="margin-top:44px">
    <tr>
      <td width="25%" style="padding:14px 18px;background:#f5eefb;border:1px solid #ede0f7;border-radius:4px">
        <div style="font-size:10px;font-weight:700;color:#6B2C94;text-transform:uppercase;letter-spacing:0.6px;margin-bottom:5px">Industry</div>
        <div style="font-size:14px;font-weight:800;color:#111">${industryLabel}</div>
      </td>
      <td width="25%" style="padding:14px 18px;background:#f5eefb;border:1px solid #ede0f7;border-radius:4px">
        <div style="font-size:10px;font-weight:700;color:#6B2C94;text-transform:uppercase;letter-spacing:0.6px;margin-bottom:5px">Organisation</div>
        <div style="font-size:14px;font-weight:800;color:#111">${sizeLabel}</div>
      </td>
      <td width="25%" style="padding:14px 18px;background:#f5eefb;border:1px solid #ede0f7;border-radius:4px">
        <div style="font-size:10px;font-weight:700;color:#6B2C94;text-transform:uppercase;letter-spacing:0.6px;margin-bottom:5px">Primary Goal</div>
        <div style="font-size:14px;font-weight:800;color:#111">${goalLabel}</div>
      </td>
      <td width="25%" style="padding:14px 18px;background:${urgencyColor}12;border:1px solid ${urgencyColor}44;border-radius:4px">
        <div style="font-size:10px;font-weight:700;color:${urgencyColor};text-transform:uppercase;letter-spacing:0.6px;margin-bottom:5px">Urgency</div>
        <div style="font-size:14px;font-weight:800;color:${urgencyColor}">${profile.urgency}</div>
      </td>
    </tr>
  </table>

  <!-- Cover footer -->
  <div style="position:absolute;bottom:52px;left:60px;right:60px;border-top:1px solid #e8e8e8;padding-top:16px">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="font-size:11px;color:#aaa">Generated by AI Watch · DXC Technology</td>
        <td style="text-align:right;font-size:11px;color:#aaa">dxc.com</td>
      </tr>
    </table>
  </div>
</div>

<!-- ═══════════════════════ SECTION 1 — NEEDS ANALYSIS ═══════════════════════ -->
<div class="page" style="page-break-before:always">

  ${pageHeader("Section 1", "Client Needs Assessment")}

  <!-- Maturity score row -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5eefb;border-left:4px solid #6B2C94;border-radius:4px;margin-bottom:20px">
    <tr>
      <td style="padding:22px 24px;vertical-align:top">
        <div style="font-size:13px;font-weight:700;color:#111;margin-bottom:8px">${industryLabel} &middot; ${sizeLabel}</div>
        <span class="badge" style="color:${urgencyColor};background:${urgencyColor}18;border:1px solid ${urgencyColor}44;margin-right:6px">${profile.urgency} Urgency</span>
        <span class="badge" style="color:#444;background:#fff;border:1px solid #e0e0e0;margin-right:6px">Goal: ${goalLabel}</span>
        <span class="badge" style="color:#444;background:#fff;border:1px solid #e0e0e0">${profile.profile.label}</span>
        <p style="font-size:12px;color:#555;line-height:1.7;margin-top:12px">${profile.narrative}</p>
      </td>
      <td style="padding:22px 24px;text-align:center;vertical-align:top;width:140px;border-left:1px solid #ede0f7">
        <div style="font-size:44px;font-weight:900;color:#6B2C94;line-height:1">${profile.maturityScore}</div>
        <div style="font-size:9px;font-weight:700;color:#aaa;text-transform:uppercase;letter-spacing:0.6px;margin-top:4px">AI Maturity Index</div>
        <div class="score-bar-track" style="margin-top:8px">
          <div style="width:${profile.maturityScore}%;height:100%;background:#6B2C94;border-radius:3px"></div>
        </div>
        <div style="font-size:11px;font-weight:700;color:#6B2C94;margin-top:6px">${profile.profile.label}</div>
      </td>
    </tr>
  </table>

  <!-- Key findings -->
  <div class="card" style="margin-bottom:16px">
    <div class="section-label" style="margin-bottom:14px">Key Risk Findings</div>
    ${findingRows || '<p style="font-size:12px;color:#aaa">No critical risks identified.</p>'}
  </div>

  <!-- Industry Benchmark -->
  <div class="card">
    <div class="section-label" style="margin-bottom:14px">Industry Benchmark</div>
    <div style="background:#f5eefb;border-left:3px solid #6B2C94;padding:12px 16px;border-radius:3px;margin-bottom:12px">
      <p style="font-size:12px;color:#555;line-height:1.65;font-style:italic">&ldquo;${profile.benchmark.stat}&rdquo;</p>
    </div>
    <div style="font-size:11px;color:#999;margin-bottom:3px">Reference peers:</div>
    <div style="font-size:12px;font-weight:700;color:#6B2C94">${profile.benchmark.peers}</div>
  </div>
</div>

<!-- ═══════════════════════ SECTION 2 — SOLUTIONS ═══════════════════════ -->
<div class="page" style="page-break-before:always">
  ${pageHeader("Section 2", "Top Matched Solutions")}
  ${solutionBlocks}
</div>

${others.length > 0 ? `
<!-- ═══════════════════════ SECTION 3 — ALSO CONSIDERED ═══════════════════════ -->
<div class="page" style="page-break-before:always">
  ${pageHeader("Section 3", `Also Considered — ${others.length} Solutions`)}
  ${otherCards}
</div>` : ""}

<!-- ═══════════════════════ BACK COVER ═══════════════════════ -->
<div class="back-cover" style="page-break-before:always">
  ${dxcLogoWhite}
  <div style="margin-top:80px">
    <div style="width:52px;height:3px;background:rgba(255,255,255,0.35);margin-bottom:24px"></div>
    <div style="font-size:26px;font-weight:800;color:#fff;margin-bottom:14px;line-height:1.3">Ready to move forward?</div>
    <div style="font-size:14px;color:rgba(255,255,255,0.75);line-height:1.8;max-width:460px;margin-bottom:32px">
      Book a free 30-minute session with a DXC Data &amp; AI advisor to validate these recommendations and define your implementation roadmap.
    </div>
    <div style="display:inline-block;padding:13px 26px;background:#fff;border-radius:4px;font-size:13px;font-weight:700;color:#6B2C94">
      Contact DXC &mdash; dxc.com/ai-advisory
    </div>
  </div>
  <div style="margin-top:64px;font-size:11px;color:rgba(255,255,255,0.35)">
    &copy; ${new Date().getFullYear()} DXC Technology. All rights reserved. This report is confidential and intended solely for the named recipient.
  </div>
</div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
<script>
  window.onload = function() {
    var opt = {
      margin: 0,
      filename: 'DXC-AI-Solution-Report.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(document.body).save().then(function() {
      window.close();
    });
  };
</script>
</body>
</html>`;
}

function downloadReport(answers, matches, profile) {
  const html = buildReportHTML(answers, matches, profile);
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
}

function Results({ answers, matches, onRestart }) {
  const profile = generateProfile(answers);
  const top5 = matches.slice(0, 5);
  const allOthers = matches.slice(5);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: B.gray900, marginBottom: 4 }}>Your Personalised Analysis</h2>
          <p style={{ fontSize: 13, color: B.gray500 }}>
            {matches.length} solutions evaluated — top 5 recommendations below
          </p>
        </div>
        <button
          onClick={onRestart}
          style={{ padding: "9px 20px", background: B.white, border: `1px solid ${B.gray200}`, borderRadius: 4, fontSize: 12, fontWeight: 600, color: B.gray600, cursor: "pointer" }}
        >
          Start Over
        </button>
      </div>

      <NeedsAnalysis profile={profile} answers={answers} />

      <div style={{ fontSize: 12, fontWeight: 700, color: B.gray500, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 16 }}>
        Top 5 Matched Solutions
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 32 }}>
        {top5.map((sol, i) => (
          <MatchCard key={sol.id} solution={sol} rank={i} answers={answers} />
        ))}
      </div>

      {/* Other solutions */}
      {allOthers.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: B.gray500, textTransform: "uppercase", letterSpacing: 0.6 }}>
              Also Considered
            </div>
            <span style={{
              fontSize: 10, fontWeight: 700, color: B.gray400,
              background: B.gray100, border: `1px solid ${B.gray200}`,
              padding: "1px 8px", borderRadius: 10,
            }}>
              {allOthers.length} solutions
            </span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
            {allOthers.map(sol => {
              const scoreColor = sol.matchScore >= 70 ? B.purple : sol.matchScore >= 55 ? B.blue : B.gray400;
              const pct = sol.matchScore;
              return (
                <div key={sol.id} style={{
                  padding: "14px 16px", background: B.white,
                  border: `1px solid ${B.gray200}`, borderRadius: 4,
                  transition: "border-color 0.15s, box-shadow 0.15s",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: B.gray800 || B.gray700, lineHeight: 1.3, flex: 1, marginRight: 10 }}>
                      {sol.title}
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 900, color: scoreColor, flexShrink: 0, lineHeight: 1 }}>
                      {pct}%
                    </div>
                  </div>
                  <div style={{ height: 3, background: B.gray100, borderRadius: 2, overflow: "hidden", marginBottom: 8 }}>
                    <div style={{
                      width: `${pct}%`, height: "100%",
                      background: scoreColor, borderRadius: 2,
                      transition: "width 0.8s ease",
                    }} />
                  </div>
                  <div style={{ fontSize: 11, color: B.gray500, lineHeight: 1.4 }}>
                    {sol.description.length > 72 ? sol.description.slice(0, 72) + "…" : sol.description}
                  </div>
                  {sol.dims?.challenge && (
                    <div style={{ marginTop: 8, display: "flex", gap: 4, flexWrap: "wrap" }}>
                      {sol.tags?.slice(0, 3).map(tag => (
                        <span key={tag} style={{
                          fontSize: 9, fontWeight: 600, color: B.gray500,
                          background: B.gray100, padding: "2px 6px", borderRadius: 2,
                          textTransform: "uppercase", letterSpacing: 0.3,
                        }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CTA Banner */}
      <div style={{
        background: B.purplePale, borderLeft: `4px solid ${B.purple}`,
        border: `1px solid ${B.purple}22`, borderRadius: 4, padding: "32px",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 24 }}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: B.purple, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
              Next Step
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: B.gray900, marginBottom: 10 }}>
              Get your full roadmap — free 30-minute session
            </h3>
            <p style={{ fontSize: 13, color: B.gray600, lineHeight: 1.7 }}>
              A DXC Data & AI advisor will review your profile, validate these recommendations against your real environment, and deliver a tailored implementation roadmap with a budget estimate.
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button
              style={{ padding: "13px 28px", background: B.purple, border: `2px solid ${B.purple}`, borderRadius: 4, fontSize: 13, fontWeight: 700, color: B.white, cursor: "pointer", whiteSpace: "nowrap" }}
              onMouseEnter={e => e.currentTarget.style.background = B.purpleDeep}
              onMouseLeave={e => e.currentTarget.style.background = B.purple}
            >
              Book Discovery Call
            </button>
            <button
              onClick={() => downloadReport(answers, matches, profile)}
              style={{ padding: "13px 28px", background: B.white, border: `2px solid ${B.purple}`, borderRadius: 4, fontSize: 13, fontWeight: 700, color: B.purple, cursor: "pointer", whiteSpace: "nowrap" }}
              onMouseEnter={e => { e.currentTarget.style.background = B.purple; e.currentTarget.style.color = B.white; }}
              onMouseLeave={e => { e.currentTarget.style.background = B.white; e.currentTarget.style.color = B.purple; }}
            >
              Download Full Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function Matching() {
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [phase, setPhase] = useState("questions"); // questions | analyzing | results
  const [matches, setMatches] = useState(null);

  function handleChange(key, value) {
    setAnswers(prev => ({ ...prev, [key]: value }));
  }

  function handleNext() {
    if (stepIndex < STEPS.length - 1) {
      setStepIndex(s => s + 1);
    } else {
      setPhase("analyzing");
      setTimeout(() => {
        setMatches(scoreAnswers(answers));
        setPhase("results");
      }, 2800);
    }
  }

  function handleBack() {
    setStepIndex(s => Math.max(0, s - 1));
  }

  function handleRestart() {
    setStepIndex(0);
    setAnswers({});
    setMatches(null);
    setPhase("questions");
  }

  return (
    <div style={{ minHeight: "100vh", background: B.white }}>
      <div style={{ padding: "24px 32px 20px", borderBottom: `1px solid ${B.gray200}` }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: B.gray900, marginBottom: 4 }}>Solution Matching</h1>
        <p style={{ fontSize: 13, color: B.gray500 }}>
          Answer 7 questions and receive a personalised needs analysis with matched DXC solutions.
        </p>
      </div>

      <div style={{ maxWidth: phase === "results" ? 900 : 620, margin: "0 auto", padding: "40px 24px" }}>
        {phase === "questions" && (
          <>
            <ProgressBar step={stepIndex + 1} total={STEPS.length} />
            <QuestionStep
              step={STEPS[stepIndex]}
              answers={answers}
              onChange={handleChange}
              onNext={handleNext}
              onBack={handleBack}
              isFirst={stepIndex === 0}
            />
          </>
        )}
        {phase === "analyzing" && <AnalyzingScreen />}
        {phase === "results" && matches && (
          <Results answers={answers} matches={matches} onRestart={handleRestart} />
        )}
      </div>
    </div>
  );
}
