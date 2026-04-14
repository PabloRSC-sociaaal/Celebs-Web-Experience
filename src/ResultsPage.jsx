import { useState, useEffect, useRef } from "react";
import { saveGeneration } from "./db";

const C = {
  blue: "#2AABE2", yellow: "#FFE500", black: "#0A0A0A", white: "#FFFFFF",
  pink: "#FF3CAC", cyan: "#00E5FF", green: "#22c55e", purple: "#8B5CF6",
};

// Full celebrity pool
const CELEB_POOL = [
  { name: "Taylor Swift",       pct: 97, color: C.yellow, img: "/samples/celeb_taylor.jpg"         },
  { name: "Timothée Chalamet",  pct: 94, color: C.blue,   img: "/samples/celeb_timothee.jpg"        },
  { name: "Lisa – BLACKPINK",   pct: 96, color: C.pink,   img: "/samples/celeb_lisa.jpg"            },
  { name: "Henry Cavill",       pct: 91, color: C.cyan,   img: "/samples/celeb_henry.jpg"           },
  { name: "Michael B. Jordan",  pct: 94, color: C.blue,   img: "/samples/celeb_michael_jordan.jpg"  },
  { name: "Billie Eilish",      pct: 89, color: C.green,  img: "/samples/celeb_billie.jpg"          },
  { name: "Selena Gomez",       pct: 92, color: C.pink,   img: "/samples/celeb_selena.jpg"          },
  { name: "Harry Styles",       pct: 88, color: C.purple, img: "/samples/celeb_harry.jpg"           },
];

// Rank labels for the "more matches" row
const RANK_LABELS = ["1ST MATCH", "2ND MATCH", "3RD MATCH", "4TH MATCH", "5TH MATCH"];
const RANK_COLORS = [C.yellow, "#C0C0C0", "#CD7F32", "rgba(255,255,255,0.25)", "rgba(255,255,255,0.15)"];
const RANK_TEXT   = [C.black,  C.black,   C.white,  C.white,                  C.white                 ];

