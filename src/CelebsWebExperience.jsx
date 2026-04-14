import { useState, useEffect, useRef } from "react";
import AnalyzingPage from "./AnalyzingPage";
import ResultsPage from "./ResultsPage";
import DashboardPage from "./DashboardPage";
import { detectAndCropFace } from "./faceDetect";
import { hasGenerations } from "./db";

/* ═══════════════════════════════════════════════════════
   CELEBS — Web Experience Landing Page
   Pop-art × Magazine Editorial
   Fonts: Fredoka (logo/headings), Oxanium (body/buttons)
   ═══════════════════════════════════════════════════════ */

const C = {
  blue: "#2AABE2",
  yellow: "#FFE500",
  black: "#0A0A0A",
  white: "#FFFFFF",
  pink: "#FF3CAC",
  purple: "#8B5CF6",
  cyan: "#00E5FF",
  green: "#22c55e",
  darkBlue: "#1B8DBF",
};

// ─── Intersection Observer Hook ───
function useInView(threshold = 0.3) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

// ─── Animated Counter ───
function Counter({ end, suffix = "", duration = 2000 }) {
  const [val, setVal] = useState(0);
  const [ref, inView] = useInView(0.5);
  const started = useRef(false);
  useEffect(() => {
    if (!inView || started.current) return;
    started.current = true;
    let cur = 0;
    const step = end / (duration / 16);
    const id = setInterval(() => {
      cur += step;
      if (cur >= end) { setVal(end); clearInterval(id); }
      else setVal(Math.floor(cur));
    }, 16);
    return () => clearInterval(id);
  }, [inView, end, duration]);
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

// ─── Logo Component (Fredoka + SVG stroke for yellow outline + blue dot) ───
function Logo({ size = 42 }) {
  const strokeW = Math.max(5, size * 0.14);
  const svgW = size * 3.8;
  const svgH = size * 1.5;
  return (
    <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`} style={{ display: "block", overflow: "visible" }}>
      <defs>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@700&display=swap');`}</style>
      </defs>
      {/* Yellow outline */}
      <text
        x={svgW / 2} y={svgH * 0.72}
        textAnchor="middle"
        fontFamily="'Fredoka', sans-serif"
        fontWeight="700"
        fontSize={size}
        fill={C.black}
        stroke={C.yellow}
        strokeWidth={strokeW}
        strokeLinejoin="round"
        paintOrder="stroke"
        letterSpacing="1"
      >celebs</text>
      {/* Blue dot on the 'b' — positioned above the b's ascender area */}
      <circle
        cx={svgW * 0.61}
        cy={svgH * 0.26}
        r={size * 0.065}
        fill={C.blue}
      />
    </svg>
  );
}

// ─── CTA Button (Oxanium ExtraBold 800) ───
function CTA({ children, variant = "yellow", size = "md", onClick, style = {} }) {
  const [h, setH] = useState(false);
  const variants = {
    yellow: { bg: C.yellow, color: C.black, border: C.black, shadow: C.black },
    black: { bg: C.black, color: C.yellow, border: C.yellow, shadow: C.yellow },
    outline: { bg: "transparent", color: C.white, border: C.white, shadow: "rgba(255,255,255,0.2)" },
    blue: { bg: C.blue, color: C.white, border: C.black, shadow: C.black },
  };
  const v = variants[variant];
  const sizes = { sm: { p: "10px 22px", fs: 13 }, md: { p: "14px 32px", fs: 15 }, lg: { p: "18px 44px", fs: 17 } };
  const s = sizes[size];
  return (
    <button
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} onClick={onClick}
      style={{
        fontFamily: "'Oxanium', sans-serif", fontWeight: 800, fontSize: s.fs,
        padding: s.p, background: v.bg, color: v.color,
        border: `3px solid ${v.border}`, borderRadius: 14,
        boxShadow: h ? `6px 6px 0 ${v.shadow}` : `4px 4px 0 ${v.shadow}`,
        transform: h ? "translate(-2px,-2px)" : "none",
        transition: "all 0.2s ease", cursor: "pointer",
        textTransform: "uppercase", letterSpacing: 1.2, ...style,
      }}
    >{children}</button>
  );
}

// ─── Polaroid Card ───
function PolaroidCard({ name, pct, color = C.blue, rotation = 0, delay = 0, userImg = null, celebImg = null }) {
  const [h, setH] = useState(false);
  return (
    <div onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)} style={{
      background: C.white, borderRadius: 12, padding: "10px 10px 16px",
      boxShadow: h ? "0 16px 40px rgba(0,0,0,0.4)" : "0 8px 24px rgba(0,0,0,0.25)",
      transform: `rotate(${h ? 0 : rotation}deg) scale(${h ? 1.08 : 1})`,
      transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
      width: 160, cursor: "default",
      animation: `floatCard 4s ease-in-out infinite`,
      animationDelay: `${delay}s`,
    }}>
      {/* Photo area — split: user | celeb */}
      <div style={{
        width: "100%", height: 130, borderRadius: 8,
        display: "flex", overflow: "hidden", position: "relative",
      }}>
        {/* Left: user photo */}
        <div style={{ flex: 1, overflow: "hidden" }}>
          {userImg
            ? <img src={userImg} alt="user" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center" }} />
            : <div style={{ width: "100%", height: "100%", background: `${color}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>👤</div>
          }
        </div>
        {/* Divider */}
        <div style={{ width: 2.5, background: C.white, flexShrink: 0, zIndex: 2, boxShadow: "0 0 6px rgba(0,0,0,0.15)" }} />
        {/* Right: celeb photo */}
        <div style={{ flex: 1, overflow: "hidden" }}>
          {celebImg
            ? <img src={celebImg} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center" }} />
            : <div style={{ width: "100%", height: "100%", background: `linear-gradient(160deg, ${color}44, ${color}99)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>⭐</div>
          }
        </div>
        {/* Match % badge */}
        <div style={{
          position: "absolute", top: -5, right: -5,
          width: 38, height: 38, borderRadius: "50%",
          background: color, color: color === C.yellow ? C.black : C.white,
          fontFamily: "'Fredoka'", fontSize: 12, fontWeight: 700,
          display: "flex", alignItems: "center", justifyContent: "center",
          border: `2.5px solid ${C.white}`, zIndex: 3,
          boxShadow: "0 2px 10px rgba(0,0,0,0.25)",
        }}>{pct}%</div>
        {/* YOU / CELEB labels */}
        <div style={{ position: "absolute", bottom: 5, left: 5, background: "rgba(0,0,0,0.55)", borderRadius: 4, padding: "2px 5px", fontFamily: "'Oxanium'", fontSize: 8, fontWeight: 700, color: "#fff", letterSpacing: 0.5 }}>YOU</div>
        <div style={{ position: "absolute", bottom: 5, right: 5, background: "rgba(0,0,0,0.55)", borderRadius: 4, padding: "2px 5px", fontFamily: "'Oxanium'", fontSize: 8, fontWeight: 700, color: "#fff", letterSpacing: 0.5 }}>CELEB</div>
      </div>
      <div style={{
        textAlign: "center", marginTop: 8,
        fontFamily: "'Oxanium'", fontWeight: 700, fontSize: 10, color: C.black,
        lineHeight: 1.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
      }}>{name}</div>
      <div style={{ textAlign: "center", marginTop: 3 }}>
        <LogoMini />
      </div>
    </div>
  );
}

