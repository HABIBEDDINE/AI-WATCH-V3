import { useState, useEffect } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import { getHealth } from "./services/api";
import { Compass, Lightbulb, BarChart2, FileText, Mail, TrendingUp } from "lucide-react";
import Explore from "./pages/Explore";
import Solutions from "./pages/Solutions";
import DataPreview from "./pages/DataPreview";
import Reports from "./pages/Reports";
import Newsletter from "./pages/Newsletter";
import ArticleDetail from "./pages/ArticleDetail";
import Trends from "./pages/Trends";

const B = {
  purple:      "#1A4A9E",
  purpleDeep:  "#102d6a",
  purpleLight: "#4a7fd4",
  purplePale:  "#e8eef8",
  purpleMid:   "#d0dcea",
  black:       "#000000",
  darkBg:      "#0a0a0a",
  darkSection: "#111111",
  darkCard:    "#1a1a1a",
  darkBorder:  "#2a2a2a",
  white:       "#ffffff",
  offWhite:    "#f9f9f9",
  gray50:      "#fafafa",
  gray100:     "#f4f4f4",
  gray200:     "#e8e8e8",
  gray300:     "#d0d0d0",
  gray400:     "#999999",
  gray500:     "#666666",
  gray600:     "#444444",
  gray700:     "#222222",
  gray900:     "#111111",
  green:       "#C45F00",
  greenLight:  "#fdf0e6",
  red:         "#c0392b",
  redLight:    "#fdf0ef",
  amber:       "#b45309",
  amberLight:  "#fef3e2",
  blue:        "#1a5fa8",
  blueLight:   "#e8f0fb",
};

