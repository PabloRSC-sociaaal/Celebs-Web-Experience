import { useState, useEffect, useRef } from "react";

const C = {
  blue: "#2AABE2", yellow: "#FFE500", black: "#0A0A0A", white: "#FFFFFF",
  pink: "#FF3CAC", cyan: "#00E5FF", green: "#22c55e",
};

// ── Configurable duration (ms) — increase/decrease to speed up or slow down ──
export const SCAN_DURATION = 8000;

const STAGES = [
  { at:  0, icon: "⚡", text: "Initializing neural network...",         sub: "Preparing AI facial analysis engine" },
  { at: 14, icon: "🔍", text: "Detecting facial structure...",          sub: "Locating key anatomical regions" },
  { at: 28, icon: "📐", text: "Mapping 4,847 facial landmarks...",      sub: "Bone structure · Eye spacing · Jawline" },
  { at: 45, icon: "⚖️", text: "Analysing proportions & symmetry...",   sub: "Computing geometric ratios in real-time" },
  { at: 62, icon: "🌍", text: "Searching 50,000+ celebrity profiles...", sub: "Scanning our global celebrity database" },
  { at: 79, icon: "🧮", text: "Calculating similarity scores...",       sub: "Running deep comparison algorithms" },
  { at: 95, icon: "🎯", text: "Doppelganger found!",                    sub: "Preparing your personalised results..." },
];

// Facial landmark dot positions (% of photo dimensions)
const LANDMARKS = [
  // Left eye
  {x:31,y:35},{x:36,y:32},{x:41,y:33},{x:46,y:34},
  // Right eye
  {x:54,y:34},{x:59,y:33},{x:64,y:32},{x:69,y:35},
  // Nose bridge & tip
  {x:50,y:42},{x:49,y:48},{x:51,y:54},{x:46,y:58},{x:54,y:58},
  // Mouth
  {x:38,y:66},{x:44,y:63},{x:50,y:64},{x:56,y:63},{x:62,y:66},
  {x:44,y:70},{x:50,y:71},{x:56,y:70},
  // Jawline
  {x:24,y:56},{x:22,y:66},{x:25,y:76},{x:32,y:83},{x:41,y:87},
  {x:50,y:88},{x:59,y:87},{x:68,y:83},{x:75,y:76},{x:78,y:66},{x:76,y:56},
  // Forehead
  {x:35,y:20},{x:43,y:16},{x:50,y:15},{x:57,y:16},{x:65,y:20},
  // Cheekbones
  {x:20,y:50},{x:80,y:50},
];

// Measurement lines connecting landmarks (pairs of indices)
const LINES = [
  [0,6],[3,7],[22,30],[9,12],[13,17],[20,28],
];

