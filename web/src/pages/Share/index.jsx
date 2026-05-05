// ─────────────────────────────────────────────────────────
//  Share Page — /share/:shareId
//
//  Flow:
//  1. Recipient opens the link → sees "Someone wants your LookAlike"
//  2. Takes a selfie (camera encouraged)
//  3. Face detected → runs generation
//  4. Result shown briefly → invitation to register
//  5. SharedRequest marked as completed in storage
//
//  DEMO: localStorage (same browser).
//  PROD: Firestore + Firebase Storage cross-device.
// ─────────────────────────────────────────────────────────

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getSharedRequest, completeSharedRequest } from "../../services/sharedGenerations";
import { detectAndCropFace } from "../../features/face/detect";
import { generateComparison } from "../../features/firebase/generateComparison";
import { AuthModal } from "../../features/auth/AuthModal";
import { useAppStore } from "../../store/appStore";

const C = {
  blue: "#2AABE2", yellow: "#FFE500", black: "#0A0A0A", white: "#FFFFFF",
  pink: "#FF3CAC", cyan: "#00E5FF", green: "#22c55e",
};

export function SharePage() {
  const { shareId } = useParams();
  const navigate = useNavigate();
  const user = useAppStore(s => s.user);

  const [request, setRequest]       = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [phase, setPhase]           = useState("intro"); // intro | camera | processing | done | already | notfound
  const [croppedPhoto, setCropped]  = useState(null);
  const [result, setResult]         = useState(null);
  const [showAuth, setShowAuth]     = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    const req = getSharedRequest(shareId);
    if (!req) {
      setError("notfound");
      setPhase("notfound");
    } else if (req.status === "completed") {
      setRequest(req);
      setPhase("already");
    } else {
      setRequest(req);
      setPhase("intro");
    }
    setLoading(false);
  }, [shareId]);

  const handleFileChange = useCallback(async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhase("processing");

    try {
      const blobUrl = URL.createObjectURL(file);
      const detected = await detectAndCropFace(blobUrl);

      if (!detected.faceDetected) {
        setError("No face detected. Please try again with a clear selfie.");
        setPhase("camera");
        return;
      }

      setCropped(detected.croppedUrl);

      const results = await generateComparison(detected.croppedUrl);
      const celeb  = results?.[0] || null;
      const others = results?.slice(1, 5) || [];

      completeSharedRequest(shareId, {
        celeb,
        others,
        recipientPhoto: detected.croppedUrl,
      });

      setResult({ celeb, others });
      setPhase("done");
    } catch (err) {
      console.error("[SharePage] generation error:", err);
      setError("Something went wrong. Please try again.");
      setPhase("camera");
    }
  }, [shareId]);

  const openCamera = () => {
    setError(null);
    fileRef.current?.click();
  };

  if (loading) {
    return <ScreenShell><Spinner text="Loading..." /></ScreenShell>;
  }

  if (phase === "notfound") {
    return (
      <ScreenShell>
        <div style={{ textAlign: "center", padding: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔗</div>
          <h2 style={{ fontFamily: "'Fredoka'", color: C.white, marginBottom: 8 }}>Link not found</h2>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, lineHeight: 1.6, maxWidth: 280, margin: "0 auto" }}>
            This share link doesn't exist or has expired.
          </p>
          <button onClick={() => navigate("/")} style={ctaStyle}>
            Try Celebs App →
          </button>
        </div>
      </ScreenShell>
    );
  }

  if (phase === "already") {
    return (
      <ScreenShell>
        <div style={{ textAlign: "center", padding: 40 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
          <h2 style={{ fontFamily: "'Fredoka'", color: C.white, marginBottom: 8 }}>Already completed!</h2>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, lineHeight: 1.6, maxWidth: 300, margin: "0 auto" }}>
            This LookAlike has already been generated. Each link can only be used once.
          </p>
          <button onClick={() => navigate("/")} style={ctaStyle}>
            Find Your Own LookAlike →
          </button>
        </div>
      </ScreenShell>
    );
  }

  if (phase === "done" && result) {
    return (
      <ScreenShell>
        <div style={{ textAlign: "center", padding: "24px 16px", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <div style={{ fontSize: 48, animation: "popIn 0.5s cubic-bezier(0.34,1.56,0.64,1)" }}>🎉</div>
          <h2 style={{ fontFamily: "'Fredoka'", color: C.white, fontSize: "clamp(20px, 5vw, 28px)", margin: 0, lineHeight: 1.2 }}>
            LookAlike Generated!
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, lineHeight: 1.6, maxWidth: 300 }}>
            Your result has been sent back. The person who invited you can now see your celebrity match!
          </p>

          {/* Quick preview — blurred to create intrigue */}
          <div style={{
            width: "clamp(120px, 40vw, 200px)", aspectRatio: "1", borderRadius: 16,
            overflow: "hidden", position: "relative",
            border: `2px solid ${result.celeb?.color || C.yellow}`,
            boxShadow: `0 0 30px ${result.celeb?.color || C.yellow}33`,
          }}>
            <img
              src={result.celeb?.img} alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover", filter: "blur(12px) brightness(0.6)" }}
            />
            <div style={{
              position: "absolute", inset: 0,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4,
            }}>
              <div style={{ fontFamily: "'Fredoka'", fontSize: 28, fontWeight: 700, color: C.yellow }}>{result.celeb?.pct}%</div>
              <div style={{ fontFamily: "'Oxanium'", fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.6)", letterSpacing: 1 }}>MATCH</div>
            </div>
          </div>

          <div style={{
            background: "rgba(255,229,0,0.08)", border: `1px solid ${C.yellow}44`,
            borderRadius: 14, padding: "14px 20px", maxWidth: 320, width: "100%",
          }}>
            <div style={{ fontFamily: "'Fredoka'", fontWeight: 700, fontSize: 14, color: C.yellow, marginBottom: 4 }}>
              Want to see who you look like?
            </div>
            <div style={{ fontFamily: "'Oxanium'", fontSize: 11, color: "rgba(255,255,255,0.5)", lineHeight: 1.5, marginBottom: 12 }}>
              Sign up free and discover your own celebrity lookalike!
            </div>
            {user ? (
              <button onClick={() => navigate("/dashboard")} style={ctaStyle}>
                Go to My Dashboard →
              </button>
            ) : (
              <button onClick={() => setShowAuth(true)} style={ctaStyle}>
                Sign Up Free →
              </button>
            )}
          </div>
        </div>

        <AuthModal
          isOpen={showAuth}
          onClose={() => setShowAuth(false)}
          onSuccess={() => { setShowAuth(false); navigate("/dashboard"); }}
          title="Join Celebs"
          subtitle="Create your free account to find your own LookAlike"
        />
      </ScreenShell>
    );
  }

  // intro + camera + processing
  const hint = request?.requestContext?.hint;
  const accentColor = hint?.color || C.cyan;
  const roleName = hint?.text || "someone";

  return (
    <ScreenShell>
      <style>{`
        @keyframes popIn { from{opacity:0;transform:scale(0.6)} to{opacity:1;transform:scale(1)} }
        @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }
        @keyframes spin  { to{transform:rotate(360deg)} }
        @keyframes glow  { 0%,100%{box-shadow:0 0 20px ${accentColor}33} 50%{box-shadow:0 0 40px ${accentColor}55} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
      `}</style>

      {/* Hidden file input — ONLY camera, front-facing (selfie) */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="user"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "24px 20px", gap: 16, textAlign: "center",
      }}>

        {phase === "processing" ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20, padding: "20px 0" }}>
            <Spinner text="Analyzing your face..." />
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, maxWidth: 260, lineHeight: 1.5 }}>
              Our AI is scanning 50,000+ celebrity profiles to find your match
            </p>
          </div>
        ) : (
          <>
            {/* Who sent this */}
            <div style={{
              background: `${accentColor}12`, border: `1.5px solid ${accentColor}33`,
              borderRadius: 16, padding: "14px 22px", maxWidth: 340, width: "100%",
              animation: "popIn 0.5s ease-out",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 28 }}>{hint?.emoji || "👋"}</span>
                <div style={{ textAlign: "left" }}>
                  <div style={{
                    fontFamily: "'Fredoka'", fontSize: 15, fontWeight: 700,
                    color: accentColor, lineHeight: 1.1,
                  }}>
                    You've been invited!
                  </div>
                  <div style={{
                    fontFamily: "'Oxanium'", fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 2,
                  }}>
                    via Celebs App
                  </div>
                </div>
              </div>
              <div style={{
                fontFamily: "'Oxanium'", fontSize: 13, color: "rgba(255,255,255,0.7)",
                lineHeight: 1.6,
              }}>
                A friend or family member wants to discover{" "}
                <strong style={{ color: C.white }}>which celebrity {roleName} looks like</strong>.
                They need a selfie of you!
              </div>
            </div>

            {/* Camera icon */}
            <div style={{
              width: 90, height: 90, borderRadius: "50%",
              background: `linear-gradient(135deg, ${accentColor}22, ${accentColor}11)`,
              border: `2.5px solid ${accentColor}44`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 40,
              animation: "float 3s ease-in-out infinite, glow 2s ease-in-out infinite",
            }}>
              🤳
            </div>

            {/* Title */}
            <div>
              <h1 style={{
                fontFamily: "'Fredoka'", fontWeight: 700,
                fontSize: "clamp(24px, 7vw, 34px)",
                color: C.white, margin: 0, lineHeight: 1.1,
              }}>
                Take a Selfie
              </h1>
              <p style={{
                fontFamily: "'Oxanium'", fontSize: 12,
                color: "rgba(255,255,255,0.35)", marginTop: 6,
              }}>
                Only a real selfie works — no gallery photos
              </p>
            </div>

            {/* How it works */}
            <div style={{
              display: "flex", gap: 8, maxWidth: 320, width: "100%",
            }}>
              {[
                { n: "1", text: "Take a selfie", icon: "🤳" },
                { n: "2", text: "AI finds your match", icon: "🔍" },
                { n: "3", text: "Result sent back", icon: "✨" },
              ].map((s) => (
                <div key={s.n} style={{
                  flex: 1, background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 10, padding: "10px 6px", textAlign: "center",
                }}>
                  <div style={{ fontSize: 18, marginBottom: 4 }}>{s.icon}</div>
                  <div style={{ fontFamily: "'Oxanium'", fontSize: 9, color: "rgba(255,255,255,0.4)", fontWeight: 600, lineHeight: 1.3 }}>
                    {s.text}
                  </div>
                </div>
              ))}
            </div>

            {error && (
              <div style={{
                background: "rgba(255,60,60,0.12)", border: "1px solid rgba(255,60,60,0.3)",
                borderRadius: 10, padding: "10px 16px", maxWidth: 320, width: "100%",
                fontFamily: "'Oxanium'", fontSize: 12, color: "#ff6b6b",
              }}>
                {error}
              </div>
            )}

            {/* CTA — only selfie camera */}
            <button onClick={openCamera} style={{
              ...ctaStyle,
              padding: "16px 40px", fontSize: 16,
              animation: "pulse 2s ease-in-out infinite",
              maxWidth: 320, width: "100%",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            }}>
              🤳 Take My Selfie
            </button>

            <div style={{
              fontFamily: "'Oxanium'", fontSize: 9,
              color: "rgba(255,255,255,0.2)", maxWidth: 260, lineHeight: 1.5,
            }}>
              Your selfie is only used for this one-time analysis. It won't be stored or shared with anyone else.
            </div>
          </>
        )}
      </div>

      {/* Branding footer */}
      <div style={{
        padding: "14px 0", textAlign: "center",
        borderTop: "1px solid rgba(255,255,255,0.06)",
      }}>
        <svg width={64} height={20} viewBox="0 0 80 26">
          <text x="40" y="20" textAnchor="middle" fontFamily="'Fredoka',sans-serif" fontWeight="700"
            fontSize="20" fill="#fff" opacity="0.25" stroke={C.yellow} strokeWidth="3"
            strokeLinejoin="round" paintOrder="stroke">celebs</text>
        </svg>
      </div>
    </ScreenShell>
  );
}

