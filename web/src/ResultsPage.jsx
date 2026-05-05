import { useState, useEffect, useRef } from "react";
import { saveGeneration } from "./services";
import { cropFaceFromUrl } from "./features/face/detect";
import { MorphSlider } from "./components/MorphSlider";
import { useAppStore } from "./store/appStore";
import { AuthModal } from "./features/auth/AuthModal";
import { PaywallModal } from "./features/auth/PaywallModal";
import { isPremium } from "./features/firebase/subscriptionService";
import { ShareMatchModal } from "./features/share/ShareMatchModal";
import { getFlag } from "./config";
import { celebImg } from "./assets/manifest";

const C = {
  blue: "#2AABE2", yellow: "#FFE500", black: "#0A0A0A", white: "#FFFFFF",
  pink: "#FF3CAC", cyan: "#00E5FF", green: "#22c55e", purple: "#8B5CF6",
};

const CELEB_POOL = [
  { name: "Taylor Swift",       pct: 97, color: C.yellow, img: celebImg("taylor")         },
  { name: "Timothée Chalamet",  pct: 94, color: C.blue,   img: celebImg("timothee")       },
  { name: "Lisa – BLACKPINK",   pct: 96, color: C.pink,   img: celebImg("lisa")           },
  { name: "Henry Cavill",       pct: 91, color: C.cyan,   img: celebImg("henry")          },
  { name: "Michael B. Jordan",  pct: 94, color: C.blue,   img: celebImg("michael_jordan") },
  { name: "Billie Eilish",      pct: 89, color: C.green,  img: celebImg("billie")         },
  { name: "Selena Gomez",       pct: 92, color: C.pink,   img: celebImg("selena")         },
  { name: "Harry Styles",       pct: 88, color: C.purple, img: celebImg("harry")          },
];

const RANK_LABELS = ["1ST MATCH", "2ND MATCH", "3RD MATCH", "4TH MATCH", "5TH MATCH"];
const RANK_COLORS = [C.yellow, "#C0C0C0", "#CD7F32", "rgba(255,255,255,0.25)", "rgba(255,255,255,0.15)"];
const RANK_TEXT   = [C.black,  C.black,   C.white,  C.white,                  C.white                 ];

// ── Locked card wrapper — blur + lock overlay ────────────────────────────────
function LockedCard({ celeb, rank, large = false, onReveal, hasUser }) {
  const w  = large ? 172 : 144;
  const ht = large ? 240 : 204;
  return (
    <div
      className={large ? "match-card match-card--large" : "match-card"}
      style={{
        flexShrink: 0, scrollSnapAlign: "start",
        width: w, height: ht, borderRadius: 16,
        overflow: "hidden", position: "relative",
        background: "linear-gradient(155deg, #0d1029 0%, #151a3a 50%, #0d1029 100%)",
        border: `1.5px solid ${hasUser ? "rgba(255,229,0,0.25)" : "rgba(255,255,255,0.10)"}`,
        cursor: "pointer",
      }}
      onClick={onReveal}
    >
      {/* Blurred thumbnail — clipped inside the card */}
      <img
        src={celeb.img} alt="" aria-hidden="true"
        style={{
          position: "absolute", inset: -8,
          width: "calc(100% + 16px)", height: "calc(100% + 16px)",
          objectFit: "cover", objectPosition: "center",
          filter: "blur(18px) saturate(0.5) brightness(0.35)",
          pointerEvents: "none",
        }}
      />
      {/* Overlay gradient */}
      <div style={{
        position: "absolute", inset: 0,
        background: hasUser
          ? "radial-gradient(ellipse at 50% 60%, rgba(255,229,0,0.06) 0%, rgba(5,8,18,0.80) 70%)"
          : "radial-gradient(ellipse at 50% 60%, rgba(100,120,255,0.06) 0%, rgba(5,8,18,0.85) 70%)",
      }} />
      {/* Top-right: hidden % badge — single combined pill matching MatchCard */}
      <div style={{
        position: "absolute", top: 8, right: 8, zIndex: 2,
        display: "flex", alignItems: "center", gap: 5,
        background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)",
        padding: "4px 9px", borderRadius: 8,
        border: "1px solid rgba(255,255,255,0.08)",
      }}>
        <span style={{
          fontFamily: "'Fredoka'", fontWeight: 700, fontSize: 14,
          color: "rgba(255,255,255,0.4)", lineHeight: 1,
        }}>??%</span>
        <span style={{
          fontFamily: "'Oxanium'", fontWeight: 800, fontSize: 8,
          color: "rgba(255,255,255,0.4)",
          letterSpacing: 0.8, textTransform: "uppercase", lineHeight: 1,
        }}>match</span>
      </div>

      {/* Content — perfectly centered */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 1,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        gap: 8, padding: "16px 12px 36px",
        textAlign: "center",
      }}>
        <div style={{ fontSize: large ? 32 : 28, lineHeight: 1 }}>{hasUser ? "👑" : "🔒"}</div>
        <div style={{
          fontFamily: "'Fredoka',sans-serif", fontWeight: 700,
          fontSize: large ? 16 : 14, color: "#fff",
          lineHeight: 1.15,
          maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {hasUser ? (celeb.pct >= 90 ? "Doppelganger" : "Lookalike") : `#${rank + 1} Match`}
        </div>
        <button onClick={(e) => { e.stopPropagation(); onReveal(); }} style={{
          background: hasUser ? C.yellow : "#fff", color: C.black, border: "none",
          borderRadius: 8,
          padding: "6px 14px",
          cursor: "pointer",
          fontFamily: "'Oxanium',sans-serif", fontWeight: 800,
          fontSize: 12, letterSpacing: 0.5,
          whiteSpace: "nowrap",
          boxShadow: hasUser ? `0 0 12px rgba(255,229,0,0.3)` : "0 2px 8px rgba(0,0,0,0.3)",
          transition: "transform 0.2s",
        }}>
          {hasUser ? "Premium →" : "Sign Up →"}
        </button>
      </div>

      {/* Bottom rank label — matches MatchCard layout */}
      <div style={{
        position: "absolute", bottom: 10, left: 0, right: 0, zIndex: 2,
        textAlign: "center",
        fontFamily: "'Oxanium'", fontWeight: 800, fontSize: 9.5,
        color: "rgba(255,255,255,0.4)",
        letterSpacing: 0.7, textTransform: "uppercase", lineHeight: 1,
      }}>
        {RANK_LABELS[rank] || `#${rank + 1} match`}
      </div>
    </div>
  );
}

