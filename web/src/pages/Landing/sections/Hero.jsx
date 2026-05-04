import { useNavigate } from "react-router-dom";
import { colors, fonts } from "../../../design/tokens";
import { useAppStore }   from "../../../store/appStore";
import { HeroUpload }    from "../../../components/HeroUpload";
import { Stars }         from "../../../components/Stars";
import { Marquee }       from "../../../components/Marquee";

// ── Decorative celebrity silhouette w/ entry, idle float and AI-scan loop ──
function HeroCeleb({ src, side = "left", style, enterDelay = 0, floatDelay = 0, scanDelay = 0 }) {
  const enterAnim = side === "left" ? "celebEnterL" : side === "right" ? "celebEnterR" : "celebEnterT";
  const floatAnim = side === "left" ? "celebFloatL" : side === "right" ? "celebFloatR" : "celebFloatT";
  return (
    <div
      className="hero-celeb"
      style={{
        position: "absolute",
        pointerEvents: "none",
        zIndex: 1,
        opacity: 0,
        animation: `${enterAnim} 0.9s cubic-bezier(0.34,1.56,0.64,1) ${enterDelay}s forwards, ${floatAnim} 6s ease-in-out ${0.9 + enterDelay + floatDelay}s infinite, celebMatchPulse 8s ease-in-out ${1 + enterDelay + scanDelay}s infinite`,
        ...style,
      }}
    >
      <div style={{ position: "relative", height: "100%", width: "auto" }}>
        <img
          src={src}
          alt=""
          draggable={false}
          style={{
            height: "100%", width: "auto",
            display: "block",
            filter: "drop-shadow(0 12px 24px rgba(0,0,0,0.45))",
            userSelect: "none",
            // Fade the top of each silhouette into the background so it never
            // competes with the hero text above. Bottom 60 % fully opaque.
            maskImage: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.35) 14%, rgba(0,0,0,0.85) 32%, black 42%)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.35) 14%, rgba(0,0,0,0.85) 32%, black 42%)",
          }}
        />
        {/* AI scan line — sweeps vertically over the celebrity face */}
        <div
          style={{
            position: "absolute", left: 0, right: 0,
            height: 14,
            background: `linear-gradient(180deg, transparent, ${colors.yellow}aa 45%, ${colors.yellow} 50%, ${colors.yellow}aa 55%, transparent)`,
            filter: "blur(2px)",
            mixBlendMode: "screen",
            opacity: 0,
            animation: `celebScanV 6s ease-in-out ${1 + enterDelay + scanDelay}s infinite`,
          }}
        />
      </div>
    </div>
  );
}

