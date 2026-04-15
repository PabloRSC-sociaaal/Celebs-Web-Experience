import { useState } from "react";
import { signInWithGoogle, signInWithEmail, signUpWithEmail } from "../firebase/authService";

/**
 * AuthModal — Full-screen auth overlay.
 * Props: { isOpen, onClose, onSuccess, initialMode, title, subtitle }
 */
export function AuthModal({ isOpen, onClose, onSuccess, initialMode = "signup", title, subtitle }) {
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const clearError = () => setError("");

  async function handleGoogle() {
    setLoading(true);
    clearError();
    try {
      const result = await signInWithGoogle();
      onSuccess?.(result.user);
      onClose?.();
    } catch (e) {
      setError(e.message || "Google sign-in failed");
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
        padding: "36px 32px",
        width: "100%", maxWidth: 400,
        position: "relative",
        boxShadow: "0 32px 80px rgba(0,0,0,0.8)",
      }}>
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: 16, right: 16,
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
          color: "#FFE500", textAlign: "center", marginBottom: 8,
          letterSpacing: 0.5,
        }}>
          celebs
        </div>

        {/* Custom title / subtitle */}
        {title && (
          <div style={{
            fontFamily: "'Fredoka', sans-serif", fontWeight: 700, fontSize: 20,
            color: "#fff", textAlign: "center", marginBottom: 4,
            lineHeight: 1.2,
          }}>
            {title}
          </div>
        )}
        {subtitle && (
          <div style={{
            fontFamily: "'Oxanium', sans-serif", fontSize: 12, fontWeight: 400,
            color: "rgba(255,255,255,0.45)", textAlign: "center",
            marginBottom: 24, lineHeight: 1.5,
          }}>
            {subtitle}
          </div>
        )}
        {!title && (
          <div style={{
            fontFamily: "'Oxanium', sans-serif", fontSize: 13, fontWeight: 500,
            color: "rgba(255,255,255,0.45)", textAlign: "center",
            marginBottom: 24,
          }}>
            {mode === "signup" ? "Create your free account" : "Welcome back"}
          </div>
        )}

        {/* Google button */}
        <button
          onClick={handleGoogle}
          disabled={loading}
          style={{
            width: "100%", padding: "12px 16px",
            background: "#fff", color: "#000",
            border: "none", borderRadius: 12,
            fontFamily: "'Oxanium', sans-serif", fontWeight: 700, fontSize: 14,
            cursor: loading ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            opacity: loading ? 0.7 : 1,
            transition: "opacity 0.2s",
            marginBottom: 20,
          }}
          onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "#f0f0f0"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "#fff"; }}
        >
          <span style={{ fontSize: 18 }}>⊕</span>
          Continue with Google
        </button>

        {/* OR divider */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12, marginBottom: 20,
        }}>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
          <span style={{ fontFamily: "'Oxanium', sans-serif", fontSize: 11, color: "rgba(255,255,255,0.3)", fontWeight: 500 }}>or</span>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
        </div>

        {/* Email/password form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 10,
              padding: "12px 14px",
              color: "#fff",
              fontFamily: "'Oxanium', sans-serif", fontSize: 14,
              outline: "none", width: "100%", boxSizing: "border-box",
            }}
            onFocus={e => { e.target.style.borderColor = "rgba(255,229,0,0.5)"; }}
            onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.12)"; }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 10,
              padding: "12px 14px",
              color: "#fff",
              fontFamily: "'Oxanium', sans-serif", fontSize: 14,
              outline: "none", width: "100%", boxSizing: "border-box",
            }}
            onFocus={e => { e.target.style.borderColor = "rgba(255,229,0,0.5)"; }}
            onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.12)"; }}
          />

          {/* Error */}
          {error && (
            <div style={{
              fontFamily: "'Oxanium', sans-serif", fontSize: 12,
              color: "#F87171", lineHeight: 1.4,
              background: "rgba(248,113,113,0.08)",
              border: "1px solid rgba(248,113,113,0.2)",
              borderRadius: 8, padding: "8px 12px",
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%", padding: "13px 16px",
              background: "#FFE500", color: "#000",
              border: "none", borderRadius: 12,
              fontFamily: "'Oxanium', sans-serif", fontWeight: 800, fontSize: 14,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              letterSpacing: 0.4,
              transition: "opacity 0.2s, transform 0.15s",
              marginTop: 4,
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; }}
          >
            {loading ? "Please wait..." : mode === "signup" ? "Create Free Account" : "Sign In"}
          </button>
        </form>

        {/* Toggle */}
        <div style={{
          textAlign: "center", marginTop: 20,
          fontFamily: "'Oxanium', sans-serif", fontSize: 12,
          color: "rgba(255,255,255,0.35)",
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
      </div>
    </div>
  );
}
