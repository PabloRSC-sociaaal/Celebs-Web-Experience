// ─────────────────────────────────────────────────────────────────────────────
//  MatchPage — /m/:matchId
//
//  Public landing for a viral share. Visitor sees:
//    • Heavily blurred user photo (privacy first)
//    • Clear celebrity photo
//    • Big match %
//    • Celebs branding
//    • CTA → upload your own selfie to find YOUR doppelganger
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getMatchShare } from "../../services/matchShare";
import { useCtaUpload } from "../../hooks/useCtaUpload";
import { useAppStore } from "../../store/appStore";
import { isPremium } from "../../features/firebase/subscriptionService";

const C = {
  blue: "#2AABE2", yellow: "#FFE500", black: "#0A0A0A", white: "#FFFFFF",
  pink: "#FF3CAC", cyan: "#00E5FF", green: "#22c55e", darkBlue: "#1B8DBF",
};

export function MatchPage() {
  const { matchId } = useParams();
  const navigate    = useNavigate();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const { triggerUpload, inputProps } = useCtaUpload();

  // Viewer-state gates the celeb reveal:
  //   - not registered  → celeb hidden (sign up to reveal)
  //   - registered free → celeb shown unless it's a Doppelganger (≥90 %)
  //   - premium         → always shown
  const user         = useAppStore(s => s.user);
  const subscription = useAppStore(s => s.subscription);
  const premium      = isPremium(subscription);

  useEffect(() => {
    const m = getMatchShare(matchId);
    setMatch(m);
    setLoading(false);
  }, [matchId]);

  if (loading) {
    return (
      <Shell>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Spinner />
        </div>
      </Shell>
    );
  }

  if (!match) {
    return (
      <Shell>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, gap: 14, textAlign: "center" }}>
          <div style={{ fontSize: 56 }}>🔗</div>
          <h2 style={{ fontFamily: "'Fredoka'", color: C.white, fontSize: 24, margin: 0 }}>Link expired</h2>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, maxWidth: 280, lineHeight: 1.6 }}>
            This match showcase isn't available — but you can still find your own celebrity Doppelganger.
          </p>
          <button onClick={() => navigate("/")} style={primaryBtn}>📸 Find My Doppelganger</button>
        </div>
      </Shell>
    );
  }

  const { celeb, userPhotoThumb, senderName } = match;
  const isDoppelganger = celeb.pct >= 90;
  // Celeb reveal rules: anonymous viewers always gated; logged-in free users
  // gated only on Doppelganger-tier matches; premium always sees everything.
  const celebHidden = !user || (!premium && isDoppelganger);
  const celebGateReason = !user ? "register" : "premium";

  return (
    <Shell>
      <input {...inputProps} />

      <style>{`
        @keyframes mpFadeUp { from { opacity:0; transform: translateY(20px) } to { opacity:1; transform: translateY(0) } }
        @keyframes mpPulse  { 0%,100% { box-shadow: 0 0 0 0 ${celeb.color}66; transform: scale(1); } 50% { box-shadow: 0 0 0 16px ${celeb.color}00; transform: scale(1.04); } }
        @keyframes mpGlow   { 0%,100% { filter: drop-shadow(0 8px 20px rgba(0,0,0,0.4)); } 50% { filter: drop-shadow(0 8px 20px rgba(0,0,0,0.4)) drop-shadow(0 0 24px ${C.yellow}aa); } }
        @keyframes mpShim   { 0% { background-position: -200% center } 100% { background-position: 200% center } }
        @keyframes mpSpin   { to { transform: rotate(360deg) } }
      `}</style>

      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", padding: "20px 16px 24px", gap: 14,
        animation: "mpFadeUp 0.6s cubic-bezier(0.34,1.56,0.64,1)",
      }}>
        {/* ── Top brand strip ── */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "rgba(0,0,0,0.4)", border: `1px solid ${C.yellow}55`,
          borderRadius: 999, padding: "5px 14px",
        }}>
          <span style={{
            width: 7, height: 7, borderRadius: "50%",
            background: "#22c55e", animation: "mpPulse 1.6s ease-in-out infinite",
          }} />
          <span style={{
            fontFamily: "'Oxanium'", fontSize: 10, fontWeight: 800,
            color: C.yellow, letterSpacing: 1.4, textTransform: "uppercase",
          }}>celebs · super lookalike</span>
        </div>

        {/* ── Headline ── */}
        <div style={{ textAlign: "center", marginTop: 4 }}>
          <h1 style={{
            fontFamily: "'Fredoka'", fontWeight: 700,
            fontSize: "clamp(22px, 7vw, 34px)",
            color: C.white, margin: 0, lineHeight: 1.1,
          }}>
            {senderName ? `${senderName.split(" ")[0]} found their` : "Someone just found their"}<br />
            <span style={{
              background: `linear-gradient(90deg, ${C.yellow}, ${C.cyan}, ${C.yellow})`,
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              animation: "mpShim 3s linear infinite",
            }}>Doppelganger</span>
          </h1>
        </div>

        {/* ── The match card ── */}
        <div style={{
          width: "100%", maxWidth: 380,
          background: C.black, borderRadius: 24,
          border: `3px solid ${celeb.color}`,
          padding: 18, position: "relative",
          boxShadow: `0 24px 60px rgba(0,0,0,0.6), 0 0 60px ${celeb.color}33`,
        }}>
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr",
            gap: 10, position: "relative",
          }}>
            {/* User photo — always shown (it's their own photo, no privacy issue) */}
            <div style={{
              position: "relative", aspectRatio: "3/4",
              borderRadius: 14, overflow: "hidden",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.18)",
            }}>
              <img
                src={userPhotoThumb}
                alt=""
                draggable={false}
                style={{
                  position: "absolute", inset: 0,
                  width: "100%", height: "100%",
                  objectFit: "cover", objectPosition: "center top",
                }}
              />
              <span style={{
                position: "absolute", bottom: 8, left: 8,
                background: "rgba(0,0,0,0.72)", color: "#fff",
                fontFamily: "'Oxanium'", fontSize: 9, fontWeight: 700,
                padding: "3px 8px", borderRadius: 6,
                textTransform: "uppercase", letterSpacing: 1,
              }}>The Person</span>
            </div>

            {/* Match badge — overlay */}
            <div style={{
              position: "absolute", left: "50%", top: "50%",
              transform: "translate(-50%, -50%)", zIndex: 3,
            }}>
              <div style={{
                width: 78, height: 78, borderRadius: "50%",
                background: `linear-gradient(135deg, ${C.yellow}, #FFC300)`,
                border: `4px solid ${C.black}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "'Fredoka'", fontSize: 22, fontWeight: 900,
                color: C.black,
                boxShadow: `0 0 0 3px ${celeb.color}, 0 8px 22px rgba(0,0,0,0.5)`,
                animation: "mpGlow 2.5s ease-in-out infinite",
              }}>
                {celeb.pct}%
              </div>
            </div>

            {/* Celeb — gated unless user is registered (and premium for ≥90 %) */}
            <div style={{
              position: "relative", aspectRatio: "3/4",
              borderRadius: 14, overflow: "hidden",
              background: "rgba(255,255,255,0.04)",
              border: `1px solid ${celebHidden ? C.yellow : celeb.color}66`,
            }}>
              <img
                src={celeb.img} alt={celeb.name}
                draggable={false}
                style={{
                  position: "absolute", inset: 0,
                  width: "100%", height: "100%",
                  objectFit: "cover", objectPosition: "center top",
                  filter: celebHidden ? "blur(30px) saturate(0.6) brightness(0.55)" : "none",
                  transform: celebHidden ? "scale(1.2)" : "none",
                }}
              />
              {celebHidden && (
                <div style={{
                  position: "absolute", inset: 0,
                  background: "linear-gradient(180deg, rgba(0,0,0,0.25), rgba(0,0,0,0.7))",
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 8, padding: 10, textAlign: "center",
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: "50%",
                    background: `${C.yellow}22`, border: `1.5px solid ${C.yellow}aa`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                      stroke={C.yellow} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="4" y="11" width="16" height="10" rx="2" />
                      <path d="M8 11V8a4 4 0 1 1 8 0v3" />
                    </svg>
                  </div>
                  <span style={{
                    fontFamily: "'Oxanium'", fontSize: 10, fontWeight: 800,
                    color: C.yellow, textTransform: "uppercase", letterSpacing: 1.4,
                    lineHeight: 1.3,
                  }}>
                    {celebGateReason === "register" ? "Sign up to reveal" : "Premium reveals"}
                  </span>
                </div>
              )}
              <span style={{
                position: "absolute", bottom: 8, right: 8,
                background: celebHidden ? "rgba(0,0,0,0.72)" : celeb.color,
                color: celebHidden
                  ? C.yellow
                  : (celeb.color === C.yellow ? C.black : "#fff"),
                fontFamily: "'Oxanium'", fontSize: 9, fontWeight: 800,
                padding: "3px 8px", borderRadius: 6,
                textTransform: "uppercase", letterSpacing: 1,
              }}>
                {celebHidden ? "?????" : celeb.name.split(" ")[0]}
              </span>
            </div>
          </div>

          {/* Celeb name — hidden under reveal CTA when gated */}
          <div style={{ textAlign: "center", marginTop: 14 }}>
            <h2 style={{
              fontFamily: "'Fredoka'", fontSize: 24, fontWeight: 700,
              color: C.white, margin: 0, letterSpacing: celebHidden ? 6 : 0.3,
              lineHeight: 1.05,
            }}>
              {celebHidden ? "?  ?  ?  ?  ?" : celeb.name}
            </h2>
            {isDoppelganger && (
              <div style={{
                display: "inline-block", marginTop: 8,
                background: `linear-gradient(135deg, ${celeb.color}, ${C.yellow})`,
                color: C.black,
                fontFamily: "'Oxanium'", fontWeight: 800, fontSize: 11,
                letterSpacing: 1.6, textTransform: "uppercase",
                padding: "5px 14px", borderRadius: 999,
                boxShadow: `0 0 16px ${celeb.color}66`,
              }}>🔥 doppelganger</div>
            )}
          </div>

          {/* Stats row */}
          <div style={{
            display: "flex", justifyContent: "center", gap: 18,
            marginTop: 14, padding: "10px 0 4px",
            borderTop: "1px solid rgba(255,255,255,0.08)",
          }}>
            {[
              { v: `${celeb.pct}%`, l: "match" },
              { v: "4,847",         l: "landmarks" },
              { v: isDoppelganger ? "Top 5%" : "Top 30%", l: "rank" },
            ].map(s => (
              <div key={s.l} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'Fredoka'", fontWeight: 700, fontSize: 16, color: C.yellow }}>{s.v}</div>
                <div style={{ fontFamily: "'Oxanium'", fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 1 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Hook (varies by viewer state) ── */}
        <div style={{ textAlign: "center", maxWidth: 360, marginTop: 4 }}>
          <p style={{
            fontFamily: "'Oxanium'", fontSize: 14, fontWeight: 600,
            color: C.white, margin: 0, lineHeight: 1.45,
          }}>
            {celebHidden ? (
              <>
                Want to see <span style={{ color: C.yellow, fontWeight: 800 }}>who they look like</span>?<br />
                <span style={{ color: "rgba(255,255,255,0.55)", fontWeight: 500, fontSize: 12 }}>
                  {celebGateReason === "register"
                    ? "Sign up free — and find your own match too."
                    : "Go Premium to reveal Doppelganger-tier matches."}
                </span>
              </>
            ) : (
              <>
                Could <span style={{ color: C.yellow, fontWeight: 800 }}>YOU</span> be next?<br />
                <span style={{ color: "rgba(255,255,255,0.55)", fontWeight: 500, fontSize: 12 }}>
                  Upload a selfie. Our AI scans 50,000+ celebrities. Free.
                </span>
              </>
            )}
          </p>
        </div>

        {/* ── CTA ── */}
        <button onClick={triggerUpload} style={{
          width: "100%", maxWidth: 360,
          fontFamily: "'Oxanium'", fontWeight: 800, fontSize: 16,
          padding: "16px 22px",
          background: C.yellow, color: C.black,
          border: `3px solid ${C.black}`, borderRadius: 16,
          boxShadow: `4px 4px 0 ${C.black}, 0 0 32px ${C.yellow}55`,
          cursor: "pointer", textTransform: "uppercase", letterSpacing: 1.2,
          animation: "mpPulse 2.4s ease-in-out infinite",
        }}>
          📸 Find My Doppelganger
        </button>

        <p style={{
          fontFamily: "'Oxanium'", fontSize: 11,
          color: "rgba(255,255,255,0.35)", margin: 0,
        }}>Free · Instant · No sign-up · 100% private</p>

        {/* Secondary link */}
        <button onClick={() => navigate("/")} style={{
          background: "transparent", border: "none",
          color: "rgba(255,255,255,0.45)",
          fontFamily: "'Oxanium'", fontSize: 11, fontWeight: 600,
          textDecoration: "underline", cursor: "pointer",
          marginTop: 4,
        }}>
          how does it work?
        </button>
      </div>

      {/* ── Branded footer ── */}
      <div style={{
        padding: "12px 0 14px", textAlign: "center",
        borderTop: "1px solid rgba(255,255,255,0.06)",
      }}>
        <svg width={68} height={22} viewBox="0 0 80 26">
          <text x="40" y="20" textAnchor="middle"
            fontFamily="'Fredoka',sans-serif" fontWeight="700" fontSize="20"
            fill={C.black} stroke={C.yellow} strokeWidth="3.5"
            strokeLinejoin="round" paintOrder="stroke">celebs</text>
        </svg>
      </div>
    </Shell>
  );
}

// ─── Layout primitives ────────────────────────────────────────────────────
function Shell({ children }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 300,
      background: `radial-gradient(ellipse at top, ${C.darkBlue} 0%, #0a1028 50%, #050812 100%)`,
      display: "flex", flexDirection: "column",
      fontFamily: "'Oxanium', sans-serif",
      overflowY: "auto",
      paddingTop: "env(safe-area-inset-top, 0px)",
      paddingBottom: "env(safe-area-inset-bottom, 0px)",
    }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@700&family=Oxanium:wght@400;500;600;700;800&display=swap');`}</style>
      {children}
    </div>
  );
}

function Spinner() {
  return (
    <div style={{
      width: 36, height: 36, borderRadius: "50%",
      border: `3px solid ${C.cyan}22`, borderTopColor: C.cyan,
      animation: "mpSpin 0.8s linear infinite",
    }} />
  );
}

const primaryBtn = {
  background: C.yellow, color: C.black,
  border: `2px solid ${C.black}`, borderRadius: 12,
  padding: "12px 24px", cursor: "pointer",
  fontFamily: "'Oxanium', sans-serif", fontWeight: 800,
  fontSize: 13, letterSpacing: 0.8, marginTop: 8,
  boxShadow: `4px 4px 0 ${C.black}`,
};