export function HeroSection() {
  const navigate       = useNavigate();
  const setPhoto       = useAppStore(s => s.setUploadedPhoto);
  const setPreloaded   = useAppStore(s => s.setPreloadedResult);
  const setSpotlight   = useAppStore(s => s.setSpotlight);
  const spotlight      = useAppStore(s => s.spotlight);

  const handleStartScan = (photoUrl) => {
    setSpotlight(false);
    setPhoto(photoUrl);
    setPreloaded(null);
    navigate("/analyzing");
  };

  return (
    <section className="hero-section" style={{
      background: `linear-gradient(165deg, ${colors.blue} 0%, ${colors.darkBlue} 60%, #1478a0 100%)`,
      padding: "100px 20px 44px",
      position: "relative",
      width: "100%",
      minHeight: "100dvh",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      overflow: spotlight ? "visible" : "hidden",
    }}>
      {/* Ambient blobs */}
      <div style={{ position: "absolute", top: 60, left: "-5%", width: 350, height: 350, borderRadius: "50%", background: `radial-gradient(circle, ${colors.yellow}12, transparent 65%)`, filter: "blur(50px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: 40, right: "-5%", width: 250, height: 250, borderRadius: "50%", background: `radial-gradient(circle, ${colors.pink}10, transparent 65%)`, filter: "blur(40px)", pointerEvents: "none" }} />

      {/* ── Decorative celebrity silhouettes (desktop only) ── */}
      <HeroCeleb
        src="/samples/hero/billie.png"
        side="left"
        style={{ left: "-90px", bottom: "10px", height: "min(48vh, 420px)", "--celeb-op": 0.92 }}
        enterDelay={0.15}
        floatDelay={0}
        scanDelay={1.2}
      />
      <HeroCeleb
        src="/samples/hero/chalamet.png"
        side="top"
        style={{ right: "-30px", top: "60px", height: "min(60vh, 480px)", "--celeb-op": 0.93 }}
        enterDelay={0.35}
        floatDelay={1.3}
        scanDelay={3.0}
      />
      <HeroCeleb
        src="/samples/hero/sabrina.png"
        side="right"
        style={{ right: "-50px", bottom: "100px", height: "min(56vh, 460px)", "--celeb-op": 0.92 }}
        enterDelay={0.55}
        floatDelay={2.2}
        scanDelay={5.0}
      />

      <div className="hero-grid" style={{
        maxWidth: 1140, width: "100%", margin: "0 auto",
        display: "flex", gap: 48, alignItems: "center",
        // When spotlight is active the upload widget needs to escape above the
        // 1000 z-index overlay; otherwise stay above the decorative celebs (z 1).
        position: "relative", zIndex: spotlight ? 1002 : 3,
      }}>
        {/* ── Left column: text ── */}
        <div className="hero-left" style={{
          flex: "1 1 50%", minWidth: 0,
          animation: "slideUp 0.8s ease-out",
          display: "flex", flexDirection: "column",
        }}>
          <div className="hero-badge" style={{
            display: "inline-block", background: "rgba(0,0,0,0.25)", borderRadius: 30,
            padding: "6px 16px", fontFamily: fonts.body, fontSize: 11, fontWeight: 700,
            color: colors.yellow, letterSpacing: 1, border: `1px solid ${colors.yellow}44`,
            marginBottom: 18, alignSelf: "flex-start",
          }}>🔥 #1 CELEBRITY LOOKALIKE APP</div>

          <h1 style={{
            fontFamily: fonts.display, fontSize: "clamp(36px, 6vw, 76px)",
            fontWeight: 700, lineHeight: 0.95, color: colors.yellow, letterSpacing: 1,
            textShadow: `4px 4px 0 ${colors.black}, 8px 8px 0 rgba(0,0,0,0.15)`,
          }}>
            Find Your<br />Celebrity<br />
            <span style={{ color: colors.white, textShadow: `3px 3px 0 ${colors.black}, 0 0 30px rgba(255,229,0,0.3)` }}>Doppelganger</span>
          </h1>

          <p style={{
            fontSize: "clamp(13px, 1.6vw, 15px)", color: "rgba(255,255,255,0.75)",
            marginTop: 16, lineHeight: 1.65, maxWidth: 420, fontWeight: 400,
          }}>
            Upload your selfie and our AI finds your celebrity Doppelganger in seconds. 4,000+ facial points. 100% free.
          </p>

          <div className="hero-stats" style={{
            display: "flex", gap: 12, marginTop: 20, alignItems: "center",
            flexWrap: "wrap", fontSize: 13, color: "rgba(255,255,255,0.55)", fontWeight: 500,
          }}>
            <span style={{ whiteSpace: "nowrap" }}><Stars n={5} size={13} /> 4.8/5</span>
            <span className="hero-stats-sep" style={{ color: "rgba(255,255,255,0.2)" }}>|</span>
            <span style={{ whiteSpace: "nowrap" }}>12M+ users</span>
            <span className="hero-stats-sep" style={{ color: "rgba(255,255,255,0.2)" }}>|</span>
            <span style={{ whiteSpace: "nowrap" }}>Instant results</span>
          </div>

          <a href="#how-it-works" className="hero-how-link" style={{
            display: "inline-block", marginTop: 20, alignSelf: "flex-start",
            fontFamily: fonts.body, fontSize: 12, fontWeight: 600,
            color: "rgba(255,255,255,0.35)", textDecoration: "none", transition: "color 0.2s",
          }}
            onMouseEnter={e => e.currentTarget.style.color = colors.yellow}
            onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.35)"}
          >↓ How does it work?</a>
        </div>

        {/* ── Right column: upload widget ── */}
        <div className="hero-visual" style={{
          flex: "0 0 auto",
          display: "flex", alignItems: "center", justifyContent: "center",
          animation: "fadeIn 0.9s ease-out",
          position: "relative",
          zIndex: spotlight ? 1001 : "auto",
          transform: spotlight ? "scale(1.03)" : "scale(1)",
          transition: "transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}>
          <HeroUpload onStartScan={handleStartScan} onSpotlight={setSpotlight} />
        </div>
      </div>

      <div style={{ maxWidth: 1140, margin: "36px auto 0", width: "100%" }}>
        <Marquee />
      </div>
    </section>
  );
}
