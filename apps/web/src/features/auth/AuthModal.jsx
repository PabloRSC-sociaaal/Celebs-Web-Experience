import { useState } from "react";
import {
  signInWithGoogle,
  signInWithApple,
  signInWithEmail,
  signUpWithEmail,
  isAppleSignInAvailable,
} from "../firebase/authService";

/**
 * AuthModal — Full-screen auth overlay.
 * Props: { isOpen, onClose, onSuccess, initialMode, title, subtitle }
 *
 * One-tap providers (Google, Apple when available) are surfaced first
 * because the marketing goal is the lowest-friction signup path.
 * Email/password is collapsed under a 'continue with email' affordance.
 */
export function AuthModal({ isOpen, onClose, onSuccess, initialMode = "signup", title, subtitle }) {
  const [mode, setMode]     = useState(initialMode);
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [emailOpen, setEmailOpen] = useState(false);

  if (!isOpen) return null;

  const showApple   = isAppleSignInAvailable();
  const clearError  = () => setError("");

  async function handleProvider(fn) {
    setLoading(true);
    clearError();
    try {
      const result = await fn();
      onSuccess?.(result.user);
      onClose?.();
    } catch (e) {
      setError(e.message || "Sign-in failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    clearError();
    try {
      const fn = mode === "signup" ? signUpWithEmail : signInWithEmail;
      const result = await fn(email, password);
      onSuccess?.(result.user);
      onClose?.();
    } catch (e) {
      setError(e.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "16px",
      }}
    >
      <div style={{
        background: "#0d0d18",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 24,
        padding: "36px 28px 28px",
        width: "100%", maxWidth: 400,
        position: "relative",
        boxShadow: "0 32px 80px rgba(0,0,0,0.8)",
      }}>
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: "absolute", top: 14, right: 14,
            background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 8, width: 32, height: 32, cursor: "pointer",
            color: "rgba(255,255,255,0.5)", fontSize: 16,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "sans-serif",
          }}
        >✕</button>

        {/* Logo */}
        <div style={{
          fontFamily: "'Fredoka', sans-serif", fontWeight: 700, fontSize: 28,
          color: "#FFE500", textAlign: "center", marginBottom: 6,
          letterSpacing: 0.5,
        }}>
          celebs
        </div>

        {/* Title / subtitle */}
        {title ? (
          <>
            <div style={{
              fontFamily: "'Fredoka', sans-serif", fontWeight: 700, fontSize: 20,
              color: "#fff", textAlign: "center", marginBottom: 4,
              lineHeight: 1.2,
            }}>{title}</div>
            {subtitle && (
              <div style={{
                fontFamily: "'Oxanium', sans-serif", fontSize: 12, fontWeight: 400,
                color: "rgba(255,255,255,0.5)", textAlign: "center",
                marginBottom: 22, lineHeight: 1.5,
              }}>{subtitle}</div>
            )}
          </>
        ) : (
          <div style={{
            fontFamily: "'Oxanium', sans-serif", fontSize: 13, fontWeight: 500,
            color: "rgba(255,255,255,0.5)", textAlign: "center",
            marginBottom: 22,
          }}>
            {mode === "signup" ? "1 click and you're in. No password needed." : "Welcome back"}
          </div>
        )}

        {/* ── Provider buttons (one-tap) ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: emailOpen ? 18 : 8 }}>
          {/* Google — official 4-colour 'G' logo */}
          <button
            onClick={() => handleProvider(signInWithGoogle)}
            disabled={loading}
            style={providerBtn({ bg: "#fff", color: "#000" })}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "#f4f4f4"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#fff"; }}
          >
            <GoogleLogo />
            <span>Continue with Google</span>
          </button>

          {/* Apple — official monochrome glyph */}
          {showApple && (
            <button
              onClick={() => handleProvider(signInWithApple)}
              disabled={loading}
              style={providerBtn({ bg: "#000", color: "#fff", border: "1px solid rgba(255,255,255,0.18)" })}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "#1a1a1a"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#000"; }}
            >
              <AppleLogo />
              <span>Continue with Apple</span>
            </button>
          )}
        </div>

        {/* ── Email fallback (collapsed by default to keep the surface clean) ── */}
        {!emailOpen ? (
          <button
            onClick={() => setEmailOpen(true)}
            style={{
              width: "100%", background: "transparent",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 12, padding: "11px 14px",
              fontFamily: "'Oxanium', sans-serif", fontWeight: 600, fontSize: 13,
              color: "rgba(255,255,255,0.6)", cursor: "pointer",
              transition: "background 0.2s, border-color 0.2s",
              marginTop: 4,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.22)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; }}
          >
            Continue with email
          </button>
        ) : (
          <>
            <div style={{
              display: "flex", alignItems: "center", gap: 12,
              marginBottom: 14, marginTop: 4,
            }}>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
              <span style={{ fontFamily: "'Oxanium', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.3)", fontWeight: 500 }}>
                or with email
              </span>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <input
                type="email"
                placeholder="Email address"
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = "rgba(255,229,0,0.5)"; }}
                onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.12)"; }}
              />
              <input
                type="password"
                placeholder="Password"
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = "rgba(255,229,0,0.5)"; }}
                onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.12)"; }}
              />

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%", padding: "12px 16px",
                  background: "#FFE500", color: "#000",
                  border: "none", borderRadius: 12,
                  fontFamily: "'Oxanium', sans-serif", fontWeight: 800, fontSize: 14,
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.7 : 1,
                  letterSpacing: 0.4,
                  transition: "opacity 0.2s, transform 0.15s",
                }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; }}
              >
                {loading ? "Please wait..." : mode === "signup" ? "Create Free Account" : "Sign In"}
              </button>
            </form>
          </>
        )}

        {/* Error */}
        {error && (
          <div style={{
            fontFamily: "'Oxanium', sans-serif", fontSize: 12,
            color: "#F87171", lineHeight: 1.4,
            background: "rgba(248,113,113,0.08)",
            border: "1px solid rgba(248,113,113,0.2)",
            borderRadius: 8, padding: "8px 12px",
            marginTop: 14,
          }}>
            {error}
          </div>
        )}

        {/* Toggle signup ↔ signin */}
        <div style={{
          textAlign: "center", marginTop: 18,
          fontFamily: "'Oxanium', sans-serif", fontSize: 12,
          color: "rgba(255,255,255,0.4)",
        }}>
          {mode === "signup" ? (
            <>Already have an account?{" "}
              <span
                onClick={() => { setMode("signin"); clearError(); }}
                style={{ color: "#FFE500", cursor: "pointer", fontWeight: 700 }}
              >Sign in</span>
            </>
          ) : (
            <>Don't have an account?{" "}
              <span
                onClick={() => { setMode("signup"); clearError(); }}
                style={{ color: "#FFE500", cursor: "pointer", fontWeight: 700 }}
              >Sign up</span>
            </>
          )}
        </div>

        {/* Trust microcopy — softens the auth wall */}
        <div style={{
          textAlign: "center", marginTop: 14,
          fontFamily: "'Oxanium', sans-serif", fontSize: 10, fontWeight: 500,
          color: "rgba(255,255,255,0.25)",
        }}>
          No spam · Cancel anytime · 100 % private
        </div>
      </div>
    </div>
  );
}

