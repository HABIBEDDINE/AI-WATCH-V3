import { useState, useEffect, useCallback } from "react";
import { getArticles, getNewsletterStatus, sendNewsletterNow, subscribeEmail, unsubscribeEmail } from "../services/api";

const B = {
  purple: "#6B2C94",
  purpleDeep: "#4a1870",
  purplePale: "#f5eefb",
  purpleMid: "#e0cff0",
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
};

const TOPICS = ["All", "AI", "Fintech", "HealthTech", "Cybersecurity", "CleanTech", "Robotics"];

const TOPIC_LABELS = {
  All: "All Topics",
  AI: "Artificial Intelligence",
  Fintech: "Financial Technology",
  HealthTech: "Health Technology",
  Cybersecurity: "Cybersecurity",
  CleanTech: "Clean Technology",
  Robotics: "Robotics & Automation",
};

const SIGNAL_BADGE = {
  Strong: { bg: "#e8f5ee", color: "#1a8a4a", label: "Strong Signal" },
  Weak:   { bg: "#fef3e2", color: "#b45309", label: "Emerging Signal" },
};

function formatDate(dateStr) {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function formatNewsletter(articles, topic, issueDate) {
  const topicLabel = TOPIC_LABELS[topic] || topic;
  const strong = articles.filter(a => a.signal === "Strong");
  const weak = articles.filter(a => a.signal !== "Strong");

  let text = "";
  text += `AI WATCH — STRATEGIC INTELLIGENCE BRIEF\n`;
  text += `${topicLabel} Edition · ${issueDate}\n`;
  text += `${"─".repeat(60)}\n\n`;

  if (strong.length > 0) {
    text += `TOP SIGNALS THIS WEEK\n\n`;
    strong.forEach((a, i) => {
      text += `${i + 1}. ${a.title}\n`;
      if (a.summary) text += `   ${a.summary.slice(0, 200)}${a.summary.length > 200 ? "..." : ""}\n`;
      if (a.source) text += `   Source: ${a.source}`;
      if (a.published_at) text += `  ·  ${formatDate(a.published_at)}`;
      text += "\n\n";
    });
  }

  if (weak.length > 0) {
    text += `EMERGING SIGNALS TO WATCH\n\n`;
    weak.forEach((a, i) => {
      text += `${i + 1}. ${a.title}\n`;
      if (a.summary) text += `   ${a.summary.slice(0, 160)}${a.summary.length > 160 ? "..." : ""}\n`;
      if (a.source) text += `   Source: ${a.source}`;
      if (a.published_at) text += `  ·  ${formatDate(a.published_at)}`;
      text += "\n\n";
    });
  }

  text += `${"─".repeat(60)}\n`;
  text += `AI Watch · Strategic Intelligence Platform\n`;
  text += `${articles.length} articles curated · ${topicLabel}\n`;

  return text;
}

function ArticleRow({ article, selected, onToggle }) {
  const signal = SIGNAL_BADGE[article.signal] || SIGNAL_BADGE.Weak;
  return (
    <div
      onClick={onToggle}
      style={{
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
        padding: "12px 14px",
        borderBottom: `1px solid ${B.gray100}`,
        cursor: "pointer",
        background: selected ? B.purplePale : B.white,
        transition: "background 0.15s",
      }}
    >
      <div style={{
        width: 16,
        height: 16,
        border: `2px solid ${selected ? B.purple : B.gray300}`,
        borderRadius: 3,
        background: selected ? B.purple : B.white,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        marginTop: 2,
      }}>
        {selected && <span style={{ color: B.white, fontSize: 10, lineHeight: 1 }}>✓</span>}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13,
          fontWeight: 600,
          color: B.gray900,
          marginBottom: 4,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}>
          {article.title}
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          {article.topic && (
            <span style={{
              fontSize: 10,
              fontWeight: 700,
              background: B.purpleMid,
              color: B.purpleDeep,
              padding: "2px 7px",
              borderRadius: 3,
            }}>
              {article.topic}
            </span>
          )}
          <span style={{
            fontSize: 10,
            fontWeight: 700,
            background: signal.bg,
            color: signal.color,
            padding: "2px 7px",
            borderRadius: 3,
          }}>
            {signal.label}
          </span>
          {article.source && (
            <span style={{ fontSize: 10, color: B.gray400 }}>{article.source}</span>
          )}
          {article.published_at && (
            <span style={{ fontSize: 10, color: B.gray400 }}>{formatDate(article.published_at)}</span>
          )}
        </div>
      </div>
    </div>
  );
}