export default function AnalyzingPage({ photo, onComplete }) {
  const [progress, setProgress]     = useState(0);
  const [stageIdx, setStageIdx]     = useState(0);
  const [dotsShown, setDotsShown]   = useState(0);
  const [matchFound, setMatchFound] = useState(false);
  const [prevStage, setPrevStage]   = useState(0);
  const startRef = useRef(Date.now());
  const rafRef   = useRef(null);

  useEffect(() => {
    const tick = () => {
      const elapsed = Date.now() - startRef.current;
      const pct = Math.min(100, (elapsed / SCAN_DURATION) * 100);
      setProgress(Math.floor(pct));

      // Stage
      let si = 0;
      for (let i = STAGES.length - 1; i >= 0; i--) {
        if (pct >= STAGES[i].at) { si = i; break; }
      }
      setStageIdx(prev => { if (prev !== si) setPrevStage(prev); return si; });

      // Dots appear progressively from 30% onward
      if (pct >= 30) {
        const shown = Math.floor(((pct - 30) / 50) * LANDMARKS.length);
        setDotsShown(Math.min(LANDMARKS.length, shown));
      }

      if (pct >= 95) setMatchFound(true);

      if (pct < 100) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setTimeout(onComplete, 700);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [onComplete]);

  const stage = STAGES[stageIdx];
  const photoSize = "clamp(260px, 38vw, 420px)";

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 300,
      background: "#050812",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      fontFamily: "'Oxanium', sans-serif",
      overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@700&family=Oxanium:wght@400;500;600;700;800&display=swap');
        @keyframes scanSweep {
          0%   { top: 0% }
          50%  { top: calc(100% - 2px) }
          100% { top: 0% }
        }
        @keyframes bracketTL { from { opacity:0; transform: translate(-8px,-8px); } to { opacity:1; transform: translate(0,0); } }
        @keyframes bracketTR { from { opacity:0; transform: translate(8px,-8px);  } to { opacity:1; transform: translate(0,0); } }
        @keyframes bracketBL { from { opacity:0; transform: translate(-8px,8px);  } to { opacity:1; transform: translate(0,0); } }
        @keyframes bracketBR { from { opacity:0; transform: translate(8px,8px);   } to { opacity:1; transform: translate(0,0); } }
        @keyframes dotPop { from { opacity:0; transform: translate(-50%,-50%) scale(0); } to { opacity:1; transform: translate(-50%,-50%) scale(1); } }
        @keyframes stageFade { from { opacity:0; transform: translateY(8px); } to { opacity:1; transform: translateY(0); } }
        @keyframes matchPulse { 0%,100% { box-shadow: 0 0 0 0 rgba(255,229,0,0.5); } 50% { box-shadow: 0 0 0 20px rgba(255,229,0,0); } }
        @keyframes glowPulse { 0%,100% { opacity:0.6 } 50% { opacity:1 } }
        @keyframes gridFadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes photoReveal { from { opacity:0; transform: scale(0.9); } to { opacity:1; transform: scale(1); } }
        @keyframes scanBlink { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>

      {/* ── Tech grid background ── */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `
          linear-gradient(rgba(42,171,226,0.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(42,171,226,0.05) 1px, transparent 1px)
        `,
        backgroundSize: "44px 44px",
        animation: "gridFadeIn 1s ease-out both",
      }} />

      {/* ── Ambient radial glow ── */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%,-50%)",
        width: 700, height: 700, borderRadius: "50%",
        background: `radial-gradient(circle, ${matchFound ? C.yellow : C.blue}18, transparent 60%)`,
        filter: "blur(60px)",
        transition: "background 1s ease",
        animation: "glowPulse 3s ease-in-out infinite",
        pointerEvents: "none",
      }} />

      {/* ── Corner HUD decorations ── */}
      {[
        { top: 20, left: 20 }, { top: 20, right: 20 },
        { bottom: 20, left: 20 }, { bottom: 20, right: 20 },
      ].map((pos, i) => (
        <div key={i} style={{
          position: "absolute", ...pos,
          width: 40, height: 40,
          borderTop: i < 2 ? `2px solid ${C.blue}66` : "none",
          borderBottom: i >= 2 ? `2px solid ${C.blue}66` : "none",
          borderLeft: (i === 0 || i === 2) ? `2px solid ${C.blue}66` : "none",
          borderRight: (i === 1 || i === 3) ? `2px solid ${C.blue}66` : "none",
          opacity: 0.6,
        }} />
      ))}

      {/* ── Scanning text top ── */}
      <div style={{
        position: "absolute", top: 32, left: "50%", transform: "translateX(-50%)",
        fontFamily: "'Oxanium'", fontSize: 11, fontWeight: 700, letterSpacing: 3,
        color: `${C.cyan}99`, textTransform: "uppercase",
        animation: "scanBlink 2s ease-in-out infinite",
      }}>
        ● AI FACIAL ANALYSIS ACTIVE
      </div>

      {/* ── Main photo container ── */}
      <div style={{
        position: "relative",
        width: photoSize, height: photoSize,
        flexShrink: 0,
        animation: "photoReveal 0.6s cubic-bezier(0.34,1.56,0.64,1) both",
      }}>

        {/* Photo */}
        <img src={photo} alt="Analyzing" style={{
          width: "100%", height: "100%",
          objectFit: "cover", objectPosition: "top center",
          borderRadius: 8,
          filter: `brightness(${matchFound ? 1.1 : 0.8}) saturate(${matchFound ? 1.2 : 1})`,
          transition: "filter 0.8s ease",
          display: "block",
        }} />

        {/* Face detection box */}
        <div style={{
          position: "absolute",
          top: "12%", left: "16%", right: "16%", bottom: "10%",
          border: `1.5px solid ${C.blue}66`,
          borderRadius: 6,
          animation: "gridFadeIn 0.4s ease-out 0.8s both",
        }} />

        {/* Scan line */}
        {!matchFound && (
          <div style={{
            position: "absolute", left: 0, right: 0, height: 2,
            background: `linear-gradient(90deg, transparent 0%, ${C.cyan}88 20%, ${C.yellow} 50%, ${C.cyan}88 80%, transparent 100%)`,
            boxShadow: `0 0 16px ${C.cyan}, 0 0 30px ${C.yellow}44`,
            animation: "scanSweep 1.8s ease-in-out infinite",
            borderRadius: 1,
          }} />
        )}

        {/* Corner brackets */}
        {[
          { top: -1, left: -1,   borderTop: `3px solid ${C.yellow}`, borderLeft: `3px solid ${C.yellow}`,  animation: "bracketTL" },
          { top: -1, right: -1,  borderTop: `3px solid ${C.yellow}`, borderRight: `3px solid ${C.yellow}`, animation: "bracketTR" },
          { bottom: -1, left: -1,  borderBottom: `3px solid ${C.yellow}`, borderLeft: `3px solid ${C.yellow}`,  animation: "bracketBL" },
          { bottom: -1, right: -1, borderBottom: `3px solid ${C.yellow}`, borderRight: `3px solid ${C.yellow}`, animation: "bracketBR" },
        ].map(({ animation, ...s }, i) => (
          <div key={i} style={{
            position: "absolute", width: 24, height: 24, ...s,
            animation: `${animation} 0.4s cubic-bezier(0.34,1.56,0.64,1) ${0.2 + i * 0.08}s both`,
          }} />
        ))}

        {/* Facial landmark dots */}
        {LANDMARKS.slice(0, dotsShown).map((pt, i) => (
          <div key={i} style={{
            position: "absolute",
            left: `${pt.x}%`, top: `${pt.y}%`,
            width: 4, height: 4, borderRadius: "50%",
            background: i % 4 === 0 ? C.yellow : C.cyan,
            boxShadow: `0 0 6px ${i % 4 === 0 ? C.yellow : C.cyan}`,
            transform: "translate(-50%,-50%)",
            animation: "dotPop 0.2s cubic-bezier(0.34,1.56,0.64,1) both",
          }} />
        ))}

        {/* SVG measurement lines */}
        {dotsShown >= LANDMARKS.length && (
          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.35 }}>
            {LINES.map(([a, b], i) => (
              <line key={i}
                x1={`${LANDMARKS[a].x}%`} y1={`${LANDMARKS[a].y}%`}
                x2={`${LANDMARKS[b].x}%`} y2={`${LANDMARKS[b].y}%`}
                stroke={C.cyan} strokeWidth="0.8" strokeDasharray="3 3"
              />
            ))}
          </svg>
        )}

        {/* Match found overlay */}
        {matchFound && (
          <div style={{
            position: "absolute", inset: 0, borderRadius: 8,
            border: `3px solid ${C.yellow}`,
            background: `linear-gradient(135deg, ${C.yellow}15, ${C.green}10)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            animation: "photoReveal 0.5s ease-out both, matchPulse 1s ease-out 0.5s infinite",
          }}>
            <div style={{
              background: C.yellow, borderRadius: 16,
              padding: "12px 28px",
              fontFamily: "'Fredoka'", fontSize: "clamp(20px, 3vw, 30px)", fontWeight: 700,
              color: C.black, letterSpacing: 1,
              boxShadow: `0 0 40px ${C.yellow}88`,
            }}>✓ MATCH FOUND</div>
          </div>
        )}
      </div>

      {/* ── Info panel ── */}
      <div style={{ marginTop: 36, textAlign: "center", width: "100%", maxWidth: 520, padding: "0 24px", zIndex: 1 }}>

        {/* Stage text */}
        <div key={stageIdx} style={{
          animation: "stageFade 0.35s ease-out both",
        }}>
          <div style={{
            fontFamily: "'Fredoka'", fontWeight: 700,
            fontSize: "clamp(16px, 2.5vw, 24px)",
            color: matchFound ? C.yellow : C.white,
            letterSpacing: 0.5,
            transition: "color 0.5s ease",
          }}>
            {stage.icon} {stage.text}
          </div>
          <div style={{
            fontFamily: "'Oxanium'", fontSize: "clamp(10px, 1.4vw, 12px)", fontWeight: 500,
            color: "rgba(255,255,255,0.4)", marginTop: 6, letterSpacing: 0.5,
          }}>
            {stage.sub}
          </div>
        </div>

        {/* Progress bar */}
        <div style={{
          marginTop: 20, width: "100%", height: 5, borderRadius: 3,
          background: "rgba(255,255,255,0.07)",
          overflow: "hidden", position: "relative",
        }}>
          <div style={{
            position: "absolute", inset: "0 auto 0 0",
            width: `${progress}%`,
            borderRadius: 3,
            background: matchFound
              ? `linear-gradient(90deg, ${C.green}, ${C.yellow})`
              : `linear-gradient(90deg, ${C.blue}, ${C.cyan})`,
            boxShadow: `0 0 12px ${matchFound ? C.yellow : C.cyan}`,
            transition: "width 0.12s linear, background 0.6s ease",
          }} />
        </div>

        {/* Percentage */}
        <div style={{
          marginTop: 10,
          fontFamily: "'Fredoka'", fontWeight: 700,
          fontSize: "clamp(36px, 6vw, 56px)",
          color: matchFound ? C.yellow : C.cyan,
          textShadow: `0 0 30px ${matchFound ? C.yellow : C.cyan}66`,
          transition: "color 0.5s ease, text-shadow 0.5s ease",
          lineHeight: 1,
        }}>
          {progress}%
        </div>
      </div>

      {/* ── Logo watermark ── */}
      <div style={{ position: "absolute", bottom: 20, left: "50%", transform: "translateX(-50%)", opacity: 0.25 }}>
        <svg width={80} height={26} viewBox="0 0 80 26">
          <text x="40" y="20" textAnchor="middle" fontFamily="'Fredoka',sans-serif" fontWeight="700"
            fontSize="20" fill="#fff" stroke={C.yellow} strokeWidth="3" strokeLinejoin="round" paintOrder="stroke">celebs</text>
        </svg>
      </div>
    </div>
  );
}
