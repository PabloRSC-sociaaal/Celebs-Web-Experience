import { useNavigate } from "react-router-dom";
import { colors, fonts } from "../../../design/tokens";
import { useAppStore }   from "../../../store/appStore";
import { HeroUpload }    from "../../../components/HeroUpload";
import { Stars }         from "../../../components/Stars";
import { Marquee }       from "../../../components/Marquee";

export function HeroSection() {
  const navigate       = useNavigate();
  const setPhoto       = useAppStore(s => s.setUploadedPhoto);
  const setPreloaded   = useAppStore(s => s.setPreloadedResult);
  const setSpotlight   = useAppStore(s => s.setSpotlight);

  const handleStartScan = (photoUrl) => {
    setSpotlight(false);
    setPhoto(photoUrl);
    setPreloaded(null);
    navigate("/analyzing");
  };

  return (
    <section className="hero-section" style={{
      background: `linear-gradient(165deg, ${colors.blue} 0%, ${colors.darkBlue} 60%, #1478a0 100%)`,
      padding: "110px 24px 44px", position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "absolute", top: 60, left: "-5%", width: 350, height: 350, borderRadius: "50%", background: `radial-gradient(circle, ${colors.yellow}12, transparent 65%)`, filter: "blur(50px)" }} />
      <div style={{ position: "absolute", bottom: 40, right: "-5%", width: 250, height: 250, borderRadius: "50%", background: `radial-gradient(circle, ${colors.pink}10, transparent 65%)`, filter: "blur(40px)" }} />

      <div className="hero-grid" style={{ maxWidth: 1140, margin: "0 auto", display: "flex", gap: 48, alignItems: "center" }}>
        <div className="hero-left" style={{ flex: "1 1 45%", minWidth: 260, animation: "slideUp 0.8s ease-out", display: "flex", flexDirection: "column" }}>
          <div className="hero-badge" style={{
            display: "inline-block", background: "rgba(0,0,0,0.25)", borderRadius: 30,
            padding: "6px 16px", fontFamily: fonts.body, fontSize: 12, fontWeight: 700,
            color: colors.yellow, letterSpacing: 1, border: `1px solid ${colors.yellow}44`,
            marginBottom: 18, alignSelf: "flex-start",
          }}>🔥 #1 ENTERTAINMENT PLATFORM</div>

          <h1 style={{
            fontFamily: fonts.display, fontSize: "clamp(42px, 6.5vw, 80px)",
            fontWeight: 700, lineHeight: 0.95, color: colors.yellow, letterSpacing: 1,
            textShadow: `4px 4px 0 ${colors.black}, 8px 8px 0 rgba(0,0,0,0.15)`,
          }}>
            Find Your<br />Celebrity<br />
            <span style={{ color: colors.white, textShadow: `3px 3px 0 ${colors.black}, 0 0 30px rgba(255,229,0,0.3)` }}>Doppelganger</span>
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
            fontFamily: fonts.body, fontSize: 12, fontWeight: 600,
            color: "rgba(255,255,255,0.35)", textDecoration: "none", transition: "color 0.2s",
          }}
            onMouseEnter={e => e.currentTarget.style.color = colors.yellow}
            onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.35)"}
          >↓ How does it work?</a>
        </div>

        <div className="hero-visual" style={{
          flex: "0 0 auto", display: "flex", alignItems: "center", justifyContent: "center",
          animation: "fadeIn 0.9s ease-out", position: "relative",
        }}>
          <HeroUpload onStartScan={handleStartScan} onSpotlight={setSpotlight} />
        </div>
      </div>

      <div style={{ maxWidth: 1140, margin: "36px auto 0" }}>
        <Marquee />
      </div>
    </section>
  );
}