function NewsletterPreview({ articles, topic, issueDate }) {
  const strong = articles.filter(a => a.signal === "Strong");
  const other = articles.filter(a => a.signal !== "Strong");
  const topicLabel = TOPIC_LABELS[topic] || topic;

  return (
    <div style={{
      border: `1px solid ${B.gray200}`,
      borderRadius: 6,
      overflow: "hidden",
      fontFamily: "Georgia, serif",
      fontSize: 14,
      lineHeight: 1.6,
    }}>
      {/* Email header */}
      <div style={{
        background: B.purpleDeep,
        padding: "28px 32px",
        color: B.white,
      }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: "rgba(255,255,255,0.6)", marginBottom: 8 }}>
          STRATEGIC INTELLIGENCE
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5, marginBottom: 4 }}>
          AI Watch Brief
        </div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.75)" }}>
          {topicLabel} Edition &nbsp;·&nbsp; {issueDate}
        </div>
      </div>

      {/* Divider bar */}
      <div style={{ height: 4, background: `linear-gradient(90deg, ${B.purple}, #c084fc)` }} />

      <div style={{ padding: "24px 32px", background: B.white }}>
        {/* Intro */}
        <p style={{ fontSize: 13, color: B.gray500, marginBottom: 24, borderBottom: `1px solid ${B.gray100}`, paddingBottom: 16 }}>
          Your curated AI intelligence brief featuring <strong style={{ color: B.gray900 }}>{articles.length} signal{articles.length !== 1 ? "s" : ""}</strong> from across the industry landscape.
        </p>

        {articles.length === 0 && (
          <p style={{ color: B.gray400, fontStyle: "italic", textAlign: "center", padding: "32px 0" }}>
            Select articles from the list to include them in this brief.
          </p>
        )}

        {/* Strong signals */}
        {strong.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <div style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: 1.5,
              color: B.green,
              marginBottom: 14,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: B.green, display: "inline-block" }} />
              TOP SIGNALS THIS WEEK
            </div>
            {strong.map((a, i) => (
              <div key={a.id || i} style={{
                borderLeft: `3px solid ${B.green}`,
                paddingLeft: 14,
                marginBottom: 20,
              }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: B.gray900, marginBottom: 5 }}>
                  {a.title}
                </div>
                {a.summary && (
                  <div style={{ fontSize: 13, color: B.gray600, lineHeight: 1.65, marginBottom: 6 }}>
                    {a.summary.length > 220 ? a.summary.slice(0, 220) + "…" : a.summary}
                  </div>
                )}
                <div style={{ fontSize: 11, color: B.gray400 }}>
                  {a.source && <span>{a.source}</span>}
                  {a.source && a.published_at && <span> · </span>}
                  {a.published_at && <span>{formatDate(a.published_at)}</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Emerging signals */}
        {other.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <div style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: 1.5,
              color: B.amber,
              marginBottom: 14,
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: B.amber, display: "inline-block" }} />
              EMERGING SIGNALS TO WATCH
            </div>
            {other.map((a, i) => (
              <div key={a.id || i} style={{
                borderLeft: `3px solid ${B.gray200}`,
                paddingLeft: 14,
                marginBottom: 16,
              }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: B.gray900, marginBottom: 4 }}>
                  {a.title}
                </div>
                {a.summary && (
                  <div style={{ fontSize: 12, color: B.gray500, lineHeight: 1.6, marginBottom: 4 }}>
                    {a.summary.length > 160 ? a.summary.slice(0, 160) + "…" : a.summary}
                  </div>
                )}
                <div style={{ fontSize: 11, color: B.gray400 }}>
                  {a.source && <span>{a.source}</span>}
                  {a.source && a.published_at && <span> · </span>}
                  {a.published_at && <span>{formatDate(a.published_at)}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        background: B.gray50,
        borderTop: `1px solid ${B.gray100}`,
        padding: "16px 32px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <div style={{ fontSize: 11, color: B.gray400 }}>
          AI Watch · Strategic Intelligence Platform
        </div>
        <div style={{ fontSize: 11, color: B.gray400 }}>
          {articles.length} article{articles.length !== 1 ? "s" : ""} · {topicLabel}
        </div>
      </div>
    </div>
  );
}

export default function Newsletter() {
  const [topic, setTopic] = useState("All");
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [copied, setCopied] = useState(false);
  const [pageSize] = useState(20);

  // Email delivery state
  const [nlStatus, setNlStatus] = useState(null);
  const [nlLoading, setNlLoading] = useState(false);
  const [sendResult, setSendResult] = useState(null);
  const [emailInput, setEmailInput] = useState("");
  const [emailAction, setEmailAction] = useState(null); // "adding" | "removing"

  const issueDate = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { pageSize, page: 1 };
      if (topic !== "All") params.topic = topic;
      const data = await getArticles(params);
      const list = Array.isArray(data) ? data : (data?.articles || data?.items || []);
      setArticles(list);
      // Auto-select first 8
      const ids = new Set(list.slice(0, 8).map((a, i) => a.id ?? i));
      setSelected(ids);
    } catch (e) {
      setError(e.message);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, [topic, pageSize]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const fetchNlStatus = useCallback(async () => {
    try {
      const s = await getNewsletterStatus();
      setNlStatus(s);
    } catch {
      // backend may not support it yet — silently ignore
    }
  }, []);

  useEffect(() => {
    fetchNlStatus();
    const interval = setInterval(fetchNlStatus, 15000);
    return () => clearInterval(interval);
  }, [fetchNlStatus]);

  const handleSendNow = async () => {
    setNlLoading(true);
    setSendResult(null);
    try {
      const res = await sendNewsletterNow("cto");
      setSendResult({ ok: true, msg: res.message || "Newsletter send started." });
      setTimeout(fetchNlStatus, 5000);
    } catch (e) {
      setSendResult({ ok: false, msg: e.message });
    } finally {
      setNlLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!emailInput.trim()) return;
    setEmailAction("adding");
    try {
      const res = await subscribeEmail(emailInput.trim());
      setNlStatus(s => s ? { ...s, recipients: res.recipients, recipient_count: res.recipients.length } : s);
      setEmailInput("");
    } catch (e) {
      setSendResult({ ok: false, msg: e.message });
    } finally {
      setEmailAction(null);
    }
  };

  const handleUnsubscribe = async (email) => {
    setEmailAction("removing");
    try {
      const res = await unsubscribeEmail(email);
      setNlStatus(s => s ? { ...s, recipients: res.recipients, recipient_count: res.recipients.length } : s);
    } catch (e) {
      setSendResult({ ok: false, msg: e.message });
    } finally {
      setEmailAction(null);
    }
  };

  const toggleArticle = (article, index) => {
    const key = article.id ?? index;
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const selectedArticles = articles.filter((a, i) => selected.has(a.id ?? i));

  const handleSelectAll = () => {
    if (selected.size === articles.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(articles.map((a, i) => a.id ?? i)));
    }
  };

  const handleCopy = async () => {
    const text = formatNewsletter(selectedArticles, topic, issueDate);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div style={{ background: B.white, padding: "24px 28px", minHeight: "100%" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: B.gray900, marginBottom: 4 }}>Newsletter Builder</h2>
            <p style={{ fontSize: 12, color: B.gray500 }}>
              Generate AI Watch intelligence briefs from the latest signals — curate, preview, and copy.
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            {/* Topic filter */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {TOPICS.map(t => (
                <button
                  key={t}
                  onClick={() => setTopic(t)}
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "5px 12px",
                    borderRadius: 20,
                    border: `1.5px solid ${topic === t ? B.purple : B.gray200}`,
                    background: topic === t ? B.purple : B.white,
                    color: topic === t ? B.white : B.gray600,
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
        gap: 12,
        marginBottom: 24,
      }}>
        {[
          { label: "Articles Loaded", value: articles.length },
          { label: "Selected", value: selectedArticles.length },
          { label: "Strong Signals", value: selectedArticles.filter(a => a.signal === "Strong").length },
          { label: "Emerging Signals", value: selectedArticles.filter(a => a.signal !== "Strong").length },
        ].map(s => (
          <div key={s.label} style={{
            background: B.gray50,
            border: `1px solid ${B.gray100}`,
            borderRadius: 4,
            padding: "12px 16px",
          }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: B.purple }}>{s.value}</div>
            <div style={{ fontSize: 10, fontWeight: 600, color: B.gray400, letterSpacing: 0.3 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Main layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "start" }}>
        {/* Left: Article selector */}
        <div style={{
          border: `1px solid ${B.gray200}`,
          borderRadius: 6,
          overflow: "hidden",
        }}>
          <div style={{
            padding: "12px 14px",
            background: B.gray50,
            borderBottom: `1px solid ${B.gray200}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: B.gray700 }}>
              Article Pool
            </span>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {loading && (
                <span style={{ fontSize: 11, color: B.gray400 }}>Loading...</span>
              )}
              <button
                onClick={handleSelectAll}
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  padding: "4px 10px",
                  borderRadius: 3,
                  border: `1px solid ${B.gray200}`,
                  background: B.white,
                  color: B.gray600,
                  cursor: "pointer",
                }}
              >
                {selected.size === articles.length && articles.length > 0 ? "Deselect All" : "Select All"}
              </button>
            </div>
          </div>

          {error && (
            <div style={{ padding: "16px 14px", background: "#fff5f5", borderBottom: `1px solid #fecaca` }}>
              <span style={{ fontSize: 12, color: "#dc2626" }}>Failed to load articles: {error}</span>
            </div>
          )}

          {!loading && !error && articles.length === 0 && (
            <div style={{ padding: "32px 14px", textAlign: "center" }}>
              <p style={{ fontSize: 13, color: B.gray400 }}>No articles found for this topic.</p>
            </div>
          )}

          <div style={{ maxHeight: 520, overflowY: "auto" }}>
            {articles.map((article, i) => (
              <ArticleRow
                key={article.id ?? i}
                article={article}
                selected={selected.has(article.id ?? i)}
                onToggle={() => toggleArticle(article, i)}
              />
            ))}
          </div>
        </div>

        {/* Right: Newsletter preview */}
        <div>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: B.gray700 }}>
              Newsletter Preview
            </span>
            <button
              onClick={handleCopy}
              disabled={selectedArticles.length === 0}
              style={{
                fontSize: 11,
                fontWeight: 700,
                padding: "7px 16px",
                borderRadius: 4,
                border: "none",
                background: selectedArticles.length === 0 ? B.gray200 : (copied ? B.green : B.purple),
                color: selectedArticles.length === 0 ? B.gray400 : B.white,
                cursor: selectedArticles.length === 0 ? "not-allowed" : "pointer",
                transition: "background 0.2s",
              }}
            >
              {copied ? "Copied!" : "Copy as Text"}
            </button>
          </div>

          <NewsletterPreview
            articles={selectedArticles}
            topic={topic}
            issueDate={issueDate}
          />
        </div>
      </div>

      {/* ── Email Delivery Panel ─────────────────────────────────────── */}
      <div style={{ marginTop: 28, borderTop: `1px solid ${B.gray100}`, paddingTop: 24 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: B.gray900, marginBottom: 4 }}>Email Delivery</h3>
        <p style={{ fontSize: 11, color: B.gray500, marginBottom: 20 }}>
          Newsletters are automatically sent every day at <strong>07:00 UTC</strong>. You can also trigger a send manually below.
        </p>

        {/* Status row */}
        {nlStatus && (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 12,
            marginBottom: 20,
          }}>
            {[
              {
                label: "SMTP Status",
                value: nlStatus.smtp_configured ? "Configured" : "Not configured",
                color: nlStatus.smtp_configured ? B.green : B.amber,
              },
              {
                label: "Schedule",
                value: nlStatus.schedule || "Daily 07:00 UTC",
                color: B.purple,
              },
              {
                label: "Recipients",
                value: nlStatus.recipient_count ?? 0,
                color: B.blue,
              },
              {
                label: "Last Sent",
                value: nlStatus.last_sent
                  ? new Date(nlStatus.last_sent).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
                  : "Never",
                color: B.gray600,
              },
            ].map(s => (
              <div key={s.label} style={{
                background: B.gray50, border: `1px solid ${B.gray100}`,
                borderRadius: 4, padding: "12px 16px",
              }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: B.gray400, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Send result toast */}
        {sendResult && (
          <div style={{
            padding: "10px 14px",
            marginBottom: 16,
            borderRadius: 4,
            fontSize: 12,
            background: sendResult.ok ? B.greenLight : "#fdf0ef",
            border: `1px solid ${sendResult.ok ? B.green : B.amber}`,
            color: sendResult.ok ? B.green : B.amber,
          }}>
            {sendResult.msg}
          </div>
        )}

        {!nlStatus?.smtp_configured && (
          <div style={{
            padding: "10px 14px",
            marginBottom: 16,
            borderRadius: 4,
            fontSize: 11,
            background: B.amberLight,
            border: `1px solid ${B.amber}`,
            color: B.amber,
          }}>
            SMTP not configured. Set <code>SMTP_USERNAME</code>, <code>SMTP_PASSWORD</code>, and <code>NEWSLETTER_RECIPIENTS</code> in your <code>.env</code> file, then restart the backend. Without SMTP, the newsletter is saved as an HTML file in <code>/reports/</code>.
          </div>
        )}

        <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
          {/* Manual send */}
          <button
            onClick={handleSendNow}
            disabled={nlLoading || nlStatus?.sending}
            style={{
              padding: "10px 20px",
              background: (nlLoading || nlStatus?.sending) ? B.gray200 : B.purple,
              border: "none",
              borderRadius: 2,
              fontSize: 12,
              fontWeight: 700,
              color: (nlLoading || nlStatus?.sending) ? B.gray400 : B.white,
              cursor: (nlLoading || nlStatus?.sending) ? "not-allowed" : "pointer",
              transition: "background 0.2s",
              flexShrink: 0,
            }}
          >
            {nlLoading || nlStatus?.sending ? "Sending..." : "Send Now"}
          </button>

          {/* Add subscriber */}
          <div style={{ display: "flex", gap: 8, flex: 1, minWidth: 260 }}>
            <input
              type="email"
              value={emailInput}
              onChange={e => setEmailInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSubscribe()}
              placeholder="Add recipient email..."
              style={{
                flex: 1,
                padding: "8px 12px",
                border: `1px solid ${B.gray200}`,
                borderRadius: 2,
                fontSize: 12,
                color: B.gray900,
                outline: "none",
              }}
            />
            <button
              onClick={handleSubscribe}
              disabled={!emailInput.trim() || emailAction === "adding"}
              style={{
                padding: "8px 14px",
                background: B.white,
                border: `1px solid ${B.purple}`,
                borderRadius: 2,
                fontSize: 11,
                fontWeight: 700,
                color: B.purple,
                cursor: "pointer",
              }}
            >
              + Add
            </button>
          </div>
        </div>

        {/* Recipient list */}
        {nlStatus?.recipients && nlStatus.recipients.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: B.gray400, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 8 }}>
              Subscribers ({nlStatus.recipients.length})
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {nlStatus.recipients.map(r => (
                <div key={r} style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "4px 10px",
                  background: B.purplePale,
                  border: `1px solid ${B.purpleMid}`,
                  borderRadius: 20,
                  fontSize: 11,
                  color: B.purpleDeep,
                }}>
                  {r}
                  <button
                    onClick={() => handleUnsubscribe(r)}
                    style={{
                      background: "none", border: "none", cursor: "pointer",
                      color: B.gray400, fontSize: 12, lineHeight: 1, padding: 0,
                      fontWeight: 700,
                    }}
                    title="Remove"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