// ── More matches horizontal scroll ──
function MoreMatchesRow({ primary, others }) {
  const TOTAL_MORE = 57; // teaser number

  return (
    <div style={{ width: "100vw", position: "relative", left: "50%", transform: "translateX(-50%)" }}>
      {/* Section header */}
      <div style={{
        padding: "0 20px 14px",
        display: "flex", justifyContent: "space-between", alignItems: "baseline",
        maxWidth: 640, margin: "0 auto",
      }}>
        <div style={{ fontFamily: "'Fredoka'", fontSize: 18, fontWeight: 700, color: C.white }}>
          Also looks like...
        </div>
        <div style={{
          fontFamily: "'Oxanium'", fontSize: 11, fontWeight: 600,
          color: "rgba(255,255,255,0.3)", letterSpacing: 0.5,
        }}>
          {TOTAL_MORE}+ matches found
        </div>
      </div>

      {/* Scrollable row */}
      <div style={{
        display: "flex", gap: 10,
        overflowX: "auto", overflowY: "visible",
        padding: "4px 20px 20px",
        scrollSnapType: "x mandatory",
        WebkitOverflowScrolling: "touch",
        // hide scrollbar
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}>
        <style>{`.more-row::-webkit-scrollbar { display: none; }`}</style>

        {/* Primary card (larger) */}
        <MatchCard celeb={primary} rank={0} large />

        {/* Secondary cards */}
        {others.map((c, i) => (
          <MatchCard key={c.name} celeb={c} rank={i + 1} />
        ))}

        {/* Teaser "SEE ALL" card */}
        <div style={{
          flexShrink: 0, scrollSnapAlign: "start",
          width: 140, height: 200, borderRadius: 18,
          background: C.yellow,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          gap: 10, padding: "0 16px",
          cursor: "pointer",
        }}>
          {/* Mini logo */}
          <svg width={60} height={20} viewBox="0 0 60 20">
            <text x="30" y="16" textAnchor="middle" fontFamily="'Fredoka',sans-serif" fontWeight="700"
              fontSize="18" fill={C.black} stroke={C.yellow} strokeWidth="1" strokeLinejoin="round" paintOrder="stroke">celebs</text>
          </svg>
          <div style={{
            fontFamily: "'Oxanium'", fontWeight: 700, fontSize: 12,
            color: C.black, textAlign: "center", lineHeight: 1.4,
          }}>
            You also look like <strong>{TOTAL_MORE} other</strong> celebrities
          </div>
          <div style={{
            background: C.black, color: C.yellow,
            fontFamily: "'Oxanium'", fontWeight: 800, fontSize: 12,
            padding: "8px 20px", borderRadius: 8, letterSpacing: 1,
            textTransform: "uppercase",
          }}>SEE ALL</div>
        </div>
      </div>
    </div>
  );
}

function MatchCard({ celeb, rank, large = false }) {
  const [h, setH] = useState(false);
  const w = large ? 160 : 130;
  const ht = large ? 230 : 200;
  const label = RANK_LABELS[rank] || "";
  const badgeBg = RANK_COLORS[rank] || "rgba(255,255,255,0.15)";
  const badgeTxt = RANK_TEXT[rank]  || C.white;

  return (
    <div
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{
        flexShrink: 0, scrollSnapAlign: "start",
        width: w, height: ht, borderRadius: 18,
        overflow: "hidden", position: "relative",
        cursor: "pointer",
        transform: h ? "scale(1.04) translateY(-4px)" : "scale(1)",
        transition: "transform 0.25s cubic-bezier(0.34,1.56,0.64,1)",
        boxShadow: h ? `0 12px 30px rgba(0,0,0,0.5)` : "0 4px 12px rgba(0,0,0,0.3)",
        border: rank === 0 ? `2px solid ${celeb.color}` : "2px solid rgba(255,255,255,0.08)",
      }}
    >
      {/* Photo */}
      <img
        src={celeb.img}
        alt={celeb.name}
        style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center", display: "block" }}
        onError={e => { e.target.style.display = "none"; }}
      />

      {/* Gradient overlay */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 50%)",
      }} />

      {/* Name */}
      <div style={{
        position: "absolute", bottom: rank === 0 ? 36 : 32, left: 10, right: 10,
        fontFamily: "'Oxanium'", fontSize: rank === 0 ? 11 : 10,
        fontWeight: 700, color: "#fff", letterSpacing: 0.3,
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
      }}>{celeb.name}</div>

      {/* Rank badge */}
      {label && (
        <div style={{
          position: "absolute", bottom: 10, left: 10,
          background: badgeBg, color: badgeTxt,
          fontFamily: "'Oxanium'", fontWeight: 800, fontSize: 9,
          padding: "4px 8px", borderRadius: 6, letterSpacing: 0.8,
          textTransform: "uppercase",
          boxShadow: rank <= 1 ? `0 0 10px ${badgeBg}88` : "none",
        }}>{label}</div>
      )}

      {/* Pct badge (top-right) */}
      <div style={{
        position: "absolute", top: 8, right: 8,
        background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)",
        color: rank === 0 ? celeb.color : "#fff",
        fontFamily: "'Fredoka'", fontWeight: 700, fontSize: rank === 0 ? 16 : 13,
        padding: "3px 8px", borderRadius: 8,
      }}>{celeb.pct}%</div>

      {/* Share icon */}
      <div style={{
        position: "absolute", bottom: 10, right: 10,
        width: 28, height: 28, borderRadius: "50%",
        background: "rgba(255,255,255,0.12)",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "rgba(255,255,255,0.6)", fontSize: 12,
      }}>↗</div>
    </div>
  );
}

// ── Animated percentage counter ──
function AnimatedPct({ target, color, duration = 1800 }) {
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
  return (
    <span style={{ color, textShadow: `0 0 30px ${color}88`, transition: "color 0.3s" }}>
      {val}%
    </span>
  );
}