// ─── Style helpers ────────────────────────────────────────────────────────────
function providerBtn({ bg, color, border = "none" }) {
  return {
    width: "100%", padding: "12px 16px",
    background: bg, color: color, border,
    borderRadius: 12,
    fontFamily: "'Oxanium', sans-serif", fontWeight: 700, fontSize: 14,
    cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
    transition: "background 0.2s",
  };
}

const inputStyle = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 10,
  padding: "12px 14px",
  color: "#fff",
  fontFamily: "'Oxanium', sans-serif", fontSize: 14,
  outline: "none", width: "100%", boxSizing: "border-box",
};

// ─── Brand SVG icons ──────────────────────────────────────────────────────────
function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
      <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
    </svg>
  );
}

function AppleLogo() {
  return (
    <svg width="17" height="20" viewBox="0 0 17 20" fill="currentColor" aria-hidden="true">
      <path d="M14.04 10.6c-.03-2.91 2.38-4.32 2.49-4.39-1.36-1.99-3.47-2.26-4.22-2.29-1.79-.18-3.5 1.05-4.41 1.05-.92 0-2.31-1.03-3.81-1-1.96.03-3.77 1.14-4.78 2.89-2.04 3.53-.52 8.74 1.46 11.6.97 1.4 2.12 2.97 3.62 2.91 1.46-.06 2.01-.94 3.77-.94s2.27.94 3.81.91c1.58-.03 2.57-1.42 3.53-2.83 1.11-1.62 1.57-3.19 1.6-3.27-.04-.02-3.07-1.18-3.1-4.66zM11.18 2.07c.81-.98 1.35-2.34 1.2-3.69-1.16.05-2.57.77-3.4 1.74-.74.86-1.4 2.24-1.22 3.57 1.29.1 2.6-.66 3.42-1.62z"/>
    </svg>
  );
}