// ── More matches horizontal scroll ──
// allMatches stays in fixed order; activeIdx highlights which one is in the viewer.
function MoreMatchesRow({ allMatches, lockFn, onReveal, hasUser, onSelect, activeIdx }) {
  const TOTAL_MORE = 57;
  return (
    <div style={{ maxWidth: 640, margin: "0 auto", width: "100%" }}>
      <div style={{
        padding: "0 0 6px",
        display: "flex", justifyContent: "space-between", alignItems: "baseline",
      }}>
        <div style={{ fontFamily: "'Fredoka'", fontSize: "clamp(13px, 3.5vw, 16px)", fontWeight: 700, color: C.white }}>
          Also looks like...
        </div>
        <div style={{ fontFamily: "'Oxanium'", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)" }}>
          {TOTAL_MORE}+ matches
        </div>
      </div>
      <div style={{
        display: "flex", gap: 8,
        overflowX: "auto", overflowY: "visible",
        padding: "4px 0 16px",
        scrollSnapType: "x mandatory",
        WebkitOverflowScrolling: "touch",
        scrollbarWidth: "none", msOverflowStyle: "none",
      }}>
        {allMatches.map((c, i) => {
          const locked = lockFn(c.pct, i);
          const isActive = i === activeIdx;
          const large = i === 0;
          return locked
            ? <LockedCard key={c.name} celeb={c} rank={i} large={large} onReveal={onReveal} hasUser={hasUser} />
            : <MatchCard key={c.name} celeb={c} rank={i} large={large}
                onSelect={i !== activeIdx ? () => onSelect?.(i) : undefined}
                isActive={isActive} />;
        })}
        {/* Teaser SEE ALL */}
        <div className="match-card" style={{
          flexShrink: 0, scrollSnapAlign: "start",
          width: 144, height: 204, borderRadius: 16,
          background: `linear-gradient(145deg, ${C.yellow}, #FFD000)`,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          gap: 8, padding: "14px 12px",
          cursor: "pointer", textAlign: "center",
        }}>
          <svg width={48} height={18} viewBox="0 0 60 20">
            <text x="30" y="16" textAnchor="middle" fontFamily="'Fredoka',sans-serif" fontWeight="700"
              fontSize="18" fill={C.black} paintOrder="stroke">celebs</text>
          </svg>
          <div style={{ fontFamily: "'Oxanium'", fontWeight: 700, fontSize: 11, color: C.black, lineHeight: 1.3 }}>
            <strong>{TOTAL_MORE}+</strong> celebs
          </div>
          <div style={{
            background: C.black, color: C.yellow,
            fontFamily: "'Oxanium'", fontWeight: 800, fontSize: 11,
            padding: "5px 12px",
            borderRadius: 8, letterSpacing: 0.7, textTransform: "uppercase",
          }}>SEE ALL</div>
        </div>
      </div>
    </div>
  );
}

function MatchCard({ celeb, rank, large = false, onSelect, isActive }) {
  const [h, setH] = useState(false);
  const w  = large ? 172 : 144;
  const ht = large ? 240 : 204;
  const highlighted = isActive;
  return (
    <div
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      onClick={() => onSelect?.()}
      className={large ? "match-card match-card--large" : "match-card"}
      style={{
        flexShrink: 0, scrollSnapAlign: "start",
        width: w, height: ht, borderRadius: 16,
        overflow: "hidden", position: "relative", cursor: onSelect ? "pointer" : "default",
        transform: h ? "scale(1.04) translateY(-4px)" : "scale(1)",
        transition: "transform 0.25s cubic-bezier(0.34,1.56,0.64,1), border-color 0.3s, box-shadow 0.3s",
        boxShadow: highlighted
          ? `0 0 16px ${celeb.color}55, 0 8px 24px rgba(0,0,0,0.5)`
          : h ? "0 12px 30px rgba(0,0,0,0.5)" : "0 4px 12px rgba(0,0,0,0.3)",
        border: highlighted ? `2px solid ${celeb.color}` : "2px solid rgba(255,255,255,0.08)",
      }}
    >
      {/* Celebrity photo */}
      <img src={celeb.img} alt={celeb.name}
        style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center center", display: "block" }}
        onError={e => { e.target.style.display = "none"; }} />

      {/* Gradient overlay — bottom half for text readability */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.45) 38%, transparent 60%)" }} />

      {/* Top-right: % match — single combined pill so we never collide with a left-side pill */}
      <div style={{
        position: "absolute", top: 8, right: 8, zIndex: 2,
        display: "flex", alignItems: "center", gap: 5,
        background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)",
        padding: "4px 9px", borderRadius: 8,
        boxShadow: highlighted ? `0 0 8px ${celeb.color}66` : "0 2px 8px rgba(0,0,0,0.35)",
        border: highlighted ? `1px solid ${celeb.color}` : "1px solid rgba(255,255,255,0.08)",
      }}>
        <span style={{
          fontFamily: "'Fredoka'", fontWeight: 700, fontSize: 14,
          color: highlighted ? celeb.color : "#fff",
          lineHeight: 1,
        }}>{celeb.pct}%</span>
        <span style={{
          fontFamily: "'Oxanium'", fontWeight: 800, fontSize: 8,
          color: "rgba(255,255,255,0.55)",
          letterSpacing: 0.8, textTransform: "uppercase",
          lineHeight: 1,
        }}>match</span>
      </div>

      {/* Top-left: ONLY the VIEWING indicator when active — otherwise blank */}
      {highlighted && (
        <div style={{
          position: "absolute", top: 8, left: 8, zIndex: 2,
          display: "flex", alignItems: "center", gap: 5,
          background: celeb.color, color: C.black,
          padding: "3px 8px", borderRadius: 999,
          fontFamily: "'Oxanium'", fontWeight: 800, fontSize: 9.5,
          letterSpacing: 0.7, textTransform: "uppercase",
          boxShadow: `0 0 10px ${celeb.color}88`,
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: "50%",
            background: C.black,
          }} />
          Viewing
        </div>
      )}

      {/* Bottom content strip — name + rank in a clean two-line stack */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 2,
        padding: "10px 11px 10px",
        display: "flex", flexDirection: "column", gap: 3,
      }}>
        <div style={{
          fontFamily: "'Oxanium'", fontSize: large ? 14 : 13,
          fontWeight: 700, color: "#fff",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          lineHeight: 1.2,
        }}>{celeb.name}</div>
        <div style={{
          fontFamily: "'Oxanium'", fontWeight: 800, fontSize: 9.5,
          color: highlighted ? celeb.color : "rgba(255,255,255,0.5)",
          letterSpacing: 0.6, textTransform: "uppercase", lineHeight: 1,
        }}>
          {RANK_LABELS[rank] || `#${rank + 1} match`}
        </div>
      </div>
    </div>
  );
}