export default function AIWatchDXC() {
  const [toasts] = useState([]);
  const [health, setHealth] = useState({ status: "checking" });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    let mounted = true;
    let failCount = 0;

    const checkHealth = () => {
      getHealth()
        .then(() => {
          if (mounted) {
            failCount = 0;
            setHealth({ status: "online" });
          }
        })
        .catch(() => {
          if (mounted) {
            failCount += 1;
            // Only flip to offline after 2 consecutive failures to avoid
            // false positives while the server is busy with a long LLM call
            if (failCount >= 2) {
              setHealth({ status: "offline" });
            }
          }
        });
    };

    checkHealth();
    const intervalId = setInterval(checkHealth, 15000);

    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, []);

  const liveStatus = health.status === "online" ? "LIVE" : health.status === "offline" ? "API DOWN" : "CHECKING";
  const liveColor = health.status === "online" ? B.green : health.status === "offline" ? B.red : B.amber;

  const navTabs = [
    { id:"feed",       label:"News Feed",       path:"/",             Icon: Compass,     desc:"Browse and filter live articles"    },
    { id:"trends",     label:"AI Trends",       path:"/trends",       Icon: TrendingUp,  desc:"Live AI tools & model intelligence"  },
    { id:"radar",      label:"Solutions",       path:"/solutions",    Icon: Lightbulb,   desc:"DXC product recommendations"        },
    { id:"data",       label:"Data Table",      path:"/data-preview", Icon: BarChart2, desc:"Sort and export article data"       },
    { id:"reports",    label:"My Reports",      path:"/reports",      Icon: FileText,  desc:"Save and download PDF reports"      },
    { id:"newsletter", label:"Newsletter",      path:"/newsletter",   Icon: Mail,      desc:"Compose and send intelligence briefs"},
  ];

  const location = useLocation();

  return (
    <div style={{ minHeight:"100vh", background:B.gray100, fontFamily:"'Open Sans','Segoe UI',Arial,sans-serif", color:B.gray900 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;600;700;800&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:0.3} }
        .fade { animation: fadeUp 0.3s ease both; }
        .dxc-nav-btn:hover { color:${B.purple} !important; background:${B.gray100} !important; }
        .dxc-persona-btn:hover { opacity:0.85; }
        .dxc-btn-primary { background:${B.purple}!important; color:${B.white}!important; border:2px solid ${B.purple}!important; border-radius:0!important; font-weight:700!important; letter-spacing:0.5px!important; transition:all 0.2s!important; cursor:pointer!important; }
        .dxc-btn-primary:hover { background:${B.purpleDeep}!important; border-color:${B.purpleDeep}!important; }
        .dxc-btn-outline { background:transparent!important; color:${B.gray700}!important; border:2px solid ${B.gray700}!important; border-radius:0!important; font-weight:700!important; letter-spacing:0.5px!important; transition:all 0.2s!important; cursor:pointer!important; }
        .dxc-btn-outline:hover { background:${B.gray700}!important; color:${B.white}!important; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-track { background:${B.gray100}; }
        ::-webkit-scrollbar-thumb { background:${B.gray300}; }
      `}</style>

      {toasts.length > 0 && (
        <div className="aw-toast-wrap" style={{ position:"fixed", top:72, right:20, zIndex:1000, display:"flex", flexDirection:"column", gap:8 }}>
          {toasts.map(t => (
            <div key={t.id} className="aw-toast-item" style={{
              minWidth:320, maxWidth:420,
              border:`1px solid ${t.kind === "error" ? B.red : B.blue}`,
              background:B.white,
              borderLeft:`4px solid ${t.kind === "error" ? B.red : B.blue}`,
              padding:"10px 12px",
              boxShadow:"0 4px 16px rgba(0,0,0,0.08)",
              fontSize:12,
              color:B.gray700,
            }}>
              {t.message}
            </div>
          ))}
        </div>
      )}

      {/* ── TOPBAR ── */}
      <div style={{
        background:B.white, height:56,
        display:"flex", alignItems:"center", padding:`0 ${isMobile ? 16 : 28}px`, justifyContent:"space-between",
        position:"sticky", top:0, zIndex:200, borderBottom:`1px solid ${B.gray100}`,
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(o => !o)}
              style={{ background:"none", border:"none", cursor:"pointer", padding:"4px 6px", display:"flex", flexDirection:"column", gap:4 }}
              aria-label="Menu"
            >
              <span style={{ display:"block", width:20, height:2, background:B.gray700, borderRadius:2 }} />
              <span style={{ display:"block", width:20, height:2, background:B.gray700, borderRadius:2 }} />
              <span style={{ display:"block", width:20, height:2, background:B.gray700, borderRadius:2 }} />
            </button>
          )}
          <span style={{ fontSize:isMobile ? 20 : 24, fontWeight:800, color:B.gray900, letterSpacing:-0.6, fontFamily:"'Open Sans',sans-serif", lineHeight:1 }}>AI Watch</span>
          <div style={{ display:"flex", alignItems:"center", gap:5, border:`1px solid ${liveColor}40`, borderRadius:2, padding:"3px 9px" }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:liveColor, animation:"pulse 2s infinite" }} />
            <span style={{ fontSize:10, fontWeight:700, color:liveColor, letterSpacing:1 }}>{liveStatus}</span>
          </div>
        </div>
      </div>

      {/* ── MOBILE SIDEBAR BACKDROP ── */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position:"fixed", top:56, right:0, bottom:0, left:0, background:"rgba(0,0,0,0.45)", zIndex:199 }}
        />
      )}

      {/* ── LAYOUT ── */}
      <div style={{ display:"flex", height:"calc(100vh - 56px)" }}>

        {/* ── LEFT SIDEBAR ── */}
        <div className={`aw-sidebar${!sidebarOpen ? " aw-sidebar-hidden" : ""}`} style={{
          width:210, background:B.white, borderRight:`1px solid ${B.gray100}`,
          padding:"0", display:"flex", flexDirection:"column",
          overflowY:"auto", flexShrink:0,
          ...(isMobile ? {
            position:"fixed", top:56, left:0, height:"calc(100vh - 56px)",
            zIndex:200, boxShadow:"4px 0 20px rgba(0,0,0,0.15)",
          } : {}),
        }}>
          {navTabs.map(t2 => {
            const isActive = location.pathname === t2.path;
            return (
              <Link
                key={t2.id}
                to={t2.path}
                onClick={() => isMobile && setSidebarOpen(false)}
                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = B.gray50; }}
                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
                style={{
                  display:"flex", alignItems:"flex-start", gap:10,
                  padding:"12px 16px", border:"none",
                  borderLeft:`3px solid ${isActive ? B.purple : "transparent"}`,
                  background: isActive ? B.purplePale : "transparent",
                  color: isActive ? B.purple : B.gray500,
                  fontSize:13, fontWeight: isActive ? 700 : 400,
                  cursor:"pointer", textAlign:"left", width:"100%", transition:"all 0.15s",
                  textDecoration:"none",
                }}
              >
                <t2.Icon size={15} strokeWidth={1.8} color={isActive ? B.purple : B.gray400} style={{ marginTop: 1, flexShrink: 0 }} />
                <div>
                  <div>{t2.label}</div>
                  {isActive && (
                    <div style={{ fontSize:11, color: B.purple, fontWeight:400, marginTop:2, opacity:0.75, lineHeight:1.4 }}>
                      {t2.desc}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}

          <div style={{ flex:1 }} />
        </div>

        {/* ── MAIN CONTENT ── */}
        <div style={{ flex:1, overflowY:"auto", background:B.white, minWidth:0 }}>

          <Routes>
            <Route path="/" element={<Explore />} />
            <Route path="/article/:id" element={<ArticleDetail />} />
            <Route path="/trends" element={<Trends />} />
            <Route path="/solutions" element={<Solutions />} />
            <Route path="/data-preview" element={<DataPreview />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/newsletter" element={<Newsletter />} />
          </Routes>
        </div>

      </div>
    </div>
  );
}