// Tiny inline logo for polaroid cards
function LogoMini() {
  return (
    <svg width={52} height={18} viewBox="0 0 52 18" style={{ display: "block", margin: "0 auto" }}>
      <text x="26" y="14" textAnchor="middle" fontFamily="'Fredoka', sans-serif" fontWeight="700"
        fontSize="14" fill={C.black} stroke={C.yellow} strokeWidth="3" strokeLinejoin="round" paintOrder="stroke"
        letterSpacing="0.5"
      >celebs</text>
    </svg>
  );
}

// ─── Hero Upload ───
// State machine: idle → validating → ready | error
function HeroUpload({ onStartScan, onSpotlight }) {
  const [dragging,    setDragging]    = useState(false);
  const [rawPreview,  setRawPreview]  = useState(null);  // original blob URL
  const [croppedUrl,  setCroppedUrl]  = useState(null);  // face-cropped blob URL
  const [phase,       setPhase]       = useState("idle"); // idle | validating | ready | error
  const [stepIdx,     setStepIdx]     = useState(0);
  const inputRef = useRef(null);

  const STEPS = [
    { icon: "📸", label: "Loading your photo" },
    { icon: "🔍", label: "Detecting your face" },
    { icon: "✂️",  label: "Cropping to face" },
    { icon: "⚡", label: "Almost ready" },
  ];

  // Cycle through steps while validating
  useEffect(() => {
    if (phase !== "validating") return;
    const id = setInterval(() => setStepIdx(i => (i + 1) % STEPS.length), 500);
    return () => clearInterval(id);
  }, [phase]);

  // ── Run detection immediately when a file is picked ──
  const handleFile = async (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const raw = URL.createObjectURL(file);
    setRawPreview(raw);
    setCroppedUrl(null);
    setPhase("validating");
    setStepIdx(0);

    try {
      const result = await detectAndCropFace(raw);
      if (!result.found) {
        setPhase("error");
        onSpotlight?.(false);
      } else {
        setCroppedUrl(result.croppedUrl);
        setPhase("ready");
        onSpotlight?.(true);
      }
    } catch (err) {
      console.error(err);
      setCroppedUrl(raw);
      setPhase("ready");
      onSpotlight?.(true);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const reset = () => {
    setRawPreview(null);
    setCroppedUrl(null);
    setPhase("idle");
    setStepIdx(0);
    onSpotlight?.(false);
  };

  // ── UPLOAD ZONE ──
  if (phase === "idle") {
    return (
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className="hero-upload"
        style={{
          width: 360, maxWidth: "100%", minHeight: 360, borderRadius: 28,
          border: `3px dashed ${dragging ? C.yellow : `${C.yellow}88`}`,
          background: dragging
            ? `rgba(255,229,0,0.12)`
            : `rgba(0,0,0,0.25)`,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 16,
          cursor: "pointer", transition: "all 0.25s ease",
          boxShadow: dragging
            ? `0 0 40px ${C.yellow}44, inset 0 0 40px ${C.yellow}08`
            : `0 8px 40px rgba(0,0,0,0.3), inset 0 0 40px rgba(255,229,0,0.03)`,
          backdropFilter: "blur(12px)",
          position: "relative", overflow: "hidden",
        }}
      >
        <input
          ref={inputRef} type="file" accept="image/*"
          style={{ display: "none" }}
          onChange={e => handleFile(e.target.files[0])}
        />
        {/* Background glow */}
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%,-50%)",
          width: 240, height: 240, borderRadius: "50%",
          background: `radial-gradient(circle, ${C.yellow}18, transparent 65%)`,
          filter: "blur(30px)", pointerEvents: "none",
        }} />
        {/* Icon */}
        <div style={{
          width: 96, height: 96, borderRadius: "50%",
          background: `linear-gradient(135deg, ${C.yellow}33, ${C.yellow}11)`,
          border: `2px solid ${C.yellow}66`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 42, transition: "transform 0.25s",
          transform: dragging ? "scale(1.15)" : "scale(1)",
          boxShadow: `0 0 20px ${C.yellow}22`,
        }}>📸</div>
        <div style={{ textAlign: "center", zIndex: 1 }}>
          <div style={{
            fontFamily: "'Fredoka'", fontSize: 24, fontWeight: 700,
            color: C.white, letterSpacing: 0.5,
          }}>
            {dragging ? "Drop it! 🎯" : "Upload your photo"}
          </div>
          <div style={{
            fontFamily: "'Oxanium'", fontSize: 13, fontWeight: 500,
            color: "rgba(255,255,255,0.6)", marginTop: 6,
          }}>
            Drag & drop or click to browse
          </div>
          <div style={{
            fontFamily: "'Oxanium'", fontSize: 11, fontWeight: 400,
            color: "rgba(255,255,255,0.3)", marginTop: 4,
          }}>
            JPG, PNG, HEIC · Max 10MB
          </div>
        </div>
        <div className="upload-cta-btn cta-main" style={{
          marginTop: 4,
          background: C.yellow, color: C.black,
          fontFamily: "'Oxanium'", fontWeight: 800, fontSize: 15,
          padding: "16px 0", borderRadius: 14,
          border: `3px solid ${C.black}`,
          boxShadow: `4px 4px 0 ${C.black}`,
          letterSpacing: 1.2, textTransform: "uppercase",
          textAlign: "center", width: "85%",
        }}>
          📸 Choose Photo
        </div>
        <div style={{
          display: "flex", gap: 12, alignItems: "center",
          fontFamily: "'Oxanium'", fontSize: 11, color: "rgba(255,255,255,0.25)",
        }}>
          <span>🔒 Private</span>
          <span>·</span>
          <span>⚡ Instant</span>
          <span>·</span>
          <span>🆓 Free</span>
        </div>
      </div>
    );
  }

  // ── VALIDATING STATE ──
  if (phase === "validating") {
    const step = STEPS[stepIdx];
    return (
      <div className="hero-upload" style={{
        width: 360, maxWidth: "100%", minHeight: 320, borderRadius: 28,
        background: "rgba(0,0,0,0.35)",
        border: `3px solid ${C.yellow}55`,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 20,
        backdropFilter: "blur(12px)",
        position: "relative", overflow: "hidden",
      }}>
        {/* Background thumbnail */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `url(${rawPreview})`,
          backgroundSize: "cover", backgroundPosition: "top center",
          filter: "brightness(0.18) blur(6px)",
        }} />

        {/* Pulsing face icon */}
        <div style={{
          position: "relative",
          width: 88, height: 88, borderRadius: "50%",
          border: `3px solid ${C.yellow}88`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 36,
          boxShadow: `0 0 0 0 ${C.yellow}44`,
          animation: "ctaPulse 1.2s ease-in-out infinite",
          zIndex: 1,
        }}>
          {step.icon}
          {/* Spinning arc */}
          <svg style={{ position: "absolute", inset: -4, width: 96, height: 96, animation: "spin 1.4s linear infinite" }} viewBox="0 0 96 96">
            <circle cx="48" cy="48" r="44" fill="none" stroke={C.yellow} strokeWidth="3"
              strokeDasharray="80 200" strokeLinecap="round" />
          </svg>
        </div>

        {/* Step label */}
        <div style={{ textAlign: "center", zIndex: 1 }}>
          <div style={{
            fontFamily: "'Fredoka'", fontSize: 20, fontWeight: 700, color: C.white, letterSpacing: 0.5,
          }}>
            {step.label}
          </div>
          <div style={{
            fontFamily: "'Oxanium'", fontSize: 11, fontWeight: 500,
            color: "rgba(255,255,255,0.35)", marginTop: 6, letterSpacing: 0.5,
          }}>
            Scanning for facial structure
          </div>
        </div>

        {/* Mini progress bar */}
        <div style={{
          width: "70%", height: 3, borderRadius: 2,
          background: "rgba(255,255,255,0.1)", overflow: "hidden", zIndex: 1,
        }}>
          <div style={{
            height: "100%", borderRadius: 2,
            background: `linear-gradient(90deg, ${C.blue}, ${C.yellow})`,
            animation: "loadBar 1.6s ease-in-out infinite",
          }} />
        </div>
      </div>
    );
  }

  // ── FACE ERROR STATE ──
  if (phase === "error") {
    return (
      <div className="hero-upload" style={{
        width: 360, maxWidth: "100%", minHeight: 300, borderRadius: 28,
        background: "rgba(0,0,0,0.35)",
        border: `3px solid ${C.pink}66`,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 18,
        backdropFilter: "blur(12px)",
        position: "relative", overflow: "hidden",
        padding: "32px 24px",
      }}>
        {/* Background thumbnail */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `url(${rawPreview})`,
          backgroundSize: "cover", backgroundPosition: "top center",
          filter: "brightness(0.12) blur(6px)",
        }} />

        <div style={{ fontSize: 52, zIndex: 1 }}>😕</div>

        <div style={{ textAlign: "center", zIndex: 1 }}>
          <div style={{
            fontFamily: "'Fredoka'", fontSize: 22, fontWeight: 700, color: C.white,
          }}>No face detected</div>
          <div style={{
            fontFamily: "'Oxanium'", fontSize: 12, fontWeight: 500,
            color: "rgba(255,255,255,0.45)", marginTop: 8, lineHeight: 1.6,
          }}>
            Make sure your face is clearly visible,<br />
            well lit, and facing the camera.
          </div>
        </div>

        {/* Tips */}
        <div style={{
          zIndex: 1, display: "flex", flexDirection: "column", gap: 8, width: "100%",
        }}>
          {["✅ Face clearly visible", "✅ Good lighting", "✅ Not too far away"].map(tip => (
            <div key={tip} style={{
              fontFamily: "'Oxanium'", fontSize: 11, fontWeight: 600,
              color: "rgba(255,255,255,0.4)", letterSpacing: 0.3,
              textAlign: "center",
            }}>{tip}</div>
          ))}
        </div>

        <button
          onClick={reset}
          style={{
            zIndex: 1,
            background: C.yellow, color: C.black,
            fontFamily: "'Oxanium'", fontWeight: 800, fontSize: 14,
            padding: "14px 32px", borderRadius: 12,
            border: `3px solid ${C.black}`,
            boxShadow: `4px 4px 0 ${C.black}`,
            cursor: "pointer", letterSpacing: 1, textTransform: "uppercase",
          }}
        >
          📸 Try Another Photo
        </button>
      </div>
    );
  }

  // ── READY STATE (face detected, cropped photo shown) ──
  return (
    <div className="hero-upload" style={{
      width: 360, maxWidth: "100%", borderRadius: 28,
      background: C.black,
      border: `3px solid ${C.yellow}`,
      overflow: "hidden",
      boxShadow: `0 0 0 6px ${C.yellow}22, 0 0 60px ${C.yellow}33, 0 24px 60px rgba(0,0,0,0.5)`,
      animation: "slideUp 0.4s cubic-bezier(0.34,1.56,0.64,1)",
    }}>
      {/* Full-width square face photo */}
      <div style={{ position: "relative", width: "100%", aspectRatio: "1 / 1", overflow: "hidden" }}>
        <img
          src={croppedUrl} alt="your face"
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center", display: "block" }}
        />
        {/* Gradient fade at bottom so CTA area blends */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: 80,
          background: `linear-gradient(transparent, ${C.black})`,
          pointerEvents: "none",
        }} />
        {/* ✓ Face detected badge */}
        <div style={{
          position: "absolute", top: 12, left: 12,
          background: `${C.green}ee`, borderRadius: 20,
          padding: "5px 12px", display: "flex", alignItems: "center", gap: 6,
          fontFamily: "'Oxanium'", fontSize: 11, fontWeight: 700, color: "#fff",
          boxShadow: `0 2px 12px ${C.green}66`,
        }}>
          ✓ Face detected
        </div>
        {/* X button */}
        <button onClick={reset} style={{
          position: "absolute", top: 12, right: 12,
          background: "rgba(0,0,0,0.65)", border: "1px solid rgba(255,255,255,0.2)",
          borderRadius: "50%", width: 32, height: 32,
          cursor: "pointer", color: C.white,
          fontFamily: "'Oxanium'", fontSize: 14,
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.2s",
        }}
        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,60,172,0.7)"}
        onMouseLeave={e => e.currentTarget.style.background = "rgba(0,0,0,0.65)"}
        >✕</button>
      </div>

      {/* CTA area */}
      <div style={{ padding: "18px 20px 20px", textAlign: "center" }}>
        <div style={{
          fontFamily: "'Oxanium'", fontSize: 12, fontWeight: 600,
          color: "rgba(255,255,255,0.45)", letterSpacing: 0.5, marginBottom: 14,
        }}>
          ✨ Great shot! Ready to find your match
        </div>
        <CTA size="lg" onClick={() => onStartScan(croppedUrl)} style={{ width: "100%", display: "block", textAlign: "center" }}>
          🔍 Find My Doppelganger
        </CTA>
        <div style={{ marginTop: 10, fontFamily: "'Oxanium'", fontSize: 10, color: "rgba(255,255,255,0.2)" }}>
          Tap anywhere outside to cancel
        </div>
      </div>
    </div>
  );
}