// ── Shared UI components ──

function ScreenShell({ children }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 300,
      background: "linear-gradient(170deg, #050812 0%, #0a1028 50%, #050812 100%)",
      display: "flex", flexDirection: "column",
      fontFamily: "'Oxanium', sans-serif",
      overflowY: "auto",
      paddingTop: "env(safe-area-inset-top, 0px)",
      paddingBottom: "env(safe-area-inset-bottom, 0px)",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@700&family=Oxanium:wght@400;500;600;700;800&display=swap');
      `}</style>
      {children}
    </div>
  );
}

function Spinner({ text }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
      <div style={{
        width: 40, height: 40, borderRadius: "50%",
        border: `3px solid ${C.cyan}22`, borderTopColor: C.cyan,
        animation: "spin 0.8s linear infinite",
      }} />
      <div style={{ fontFamily: "'Oxanium'", fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.6)" }}>
        {text}
      </div>
    </div>
  );
}

const ctaStyle = {
  background: C.yellow, color: C.black, border: "none",
  borderRadius: 12, padding: "12px 24px",
  cursor: "pointer",
  fontFamily: "'Oxanium', sans-serif", fontWeight: 800,
  fontSize: 13, letterSpacing: 0.5,
  boxShadow: `0 0 20px ${C.yellow}33`,
  marginTop: 8,
};
