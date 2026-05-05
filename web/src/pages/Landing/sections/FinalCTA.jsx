// @STUB — Email waitlist capture (FinalCTA section)
// Status:    DUMMY — shows "You're on the list!" but email is NOT persisted anywhere
// Missing:   Backend integration to save email (Firestore, Mailchimp, Resend, etc.)
// Priority:  P1 — losing potential leads; wire to any email service
// Effort:    ~1h — POST to email API or write to Firestore collection
import { useState } from "react";
import { colors, fonts } from "../../../design/tokens";
import { useCtaUpload }  from "../../../hooks/useCtaUpload";
import { AuthModal }     from "../../../features/auth/AuthModal";

export function FinalCTA() {
  const { triggerUpload, inputProps } = useCtaUpload();
  const [showAuth, setShowAuth] = useState(false);
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  function handleEmailSubmit(e) {
    e.preventDefault();
    if (email.trim()) setEmailSent(true);
  }

  return (
    <section style={{ background: colors.black, padding: "90px 24px" }}>
      <input {...inputProps} />
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <div style={{
          background: `linear-gradient(135deg, ${colors.yellow}0A, ${colors.blue}0A)`,
          border: `2px solid ${colors.yellow}25`,
          borderRadius: 32, padding: "60px 40px", textAlign: "center",
          position: "relative", overflow: "hidden",
        }}>
          {/* radial glow */}
          <div style={{ position: "absolute", top: -80, left: "50%", transform: "translateX(-50%)", width: 350, height: 350, borderRadius: "50%", background: `radial-gradient(circle, ${colors.yellow}12, transparent 60%)`, filter: "blur(50px)" }} />
          <div style={{ position: "relative", zIndex: 2 }}>
            <div style={{ fontSize: 52, marginBottom: 14 }}>🌟</div>
            <h2 style={{ fontFamily: fonts.display, fontSize: "clamp(36px, 5vw, 58px)", fontWeight: 700, color: colors.yellow, lineHeight: 1, textShadow: `3px 3px 0 ${colors.blue}` }}>
              Ready to Meet<br />Your Lookalike?
            </h2>
            <p style={{ fontFamily: fonts.body, color: "rgba(255,255,255,0.55)", fontSize: 15, marginTop: 18, maxWidth: 440, margin: "18px auto 0", lineHeight: 1.6, fontWeight: 400 }}>
              Join over 12 million people who already found their celebrity doppelganger.
            </p>
            <div style={{ display: "flex", gap: 14, justifyContent: "center", marginTop: 36, flexWrap: "wrap" }}>
              <button onClick={triggerUpload} style={{
                fontFamily: fonts.body, fontWeight: 800, fontSize: 17,
                padding: "18px 44px", background: colors.yellow, color: colors.black,
                border: `3px solid ${colors.black}`, borderRadius: 14,
                boxShadow: `4px 4px 0 ${colors.black}`,
                cursor: "pointer", textTransform: "uppercase", letterSpacing: 1.2,
                transition: "all 0.2s",
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translate(-2px,-2px)"; e.currentTarget.style.boxShadow = `6px 6px 0 ${colors.black}`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = `4px 4px 0 ${colors.black}`; }}
              >
                🚀 Upload My Photo — It's Free
              </button>

              {/* Secondary: Create Account */}
              <button onClick={() => setShowAuth(true)} style={{
                fontFamily: fonts.body, fontWeight: 700, fontSize: 16,
                padding: "18px 36px",
                background: "transparent",
                color: colors.yellow,
                border: `2px solid ${colors.yellow}66`,
                borderRadius: 14,
                cursor: "pointer", letterSpacing: 0.8,
                transition: "all 0.2s",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = colors.yellow; e.currentTarget.style.background = `${colors.yellow}10`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = `${colors.yellow}66`; e.currentTarget.style.background = "transparent"; }}
              >
                ✨ Create Account
              </button>
            </div>
            <p style={{ fontFamily: fonts.body, color: "rgba(255,255,255,0.3)", fontSize: 12, marginTop: 20, fontWeight: 500 }}>
              Instant results · 100% free
            </p>

            {/* Email capture */}
            <div style={{ marginTop: 32, borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 28 }}>
              {emailSent ? (
                <div style={{
                  fontFamily: fonts.body, fontSize: 14, fontWeight: 700,
                  color: "#22c55e",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}>
                  <span style={{ fontSize: 18 }}>✓</span> You're on the list!
                </div>
              ) : (
                <form onSubmit={handleEmailSubmit} style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      borderRadius: 10, padding: "11px 16px",
                      color: "#fff",
                      fontFamily: fonts.body, fontSize: 14,
                      outline: "none", width: 220,
                    }}
                    onFocus={e => { e.target.style.borderColor = `${colors.yellow}66`; }}
                    onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.15)"; }}
                  />
                  <button type="submit" style={{
                    fontFamily: fonts.body, fontWeight: 700, fontSize: 13,
                    padding: "11px 20px",
                    background: "rgba(255,229,0,0.15)",
                    color: colors.yellow,
                    border: `1.5px solid ${colors.yellow}44`,
                    borderRadius: 10,
                    cursor: "pointer", letterSpacing: 0.4,
                    whiteSpace: "nowrap",
                    transition: "all 0.2s",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = `${colors.yellow}25`; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,229,0,0.15)"; }}
                  >
                    Get Early Access
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        onSuccess={() => setShowAuth(false)}
        initialMode="signup"
      />
    </section>
  );
}
