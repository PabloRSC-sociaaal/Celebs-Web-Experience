import { useState, useEffect, useRef } from "react";
import { colors, fonts } from "../../design/tokens";
import { Button } from "../Button";
import { detectAndCropFace } from "../../features/face/detect";

const STEPS = [
  { icon: "📸", label: "Loading your photo" },
  { icon: "🔍", label: "Detecting your face" },
  { icon: "✂️",  label: "Cropping to face" },
  { icon: "⚡", label: "Almost ready" },
];

export function HeroUpload({ onStartScan, onSpotlight }) {
  const [dragging,   setDragging]   = useState(false);
  const [rawPreview, setRawPreview] = useState(null);
  const [croppedUrl, setCroppedUrl] = useState(null);
  const [phase,      setPhase]      = useState("idle"); // idle | validating | ready | error
  const [stepIdx,    setStepIdx]    = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (phase !== "validating") return;
    const id = setInterval(() => setStepIdx(i => (i + 1) % STEPS.length), 500);
    return () => clearInterval(id);
  }, [phase]);

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
    } catch {
      setCroppedUrl(raw);
      setPhase("ready");
      onSpotlight?.(true);
    }
  };

  const handleDrop = (e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); };

  const reset = () => {
    setRawPreview(null); setCroppedUrl(null); setPhase("idle"); setStepIdx(0);
    onSpotlight?.(false);
  };

  if (phase === "idle") return (
    <div
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className="hero-upload"
      style={{
        width: 360, maxWidth: "100%", minHeight: 360, borderRadius: 28,
        border: `3px dashed ${dragging ? colors.yellow : `${colors.yellow}88`}`,
        background: dragging ? `rgba(255,229,0,0.12)` : `rgba(0,0,0,0.25)`,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16,
        cursor: "pointer", transition: "all 0.25s ease",
        boxShadow: dragging
          ? `0 0 40px ${colors.yellow}44, inset 0 0 40px ${colors.yellow}08`
          : `0 8px 40px rgba(0,0,0,0.3), inset 0 0 40px rgba(255,229,0,0.03)`,
        backdropFilter: "blur(12px)", position: "relative", overflow: "hidden",
      }}
    >
      <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }}
        onChange={e => handleFile(e.target.files[0])} />
      <div style={{
        position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
        width: 240, height: 240, borderRadius: "50%",
        background: `radial-gradient(circle, ${colors.yellow}18, transparent 65%)`,
        filter: "blur(30px)", pointerEvents: "none",
      }} />
      <div style={{
        width: 96, height: 96, borderRadius: "50%",
        background: `linear-gradient(135deg, ${colors.yellow}33, ${colors.yellow}11)`,
        border: `2px solid ${colors.yellow}66`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 42, transition: "transform 0.25s",
        transform: dragging ? "scale(1.15)" : "scale(1)",
        boxShadow: `0 0 20px ${colors.yellow}22`,
      }}>📸</div>
      <div style={{ textAlign: "center", zIndex: 1 }}>
        <div style={{ fontFamily: fonts.display, fontSize: 24, fontWeight: 700, color: colors.white, letterSpacing: 0.5 }}>
          {dragging ? "Drop it! 🎯" : "Upload your photo"}
        </div>
        <div style={{ fontFamily: fonts.body, fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.6)", marginTop: 6 }}>
          Drag & drop or click to browse
        </div>
        <div style={{ fontFamily: fonts.body, fontSize: 11, fontWeight: 400, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>
          JPG, PNG, HEIC · Max 10MB
        </div>
      </div>
      <div className="upload-cta-btn cta-main" style={{
        marginTop: 4, background: colors.yellow, color: colors.black,
        fontFamily: fonts.body, fontWeight: 800, fontSize: 15,
        padding: "16px 0", borderRadius: 14, border: `3px solid ${colors.black}`,
        boxShadow: `4px 4px 0 ${colors.black}`, letterSpacing: 1.2,
        textTransform: "uppercase", textAlign: "center", width: "85%",
      }}>
        📸 Choose Photo
      </div>
      <div style={{ display: "flex", gap: 12, alignItems: "center", fontFamily: fonts.body, fontSize: 11, color: "rgba(255,255,255,0.25)" }}>
        <span>🔒 Private</span><span>·</span><span>⚡ Instant</span><span>·</span><span>🆓 Free</span>
      </div>
    </div>
  );

  if (phase === "validating") {
    const step = STEPS[stepIdx];
    return (
      <div className="hero-upload" style={{
        width: 360, maxWidth: "100%", minHeight: 320, borderRadius: 28,
        background: "rgba(0,0,0,0.35)", border: `3px solid ${colors.yellow}55`,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20,
        backdropFilter: "blur(12px)", position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0, backgroundImage: `url(${rawPreview})`,
          backgroundSize: "cover", backgroundPosition: "top center",
          filter: "brightness(0.18) blur(6px)",
        }} />
        <div style={{
          position: "relative", width: 88, height: 88, borderRadius: "50%",
          border: `3px solid ${colors.yellow}88`, display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: 36,
          animation: "ctaPulse 1.2s ease-in-out infinite", zIndex: 1,
        }}>
          {step.icon}
          <svg style={{ position: "absolute", inset: -4, width: 96, height: 96, animation: "spin 1.4s linear infinite" }} viewBox="0 0 96 96">
            <circle cx="48" cy="48" r="44" fill="none" stroke={colors.yellow} strokeWidth="3" strokeDasharray="80 200" strokeLinecap="round" />
          </svg>
        </div>
        <div style={{ textAlign: "center", zIndex: 1 }}>
          <div style={{ fontFamily: fonts.display, fontSize: 20, fontWeight: 700, color: colors.white }}>{step.label}</div>
          <div style={{ fontFamily: fonts.body, fontSize: 11, fontWeight: 500, color: "rgba(255,255,255,0.35)", marginTop: 6 }}>
            Scanning for facial structure
          </div>
        </div>
        <div style={{ width: "70%", height: 3, borderRadius: 2, background: "rgba(255,255,255,0.1)", overflow: "hidden", zIndex: 1 }}>
          <div style={{ height: "100%", borderRadius: 2, background: `linear-gradient(90deg, ${colors.blue}, ${colors.yellow})`, animation: "loadBar 1.6s ease-in-out infinite" }} />
        </div>
      </div>
    );
  }

  if (phase === "error") return (
    <div className="hero-upload" style={{
      width: 360, maxWidth: "100%", minHeight: 300, borderRadius: 28,
      background: "rgba(0,0,0,0.35)", border: `3px solid ${colors.pink}66`,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18,
      backdropFilter: "blur(12px)", position: "relative", overflow: "hidden", padding: "32px 24px",
    }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${rawPreview})`, backgroundSize: "cover", backgroundPosition: "top center", filter: "brightness(0.12) blur(6px)" }} />
      <div style={{ fontSize: 52, zIndex: 1 }}>😕</div>
      <div style={{ textAlign: "center", zIndex: 1 }}>
        <div style={{ fontFamily: fonts.display, fontSize: 22, fontWeight: 700, color: colors.white }}>No face detected</div>
        <div style={{ fontFamily: fonts.body, fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.45)", marginTop: 8, lineHeight: 1.6 }}>
          Make sure your face is clearly visible,<br />well lit, and facing the camera.
        </div>
      </div>
      <div style={{ zIndex: 1, display: "flex", flexDirection: "column", gap: 8, width: "100%" }}>
        {["✅ Face clearly visible", "✅ Good lighting", "✅ Not too far away"].map(tip => (
          <div key={tip} style={{ fontFamily: fonts.body, fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", letterSpacing: 0.3, textAlign: "center" }}>{tip}</div>
        ))}
      </div>
      <button onClick={reset} style={{
        zIndex: 1, background: colors.yellow, color: colors.black,
        fontFamily: fonts.body, fontWeight: 800, fontSize: 14,
        padding: "14px 32px", borderRadius: 12, border: `3px solid ${colors.black}`,
        boxShadow: `4px 4px 0 ${colors.black}`, cursor: "pointer", letterSpacing: 1, textTransform: "uppercase",
      }}>
        📸 Try Another Photo
      </button>
    </div>
  );

  return (
    <div className="hero-upload" style={{
      width: 360, maxWidth: "100%", borderRadius: 28, background: colors.black,
      border: `3px solid ${colors.yellow}`, overflow: "hidden",
      boxShadow: `0 0 0 6px ${colors.yellow}22, 0 0 60px ${colors.yellow}33, 0 24px 60px rgba(0,0,0,0.5)`,
      animation: "slideUp 0.4s cubic-bezier(0.34,1.56,0.64,1)",
    }}>
      <div style={{ position: "relative", width: "100%", aspectRatio: "1 / 1", overflow: "hidden" }}>
        <img src={croppedUrl} alt="your face" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center", display: "block" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 80, background: `linear-gradient(transparent, ${colors.black})`, pointerEvents: "none" }} />
        <div style={{
          position: "absolute", top: 12, left: 12, background: `${colors.green}ee`,
          borderRadius: 20, padding: "5px 12px", display: "flex", alignItems: "center", gap: 6,
          fontFamily: fonts.body, fontSize: 11, fontWeight: 700, color: "#fff",
          boxShadow: `0 2px 12px ${colors.green}66`,
        }}>✓ Face detected</div>
        <button onClick={reset} style={{
          position: "absolute", top: 12, right: 12,
          background: "rgba(0,0,0,0.65)", border: "1px solid rgba(255,255,255,0.2)",
          borderRadius: "50%", width: 32, height: 32, cursor: "pointer", color: colors.white,
          fontFamily: fonts.body, fontSize: 14,
          display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s",
        }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,60,172,0.7)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(0,0,0,0.65)"}
        >✕</button>
      </div>
      <div style={{ padding: "18px 20px 20px", textAlign: "center" }}>
        <div style={{ fontFamily: fonts.body, fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.45)", letterSpacing: 0.5, marginBottom: 14 }}>
          ✨ Great shot! Ready to find your match
        </div>
        <Button size="lg" onClick={() => onStartScan(croppedUrl)} style={{ width: "100%", display: "block", textAlign: "center" }}>
          🔍 Find My Doppelganger
        </Button>
        <div style={{ marginTop: 10, fontFamily: fonts.body, fontSize: 10, color: "rgba(255,255,255,0.2)" }}>
          Tap anywhere outside to cancel
        </div>
      </div>
    </div>
  );
}