function AnimatedPct({ target, color, duration = 1600 }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let cur = 0;
    const step = target / (duration / 16);
    const id = setInterval(() => {
      cur += step;
      if (cur >= target) { setVal(target); clearInterval(id); }
      else setVal(Math.floor(cur));
    }, 16);
    return () => clearInterval(id);
  }, [target, duration]);
  return <span style={{ color, textShadow: `0 0 30px ${color}88` }}>{val}%</span>;
}

function ShareBtn({ label, icon, bg, color, onClick }) {
  const [h, setH] = useState(false);
  return (
    <button onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} onClick={onClick}
      style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
        padding: "11px 16px", borderRadius: 11,
        background: h ? bg : `${bg}cc`, color,
        border: "none", cursor: "pointer",
        fontFamily: "'Oxanium'", fontWeight: 700, fontSize: 12, letterSpacing: 0.4,
        transition: "all 0.2s ease",
        transform: h ? "translateY(-2px)" : "none",
        boxShadow: h ? `0 8px 20px ${bg}44` : "none",
        flex: "1 1 0", minWidth: 0,
      }}
    >
      <span style={{ fontSize: 16 }}>{icon}</span>
      <span className="share-label">{label}</span>
    </button>
  );
}

export default function ResultsPage({ photo, onReset, onDashboard, preloaded = null, apiResult = null, onMount, returnContext = null }) {
  const user = useAppStore(s => s.user);
  const subscription = useAppStore(s => s.subscription);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showShare,   setShowShare]   = useState(false);

  const premium = isPremium(subscription);

  // All matches — primary + others, computed once
  const [allMatches] = useState(() => {
    if (preloaded) return [preloaded.celeb, ...(preloaded.others || [])];
    if (apiResult && apiResult.length > 0) return apiResult.slice(0, 5);
    const idx = Math.floor(Math.random() * CELEB_POOL.length);
    const primary = CELEB_POOL[idx];
    const rest = CELEB_POOL
      .filter((_, i) => i !== idx)
      .sort(() => Math.random() - 0.5)
      .slice(0, 4)
      .map((c, i) => ({ ...c, pct: Math.max(60, primary.pct - 6 - i * 5 - Math.floor(Math.random() * 4)) }));
    return [primary, ...rest];
  });

  // The index of the only match visible to unregistered users (the last one).
  const freeIdx = allMatches.length - 1;

  // Active celebrity in the viewer — switched by clicking any card in the row.
  // The list order never changes; only the highlighted card moves.
  // Always starts at 0: guests see the blurred #1 match and can click the 5th card to preview it.
  const [activeIdx, setActiveIdx] = useState(0);
  const celeb = allMatches[activeIdx];

  // Viewer-level lock: depends on the currently active match index.
  // Unregistered users can only see the last match (freeIdx) freely.
  // Premium gating applies regardless of how the result is reached
  // (fresh scan or saved generation) — saving never grants premium access.
  const needsAuth    = !user && activeIdx !== freeIdx;
  const needsPremium = (pct) => user && !premium && pct >= 90;

  // Card-level lock for the "Also looks like" row.
  const isLocked = (pct, originalIndex) => {
    if (!user) return originalIndex !== freeIdx;
    if (!premium && pct >= 90) return true;
    return false;
  };

  const handleUnlock = () => {
    if (!user) setShowAuthModal(true);
    else if (!premium) setShowPaywall(true);
  };

  const savedRef = useRef(false);
  useEffect(() => {
    if (preloaded || savedRef.current) return;
    savedRef.current = true;
    saveGeneration({ photoUrl: photo, celeb: allMatches[0], others: allMatches.slice(1) })
      .then(() => { onMount?.(); })
      .catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Face-crop the celebrity image ──
  const [celebImgCache, setCelebImgCache] = useState({});
  const celebImg = celebImgCache[celeb.name] || celeb.img;

  useEffect(() => {
    if (celebImgCache[celeb.name]) return;
    cropFaceFromUrl(celeb.img)
      .then(result => {
        if (result.croppedUrl !== celeb.img) {
          setCelebImgCache(prev => ({ ...prev, [celeb.name]: result.croppedUrl }));
        }
      })
      .catch(() => {});
  }, [celeb.name, celeb.img]); // eslint-disable-line react-hooks/exhaustive-deps

  const [phase, setPhase] = useState("reveal");

  useEffect(() => {
    const t = setTimeout(() => setPhase("details"), 900);
    return () => clearTimeout(t);
  }, []);

  const handleShare = (platform) => {
    const text = encodeURIComponent(
      celeb.pct >= 90
        ? `I'm ${celeb.pct}% ${celeb.name}'s Doppelganger! 😱 Find yours at celebs.app`
        : `${celeb.pct}% lookalike with ${celeb.name}! Find yours at celebs.app`
    );
    const urls = { twitter: `https://twitter.com/intent/tweet?text=${text}`, whatsapp: `https://wa.me/?text=${text}` };
    if (urls[platform]) window.open(urls[platform], "_blank");
  };

  return (<>
    <div style={{
      position: "fixed", inset: 0, zIndex: 300,
      background: "#050812",
      display: "flex", flexDirection: "column", alignItems: "center",
      fontFamily: "'Oxanium', sans-serif",
      overflowY: "auto", overflowX: "hidden",
      WebkitOverflowScrolling: "touch",
      // Safe areas — notch + home indicator
      paddingTop: "env(safe-area-inset-top, 0px)",
      paddingBottom: "env(safe-area-inset-bottom, 0px)",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@700&family=Oxanium:wght@400;500;600;700;800&display=swap');
        @keyframes resultsReveal { from{opacity:0;transform:scale(0.92)} to{opacity:1;transform:scale(1)} }
        @keyframes slideUpResult { from{opacity:0;transform:translateY(32px)} to{opacity:1;transform:translateY(0)} }
        @keyframes confettiDrop  { 0%{transform:translateY(-20px) rotate(0deg);opacity:1} 100%{transform:translateY(110vh) rotate(720deg);opacity:0} }
        @keyframes namePop       { 0%{opacity:0;transform:scale(0.7)} 60%{transform:scale(1.08)} 100%{opacity:1;transform:scale(1)} }
        @keyframes glowPulseRes  { 0%,100%{opacity:0.5} 50%{opacity:1} }


        /* ── Responsive share row ── */
        .res-share-row   { display:flex; gap:8px; width:100%; }
        .res-second-row  { display:flex; gap:8px; width:100%; flex-wrap:wrap; }
        .res-second-row > button { flex:1 1 140px; min-width:0; }

        /* Mobile: hide verbose share labels to keep buttons compact */
        @media(max-width:400px) {
          .share-label { display:none; }
          .res-share-row button { padding:12px 14px; }
        }

        /* Mobile: hide logo watermark (saves vertical space) */
        @media(max-width:480px) {
          .res-logo { display:none; }
        }

        /* Tablet+: secondary row no-wrap. Cards stay at the JSX-default size
           (172/144 px) which is just right beside the bigger morph slider. */
        @media(min-width:600px) {
          .res-second-row { flex-wrap:nowrap; }
          .res-second-row > button { flex:1 1 0; }
        }

        /* Landscape phones: cap slider height */
        @media(max-height:500px) and (orientation:landscape) {
          .res-slider-wrap { max-width:260px !important; }
        }

        /* Mobile: keep the morph slider compact, but cards stay generous so
           text and the % pill aren't clipped — show ~2 cards + peek. */
        @media(max-width:480px) {
          .res-slider-wrap { padding: 0 4px; max-width: 78vw !important; }
          .match-card       { width:164px !important; height:228px !important; }
          .match-card--large { width:188px !important; height:256px !important; }
        }

        /* Tiny phones (iPhone SE, etc.) — slightly smaller but still readable */
        @media(max-width:380px) {
          .res-slider-wrap { max-width: 78vw !important; }
          .match-card       { width:154px !important; height:214px !important; }
          .match-card--large { width:176px !important; height:240px !important; }
        }

        /* Short phones — squeeze more aggressively */
        @media(max-height:700px) and (max-width:480px) {
          .res-slider-wrap { max-width: 44vw !important; }
        }

        /* Tall phones (6.7"+ screens) — use extra room */
        @media(min-height:800px) and (max-width:480px) {
          .res-slider-wrap { max-width: 62vw !important; }
        }

        /* Mobile: roomy action buttons so the stack breathes */
        @media(max-width:480px) {
          .res-actions { gap:12px !important; }
          .res-actions button { padding:13px 0 !important; font-size:13px !important; }
          .res-share-row { gap:10px !important; }
          .res-share-row button { padding:11px 12px !important; }
        }
      `}</style>

      {/* Ambient glow */}
      <div style={{
        position: "fixed", top: "30%", left: "50%", transform: "translate(-50%,-50%)",
        width: 500, height: 500, borderRadius: "50%",
        background: `radial-gradient(circle, ${celeb.color}20, transparent 60%)`,
        filter: "blur(80px)", pointerEvents: "none",
        animation: "glowPulseRes 3s ease-in-out infinite",
      }} />

      {/* Confetti */}
      {[...Array(16)].map((_, i) => (
        <div key={i} style={{
          position: "fixed", left: `${5 + (i * 5.9) % 93}%`, top: "-20px",
          width: i % 3 === 0 ? 9 : 6, height: i % 3 === 0 ? 9 : 6,
          borderRadius: i % 2 === 0 ? "50%" : 2,
          background: [C.yellow, C.pink, C.cyan, C.blue, C.green][i % 5],
          animation: `confettiDrop ${2.4 + (i % 4) * 0.6}s ease-in ${(i % 5) * 0.16}s both`,
          pointerEvents: "none", zIndex: 400,
        }} />
      ))}

      {/* ── Content wrapper ── */}
      <div style={{
        width: "100%", maxWidth: 640,
        minHeight: "100dvh",
        // Generous mobile gutter so nothing kisses the screen edge.
        padding: "clamp(14px, 2vw, 36px) clamp(24px, 5.5vw, 40px) clamp(28px, 3vw, 36px)",
        display: "flex", flexDirection: "column",
        alignItems: "center",
        gap: "clamp(16px, 2vw, 22px)",
        zIndex: 1,
      }}>

        {/* ── Nav row: back + context badge ── */}
        <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
          <button onClick={onDashboard || onReset} style={{
            background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 10, padding: "8px 12px", cursor: "pointer",
            fontSize: 15, color: "rgba(255,255,255,0.5)",
            display: "flex", alignItems: "center", flexShrink: 0,
          }}>←</button>

          {returnContext && returnContext.type !== "free" && (
            <div onClick={onDashboard}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                background: returnContext.hint?.color ? `${returnContext.hint.color}18` : "rgba(255,229,0,0.1)",
                border: `1px solid ${returnContext.hint?.color ?? C.yellow}44`,
                borderRadius: 20, padding: "6px 12px", cursor: "pointer", transition: "all 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.opacity = "0.8"; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
            >
              {returnContext.hint?.emoji && <span style={{ fontSize: 13 }}>{returnContext.hint.emoji}</span>}
              <div>
                <div style={{
                  fontFamily: "'Oxanium'", fontSize: 9, fontWeight: 700, letterSpacing: 0.8,
                  color: returnContext.hint?.color ?? C.yellow, textTransform: "uppercase", lineHeight: 1,
                }}>
                  {returnContext.type === "camino"
                    ? `Camino · Step ${(returnContext.step ?? 0) + 1}`
                    : returnContext.type === "dice" ? "Dice Roll" : "Dashboard"}
                </div>
                <div style={{ fontFamily: "'Oxanium'", fontSize: 9, color: "rgba(255,255,255,0.35)", marginTop: 2, lineHeight: 1 }}>
                  ← back to {returnContext.returnTo === "camino" ? "path" : "dashboard"}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Logo watermark — hidden on small phones */}
        <div className="res-logo" style={{ opacity: 0.25 }}>
          <svg width={72} height={24} viewBox="0 0 80 26">
            <text x="40" y="20" textAnchor="middle" fontFamily="'Fredoka',sans-serif" fontWeight="700"
              fontSize="20" fill="#fff" stroke={C.yellow} strokeWidth="3" strokeLinejoin="round" paintOrder="stroke">celebs</text>
          </svg>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            CASE A — NOT REGISTERED: full block, force sign-up
        ───────────────────────────────────────────────────────────── */}
        {needsAuth ? (<>
          {/* Hidden name */}
          <div style={{ textAlign: "center", animation: "slideUpResult 0.5s ease-out 0.2s both" }}>
            <div style={{
              fontFamily: "'Oxanium'", fontSize: 10, fontWeight: 700, letterSpacing: 2.5,
              color: `${C.cyan}99`, textTransform: "uppercase", marginBottom: 6,
            }}>✦ Your Celebrity Match ✦</div>
            <div style={{
              fontFamily: "'Fredoka'", fontWeight: 700,
              fontSize: "clamp(28px, 8vw, 54px)",
              letterSpacing: 1, lineHeight: 1.05,
              color: "rgba(255,255,255,0.08)",
              filter: "blur(10px)", userSelect: "none",
              animation: "namePop 0.7s cubic-bezier(0.34,1.56,0.64,1) 0.5s both",
            }}>Celebrity Name</div>
          </div>

          {/* Fully blurred morph + overlay */}
          <div style={{ position: "relative", width: "100%", maxWidth: 460 }}>
            <div className="res-slider-wrap" style={{
              width: "100%",
              animation: "resultsReveal 0.7s cubic-bezier(0.34,1.56,0.64,1) 0.3s both",
              filter: "blur(28px)", pointerEvents: "none", userSelect: "none",
            }}>
              <MorphSlider key={celeb.name} userPhoto={photo} celebPhoto={celebImg} color={celeb.color} />
            </div>
            <div style={{
              position: "absolute", inset: 0,
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 12,
              borderRadius: 20, zIndex: 2,
            }}>
              <div style={{ fontSize: 48 }}>🔒</div>
              <div style={{
                fontFamily: "'Fredoka', sans-serif", fontWeight: 700, fontSize: 22,
                color: "#FFE500", textAlign: "center", lineHeight: 1.2,
              }}>
                Your match is ready!
              </div>
              <div style={{
                fontFamily: "'Oxanium', sans-serif", fontSize: 13,
                color: "rgba(255,255,255,0.6)", textAlign: "center",
                maxWidth: 260, lineHeight: 1.5,
              }}>
                Create a free account to reveal who you look like
              </div>
              <button
                onClick={() => setShowAuthModal(true)}
                style={{
                  background: "#FFE500", color: "#000", border: "none", borderRadius: 14,
                  padding: "14px 32px", cursor: "pointer", marginTop: 4,
                  fontFamily: "'Oxanium', sans-serif", fontWeight: 800, fontSize: 15,
                  letterSpacing: 0.6,
                  boxShadow: "0 8px 32px rgba(255,229,0,0.3)",
                  transition: "transform 0.15s",
                  animation: "ctaPulse 2.4s ease-in-out infinite",
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; }}
              >
                Sign Up Free →
              </button>
            </div>
          </div>

          {/* Hidden score */}
          {phase === "details" && (
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              gap: 3, width: "100%", animation: "slideUpResult 0.6s ease-out both",
            }}>
              <div style={{
                filter: "blur(16px)", pointerEvents: "none", userSelect: "none",
                fontFamily: "'Fredoka'", fontWeight: 700,
                fontSize: "clamp(56px, 13vw, 88px)", lineHeight: 1,
                color: "rgba(255,255,255,0.08)",
              }}>??%</div>
              <div style={{
                fontFamily: "'Oxanium'", fontSize: 12, fontWeight: 600,
                color: "rgba(255,255,255,0.2)", letterSpacing: 1, textTransform: "uppercase",
              }}>Match Score Hidden</div>
            </div>
          )}
        </>) : needsPremium(celeb.pct) ? (<>
        {/* ─────────────────────────────────────────────────────────────
            CASE B — REGISTERED + DOPPELGANGER + NOT PREMIUM:
            Show score & "DOPPELGANGER" clearly, but hide identity
        ───────────────────────────────────────────────────────────── */}
          {/* Hidden name with Doppelganger badge */}
          <div style={{ textAlign: "center", animation: "slideUpResult 0.5s ease-out 0.2s both" }}>
            <div style={{
              fontFamily: "'Oxanium'", fontSize: 10, fontWeight: 700, letterSpacing: 2.5,
              color: `${C.cyan}99`, textTransform: "uppercase", marginBottom: 6,
            }}>✦ Your Celebrity Doppelganger ✦</div>
            <div style={{
              fontFamily: "'Fredoka'", fontWeight: 700,
              fontSize: "clamp(28px, 8vw, 54px)",
              letterSpacing: 1, lineHeight: 1.05,
              color: "rgba(255,255,255,0.08)",
              filter: "blur(10px)", userSelect: "none",
              animation: "namePop 0.7s cubic-bezier(0.34,1.56,0.64,1) 0.5s both",
            }}>Who Is It?</div>
          </div>

          {/* Blurred morph + premium overlay */}
          <div style={{ position: "relative", width: "100%", maxWidth: 460 }}>
            <div className="res-slider-wrap" style={{
              width: "100%",
              animation: "resultsReveal 0.7s cubic-bezier(0.34,1.56,0.64,1) 0.3s both",
              filter: "blur(24px)", pointerEvents: "none", userSelect: "none",
            }}>
              <MorphSlider key={celeb.name} userPhoto={photo} celebPhoto={celebImg} color={celeb.color} />
            </div>
            <div style={{
              position: "absolute", inset: 0,
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 10,
              borderRadius: 20, zIndex: 2,
            }}>
              <div style={{ fontSize: 44 }}>👑</div>
              <div style={{
                fontFamily: "'Fredoka', sans-serif", fontWeight: 700, fontSize: 18,
                color: "#FFE500", textAlign: "center", lineHeight: 1.2,
              }}>
                Premium Exclusive
              </div>
              <div style={{
                fontFamily: "'Oxanium', sans-serif", fontSize: 12,
                color: "rgba(255,255,255,0.55)", textAlign: "center",
                maxWidth: 260, lineHeight: 1.5,
              }}>
                Unlock Premium to reveal your Doppelganger's identity
              </div>
              <button
                onClick={() => setShowPaywall(true)}
                style={{
                  background: "#FFE500", color: "#000", border: "none", borderRadius: 12,
                  padding: "12px 28px", cursor: "pointer", marginTop: 4,
                  fontFamily: "'Oxanium', sans-serif", fontWeight: 800, fontSize: 14,
                  letterSpacing: 0.5,
                  boxShadow: "0 8px 32px rgba(255,229,0,0.3)",
                  transition: "transform 0.15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; }}
              >
                Go Premium →
              </button>
            </div>
          </div>

          {/* VISIBLE score + Doppelganger badge — creates FOMO */}
          {phase === "details" && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, animation: "slideUpResult 0.6s ease-out both", width: "100%" }}>
              <div style={{ fontFamily: "'Fredoka'", fontWeight: 700, fontSize: "clamp(56px, 13vw, 88px)", lineHeight: 1 }}>
                <AnimatedPct target={celeb.pct} color={celeb.color} />
              </div>
              {/* DOPPELGANGER badge — big, unmissable */}
              <div style={{
                background: `linear-gradient(135deg, ${celeb.color}, ${C.yellow})`,
                color: C.black,
                fontFamily: "'Oxanium'", fontWeight: 800, fontSize: 14,
                letterSpacing: 2, textTransform: "uppercase",
                padding: "8px 24px", borderRadius: 12, marginTop: 6,
                boxShadow: `0 0 20px ${celeb.color}66, 0 4px 12px rgba(0,0,0,0.4)`,
                animation: "pulse 2s ease-in-out infinite",
              }}>🔥 DOPPELGANGER 🔥</div>
              <div style={{
                fontFamily: "'Oxanium'", fontSize: 12, fontWeight: 600,
                color: "rgba(255,255,255,0.4)", letterSpacing: 0.8, marginTop: 8,
                textAlign: "center", lineHeight: 1.5, maxWidth: 280,
              }}>
                You're in the top 5%! Unlock Premium to discover who your celebrity twin is
              </div>
              {/* Score bar visible */}
              <div style={{ width: "min(300px, 78vw)", height: 7, borderRadius: 4, background: "rgba(255,255,255,0.08)", overflow: "hidden", marginTop: 10 }}>
                <div style={{
                  height: "100%", borderRadius: 4,
                  background: `linear-gradient(90deg, ${C.blue}, ${celeb.color})`,
                  width: `${celeb.pct}%`, boxShadow: `0 0 12px ${celeb.color}`,
                  transition: "width 1.8s cubic-bezier(0.25, 1, 0.5, 1)",
                }} />
              </div>
              {/* Trait badges visible */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center", marginTop: 10, maxWidth: 360 }}>
                {["Bone structure", "Eye spacing", "Jaw shape", "Facial symmetry", "Skin tone"].map((trait, i) => (
                  <div key={trait} style={{
                    background: `${celeb.color}18`, border: `1px solid ${celeb.color}44`,
                    borderRadius: 20, padding: "4px 12px",
                    fontFamily: "'Oxanium'", fontSize: 10, fontWeight: 600,
                    color: celeb.color, letterSpacing: 0.4,
                    animation: `slideUpResult 0.4s ease-out ${0.08 + i * 0.06}s both`,
                  }}>✓ {trait}</div>
                ))}
              </div>
              {/* Second CTA for emphasis */}
              <button
                onClick={() => setShowPaywall(true)}
                style={{
                  background: "transparent", border: `2px solid ${C.yellow}`,
                  borderRadius: 12, padding: "10px 24px", cursor: "pointer", marginTop: 12,
                  fontFamily: "'Oxanium', sans-serif", fontWeight: 800, fontSize: 13,
                  color: C.yellow, letterSpacing: 0.6,
                  transition: "all 0.2s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = `${C.yellow}18`; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
              >
                👑 Reveal My Doppelganger
              </button>
            </div>
          )}
        </>) : (<>
        {/* ─────────────────────────────────────────────────────────────
            CASE C — UNLOCKED: show everything normally
        ───────────────────────────────────────────────────────────── */}
          {/* Name */}
          <div style={{ textAlign: "center", animation: "slideUpResult 0.5s ease-out 0.2s both" }}>
            {/* Position badge — shows which match is being viewed */}
            {activeIdx > 0 && (
              <div style={{
                fontFamily: "'Oxanium'", fontSize: 10, fontWeight: 700,
                color: celeb.color, letterSpacing: 1.5,
                marginBottom: 4,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              }}>
                <span style={{
                  background: `${celeb.color}22`, border: `1px solid ${celeb.color}44`,
                  borderRadius: 20, padding: "2px 10px", fontSize: 9,
                }}>#{activeIdx + 1} MATCH</span>
              </div>
            )}
            <div style={{
              fontFamily: "'Oxanium'", fontSize: 10, fontWeight: 700, letterSpacing: 2.5,
              color: `${C.cyan}99`, textTransform: "uppercase", marginBottom: 6,
            }}>{activeIdx === 0
                ? `✦ Your Celebrity ${celeb.pct >= 90 ? "Doppelganger" : "Lookalike"} ✦`
                : `✦ Celebrity Match #${activeIdx + 1} ✦`}</div>
            <div style={{
              fontFamily: "'Fredoka'", fontWeight: 700,
              fontSize: "clamp(28px, 8vw, 54px)",
              color: celeb.color, letterSpacing: 1, lineHeight: 1.05,
              animation: "namePop 0.7s cubic-bezier(0.34,1.56,0.64,1) 0.5s both",
            }}>{celeb.name}</div>
          </div>

          {/* Morph slider */}
          <div className="res-slider-wrap" style={{
            width: "100%", maxWidth: 460,
            animation: "resultsReveal 0.7s cubic-bezier(0.34,1.56,0.64,1) 0.3s both",
          }}>
            <MorphSlider key={celeb.name} userPhoto={photo} celebPhoto={celebImg} color={celeb.color} />
          </div>

          {/* Score */}
          {phase === "details" && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, animation: "slideUpResult 0.6s ease-out both", width: "100%" }}>
              <div style={{ fontFamily: "'Fredoka'", fontWeight: 700, fontSize: "clamp(56px, 13vw, 88px)", lineHeight: 1 }}>
                <AnimatedPct target={celeb.pct} color={celeb.color} />
              </div>
              <div style={{ fontFamily: "'Oxanium'", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.5)", letterSpacing: 1, textTransform: "uppercase" }}>
                Match Score
              </div>
              <div style={{ width: "min(300px, 78vw)", height: 7, borderRadius: 4, background: "rgba(255,255,255,0.08)", overflow: "hidden", marginTop: 10 }}>
                <div style={{
                  height: "100%", borderRadius: 4,
                  background: `linear-gradient(90deg, ${C.blue}, ${celeb.color})`,
                  width: `${celeb.pct}%`, boxShadow: `0 0 12px ${celeb.color}`,
                  transition: "width 1.8s cubic-bezier(0.25, 1, 0.5, 1)",
                }} />
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center", marginTop: 10, maxWidth: 360 }}>
                {["Bone structure", "Eye spacing", "Jaw shape", "Facial symmetry", "Skin tone"].map((trait, i) => (
                  <div key={trait} style={{
                    background: `${celeb.color}18`, border: `1px solid ${celeb.color}44`,
                    borderRadius: 20, padding: "4px 12px",
                    fontFamily: "'Oxanium'", fontSize: 10, fontWeight: 600,
                    color: celeb.color, letterSpacing: 0.4,
                    animation: `slideUpResult 0.4s ease-out ${0.08 + i * 0.06}s both`,
                  }}>✓ {trait}</div>
                ))}
              </div>
            </div>
          )}
        </>)}

        {/* ── More matches ── */}
        {phase === "details" && (
          <div style={{ width: "100%", animation: "slideUpResult 0.6s ease-out 0.3s both" }}>
            <MoreMatchesRow
              allMatches={allMatches}
              lockFn={isLocked}
              onReveal={handleUnlock}
              hasUser={!!user}
              activeIdx={activeIdx}
              onSelect={(idx) => {
                if (idx !== activeIdx) {
                  setActiveIdx(idx);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
            />
          </div>
        )}

        {/* ── Actions ── */}
        {phase === "details" && (
          <div className="res-actions" style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
            width: "100%", maxWidth: 420,
            animation: "slideUpResult 0.6s ease-out 0.4s both",
          }}>
            {/* Primary CTA */}
            <button style={{
              width: "100%", padding: "clamp(14px, 3vw, 18px) 0",
              background: C.yellow, color: C.black,
              fontFamily: "'Oxanium'", fontWeight: 800, fontSize: "clamp(13px, 3.5vw, 16px)",
              border: `3px solid ${C.black}`, borderRadius: 14,
              boxShadow: `4px 4px 0 ${C.black}`,
              cursor: "pointer", letterSpacing: 1.1, textTransform: "uppercase",
            }}>🚀 Get My Full Analysis</button>

            {/* Viral share — opens the vertical share-card modal when the
                viewer is allowed to see the match. Otherwise the click
                triggers the paywall / auth flow with a clear lock state. */}
            {(() => {
              const shareLocked = needsPremium(celeb.pct) || (!user && activeIdx !== freeIdx);
              const shareReason = !user
                ? "Sign up to share"
                : shareLocked ? "Premium to share" : null;
              return (
                <button
                  onClick={() => {
                    if (shareLocked) handleUnlock();
                    else setShowShare(true);
                  }}
                  style={{
                    width: "100%", padding: "clamp(13px, 2.8vw, 16px) 0",
                    background: shareLocked
                      ? "rgba(255,255,255,0.06)"
                      : `linear-gradient(135deg, ${celeb.color || C.yellow}, ${C.yellow})`,
                    color: shareLocked ? C.yellow : C.black,
                    fontFamily: "'Oxanium'", fontWeight: 800, fontSize: "clamp(13px, 3.5vw, 15px)",
                    border: shareLocked
                      ? `1.5px solid ${C.yellow}66`
                      : `3px solid ${C.black}`,
                    borderRadius: 14,
                    boxShadow: shareLocked
                      ? "none"
                      : `4px 4px 0 ${C.black}, 0 0 24px ${(celeb.color || C.yellow)}66`,
                    cursor: "pointer", letterSpacing: 1.2, textTransform: "uppercase",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                    transition: "transform 0.15s, box-shadow 0.15s",
                  }}
                  onMouseEnter={e => {
                    if (shareLocked) {
                      e.currentTarget.style.background = `${C.yellow}18`;
                      e.currentTarget.style.borderColor = C.yellow;
                    } else {
                      e.currentTarget.style.transform = "translate(-2px,-2px)";
                      e.currentTarget.style.boxShadow = `6px 6px 0 ${C.black}, 0 0 32px ${(celeb.color || C.yellow)}88`;
                    }
                  }}
                  onMouseLeave={e => {
                    if (shareLocked) {
                      e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                      e.currentTarget.style.borderColor = `${C.yellow}66`;
                    } else {
                      e.currentTarget.style.transform = "none";
                      e.currentTarget.style.boxShadow = `4px 4px 0 ${C.black}, 0 0 24px ${(celeb.color || C.yellow)}66`;
                    }
                  }}
                >
                  {shareLocked
                    ? <>🔒 Share — {shareReason}</>
                    : <>📲 Share to Stories</>}
                </button>
              );
            })()}

            {/* Compact secondary share row — kept for fast direct posts */}
            <div className="res-share-row">
              <ShareBtn label="Share on X"  icon="𝕏"  bg="#1a1a1a"             color="#fff" onClick={() => handleShare("twitter")} />
              <ShareBtn label="WhatsApp"    icon="💬" bg="#25D366"              color="#fff" onClick={() => handleShare("whatsapp")} />
              <ShareBtn label="Copy link"   icon="🔗" bg="rgba(255,255,255,0.1)" color="#fff"
                onClick={() => { navigator.clipboard?.writeText("https://celebs.app").catch(() => {}); }} />
            </div>

            {/* Secondary row */}
            <div className="res-second-row">
              {onDashboard && returnContext && returnContext.type !== "free" && (
                <button onClick={onDashboard} style={{
                  background: returnContext.hint?.color ? `${returnContext.hint.color}22` : `${C.yellow}18`,
                  border: `1.5px solid ${returnContext.hint?.color ?? C.yellow}66`,
                  borderRadius: 10, padding: "11px 16px",
                  fontFamily: "'Oxanium'", fontWeight: 800, fontSize: 12,
                  color: returnContext.hint?.color ?? C.yellow,
                  cursor: "pointer", letterSpacing: 0.4, transition: "all 0.2s",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                }}
                  onMouseEnter={e => { e.currentTarget.style.opacity = "0.8"; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
                >
                  {returnContext.type === "camino"
                    ? `${returnContext.hint?.emoji ?? "🌟"} Continue path`
                    : returnContext.type === "dice" ? "🎲 Back to dashboard" : "📊 My Results"}
                </button>
              )}

              {onDashboard && (!returnContext || returnContext.type === "free") && (
                <button onClick={onDashboard} style={{
                  background: "rgba(255,229,0,0.08)", border: `1px solid ${C.yellow}55`,
                  borderRadius: 10, padding: "11px 16px",
                  fontFamily: "'Oxanium'", fontWeight: 700, fontSize: 12,
                  color: C.yellow, cursor: "pointer", letterSpacing: 0.4, transition: "all 0.2s",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = `${C.yellow}18`; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,229,0,0.08)"; }}
                >📊 My Results</button>
              )}

              <button onClick={onReset} style={{
                background: "transparent", border: "1px solid rgba(255,255,255,0.14)",
                borderRadius: 10, padding: "11px 16px",
                fontFamily: "'Oxanium'", fontWeight: 600, fontSize: 12,
                color: "rgba(255,255,255,0.4)", cursor: "pointer", letterSpacing: 0.4, transition: "all 0.2s",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
              }}
                onMouseEnter={e => { e.currentTarget.style.color = C.white; }}
                onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}
              >↩ Try another</button>
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div style={{
          fontFamily: "'Oxanium'", fontSize: 9, color: "rgba(255,255,255,0.15)",
          textAlign: "center", maxWidth: 320, lineHeight: 1.6,
          paddingBottom: "clamp(12px, 3vw, 24px)",
        }}>
          Results are for entertainment purposes only. Celebrity images used under fair use.
        </div>
      </div>
    </div>

    <AuthModal
      isOpen={showAuthModal}
      onClose={() => setShowAuthModal(false)}
      onSuccess={() => {
        setShowAuthModal(false);
        if (celeb.pct >= 90 && !preloaded) setShowPaywall(true);
      }}
      title="🔒 Unlock Your Doppelganger"
      subtitle="Sign up free to reveal your #1 celebrity match"
    />

    <PaywallModal
      isOpen={showPaywall}
      onClose={() => setShowPaywall(false)}
    />

    {/* Viral share — vertical 9:16 card for Snapchat / TikTok / Instagram */}
    <ShareMatchModal
      open={showShare}
      onClose={() => setShowShare(false)}
      celeb={celeb}
      userPhotoUrl={photo}
      userName={user?.displayName || ""}
    />
  </>);
}
