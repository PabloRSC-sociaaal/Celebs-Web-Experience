// ─────────────────────────────────────────────────────────────────────────────
// ShareMatchModal — Viral share dialog. Generates the 1080×1920 PNG card,
// stores a public match record, then offers Web Share API / Download / Copy
// Link so the user can post it to Snapchat / TikTok / Instagram Stories.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState, useCallback } from "react";
import { generateShareCard } from "./generateShareCard";
import { createMatchShare }  from "../../services/matchShare";

const C = {
  yellow: "#FFE500", black: "#0A0A0A", white: "#FFFFFF",
  cyan: "#00E5FF", blue: "#2AABE2",
};

export function ShareMatchModal({ open, onClose, celeb, userPhotoUrl, userName = "" }) {
  const [imgUrl, setImgUrl]       = useState(null);
  const [blob, setBlob]           = useState(null);
  const [shareUrl, setShareUrl]   = useState(null);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied]       = useState(false);
  const [error, setError]         = useState(null);
  const startedRef = useRef(false);

  const generate = useCallback(async () => {
    if (startedRef.current) return;
    startedRef.current = true;
    setGenerating(true);
    setError(null);

    try {
      // 1. Build the canvas blob
      const b = await generateShareCard({ celeb, userPhotoUrl });
      if (!b) throw new Error("Failed to render share card");

      // 2. Persist a viral match record so /m/:matchId works
      const { shareUrl } = createMatchShare({
        celeb, userPhotoUrl, senderName: userName,
      });

      const url = URL.createObjectURL(b);
      setBlob(b);
      setImgUrl(url);
      setShareUrl(shareUrl);
    } catch (e) {
      console.error("[ShareMatchModal] generate error:", e);
      setError("Couldn't build the share card. Please try again.");
    } finally {
      setGenerating(false);
    }
  }, [celeb, userPhotoUrl, userName]);

  // Kick off generation on open and lock body scroll
  useEffect(() => {
    if (!open) return;
    generate();
    document.body.style.overflow = "hidden";
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Cleanup blob URL when modal closes / unmounts
  useEffect(() => {
    return () => {
      if (imgUrl) URL.revokeObjectURL(imgUrl);
    };
  }, [imgUrl]);

  // Reset state when modal closes so the next open re-generates fresh
  useEffect(() => {
    if (!open) {
      startedRef.current = false;
      setImgUrl(null); setBlob(null); setShareUrl(null);
      setCopied(false); setError(null);
    }
  }, [open]);

  if (!open) return null;

  // ── Action handlers ──
  // Caption hides the celeb identity — that's the reveal at the link.
  const shareCaption = celeb.pct >= 90
    ? `🔥 ${celeb.pct}% match with my celebrity Doppelganger… can you guess who? 👀`
    : `Just got a ${celeb.pct}% celebrity match 😅 Tap to see who and find yours →`;

  const handleNativeShare = async () => {
    if (!blob || !shareUrl) return;
    const file = new File([blob], "celebs-match.png", { type: "image/png" });
    const data = {
      files: [file],
      title: "My Celebrity Doppelganger — Celebs",
      text:  `${shareCaption}\n${shareUrl}`,
      url:   shareUrl,
    };
    try {
      if (navigator.canShare && navigator.canShare(data)) {
        await navigator.share(data);
      } else if (navigator.share) {
        await navigator.share({ title: data.title, text: data.text, url: data.url });
      } else {
        handleDownload();
      }
    } catch (e) {
      if (e?.name !== "AbortError") console.warn("[share] native share failed:", e);
    }
  };

  const handleDownload = () => {
    if (!imgUrl) return;
    const a = document.createElement("a");
    a.href = imgUrl;
    a.download = `celebs-${(celeb.name || "match").toLowerCase().replace(/\s+/g, "-")}-${celeb.pct}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleCopyLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(`${shareCaption}\n${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard blocked — show fallback by selecting input
    }
  };

  const canNativeShare = typeof navigator !== "undefined" && !!navigator.share;

  return (
    <div
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed", inset: 0, zIndex: 2200,
        background: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 14,
        animation: "fadeIn 0.25s ease",
        overscrollBehavior: "contain",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: C.black,
          border: `3px solid ${C.yellow}`,
          borderRadius: 22,
          width: "100%", maxWidth: 440,
          maxHeight: "calc(100vh - 28px)",
          overflowY: "auto",
          position: "relative",
          boxShadow: `0 30px 80px rgba(0,0,0,0.7), 0 0 60px ${C.yellow}33`,
          animation: "slideUp 0.4s cubic-bezier(0.34,1.56,0.64,1)",
          fontFamily: "'Oxanium', sans-serif",
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: "absolute", top: 12, right: 12, zIndex: 5,
            width: 36, height: 36, borderRadius: "50%",
            background: "rgba(0,0,0,0.65)", border: "1.5px solid rgba(255,255,255,0.2)",
            color: "#fff", cursor: "pointer",
            fontSize: 18, fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >×</button>

        {/* Header */}
        <div style={{ padding: "20px 22px 12px", textAlign: "center" }}>
          <div style={{ fontSize: 30, marginBottom: 4 }}>📲</div>
          <h3 style={{
            fontFamily: "'Fredoka'", fontWeight: 700, fontSize: 22,
            color: C.white, margin: 0, letterSpacing: 0.3,
          }}>
            Share to Stories
          </h3>
          <p style={{
            fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.55)",
            marginTop: 6, lineHeight: 1.5,
          }}>
            Built for Snapchat, TikTok & Instagram. Privacy-safe.
          </p>
        </div>

        {/* Preview */}
        <div style={{
          padding: "0 22px",
          display: "flex", flexDirection: "column", alignItems: "center",
        }}>
          <div style={{
            width: "100%", maxWidth: 260,
            aspectRatio: "9/16", borderRadius: 16, overflow: "hidden",
            background: "rgba(255,255,255,0.04)",
            border: "1.5px solid rgba(255,255,255,0.15)",
            position: "relative",
            boxShadow: "0 12px 30px rgba(0,0,0,0.5)",
          }}>
            {imgUrl ? (
              <img
                src={imgUrl}
                alt="Share preview"
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            ) : (
              <div style={{
                position: "absolute", inset: 0,
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", gap: 12,
                color: "rgba(255,255,255,0.5)",
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  border: `3px solid ${C.yellow}33`, borderTopColor: C.yellow,
                  animation: "morphSpin 0.8s linear infinite",
                }} />
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>
                  Generating…
                </span>
              </div>
            )}
          </div>

          {error && (
            <div style={{
              marginTop: 10, padding: "8px 12px",
              background: "rgba(255,60,60,0.12)",
              border: "1px solid rgba(255,60,60,0.3)",
              borderRadius: 10, fontSize: 12,
              color: "#ff6b6b",
            }}>
              {error} <button onClick={() => { startedRef.current = false; generate(); }}
                style={{ background: "none", border: "none", color: C.yellow, cursor: "pointer", textDecoration: "underline", fontWeight: 700, marginLeft: 6 }}>
                retry
              </button>
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ padding: "16px 22px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
          {/* Primary: native share (mobile) */}
          {canNativeShare ? (
            <button
              onClick={handleNativeShare}
              disabled={!imgUrl || generating}
              style={primaryBtn(!imgUrl || generating)}
            >
              📤 Share Now
            </button>
          ) : (
            <button
              onClick={handleDownload}
              disabled={!imgUrl || generating}
              style={primaryBtn(!imgUrl || generating)}
            >
              ⬇ Download Image
            </button>
          )}

          {/* Secondary actions row */}
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={handleDownload}
              disabled={!imgUrl || generating}
              style={secondaryBtn(!imgUrl || generating)}
            >
              ⬇ Save
            </button>
            <button
              onClick={handleCopyLink}
              disabled={!shareUrl || generating}
              style={secondaryBtn(!shareUrl || generating)}
            >
              {copied ? "✓ Copied!" : "🔗 Copy link"}
            </button>
          </div>

          {/* Share URL display */}
          {shareUrl && (
            <div style={{
              marginTop: 6, padding: "10px 12px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 10,
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <span style={{ fontSize: 14 }}>🔗</span>
              <span style={{
                flex: 1, fontFamily: "'Oxanium'", fontSize: 11, fontWeight: 600,
                color: "rgba(255,255,255,0.6)", overflow: "hidden",
                textOverflow: "ellipsis", whiteSpace: "nowrap", direction: "rtl", textAlign: "left",
              }}>{shareUrl}</span>
            </div>
          )}

          {/* Caption hint */}
          <div style={{
            marginTop: 4,
            background: "rgba(255,229,0,0.06)",
            border: `1px solid ${C.yellow}33`,
            borderRadius: 12, padding: "10px 12px",
            fontSize: 11, fontWeight: 500,
            color: "rgba(255,255,255,0.65)", lineHeight: 1.5,
          }}>
            <strong style={{ color: C.yellow }}>Suggested caption:</strong>{" "}
            <span>{shareCaption}</span>
          </div>
        </div>

        <style>{`@keyframes morphSpin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}

function primaryBtn(disabled) {
  return {
    width: "100%",
    background: disabled ? "rgba(255,229,0,0.4)" : C.yellow,
    color: C.black, border: `3px solid ${C.black}`,
    borderRadius: 14, padding: "14px 18px",
    fontFamily: "'Oxanium'", fontWeight: 800, fontSize: 15,
    letterSpacing: 1.2, textTransform: "uppercase",
    cursor: disabled ? "not-allowed" : "pointer",
    boxShadow: disabled ? "none" : `4px 4px 0 rgba(255,229,0,0.45)`,
    transition: "transform 0.15s, box-shadow 0.15s",
  };
}

function secondaryBtn(disabled) {
  return {
    flex: 1,
    background: disabled ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.07)",
    color: disabled ? "rgba(255,255,255,0.35)" : "#fff",
    border: "1.5px solid rgba(255,255,255,0.14)",
    borderRadius: 12, padding: "11px 12px",
    fontFamily: "'Oxanium'", fontWeight: 700, fontSize: 12,
    letterSpacing: 0.6, cursor: disabled ? "not-allowed" : "pointer",
  };
}