// ── Share button ──
function ShareBtn({ label, icon, bg, color, onClick }) {
  const [h, setH] = useState(false);
  return (
    <button
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "12px 20px", borderRadius: 12,
        background: h ? bg : `${bg}cc`,
        color, border: "none", cursor: "pointer",
        fontFamily: "'Oxanium'", fontWeight: 700, fontSize: 13,
        letterSpacing: 0.5, transition: "all 0.2s ease",
        transform: h ? "translateY(-2px)" : "none",
        boxShadow: h ? `0 8px 20px ${bg}44` : "none",
      }}
    >
      <span style={{ fontSize: 18 }}>{icon}</span>
      {label}
    </button>
  );
}

export default function ResultsPage({ photo, onReset, onDashboard, preloaded = null, onMount }) {
  // If replaying from dashboard, use preloaded data; otherwise pick random
  const [celeb, others] = useState(() => {
    if (preloaded) return [preloaded.celeb, preloaded.others];
    const idx = Math.floor(Math.random() * CELEB_POOL.length);
    const primary = CELEB_POOL[idx];
    const rest = CELEB_POOL
      .filter((_, i) => i !== idx)
      .sort(() => Math.random() - 0.5)
      .slice(0, 4)
      .map((c, i) => ({
        ...c,
        pct: Math.max(60, primary.pct - 6 - i * 5 - Math.floor(Math.random() * 4)),
      }));
    return [primary, rest]; // state = [primary, rest]
  })[0]; // [0] gets the state value (ignoring the setter)

  // Auto-save generation to localStorage (only for fresh results, not replays)
  const savedRef = useRef(false);
  useEffect(() => {
    if (preloaded || savedRef.current) return;
    savedRef.current = true;
    saveGeneration({ photoUrl: photo, celeb, others })
      .then(() => { onMount?.(); })
      .catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [phase, setPhase] = useState("reveal"); // reveal → details
  const [sliderX, setSliderX] = useState(50);
  const [dragging, setDragging] = useState(false);
  const containerRef = useRef(null);

  // Sequence: photo reveal → then details slide up
  useEffect(() => {
    const t = setTimeout(() => setPhase("details"), 900);
    return () => clearTimeout(t);
  }, []);

  // Drag slider
  const handlePointerDown = (e) => {
    setDragging(true);
    e.preventDefault();
  };
  useEffect(() => {
    const move = (e) => {
      if (!dragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const x = Math.max(10, Math.min(90, ((clientX - rect.left) / rect.width) * 100));
      setSliderX(x);
    };
    const up = () => setDragging(false);
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    window.addEventListener("touchmove", move, { passive: true });
    window.addEventListener("touchend", up);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
      window.removeEventListener("touchmove", move);
      window.removeEventListener("touchend", up);
    };
  }, [dragging]);

  const handleShare = (platform) => {
    const text = encodeURIComponent(`I'm ${celeb.pct}% ${celeb.name}'s Doppelganger! 😱 Find yours at celebs.app`);
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${text}`,
      whatsapp: `https://wa.me/?text=${text}`,
    };
    if (urls[platform]) window.open(urls[platform], "_blank");
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 300,
      background: "#050812",
      display: "flex", flexDirection: "column",
      alignItems: "center",
      fontFamily: "'Oxanium', sans-serif",
      overflowY: "auto",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@700&family=Oxanium:wght@400;500;600;700;800&display=swap');
        @keyframes resultsReveal  { from { opacity:0; transform: scale(0.92); } to { opacity:1; transform: scale(1); } }
        @keyframes slideUpResult  { from { opacity:0; transform: translateY(40px); } to { opacity:1; transform: translateY(0); } }
        @keyframes confettiDrop   { 0% { transform: translateY(-20px) rotate(0deg); opacity:1; } 100% { transform: translateY(110vh) rotate(720deg); opacity:0; } }
        @keyframes namePop        { 0% { opacity:0; transform: scale(0.7); } 60% { transform: scale(1.08); } 100% { opacity:1; transform: scale(1); } }
        @keyframes glowPulseRes   { 0%,100% { opacity:0.5 } 50% { opacity:1 } }
        @keyframes badgeBounce    { 0%,100%{ transform: scale(1) } 30%{ transform: scale(1.18) } 60%{ transform: scale(0.95) } }
        @keyframes sliderThumb    { 0%,100%{ box-shadow: 0 0 0 0 ${C.yellow}66 } 50%{ box-shadow: 0 0 0 12px ${C.yellow}00 } }
      `}</style>

      {/* Ambient glow */}
      <div style={{
        position: "fixed", top: "30%", left: "50%",
        transform: "translate(-50%,-50%)",
        width: 600, height: 600, borderRadius: "50%",
        background: `radial-gradient(circle, ${celeb.color}20, transparent 60%)`,
        filter: "blur(80px)", pointerEvents: "none",
        animation: "glowPulseRes 3s ease-in-out infinite",
      }} />

      {/* Confetti pieces */}
      {[...Array(18)].map((_, i) => (
        <div key={i} style={{
          position: "fixed",
          left: `${5 + (i * 5.5) % 95}%`,
          top: "-20px",
          width: i % 3 === 0 ? 10 : 7,
          height: i % 3 === 0 ? 10 : 7,
          borderRadius: i % 2 === 0 ? "50%" : 2,
          background: [C.yellow, C.pink, C.cyan, C.blue, C.green][i % 5],
          animation: `confettiDrop ${2.5 + (i % 4) * 0.6}s ease-in ${(i % 5) * 0.18}s both`,
          pointerEvents: "none",
          zIndex: 400,
        }} />
      ))}

      {/* ── Content wrapper ── */}
      <div style={{
        width: "100%", maxWidth: 640,
        padding: "clamp(20px, 5vw, 48px) clamp(16px, 4vw, 32px)",
        display: "flex", flexDirection: "column",
        alignItems: "center", gap: 28,
        zIndex: 1, minHeight: "100%",
        justifyContent: "center",
      }}>

        {/* Logo watermark */}
        <div style={{ opacity: 0.3 }}>
          <svg width={80} height={26} viewBox="0 0 80 26">
            <text x="40" y="20" textAnchor="middle" fontFamily="'Fredoka',sans-serif" fontWeight="700"
              fontSize="20" fill="#fff" stroke={C.yellow} strokeWidth="3" strokeLinejoin="round" paintOrder="stroke">celebs</text>
          </svg>
        </div>

        {/* Headline */}
        <div style={{
          textAlign: "center",
          animation: "slideUpResult 0.5s ease-out 0.2s both",
        }}>
          <div style={{
            fontFamily: "'Oxanium'", fontSize: "clamp(10px, 1.4vw, 12px)",
            fontWeight: 700, letterSpacing: 3, color: `${C.cyan}99`,
            textTransform: "uppercase", marginBottom: 10,
          }}>
            ✦ Your Celebrity Doppelganger ✦
          </div>
          <div style={{
            fontFamily: "'Fredoka'", fontWeight: 700,
            fontSize: "clamp(32px, 6vw, 58px)",
            color: celeb.color, letterSpacing: 1,
            lineHeight: 1.05,
            animation: "namePop 0.7s cubic-bezier(0.34,1.56,0.64,1) 0.5s both",
          }}>
            {celeb.name}
          </div>
        </div>

        {/* ── Comparison slider ── */}
        <div style={{
          width: "100%", maxWidth: 480,
          animation: "resultsReveal 0.7s cubic-bezier(0.34,1.56,0.64,1) 0.3s both",
        }}>
          <div
            ref={containerRef}
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: "1 / 1",
              borderRadius: 20,
              overflow: "hidden",
              border: `3px solid ${celeb.color}`,
              boxShadow: `0 0 60px ${celeb.color}44, 0 20px 60px rgba(0,0,0,0.5)`,
              cursor: dragging ? "grabbing" : "col-resize",
              userSelect: "none",
            }}
          >
            {/* Celebrity photo (full) */}
            <div style={{
              position: "absolute", inset: 0,
              background: `linear-gradient(135deg, ${celeb.color}22, ${celeb.color}44)`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <img
                src={celeb.img}
                alt={celeb.name}
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center" }}
                onError={(e) => { e.target.style.display = "none"; }}
              />
            </div>

            {/* User photo (clipped to left side) */}
            <div style={{
              position: "absolute", inset: 0,
              clipPath: `inset(0 ${100 - sliderX}% 0 0)`,
            }}>
              <img
                src={photo}
                alt="You"
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center" }}
              />
            </div>

            {/* Divider line */}
            <div style={{
              position: "absolute", top: 0, bottom: 0,
              left: `${sliderX}%`, transform: "translateX(-50%)",
              width: 3,
              background: C.white,
              boxShadow: `0 0 12px ${C.white}, 0 0 4px ${celeb.color}`,
              zIndex: 10,
            }} />

            {/* Drag handle */}
            <div
              onMouseDown={handlePointerDown}
              onTouchStart={handlePointerDown}
              style={{
                position: "absolute", top: "50%",
                left: `${sliderX}%`,
                transform: "translate(-50%, -50%)",
                width: 44, height: 44, borderRadius: "50%",
                background: C.white,
                border: `3px solid ${celeb.color}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "col-resize", zIndex: 20,
                boxShadow: `0 0 20px ${celeb.color}88`,
                animation: "sliderThumb 2s ease-in-out infinite",
              }}
            >
              <svg width={20} height={14} viewBox="0 0 20 14">
                <path d="M0 7h4M16 7h4M3 7l3-4M3 7l3 4M17 7l-3-4M17 7l-3 4" stroke={celeb.color} strokeWidth="2.2" strokeLinecap="round" fill="none" />
              </svg>
            </div>

            {/* Labels */}
            <div style={{
              position: "absolute", bottom: 14, left: 14,
              background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)",
              borderRadius: 8, padding: "5px 12px",
              fontFamily: "'Oxanium'", fontSize: 11, fontWeight: 800,
              color: "#fff", letterSpacing: 1,
            }}>YOU</div>
            <div style={{
              position: "absolute", bottom: 14, right: 14,
              background: `${celeb.color}cc`, backdropFilter: "blur(8px)",
              borderRadius: 8, padding: "5px 12px",
              fontFamily: "'Oxanium'", fontSize: 11, fontWeight: 800,
              color: celeb.color === C.yellow ? C.black : C.white, letterSpacing: 1,
            }}>CELEB</div>
          </div>

          {/* Hint */}
          <div style={{
            textAlign: "center", marginTop: 10,
            fontFamily: "'Oxanium'", fontSize: 11, color: "rgba(255,255,255,0.3)",
          }}>
            ← drag to compare →
          </div>
        </div>

        {/* ── Match badge ── */}
        {phase === "details" && (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
            animation: "slideUpResult 0.6s ease-out both",
          }}>
            <div style={{
              fontFamily: "'Fredoka'", fontWeight: 700,
              fontSize: "clamp(64px, 14vw, 96px)",
              lineHeight: 1,
            }}>
              <AnimatedPct target={celeb.pct} color={celeb.color} />
            </div>
            <div style={{
              fontFamily: "'Oxanium'", fontSize: "clamp(12px, 2vw, 15px)",
              fontWeight: 600, color: "rgba(255,255,255,0.55)", letterSpacing: 1,
              textTransform: "uppercase",
            }}>
              Match Score
            </div>

            {/* Score bar */}
            <div style={{
              width: "min(320px, 80vw)", height: 8, borderRadius: 4,
              background: "rgba(255,255,255,0.08)", overflow: "hidden", marginTop: 12,
            }}>
              <div style={{
                height: "100%", borderRadius: 4,
                background: `linear-gradient(90deg, ${C.blue}, ${celeb.color})`,
                width: `${celeb.pct}%`,
                boxShadow: `0 0 12px ${celeb.color}`,
                transition: "width 1.8s cubic-bezier(0.25, 1, 0.5, 1)",
              }} />
            </div>

            {/* Trait badges */}
            <div style={{
              display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center",
              marginTop: 14, maxWidth: 380,
            }}>
              {["Bone structure", "Eye spacing", "Jaw shape", "Facial symmetry", "Skin tone"].map((trait, i) => (
                <div key={trait} style={{
                  background: `${celeb.color}18`,
                  border: `1px solid ${celeb.color}44`,
                  borderRadius: 20, padding: "5px 14px",
                  fontFamily: "'Oxanium'", fontSize: 11, fontWeight: 600,
                  color: celeb.color, letterSpacing: 0.5,
                  animation: `slideUpResult 0.4s ease-out ${0.1 + i * 0.07}s both`,
                }}>✓ {trait}</div>
              ))}
            </div>
          </div>
        )}

        {/* ── More matches row ── */}
        {phase === "details" && (
          <div style={{
            width: "100%",
            animation: "slideUpResult 0.6s ease-out 0.35s both",
          }}>
            <MoreMatchesRow primary={celeb} others={others} />
          </div>
        )}

        {/* ── Actions ── */}
        {phase === "details" && (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 14,
            width: "100%", maxWidth: 420,
            animation: "slideUpResult 0.6s ease-out 0.4s both",
          }}>
            {/* Primary CTA */}
            <button style={{
              width: "100%", padding: "18px 0",
              background: C.yellow, color: C.black,
              fontFamily: "'Oxanium'", fontWeight: 800, fontSize: 16,
              border: `3px solid ${C.black}`,
              borderRadius: 14,
              boxShadow: `4px 4px 0 ${C.black}`,
              cursor: "pointer", letterSpacing: 1.2,
              textTransform: "uppercase",
            }}>
              🚀 Get My Full Analysis
            </button>

            {/* Share row */}
            <div style={{
              display: "flex", gap: 10, width: "100%", justifyContent: "center",
              flexWrap: "wrap",
            }}>
              <ShareBtn
                label="Share on X"
                icon="𝕏"
                bg="#1a1a1a"
                color="#fff"
                onClick={() => handleShare("twitter")}
              />
              <ShareBtn
                label="WhatsApp"
                icon="💬"
                bg="#25D366"
                color="#fff"
                onClick={() => handleShare("whatsapp")}
              />
              <ShareBtn
                label="Copy link"
                icon="🔗"
                bg="rgba(255,255,255,0.1)"
                color="#fff"
                onClick={() => {
                  navigator.clipboard?.writeText("https://celebs.app").catch(() => {});
                }}
              />
            </div>

            {/* Secondary actions row */}
            <div style={{ display: "flex", gap: 10, width: "100%", justifyContent: "center", flexWrap: "wrap" }}>
              {/* My Results / Dashboard button */}
              {onDashboard && (
                <button
                  onClick={onDashboard}
                  style={{
                    background: "rgba(255,229,0,0.08)", border: `1px solid ${C.yellow}55`,
                    borderRadius: 10, padding: "11px 22px",
                    fontFamily: "'Oxanium'", fontWeight: 700, fontSize: 13,
                    color: C.yellow, cursor: "pointer",
                    letterSpacing: 0.5, transition: "all 0.2s",
                    display: "flex", alignItems: "center", gap: 8,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = `${C.yellow}18`; e.currentTarget.style.borderColor = C.yellow; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,229,0,0.08)"; e.currentTarget.style.borderColor = `${C.yellow}55`; }}
                >
                  📊 My Results
                </button>
              )}

              {/* Try again */}
              <button
                onClick={onReset}
                style={{
                  background: "transparent", border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: 10, padding: "11px 22px",
                  fontFamily: "'Oxanium'", fontWeight: 600, fontSize: 13,
                  color: "rgba(255,255,255,0.45)", cursor: "pointer",
                  letterSpacing: 0.5, transition: "all 0.2s",
                  display: "flex", alignItems: "center", gap: 8,
                }}
                onMouseEnter={e => { e.currentTarget.style.color = C.white; e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.45)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; }}
              >
                ↩ Try another photo
              </button>
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div style={{
          fontFamily: "'Oxanium'", fontSize: 10, color: "rgba(255,255,255,0.18)",
          textAlign: "center", maxWidth: 340, lineHeight: 1.6,
          paddingBottom: 20,
        }}>
          Results are generated for entertainment purposes only. Celebrity images used under fair use for illustrative comparison.
        </div>
      </div>
    </div>
  );
}