// ─── Scanning Animation ───
function ScanningVisual() {
  return (
    <div style={{
      width: 280, height: 360, borderRadius: 24,
      background: C.yellow, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 14,
      position: "relative", overflow: "hidden",
      boxShadow: `6px 6px 0 ${C.black}`, border: `3px solid ${C.black}`,
    }}>
      <div style={{ transform: "scale(0.65)", marginBottom: -8, marginTop: -8 }}>
        <Logo size={32} />
      </div>
      <div style={{ fontFamily: "'Oxanium'", fontWeight: 700, fontSize: 15, color: C.black }}>
        You look amazing...
      </div>
      <div style={{ position: "relative", width: 120, height: 120 }}>
        {[100, 80, 60].map((s, i) => (
          <div key={i} style={{
            position: "absolute", top: "50%", left: "50%",
            width: s + 20, height: s + 20, borderRadius: "50%",
            background: `rgba(200, 200, 0, ${0.15 + i * 0.1})`,
            transform: "translate(-50%, -50%)",
            animation: `pulseRing 2s ease-in-out infinite`,
            animationDelay: `${i * 0.3}s`,
          }} />
        ))}
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: 60, height: 60, borderRadius: "50%",
          background: "linear-gradient(135deg, #ddd, #bbb)",
          border: `3px solid ${C.white}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 24, zIndex: 2,
        }}>🤳</div>
      </div>
      <div style={{ fontFamily: "'Oxanium'", fontSize: 12, color: C.black, textAlign: "center", lineHeight: 1.5, fontWeight: 600 }}>
        Wait a second...<br />We're finding your Doppelganger
      </div>
      <div style={{ width: "60%", height: 4, borderRadius: 2, background: "rgba(0,0,0,0.15)", overflow: "hidden" }}>
        <div style={{
          width: "100%", height: "100%", background: C.black, borderRadius: 2,
          animation: "loadBar 2.5s ease-in-out infinite",
        }} />
      </div>
    </div>
  );
}

// ─── Result Preview ───
function ResultPreview() {
  return (
    <div style={{
      width: 220, borderRadius: 20,
      background: C.white, overflow: "hidden",
      boxShadow: `6px 6px 0 ${C.black}`, border: `3px solid ${C.black}`,
    }}>
      <div style={{
        height: 180, display: "flex",
        background: "linear-gradient(135deg, #f0d0a0, #e8b88a)",
      }}>
        <div style={{
          flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
          background: "linear-gradient(135deg, #f5deb3, #deb887)",
          borderRight: "2px solid rgba(255,255,255,0.5)", fontSize: 40,
        }}>👤</div>
        <div style={{
          flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
          background: "linear-gradient(135deg, #e8b88a, #d4a574)", fontSize: 40,
        }}>🌟</div>
      </div>
      <div style={{ padding: "16px 20px", textAlign: "center" }}>
        <div style={{ fontFamily: "'Oxanium'", fontSize: 11, color: "#999", fontWeight: 500 }}>You look like</div>
        <div style={{ fontFamily: "'Oxanium'", fontSize: 18, fontWeight: 800, color: C.black, marginTop: 4 }}>TAYLOR SWIFT</div>
        <div style={{
          margin: "10px auto 0", width: 50, height: 50, borderRadius: "50%",
          background: `linear-gradient(135deg, ${C.yellow}, #FFC300)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "'Fredoka'", fontSize: 18, fontWeight: 700, color: C.black,
          border: `2px solid ${C.black}`,
        }}>97%</div>
      </div>
    </div>
  );
}

