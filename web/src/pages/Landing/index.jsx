import { useState, useEffect } from "react";
import { useNavigate }         from "react-router-dom";
import { colors, fonts }       from "../../design/tokens";
import { globalCSS }           from "../../design/globalStyles";
import { useAppStore }         from "../../store/appStore";
import { hasGenerations }      from "../../services";
import { Logo }                from "../../components/Logo";
import { Button }              from "../../components/Button";

import { HeroSection }   from "./sections/Hero";
import { StatsBar }      from "./sections/StatsBar";
import { HowItWorks }    from "./sections/HowItWorks";
import { Exclusivity }   from "./sections/Exclusivity";
import { Gallery }       from "./sections/Gallery";
import { Reviews }       from "./sections/Reviews";
import { UseCases }      from "./sections/UseCases";
import { FinalCTA }      from "./sections/FinalCTA";

// ─────────────────────────────────────────────────────────
//  Landing Page — orquesta todas las secciones.
//  Para añadir/quitar una sección: edita solo este archivo.
// ─────────────────────────────────────────────────────────
export function LandingPage() {
  const navigate      = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const spotlight     = useAppStore(s => s.spotlight);
  const reset         = useAppStore(s => s.reset);
  const hasDashboard  = useAppStore(s => s.hasDashboard);
  const setHasDashboard = useAppStore(s => s.setHasDashboard);

  useEffect(() => {
    setHasDashboard(hasGenerations());
  }, [setHasDashboard]);

  useEffect(() => {
    const h = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <div style={{ fontFamily: fonts.body, background: colors.black, color: colors.white, overflowX: "clip", minHeight: "100vh" }}>
      <style>{globalCSS}</style>

      {/* Spotlight overlay */}
      {spotlight && (
        <div onClick={reset} style={{
          position: "fixed", inset: 0, zIndex: 1000,
          background: "rgba(0,0,0,0.82)", backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)", animation: "spotlightIn 0.45s ease", cursor: "pointer",
        }} />
      )}

      {/* Navbar */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: scrollY > 60 ? `rgba(42,171,226,0.95)` : "transparent",
        backdropFilter: scrollY > 60 ? "blur(16px)" : "none",
        borderBottom: scrollY > 60 ? `2px solid ${colors.yellow}44` : "none",
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
                  fontFamily: fonts.body, fontSize: 13, fontWeight: 600,
                  letterSpacing: 0.5, transition: "color 0.2s", whiteSpace: "nowrap",
                }}
                  onMouseEnter={e => e.target.style.color = colors.yellow}
                  onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.85)"}
                >{l}</a>
              ))}
            </div>
            {hasDashboard && (
              <button
                onClick={() => navigate("/dashboard")}
                title="My Results"
                style={{
                  background: "rgba(255,229,0,0.15)", border: `1.5px solid ${colors.yellow}66`,
                  borderRadius: 10, padding: "7px 14px",
                  fontFamily: fonts.body, fontWeight: 700, fontSize: 12,
                  color: colors.yellow, cursor: "pointer", letterSpacing: 0.5,
                  display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s", whiteSpace: "nowrap",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = `${colors.yellow}28`; e.currentTarget.style.borderColor = colors.yellow; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,229,0,0.15)"; e.currentTarget.style.borderColor = `${colors.yellow}66`; }}
              >📊 My Results</button>
            )}
            <Button size="sm" style={{ whiteSpace: "nowrap" }}>Get Started</Button>
          </div>
        </div>
      </nav>

      {/* Secciones */}
      <HeroSection />
      <StatsBar />
      <HowItWorks />
      <Exclusivity />
      <Gallery />
      <Reviews />
      <UseCases />
      <FinalCTA />

      {/* Footer */}
      <footer style={{ background: colors.black, borderTop: `3px solid ${colors.yellow}`, padding: "40px 24px 28px" }}>
        <div className="footer-inner" style={{ maxWidth: 1140, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
          <div>
            <div style={{ transform: "scale(0.5)", transformOrigin: "left center" }}>
              <Logo size={36} />
            </div>
            <p style={{ fontFamily: fonts.body, fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 4, fontWeight: 400 }}>
              The #1 AI Celebrity Doppelganger Platform
            </p>
          </div>
          <div className="footer-links" style={{ display: "flex", gap: 24 }}>
            {["Contact", "Terms", "Privacy", "FAQ"].map(l => (
              <a key={l} href="#" style={{ fontFamily: fonts.body, color: "rgba(255,255,255,0.45)", textDecoration: "none", fontSize: 12, fontWeight: 600, transition: "color 0.2s" }}
                onMouseEnter={e => e.target.style.color = colors.yellow}
                onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.45)"}
              >{l}</a>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {["TikTok", "IG"].map((s, i) => (
              <div key={i} style={{
                width: 34, height: 34, borderRadius: "50%",
                border: "1px solid rgba(255,255,255,0.18)",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", transition: "all 0.2s",
                fontFamily: fonts.body, fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.5)",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = colors.yellow; e.currentTarget.style.color = colors.yellow; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}
              >{s}</div>
            ))}
          </div>
        </div>
        <div style={{ textAlign: "center", marginTop: 24, fontFamily: fonts.body, fontSize: 11, color: "rgba(255,255,255,0.2)", fontWeight: 400 }}>
          © 2025 Celebs. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
