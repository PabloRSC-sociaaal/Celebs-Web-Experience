import { useState, useEffect } from "react";
import { useNavigate }         from "react-router-dom";
import { colors, fonts }       from "../../design/tokens";
import { globalCSS }           from "../../design/globalStyles";
import { useAppStore }         from "../../store/appStore";
import { hasGenerations }      from "../../services";
import { Logo }                from "../../components/Logo";
import { Button }              from "../../components/Button";
import { useCtaUpload }        from "../../hooks/useCtaUpload";
import { AuthModal }           from "../../features/auth/AuthModal";
import { signOutUser }         from "../../features/firebase/authService";
import { getFlag }             from "../../config";

import { HeroSection }   from "./sections/Hero";
import { StatsBar }      from "./sections/StatsBar";
import { HowItWorks }    from "./sections/HowItWorks";
import { Exclusivity }        from "./sections/Exclusivity";
import { SimilarityExplorer } from "./sections/SimilarityExplorer";
import { Gallery }            from "./sections/Gallery";
import { Reviews }       from "./sections/Reviews";
import { UseCases }      from "./sections/UseCases";
import { FinalCTA }      from "./sections/FinalCTA";

export function LandingPage() {
  const navigate      = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const spotlight     = useAppStore(s => s.spotlight);
  const reset         = useAppStore(s => s.reset);
  const hasDashboard  = useAppStore(s => s.hasDashboard);
  const setHasDashboard = useAppStore(s => s.setHasDashboard);
  const user          = useAppStore(s => s.user);
  const setUser       = useAppStore(s => s.setUser);

  useEffect(() => { setHasDashboard(hasGenerations()); }, [setHasDashboard]);

  useEffect(() => {
    const h = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  // Close menu on scroll
  useEffect(() => {
    if (menuOpen) {
      const close = () => setMenuOpen(false);
      window.addEventListener("scroll", close, { passive: true, once: true });
      return () => window.removeEventListener("scroll", close);
    }
  }, [menuOpen]);

  const { triggerUpload, inputProps: navInputProps } = useCtaUpload();
  const scrolled = scrollY > 60;

  return (
    <div style={{ fontFamily: fonts.body, background: colors.black, color: colors.white, overflowX: "clip", minHeight: "100vh" }}>
      <style>{globalCSS}</style>

      <input {...navInputProps} />

      {/* Spotlight overlay */}
      {spotlight && (
        <div onClick={reset} style={{
          position: "fixed", inset: 0, zIndex: 1000,
          background: "rgba(0,0,0,0.82)", backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)", animation: "spotlightIn 0.45s ease", cursor: "pointer",
        }} />
      )}

      {/* ── Navbar ── */}
      <nav className="main-nav" style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: scrolled || menuOpen ? "rgba(42,171,226,0.97)" : "transparent",
        backdropFilter: scrolled || menuOpen ? "blur(16px)" : "none",
        WebkitBackdropFilter: scrolled || menuOpen ? "blur(16px)" : "none",
        borderBottom: scrolled ? `2px solid ${colors.yellow}44` : "none",
        padding: "0 16px",
        transition: "background 0.35s, backdrop-filter 0.35s",
      }}>
        <div style={{
          maxWidth: 1140, margin: "0 auto", height: 56,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          {/* Logo */}
          <Logo size={20} />

          {/* Desktop links */}
          <div className="nav-desktop" style={{ display: "flex", gap: 20, alignItems: "center" }}>
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
              <button onClick={() => navigate("/dashboard")} title="My Results" style={{
                background: "rgba(255,229,0,0.15)", border: `1.5px solid ${colors.yellow}66`,
                borderRadius: 10, padding: "7px 14px",
                fontFamily: fonts.body, fontWeight: 700, fontSize: 12,
                color: colors.yellow, cursor: "pointer", letterSpacing: 0.5,
                display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s", whiteSpace: "nowrap",
              }}
                onMouseEnter={e => { e.currentTarget.style.background = `${colors.yellow}28`; e.currentTarget.style.borderColor = colors.yellow; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,229,0,0.15)"; e.currentTarget.style.borderColor = `${colors.yellow}66`; }}
              >📊 My Photos</button>
            )}
            {user ? (
              <button
                onClick={() => { if (window.confirm("Sign out?")) { signOutUser().then(() => setUser(null)); } }}
                title="Sign out"
                style={{
                  width: 32, height: 32, borderRadius: "50%",
                  overflow: "hidden", border: `2px solid ${colors.yellow}66`,
                  cursor: "pointer", background: "rgba(255,229,0,0.15)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  padding: 0,
                }}
              >
                {user.photoURL ? (
                  <img src={user.photoURL} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <span style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 12, fontWeight: 700, color: colors.yellow }}>
                    {(user.displayName || user.email || "U")[0].toUpperCase()}
                  </span>
                )}
              </button>
            ) : (
              <button onClick={() => setShowAuth(true)} style={{
                background: "transparent", border: "1px solid rgba(255,255,255,0.25)",
                borderRadius: 9, padding: "7px 14px",
                fontFamily: fonts.body, fontWeight: 600, fontSize: 12,
                color: "rgba(255,255,255,0.65)", cursor: "pointer", whiteSpace: "nowrap",
                transition: "all 0.2s",
              }}
                onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.5)"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.65)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"; }}
              >Sign In</button>
            )}
            <Button size="sm" onClick={triggerUpload} style={{ whiteSpace: "nowrap" }}>Get Started</Button>
          </div>

          {/* Mobile: primary action + hamburger — always visible on small screens */}
          <div className="nav-mobile-right" style={{
            display: "none", alignItems: "center", gap: 10,
          }}>
            {user ? (
              hasDashboard ? (
                <button onClick={() => navigate("/dashboard")} style={{
                  background: "rgba(255,229,0,0.15)", border: `1.5px solid ${colors.yellow}66`,
                  borderRadius: 9, padding: "7px 12px",
                  fontFamily: fonts.body, fontWeight: 700, fontSize: 11,
                  color: colors.yellow, cursor: "pointer", letterSpacing: 0.4,
                  display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap",
                }}>📸 My Photos</button>
              ) : (
                <button
                  onClick={() => { if (window.confirm("Sign out?")) { signOutUser().then(() => setUser(null)); } }}
                  title="Sign out"
                  style={{
                    width: 30, height: 30, borderRadius: "50%",
                    overflow: "hidden", border: `2px solid ${colors.yellow}66`,
                    cursor: "pointer", background: "rgba(255,229,0,0.15)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    padding: 0, flexShrink: 0,
                  }}
                >
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <span style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 11, fontWeight: 700, color: colors.yellow }}>
                      {(user.displayName || user.email || "U")[0].toUpperCase()}
                    </span>
                  )}
                </button>
              )
            ) : (
              <button onClick={() => setShowAuth(true)} style={{
                background: colors.yellow, color: colors.black, border: "none",
                borderRadius: 9, padding: "7px 14px",
                fontFamily: fonts.body, fontWeight: 700, fontSize: 11,
                cursor: "pointer", whiteSpace: "nowrap", letterSpacing: 0.4,
              }}>Sign Up</button>
            )}

            {/* Hamburger */}
            <button onClick={() => setMenuOpen(v => !v)} style={{
              background: "none", border: "none",
              cursor: "pointer", padding: 6, display: "flex", flexDirection: "column", gap: 5,
              justifyContent: "center", alignItems: "center",
            }}>
              <span style={{
                display: "block", width: 22, height: 2, borderRadius: 1,
                background: colors.white, transition: "all 0.3s",
                transform: menuOpen ? "rotate(45deg) translate(3.5px,3.5px)" : "none",
              }} />
              <span style={{
                display: "block", width: 22, height: 2, borderRadius: 1,
                background: colors.white, transition: "all 0.3s",
                opacity: menuOpen ? 0 : 1,
              }} />
              <span style={{
                display: "block", width: 22, height: 2, borderRadius: 1,
                background: colors.white, transition: "all 0.3s",
                transform: menuOpen ? "rotate(-45deg) translate(3.5px,-3.5px)" : "none",
              }} />
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        <div className="nav-mobile-menu" style={{
          maxHeight: menuOpen ? 360 : 0,
          overflow: "hidden",
          transition: "max-height 0.35s ease",
          display: "none",
        }}>
          <div style={{
            display: "flex", flexDirection: "column", gap: 8,
            padding: "8px 0 16px",
          }}>
            {["How it works", "Results"].map(l => (
              <a key={l} href={`#${l.toLowerCase().replace(/ /g, "-")}`}
                onClick={() => setMenuOpen(false)}
                style={{
                  color: "rgba(255,255,255,0.85)", textDecoration: "none",
                  fontFamily: fonts.body, fontSize: 15, fontWeight: 600,
                  padding: "10px 12px", borderRadius: 10,
                  background: "rgba(255,255,255,0.06)",
                  transition: "background 0.2s",
                }}
              >{l}</a>
            ))}
            {hasDashboard && (
              <button onClick={() => { navigate("/dashboard"); setMenuOpen(false); }} style={{
                background: "rgba(255,229,0,0.15)", border: `1.5px solid ${colors.yellow}66`,
                borderRadius: 10, padding: "10px 12px",
                fontFamily: fonts.body, fontWeight: 700, fontSize: 14,
                color: colors.yellow, cursor: "pointer", textAlign: "left",
                display: "flex", alignItems: "center", gap: 8,
              }}>📸 My Photos</button>
            )}
            {user ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 12px", borderRadius: 10,
                  background: "rgba(255,255,255,0.04)",
                }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%",
                    overflow: "hidden", border: `2px solid ${colors.yellow}66`,
                    background: "rgba(255,229,0,0.15)", flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <span style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 11, fontWeight: 700, color: colors.yellow }}>
                        {(user.displayName || user.email || "U")[0].toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: fonts.body, fontSize: 13, fontWeight: 600, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {user.displayName || user.email || "User"}
                    </div>
                  </div>
                </div>
                <button onClick={() => { signOutUser().then(() => setUser(null)); setMenuOpen(false); }} style={{
                  background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 10, padding: "10px 12px",
                  fontFamily: fonts.body, fontWeight: 600, fontSize: 13,
                  color: "rgba(255,255,255,0.5)", cursor: "pointer", textAlign: "left",
                }}>Sign Out</button>
              </div>
            ) : (
              <button onClick={() => { setMenuOpen(false); setShowAuth(true); }} style={{
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 10, padding: "10px 12px",
                fontFamily: fonts.body, fontWeight: 600, fontSize: 14,
                color: "rgba(255,255,255,0.7)", cursor: "pointer", textAlign: "left",
              }}>Sign In</button>
            )}
            <Button size="md" onClick={() => { setMenuOpen(false); triggerUpload(); }}
              style={{ width: "100%", textAlign: "center", marginTop: 4 }}>
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Sections */}
      <HeroSection />
      <StatsBar />
      <HowItWorks />
      <Exclusivity />
      {getFlag("SIMILARITY_EXPLORER") && <SimilarityExplorer />}
      <Gallery />
      <Reviews />
      <UseCases />
      <FinalCTA />

      {/* Auth modal */}
      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        onSuccess={() => setShowAuth(false)}
        initialMode="signup"
      />

      {/* Footer */}
      <footer style={{ background: colors.black, borderTop: `3px solid ${colors.yellow}`, padding: "40px 24px 28px" }}>
        <div className="footer-inner" style={{ maxWidth: 1140, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
          <div>
            <Logo size={18} />
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