// ─── Stars ───
function Stars({ n = 5, size = 16 }) {
  return (
    <span style={{ display: "inline-flex", gap: 2 }}>
      {[...Array(5)].map((_, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={i < n ? C.yellow : "#444"}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01z" />
        </svg>
      ))}
    </span>
  );
}

// ─── Marquee ───
function Marquee() {
  const items = [
    "Taylor Swift 97%", "Timothée Chalamet 94%", "Zendaya 96%", "Bad Bunny 91%",
    "Selena Gomez 93%", "Henry Cavill 89%", "Billie Eilish 90%", "Messi 88%",
    "Ana de Armas 92%", "Harry Styles 87%", "Rihanna 95%", "LeBron 85%",
  ];
  return (
    <div style={{ overflow: "hidden", width: "100%", padding: "14px 0" }}>
      <div style={{
        display: "flex", gap: 12, animation: "marquee 40s linear infinite", width: "max-content",
      }}>
        {[...items, ...items].map((item, i) => (
          <div key={i} style={{
            background: "rgba(0,0,0,0.25)", backdropFilter: "blur(8px)",
            borderRadius: 30, padding: "8px 18px",
            fontFamily: "'Oxanium'", fontSize: 13, fontWeight: 600,
            color: C.white, whiteSpace: "nowrap",
            border: "1px solid rgba(255,255,255,0.15)",
          }}>
            ⭐ {item}
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════
export default function CelebsWebExperience() {
  const [scrollY,        setScrollY]        = useState(0);
  const [page,           setPage]            = useState("landing");
  const [uploadedPhoto,  setUploadedPhoto]   = useState(null);
  const [spotlight,      setSpotlight]       = useState(false);
  const [preloadedResult,setPreloadedResult] = useState(null); // for dashboard replay
  const [hasDashboard,   setHasDashboard]    = useState(() => hasGenerations());

  const handleStartScan = (photoUrl) => {
    setSpotlight(false);
    setUploadedPhoto(photoUrl);
    setPreloadedResult(null);
    setPage("analyzing");
  };

  const handleAnalysisComplete = () => setPage("results");

  const handleReset = () => {
    setSpotlight(false);
    setUploadedPhoto(null);
    setPreloadedResult(null);
    setPage("landing");
  };

  const handleGoToDashboard = () => {
    setHasDashboard(hasGenerations()); // refresh
    setPage("dashboard");
  };

  // Called from dashboard when user taps "View results" on a generation card
  const handleViewResult = (gen) => {
    setUploadedPhoto(gen.preview); // use the saved 320px preview as photo
    setPreloadedResult(gen);       // pass full gen so ResultsPage skips re-rolling
    setPage("results");
  };

  // After results auto-saves, refresh hasDashboard flag
  const handleResultsMounted = () => {
    setHasDashboard(true);
  };

  useEffect(() => {
    const h = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  // ── Full-screen overlay pages ──
  if (page === "analyzing") {
    return <AnalyzingPage photo={uploadedPhoto} onComplete={handleAnalysisComplete} />;
  }
  if (page === "results") {
    return (
      <ResultsPage
        photo={uploadedPhoto}
        onReset={handleReset}
        onDashboard={handleGoToDashboard}
        preloaded={preloadedResult}
        onMount={handleResultsMounted}
      />
    );
  }
  if (page === "dashboard") {
    return (
      <DashboardPage
        onNew={handleReset}
        onViewResult={handleViewResult}
        onBack={() => setPage("landing")}
      />
    );
  }

  const reviews = [
    { name: "Sarah K.", text: "I can't believe how accurate it is! My whole family couldn't stop laughing.", stars: 5, match: "Shakira 94%" },
    { name: "James R.", text: "Most fun I've had online this year. Everyone at the office tried it.", stars: 5, match: "Brad Pitt 87%" },
    { name: "Laura M.", text: "Perfect icebreaker at parties. Everyone wants to know their Doppelganger.", stars: 5, match: "Rihanna 91%" },
    { name: "Diego S.", text: "The AI is impressive. Tried old photos and current ones — always nails it!", stars: 4, match: "Messi 89%" },
  ];

  return (
    <div style={{ fontFamily: "'Oxanium', sans-serif", background: C.black, color: C.white, overflowX: "hidden", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700&family=Oxanium:wght@300;400;500;600;700;800&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }

        @keyframes marquee { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        @keyframes floatCard { 0%,100%{} 50%{transform:translateY(-8px)} }
        @keyframes float1 { 0%,100%{transform:translateY(0) rotate(-8deg)} 50%{transform:translateY(-12px) rotate(-6deg)} }
        @keyframes float2 { 0%,100%{transform:translateY(0) rotate(5deg)} 50%{transform:translateY(-10px) rotate(7deg)} }
        @keyframes float3 { 0%,100%{transform:translateY(0) rotate(-3deg)} 50%{transform:translateY(-14px) rotate(-5deg)} }
        @keyframes pulseRing { 0%,100%{transform:translate(-50%,-50%) scale(1);opacity:0.4} 50%{transform:translate(-50%,-50%) scale(1.15);opacity:0.15} }
        @keyframes loadBar { 0%{transform:translateX(-100%)} 50%{transform:translateX(0)} 100%{transform:translateX(100%)} }
        @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.06)} }
        @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes slideUp { from{opacity:0;transform:translateY(50px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes badgeFloat1 { 0%,100%{transform:translate(0,0)} 33%{transform:translate(6px,-10px)} 66%{transform:translate(-4px,6px)} }
        @keyframes badgeFloat2 { 0%,100%{transform:translate(0,0)} 33%{transform:translate(-8px,6px)} 66%{transform:translate(5px,-8px)} }
        @keyframes badgeFloat3 { 0%,100%{transform:translate(0,0)} 33%{transform:translate(4px,8px)} 66%{transform:translate(-6px,-6px)} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes scanLine { 0%{top:0%} 50%{top:calc(100% - 3px)} 100%{top:0%} }
        @keyframes spotlightIn  { from{opacity:0} to{opacity:1} }
        @keyframes spotlightOut { from{opacity:1} to{opacity:0} }

        .halftone {
          background-image: radial-gradient(circle, rgba(0,0,0,0.07) 1px, transparent 1px);
          background-size: 16px 16px;
        }
        .halftone-light {
          background-image: radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px);
          background-size: 18px 18px;
        }

        .step-card:hover { transform: translateY(-8px) !important; box-shadow: 8px 8px 0 ${C.yellow} !important; }
        .review-card:hover { border-color: ${C.yellow} !important; transform: scale(1.03) !important; }
        .use-card:hover { transform: rotate(-1deg) scale(1.04) !important; }

        .glow-text {
          background: linear-gradient(90deg, ${C.yellow}, ${C.cyan}, ${C.yellow});
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 3s linear infinite;
        }

        @keyframes ctaPulse {
          0%,100% { box-shadow: 4px 4px 0 ${C.black}, 0 0 0 0 ${C.yellow}66; transform: scale(1); }
          50% { box-shadow: 4px 4px 0 ${C.black}, 0 0 0 12px ${C.yellow}00; transform: scale(1.02); }
        }
        .cta-main { animation: ctaPulse 2.4s ease-in-out infinite !important; }

        /* ── TABLET (≤860px) ── */
        @media (max-width: 860px) {
          .hero-grid { flex-direction: column !important; text-align: center !important; align-items: center !important; gap: 28px !important; }
          .hero-left { align-items: center !important; }
          .hero-left .hero-badge { align-self: center !important; }
          .hero-left > a { align-self: center !important; }
          .hero-visual { display: flex !important; justify-content: center !important; width: 100% !important; }
          .hero-upload { width: min(400px, 92vw) !important; }
          .hero-stats { justify-content: center !important; }
          .steps-row { flex-direction: column !important; align-items: center !important; }
          .excl-grid { flex-direction: column !important; align-items: center !important; text-align: center !important; }
          .gallery-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .reviews-grid { grid-template-columns: 1fr !important; }
          .use-grid { grid-template-columns: 1fr !important; }
          .stats-row { flex-wrap: wrap !important; gap: 24px !important; }
          .footer-inner { flex-direction: column !important; gap: 24px !important; text-align: center !important; }
          .how-demo { flex-direction: column !important; }
        }

        /* ── MOBILE (≤600px) ── */
        @media (max-width: 600px) {
          .nav-links { display: none !important; }
          .hero-section { padding: 82px 16px 36px !important; }
          .hero-upload { width: calc(100vw - 32px) !important; max-width: 100% !important; }
          .upload-cta-btn { width: 100% !important; }
          .hero-stats { gap: 8px !important; font-size: 12px !important; }
          .hero-stats-sep { display: none !important; }
          .footer-links { flex-wrap: wrap !important; gap: 12px !important; justify-content: center !important; }
        }

        /* ── SMALL MOBILE (≤400px) ── */
        @media (max-width: 400px) {
          .gallery-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ═══════════ SPOTLIGHT OVERLAY ═══════════ */}
      {spotlight && (
        <div
          onClick={handleReset}
          style={{
            position: "fixed", inset: 0, zIndex: 1000,
            background: "rgba(0,0,0,0.82)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            animation: "spotlightIn 0.45s ease",
            cursor: "pointer",
          }}
        />
      )}

      {/* ═══════════ NAVBAR ═══════════ */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: scrollY > 60 ? "rgba(42,171,226,0.95)" : "transparent",
        backdropFilter: scrollY > 60 ? "blur(16px)" : "none",
        borderBottom: scrollY > 60 ? `2px solid ${C.yellow}44` : "none",
        padding: "10px 20px", transition: "all 0.35s ease",
      }}>
        <div style={{ maxWidth: 1140, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ transform: "scale(0.55)", transformOrigin: "left center", flexShrink: 0 }}>
            <Logo size={38} />
          </div>
          <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
            <div className="nav-links" style={{ display: "flex", gap: 24, alignItems: "center" }}>
              {["How it works", "Results"].map(l => (
                <a key={l} href={`#${l.toLowerCase().replace(/ /g, "-")}`} style={{
                  color: "rgba(255,255,255,0.85)", textDecoration: "none",
                  fontFamily: "'Oxanium'", fontSize: 13, fontWeight: 600,
                  letterSpacing: 0.5, transition: "color 0.2s", whiteSpace: "nowrap",
                }} onMouseEnter={e => e.target.style.color = C.yellow} onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.85)"}>
                  {l}
                </a>
              ))}
            </div>
            {/* Dashboard icon — only shown when user has past generations */}
            {hasDashboard && (
              <button
                onClick={handleGoToDashboard}
                title="My Results"
                style={{
                  background: "rgba(255,229,0,0.15)", border: `1.5px solid ${C.yellow}66`,
                  borderRadius: 10, padding: "7px 14px",
                  fontFamily: "'Oxanium'", fontWeight: 700, fontSize: 12,
                  color: C.yellow, cursor: "pointer", letterSpacing: 0.5,
                  display: "flex", alignItems: "center", gap: 6,
                  transition: "all 0.2s",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = `${C.yellow}28`; e.currentTarget.style.borderColor = C.yellow; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,229,0,0.15)"; e.currentTarget.style.borderColor = `${C.yellow}66`; }}
              >
                📊 My Results
              </button>
            )}
            <CTA size="sm" style={{ whiteSpace: "nowrap" }}>Get Started</CTA>
          </div>
        </div>
      </nav>

      {/* ═══════════ HERO ═══════════ */}
      <section className="hero-section" style={{
        background: `linear-gradient(165deg, ${C.blue} 0%, ${C.darkBlue} 60%, #1478a0 100%)`,
        padding: "110px 24px 44px", position: "relative", overflow: "hidden",
      }}>
        {/* Decorative blobs */}
        <div style={{ position: "absolute", top: 60, left: "-5%", width: 350, height: 350, borderRadius: "50%", background: `radial-gradient(circle, ${C.yellow}12, transparent 65%)`, filter: "blur(50px)" }} />
        <div style={{ position: "absolute", bottom: 40, right: "-5%", width: 250, height: 250, borderRadius: "50%", background: `radial-gradient(circle, ${C.pink}10, transparent 65%)`, filter: "blur(40px)" }} />

        <div className="hero-grid" style={{ maxWidth: 1140, margin: "0 auto", display: "flex", gap: 48, alignItems: "center" }}>
          {/* LEFT */}
          <div className="hero-left" style={{ flex: "1 1 45%", minWidth: 260, animation: "slideUp 0.8s ease-out", display: "flex", flexDirection: "column" }}>
            <div className="hero-badge" style={{
              display: "inline-block", background: "rgba(0,0,0,0.25)", borderRadius: 30,
              padding: "6px 16px", fontFamily: "'Oxanium'", fontSize: 12,
              fontWeight: 700, color: C.yellow, letterSpacing: 1,
              border: `1px solid ${C.yellow}44`, marginBottom: 18, alignSelf: "flex-start",
            }}>
              🔥 #1 ENTERTAINMENT PLATFORM
            </div>

            <h1 style={{
              fontFamily: "'Fredoka', sans-serif", fontSize: "clamp(42px, 6.5vw, 80px)",
              fontWeight: 700, lineHeight: 0.95, color: C.yellow, letterSpacing: 1,
              textShadow: `4px 4px 0 ${C.black}, 8px 8px 0 rgba(0,0,0,0.15)`,
            }}>
              Find Your<br />Celebrity<br />
              <span style={{ color: C.white, textShadow: `3px 3px 0 ${C.black}, 0 0 30px rgba(255,229,0,0.3)` }}>Doppelganger</span>
            </h1>

            <p style={{ fontSize: "clamp(13px,1.8vw,15px)", color: "rgba(255,255,255,0.75)", marginTop: 16, lineHeight: 1.65, maxWidth: 420, fontWeight: 400 }}>
              Upload your selfie and our AI finds your celebrity Doppelganger in seconds. 4,000+ facial points. 100% free.
            </p>

            <div className="hero-stats" style={{ display: "flex", gap: 12, marginTop: 20, alignItems: "center", flexWrap: "nowrap", fontSize: 13, color: "rgba(255,255,255,0.55)", fontWeight: 500 }}>
              <span style={{ whiteSpace: "nowrap" }}><Stars n={5} size={13} /> 4.8/5</span>
              <span className="hero-stats-sep" style={{ color: "rgba(255,255,255,0.2)" }}>|</span>
              <span style={{ whiteSpace: "nowrap" }}>12M+ users</span>
              <span className="hero-stats-sep" style={{ color: "rgba(255,255,255,0.2)" }}>|</span>
              <span style={{ whiteSpace: "nowrap" }}>Instant results</span>
            </div>

            <a href="#how-it-works" style={{
              display: "inline-block", marginTop: 20, alignSelf: "flex-start",
              fontFamily: "'Oxanium'", fontSize: 12, fontWeight: 600,
              color: "rgba(255,255,255,0.35)", textDecoration: "none", transition: "color 0.2s",
            }}
            onMouseEnter={e => e.currentTarget.style.color = C.yellow}
            onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.35)"}>
              ↓ How does it work?
            </a>
          </div>

          {/* RIGHT — Interactive Upload */}
          <div className="hero-visual" style={{
            flex: "0 0 auto",
            display: "flex", alignItems: "center", justifyContent: "center",
            animation: "fadeIn 0.9s ease-out",
            position: "relative",
            zIndex: spotlight ? 1001 : "auto",
            transition: "transform 0.35s cubic-bezier(0.34,1.56,0.64,1)",
            transform: spotlight ? "scale(1.03)" : "scale(1)",
          }}>
            <HeroUpload onStartScan={handleStartScan} onSpotlight={setSpotlight} />
          </div>
        </div>

        {/* Marquee */}
        <div style={{ maxWidth: 1140, margin: "36px auto 0" }}>
          <Marquee />
        </div>
      </section>

      {/* ═══════════ STATS BAR ═══════════ */}
      <div style={{
        background: C.yellow, padding: "32px 24px",
        borderTop: `4px solid ${C.black}`, borderBottom: `4px solid ${C.black}`,
      }}>
        <div className="stats-row" style={{
          maxWidth: 960, margin: "0 auto",
          display: "flex", justifyContent: "space-around", alignItems: "center", gap: 16,
        }}>
          {[
            { v: 12, s: "M+", l: "Users" },
            { v: 500, s: "M+", l: "Photos Analyzed" },
            { v: 150, s: "+", l: "Countries" },
            { v: 50000, s: "+", l: "Celebrities" },
          ].map((st, i) => (
            <div key={i} style={{ textAlign: "center", flex: 1, minWidth: 100 }}>
              <div style={{ fontFamily: "'Fredoka'", fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 700, color: C.black, lineHeight: 1 }}>
                <Counter end={st.v} suffix={st.s} />
              </div>
              <div style={{ fontFamily: "'Oxanium'", fontSize: 12, fontWeight: 700, color: "rgba(0,0,0,0.55)", marginTop: 4, textTransform: "uppercase", letterSpacing: 1 }}>
                {st.l}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <section id="how-it-works" className="halftone-light" style={{
        background: C.black, padding: "90px 24px", position: "relative",
      }}>
        <div style={{ maxWidth: 1140, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{
              display: "inline-block", background: `${C.blue}22`,
              borderRadius: 30, padding: "6px 18px",
              fontFamily: "'Oxanium'", fontSize: 12, fontWeight: 800,
              color: C.blue, letterSpacing: 1, border: `1px solid ${C.blue}44`,
              textTransform: "uppercase",
            }}>Super Simple</div>
            <h2 style={{
              fontFamily: "'Fredoka'", fontSize: "clamp(38px, 5vw, 58px)",
              fontWeight: 700,
              color: C.yellow, marginTop: 14,
              textShadow: `3px 3px 0 ${C.blue}`,
            }}>How Does It Work?</h2>
            <p style={{ fontFamily: "'Oxanium'", color: "rgba(255,255,255,0.55)", marginTop: 8, fontSize: 15, fontWeight: 400 }}>
              3 steps. 10 seconds. Zero hassle.
            </p>
          </div>

          <div className="steps-row" style={{ display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap" }}>
            {[
              { step: "01", icon: "📸", title: "Upload your selfie", desc: "Drag your photo or take one with your webcam. No sign-up needed.", color: C.yellow },
              { step: "02", icon: "🧠", title: "AI scans your face", desc: "We analyze over 4,000 facial points and compare against our celebrity database.", color: C.blue },
              { step: "03", icon: "🌟", title: "Meet your Doppelganger", desc: "See a split-face comparison with your celebrity match and similarity score.", color: C.pink },
            ].map((s, i) => (
              <div key={i} className="step-card" style={{
                flex: "1 1 280px", maxWidth: 320,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 22, padding: "36px 28px", textAlign: "center",
                transition: "all 0.35s ease", cursor: "default",
                boxShadow: `4px 4px 0 ${s.color}33`,
                position: "relative", overflow: "hidden",
              }}>
                <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: `${s.color}08`, filter: "blur(15px)" }} />
                <div style={{ fontFamily: "'Oxanium'", fontSize: 12, fontWeight: 800, color: s.color, letterSpacing: 4, marginBottom: 14, textTransform: "uppercase" }}>
                  Step {s.step}
                </div>
                <div style={{ fontSize: 48, marginBottom: 14 }}>{s.icon}</div>
                <h3 style={{ fontFamily: "'Fredoka'", fontSize: 22, fontWeight: 700, color: C.white, letterSpacing: 0.5, marginBottom: 10 }}>
                  {s.title}
                </h3>
                <p style={{ fontFamily: "'Oxanium'", fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.65, fontWeight: 400 }}>
                  {s.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Visual demo: scanning + result */}
          <div className="how-demo" style={{
            display: "flex", gap: 40, justifyContent: "center", alignItems: "center",
            marginTop: 60, flexWrap: "wrap",
          }}>
            <ScanningVisual />
            <div style={{ fontSize: 36, color: C.yellow, fontFamily: "'Fredoka'" }}>→</div>
            <ResultPreview />
          </div>

          <div style={{ textAlign: "center", marginTop: 48 }}>
            <CTA size="lg">Try It Now — Free</CTA>
          </div>
        </div>
      </section>

      {/* ═══════════ EXCLUSIVITY ═══════════ */}
      <section className="halftone" style={{
        background: C.yellow, padding: "90px 24px", position: "relative", overflow: "hidden",
      }}>
        <div style={{ maxWidth: 1140, margin: "0 auto" }}>
          <div className="excl-grid" style={{ display: "flex", gap: 56, alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
            <div style={{ flex: "1 1 340px", maxWidth: 500 }}>
              <h2 style={{
                fontFamily: "'Fredoka'", fontSize: "clamp(42px, 6vw, 68px)",
                fontWeight: 700,
                color: C.black, lineHeight: 0.95,
                textShadow: `3px 3px 0 ${C.blue}`,
              }}>
                Only 5%<br />Find Their<br />Doppelganger
              </h2>
              <p style={{
                fontFamily: "'Oxanium'", fontSize: 15, color: "rgba(0,0,0,0.7)",
                marginTop: 18, lineHeight: 1.65, fontWeight: 400, maxWidth: 420,
              }}>
                Our AI analyzes over 4,000 reference points on your face — bone structure, eye spacing, jawline, and more. Will you be part of the elite 5%?
              </p>
              <div style={{ marginTop: 28 }}>
                <CTA variant="black" size="lg">🎯 Discover My Doppelganger</CTA>
              </div>
            </div>

            <div style={{ flex: "0 0 auto", position: "relative", width: 260, height: 260 }}>
              <div style={{
                width: 200, height: 200, borderRadius: "50%",
                background: C.white, border: `5px solid ${C.black}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 72, boxShadow: `8px 8px 0 ${C.black}`,
                animation: "pulse 2.5s ease-in-out infinite",
                position: "absolute", top: 30, left: 30,
              }}>📷</div>
              {[
                { top: 0, left: -10, pct: "97%", bg: C.green, anim: "badgeFloat1" },
                { top: 20, right: -25, pct: "94%", bg: C.blue, anim: "badgeFloat2" },
                { bottom: 5, left: 10, pct: "91%", bg: C.pink, anim: "badgeFloat3" },
              ].map((b, i) => (
                <div key={i} style={{
                  position: "absolute",
                  top: b.top, bottom: b.bottom, left: b.left, right: b.right,
                  background: b.bg, color: C.white,
                  fontFamily: "'Fredoka'", fontSize: 17, fontWeight: 700,
                  padding: "6px 14px", borderRadius: 12,
                  border: `2px solid ${C.white}`,
                  boxShadow: "3px 3px 0 rgba(0,0,0,0.2)",
                  animation: `${b.anim} ${3 + i * 0.5}s ease-in-out infinite`,
                  zIndex: 3,
                }}>{b.pct}</div>
              ))}
              {/* Starburst decorations */}
              {[{ top: -20, right: 20, s: 28 }, { bottom: -10, right: -15, s: 22 }].map((d, i) => (
                <svg key={i} style={{ position: "absolute", top: d.top, bottom: d.bottom, right: d.right, animation: `spin ${8 + i * 4}s linear infinite` }}
                  width={d.s} height={d.s} viewBox="0 0 24 24" fill={C.black}>
                  <path d="M12 0l2.5 8.5L24 12l-9.5 3.5L12 24l-2.5-8.5L0 12l9.5-3.5z" />
                </svg>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ RESULTS GALLERY ═══════════ */}
      <section id="results" style={{ background: C.black, padding: "90px 24px", position: "relative" }}>
        <div style={{ maxWidth: 1140, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <h2 style={{
              fontFamily: "'Fredoka'", fontSize: "clamp(36px, 5vw, 54px)", fontWeight: 700, color: C.yellow,
              textShadow: `3px 3px 0 ${C.blue}`,
            }}>Real Results, Real People</h2>
            <p style={{ fontFamily: "'Oxanium'", color: "rgba(255,255,255,0.5)", marginTop: 8, fontSize: 14 }}>
              See what our users discovered about their celebrity Doppelganger
            </p>
          </div>
          <div className="gallery-grid" style={{
            display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
            gap: 20, maxWidth: 860, margin: "0 auto",
          }}>
            {[
              { n: "Michael B. Jordan", p: 94, c: C.blue,   r: -3, user: "/samples/user1.jpg", celeb: "/samples/celeb_michael_jordan.jpg" },
              { n: "Lisa – BLACKPINK",  p: 96, c: C.pink,   r: 4,  user: "/samples/user2.jpg", celeb: "/samples/celeb_lisa.jpg"           },
              { n: "Timothée Chalamet", p: 93, c: C.purple, r: -2, user: "/samples/user3.jpg", celeb: "/samples/celeb_timothee.jpg"        },
              { n: "Taylor Swift",      p: 97, c: C.yellow, r: 5,  user: "/samples/user4.jpg", celeb: "/samples/celeb_taylor.jpg"          },
              { n: "Henry Cavill",      p: 91, c: C.cyan,   r: 3,  user: "/samples/user5.jpg", celeb: "/samples/celeb_henry.jpg"           },
              { n: "Billie Eilish",     p: 89, c: C.green,  r: -4, user: "/samples/user3.jpg", celeb: "/samples/celeb_billie.jpg"          },
              { n: "Selena Gomez",      p: 92, c: C.pink,   r: 2,  user: "/samples/user2.jpg", celeb: "/samples/celeb_selena.jpg"          },
              { n: "Harry Styles",      p: 88, c: C.blue,   r: -5, user: "/samples/user1.jpg", celeb: "/samples/celeb_harry.jpg"           },
            ].map((c, i) => (
              <PolaroidCard key={i} name={c.n} pct={c.p} color={c.c} rotation={c.r} delay={i * 0.2} userImg={c.user} celebImg={c.celeb} />
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 44 }}>
            <CTA size="lg">Find My Doppelganger</CTA>
          </div>
        </div>
      </section>

      {/* ═══════════ REVIEWS ═══════════ */}
      <section style={{
        background: `linear-gradient(180deg, #0a0a1a, ${C.black})`,
        padding: "90px 24px",
      }}>
        <div style={{ maxWidth: 1140, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{
              display: "inline-block", background: `${C.pink}22`,
              borderRadius: 30, padding: "6px 18px",
              fontFamily: "'Oxanium'", fontSize: 12, fontWeight: 800,
              color: C.pink, letterSpacing: 1, border: `1px solid ${C.pink}44`,
              textTransform: "uppercase",
            }}>Real Reviews</div>
            <h2 style={{ fontFamily: "'Fredoka'", fontSize: "clamp(36px, 5vw, 54px)", fontWeight: 700, color: C.white, marginTop: 14 }}>
              What People Are <span className="glow-text">Saying</span>
            </h2>
          </div>
          <div className="reviews-grid" style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20,
          }}>
            {reviews.map((r, i) => (
              <div key={i} className="review-card" style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 18, padding: 24,
                transition: "all 0.3s ease", cursor: "default",
              }}>
                <Stars n={r.stars} size={14} />
                <p style={{ fontFamily: "'Oxanium'", fontSize: 13, color: "rgba(255,255,255,0.75)", marginTop: 14, lineHeight: 1.65, fontStyle: "italic", fontWeight: 400 }}>
                  "{r.text}"
                </p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
                  <span style={{ fontFamily: "'Oxanium'", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.4)" }}>— {r.name}</span>
                  <span style={{
                    background: "rgba(255,255,255,0.08)", padding: "3px 10px",
                    borderRadius: 14, fontFamily: "'Oxanium'", fontSize: 11,
                    fontWeight: 700, color: C.yellow,
                  }}>{r.match}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ USE CASES ═══════════ */}
      <section style={{ background: C.blue, padding: "90px 24px", position: "relative", overflow: "hidden" }}>
        <div className="halftone-light" style={{ position: "absolute", inset: 0 }} />
        <div style={{ maxWidth: 1140, margin: "0 auto", position: "relative", zIndex: 2 }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{
              fontFamily: "'Fredoka'", fontSize: "clamp(36px, 5vw, 56px)",
              fontWeight: 700,
              color: C.yellow, textShadow: `3px 3px 0 rgba(0,0,0,0.25)`,
            }}>A Thousand Ways to Have Fun</h2>
          </div>
          <div className="use-grid" style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20,
          }}>
            {[
              { emoji: "😂", t: "Hilarious Results", d: "Get unexpected matches that will make you cry laughing", bg: C.yellow, c: C.black },
              { emoji: "👨‍👩‍👧‍👦", t: "Family & Friends", d: "Try it in groups and compare your celebrity Doppelgangers", bg: C.pink, c: C.white },
              { emoji: "💑", t: "Couples", d: "Find out which celebrity couple you'd be together", bg: C.purple, c: C.white },
              { emoji: "📱", t: "Share Everywhere", d: "Perfect results for Instagram, TikTok, and Snapchat", bg: C.cyan, c: C.black },
            ].map((u, i) => (
              <div key={i} className="use-card" style={{
                background: u.bg, borderRadius: 22, padding: 28,
                border: `3px solid ${C.black}`, boxShadow: `5px 5px 0 ${C.black}`,
                transition: "all 0.3s ease", cursor: "default",
              }}>
                <div style={{ fontSize: 44, marginBottom: 14 }}>{u.emoji}</div>
                <h3 style={{ fontFamily: "'Fredoka'", fontSize: 22, fontWeight: 700, color: u.c, letterSpacing: 0.5, marginBottom: 8 }}>{u.t}</h3>
                <p style={{ fontFamily: "'Oxanium'", fontSize: 13, color: u.c, opacity: 0.8, lineHeight: 1.55, fontWeight: 400 }}>{u.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ FINAL CTA ═══════════ */}
      <section style={{ background: C.black, padding: "90px 24px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div style={{
            background: `linear-gradient(135deg, ${C.yellow}0A, ${C.blue}0A)`,
            border: `2px solid ${C.yellow}25`,
            borderRadius: 32, padding: "60px 40px", textAlign: "center",
            position: "relative", overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", top: -80, left: "50%", transform: "translateX(-50%)",
              width: 350, height: 350, borderRadius: "50%",
              background: `radial-gradient(circle, ${C.yellow}12, transparent 60%)`, filter: "blur(50px)",
            }} />
            <div style={{ position: "relative", zIndex: 2 }}>
              <div style={{ fontSize: 52, marginBottom: 14 }}>🌟</div>
              <h2 style={{
                fontFamily: "'Fredoka'", fontSize: "clamp(36px, 5vw, 58px)",
                fontWeight: 700,
                color: C.yellow, lineHeight: 1,
                textShadow: `3px 3px 0 ${C.blue}`,
              }}>
                Ready to Meet<br />Your Doppelganger?
              </h2>
              <p style={{
                fontFamily: "'Oxanium'", color: "rgba(255,255,255,0.55)",
                fontSize: 15, marginTop: 18, maxWidth: 440, margin: "18px auto 0", lineHeight: 1.6, fontWeight: 400,
              }}>
                Join over 12 million people who already found their celebrity doppelganger.
              </p>
              <div style={{ display: "flex", gap: 14, justifyContent: "center", marginTop: 36, flexWrap: "wrap" }}>
                <CTA size="lg">🚀 Upload My Photo — It's Free</CTA>
              </div>
              <p style={{ fontFamily: "'Oxanium'", color: "rgba(255,255,255,0.3)", fontSize: 12, marginTop: 20, fontWeight: 500 }}>
                No sign-up · Instant results · Secure payment
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer style={{
        background: C.black, borderTop: `3px solid ${C.yellow}`,
        padding: "40px 24px 28px",
      }}>
        <div className="footer-inner" style={{
          maxWidth: 1140, margin: "0 auto",
          display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20,
        }}>
          <div>
            <div style={{ transform: "scale(0.5)", transformOrigin: "left center" }}>
              <Logo size={36} />
            </div>
            <p style={{ fontFamily: "'Oxanium'", fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 4, fontWeight: 400 }}>
              The #1 AI Celebrity Doppelganger Platform
            </p>
          </div>
          <div style={{ display: "flex", gap: 24 }}>
            {["Contact", "Terms", "Privacy", "FAQ"].map(l => (
              <a key={l} href="#" style={{
                fontFamily: "'Oxanium'", color: "rgba(255,255,255,0.45)",
                textDecoration: "none", fontSize: 12, fontWeight: 600,
                transition: "color 0.2s",
              }} onMouseEnter={e => e.target.style.color = C.yellow} onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.45)"}>
                {l}
              </a>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {["TikTok", "IG"].map((s, i) => (
              <div key={i} style={{
                width: 34, height: 34, borderRadius: "50%",
                border: "1px solid rgba(255,255,255,0.18)",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", transition: "all 0.2s",
                fontFamily: "'Oxanium'", fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.5)",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.yellow; e.currentTarget.style.color = C.yellow; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}>
                {s}
              </div>
            ))}
          </div>
        </div>
        <div style={{ textAlign: "center", marginTop: 24, fontFamily: "'Oxanium'", fontSize: 11, color: "rgba(255,255,255,0.2)", fontWeight: 400 }}>
          © 2025 Celebs. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
