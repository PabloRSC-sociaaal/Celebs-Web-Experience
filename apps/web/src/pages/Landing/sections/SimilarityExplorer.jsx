import { useState, useRef, useCallback, useEffect } from "react";
import { colors, fonts } from "../../../design/tokens";
import { useCtaUpload }  from "../../../hooks/useCtaUpload";
import { bracketImg }    from "../../../assets/manifest";

// ── Data for each 10 % bracket ──────────────────────────────
const BRACKETS = [
  { min: 0,  max: 10,  key: "bracket_0_10",   label: "No Match",          color: "#ef4444", emoji: "❌", desc: "Completely different facial structures — the algorithm finds zero connection.",             pair: "Random strangers" },
  { min: 11, max: 20,  key: "bracket_11_20",  label: "Very Low",           color: "#f97316", emoji: "😕", desc: "Almost nothing in common. Different face shapes, features and proportions.",               pair: "Unrelated people" },
  { min: 21, max: 30,  key: "bracket_21_30",  label: "Slight Resemblance", color: "#f59e0b", emoji: "🤔", desc: "A couple of features vaguely align — maybe eye shape or nose width.",                     pair: "Co-workers who 'kinda look alike'" },
  { min: 31, max: 40,  key: "bracket_31_40",  label: "Some Features",      color: "#eab308", emoji: "👀", desc: "A few matching landmarks are detected. Noticeable but still faint.",                       pair: "Distant relatives" },
  { min: 41, max: 50,  key: "bracket_41_50",  label: "Moderate Match",     color: "#84cc16", emoji: "😮", desc: "Several facial landmarks overlap. Friends might say 'you look a bit like…'",              pair: "Friends who get confused" },
  { min: 51, max: 60,  key: "bracket_51_60",  label: "Notable",            color: "#22c55e", emoji: "😲", desc: "Strong alignment in key features. The resemblance is hard to deny.",                       pair: "Siblings" },
  { min: 61, max: 70,  key: "bracket_61_70",  label: "Striking",           color: "#14b8a6", emoji: "🔥", desc: "People would stop you on the street. Multiple feature groups match.",                      pair: "Parent & child" },
  { min: 71, max: 80,  key: "bracket_71_80",  label: "High Similarity",    color: "#06b6d4", emoji: "⚡", desc: "The algorithm lights up. Very close mapping across bone structure & eye spacing.",         pair: "Lookalikes" },
  { min: 81, max: 90,  key: "bracket_81_90",  label: "Near Match",         color: "#8b5cf6", emoji: "🤯", desc: "Jaw, cheekbones, eye spacing — almost identical. So close, yet not quite…",               pair: "Identical twins" },
  { min: 91, max: 100, key: "bracket_91_100", label: "DOPPELGANGER",       color: colors.yellow, emoji: "🎯", desc: "Over 90 % facial match. You've crossed the threshold. You ARE the celebrity.", pair: "Celebrity & their Doppelganger" },
];

function getBracket(val) {
  return BRACKETS.find(b => val >= b.min && val <= b.max) || BRACKETS[0];
}

// ── Face card — shows real photo when src provided, falls back to SVG ──
function FaceCard({ label, dark, src }) {
  return (
    <div style={{
      width: "100%", maxWidth: 130, aspectRatio: "3/4", borderRadius: 14,
      background: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
      border: src
        ? `2px solid ${dark ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.18)"}`
        : `2px dashed ${dark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)"}`,
      overflow: "hidden", position: "relative",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      gap: 8, transition: "all 0.3s",
    }}>
      {src ? (
        <>
          <img
            src={src}
            alt={label}
            style={{
              position: "absolute", inset: 0,
              width: "100%", height: "100%",
              objectFit: "cover", objectPosition: "center top",
            }}
          />
          <span style={{
            position: "absolute", bottom: 6, left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(0,0,0,0.65)", color: "#fff",
            fontFamily: fonts.body, fontSize: 9, fontWeight: 700,
            textTransform: "uppercase", letterSpacing: 1,
            padding: "3px 8px", borderRadius: 6,
            whiteSpace: "nowrap",
          }}>
            {label}
          </span>
        </>
      ) : (
        <>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
            stroke={dark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.18)"}
            strokeWidth="1.5" strokeLinecap="round">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
          </svg>
          <span style={{
            fontFamily: fonts.body, fontSize: 9, fontWeight: 700,
            color: dark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.3)",
            textTransform: "uppercase", letterSpacing: 1,
          }}>
            {label}
          </span>
        </>
      )}
    </div>
  );
}

// ── Component ────────────────────────────────────────────────
export function SimilarityExplorer() {
  const [value, setValue]                 = useState(50);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [cardHover, setCardHover]         = useState(false);
  const [spotlightDismissed, setSpotlightDismissed] = useState(false);
  const trackRef   = useRef(null);
  const sectionRef = useRef(null);
  const dragging   = useRef(false);
  const prevDoppel = useRef(false);

  const bracket        = getBracket(value);
  const isDoppelganger = value >= 91;
  const pairImages     = bracketImg(bracket.key);

  if (prevDoppel.current && !isDoppelganger) setSpotlightDismissed(false);
  prevDoppel.current = isDoppelganger;

  const spotlightActive = isDoppelganger && !spotlightDismissed;

  // ── Dismiss spotlight on scroll ──
  useEffect(() => {
    if (!spotlightActive) return;
    const dismiss = () => setSpotlightDismissed(true);
    window.addEventListener("scroll", dismiss, { passive: true, once: true });
    return () => window.removeEventListener("scroll", dismiss);
  }, [spotlightActive]);

  // ── Scroll-snap ──
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = "html{scroll-snap-type:y proximity}";
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  // ── pointer helpers ──
  const updateFromPointer = useCallback((clientX) => {
    const rect = trackRef.current.getBoundingClientRect();
    const pct  = ((clientX - rect.left) / rect.width) * 100;
    setValue(Math.max(0, Math.min(100, Math.round(pct))));
  }, []);

  const onPointerDown = useCallback((e) => {
    dragging.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    if (!hasInteracted) setHasInteracted(true);
    updateFromPointer(e.clientX);
  }, [updateFromPointer, hasInteracted]);

  const onPointerMove = useCallback((e) => {
    if (!dragging.current) return;
    updateFromPointer(e.clientX);
  }, [updateFromPointer]);

  const onPointerUp = useCallback(() => { dragging.current = false; }, []);

  const { triggerUpload, inputProps } = useCtaUpload();

  const handleCardClick = () => {
    if (!isDoppelganger) return;
    triggerUpload();
  };

  const ticks = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

  return (
    <section
      ref={sectionRef}
      style={{
        background: colors.yellow,
        minHeight: "100vh",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "80px 24px",
        position: "relative",
        zIndex: 2,
        marginTop: "-60vh",
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        borderTop: `4px solid ${colors.black}`,
        boxShadow: `0 -20px 60px rgba(0,0,0,0.25), 0 -4px 12px rgba(0,0,0,0.1)`,
        scrollSnapAlign: "start",
        scrollSnapStop: "always",
      }}
    >
      <style>{`
        @keyframes simExpPulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(255,229,0,0.5); }
          50%     { box-shadow: 0 0 18px 6px rgba(255,229,0,0.35); }
        }
        @keyframes simExpWiggle {
          0%,100% { transform: translateX(0); }
          25%     { transform: translateX(-14px); }
          75%     { transform: translateX(14px); }
        }
        @keyframes simExpCardGlow {
          0%,100% { box-shadow: 0 0 30px rgba(255,229,0,0.4), 6px 6px 0 ${colors.black}; }
          50%     { box-shadow: 0 0 50px rgba(255,229,0,0.65), 6px 6px 0 ${colors.black}; }
        }
        @keyframes simExpSpotlightIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>

      <input {...inputProps} />

      {/* Slide handle */}
      <div style={{
        position: "absolute", top: 12, left: "50%",
        transform: "translateX(-50%)",
        width: 48, height: 5, borderRadius: 3,
        background: "rgba(0,0,0,0.18)",
        pointerEvents: "none",
      }} />

      {/* Halftone */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: "radial-gradient(circle, rgba(0,0,0,0.05) 1px, transparent 1px)",
        backgroundSize: "16px 16px",
        borderTopLeftRadius: 32, borderTopRightRadius: 32,
      }} />

      {/* ── Spotlight overlay — always rendered, opacity-driven ── */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 50,
        background: "rgba(0,0,0,0.78)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        opacity: spotlightActive ? 1 : 0,
        transition: "opacity 1.2s ease",
        pointerEvents: "none",
        animation: spotlightActive ? "simExpSpotlightIn 0.45s ease" : "none",
        visibility: isDoppelganger || spotlightDismissed ? "visible" : "hidden",
      }} />

      {/*
        Content wrapper — NO z-index here so the card's z-index
        participates directly in the section's stacking context,
        allowing it to appear above the overlay (z-index 50).
      */}
      <div style={{ maxWidth: 660, width: "100%", position: "relative" }}>

        {/* ── Title ── */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <h2 style={{
            fontFamily: fonts.display, fontSize: "clamp(22px, 4vw, 36px)",
            fontWeight: 700, color: colors.black, margin: 0, lineHeight: 1.2,
          }}>
            What does each score look like?
          </h2>
          <p style={{
            fontFamily: fonts.body, fontSize: 14, color: "rgba(0,0,0,0.5)",
            marginTop: 8, fontWeight: 500,
          }}>
            Explore real examples across the similarity spectrum
          </p>
        </div>

        {/* ── Card — fixed height for clean transitions ── */}
        <div
          onClick={handleCardClick}
          onMouseEnter={() => isDoppelganger && setCardHover(true)}
          onMouseLeave={() => setCardHover(false)}
          style={{
            position: "relative",
            zIndex: spotlightActive ? 60 : "auto",
            background: isDoppelganger ? colors.black : "rgba(255,255,255,0.55)",
            border: `3px solid ${isDoppelganger ? colors.yellow : colors.black}`,
            borderRadius: 24,
            padding: "24px 20px 20px",
            minHeight: 340,
            display: "flex",
            flexDirection: "column",
            boxShadow: isDoppelganger
              ? undefined
              : `5px 5px 0 ${colors.black}`,
            animation: isDoppelganger
              ? "simExpCardGlow 2.5s ease-in-out infinite"
              : "none",
            marginBottom: 32,
            cursor: isDoppelganger ? "pointer" : "default",
            transform: spotlightActive && cardHover
              ? "translate(-2px,-2px) scale(1.04)"
              : spotlightActive
                ? "scale(1.02)"
                : isDoppelganger && cardHover
                  ? "translate(-2px,-2px) scale(1.015)"
                  : "none",
            transition: "transform 0.3s cubic-bezier(0.34,1.56,0.64,1), background 0.35s, border-color 0.35s",
          }}
        >
          {/* Bracket pill */}
          <div style={{ textAlign: "center", marginBottom: 14 }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: bracket.color,
              color: isDoppelganger || bracket.color === "#eab308" || bracket.color === "#84cc16" ? colors.black : "#fff",
              borderRadius: 20, padding: "5px 14px",
              fontFamily: fonts.body, fontSize: 11, fontWeight: 800,
              letterSpacing: 1, textTransform: "uppercase",
              transition: "background 0.3s, color 0.3s",
            }}>
              {bracket.emoji} {bracket.label}
            </span>
          </div>

          {/* Face pair + percentage */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: "clamp(12px, 3vw, 24px)", marginBottom: 14,
          }}>
            <FaceCard label={isDoppelganger ? "You" : "Person"} dark={isDoppelganger} src={pairImages.left} />

            <div style={{
              minWidth: 68, height: 68, borderRadius: "50%",
              background: bracket.color,
              border: `3px solid ${isDoppelganger ? colors.yellow : colors.black}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: fonts.body, fontSize: 20, fontWeight: 900,
              color: isDoppelganger || bracket.color === "#eab308" || bracket.color === "#84cc16" ? colors.black : "#fff",
              boxShadow: isDoppelganger ? `0 0 24px ${colors.yellow}55` : `3px 3px 0 ${colors.black}`,
              flexShrink: 0,
              transition: "background 0.3s, border-color 0.3s, box-shadow 0.3s, color 0.3s",
            }}>
              {value}%
            </div>

            <FaceCard label="Celebrity" dark={isDoppelganger} src={pairImages.right} />
          </div>

          {/* Pair label — fixed height */}
          <div style={{
            fontFamily: fonts.body, fontSize: 11, fontWeight: 700,
            color: isDoppelganger ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.35)",
            textAlign: "center", textTransform: "uppercase", letterSpacing: 1.2,
            marginBottom: 6, minHeight: 16,
            transition: "color 0.3s",
          }}>
            {isDoppelganger ? "Could this be you?" : `Example: ${bracket.pair}`}
          </div>

          {/* Description — fixed height for consistency */}
          <p style={{
            fontFamily: fonts.body, fontSize: 13, fontWeight: 500,
            color: isDoppelganger ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.55)",
            textAlign: "center", lineHeight: 1.6, maxWidth: 440,
            margin: "0 auto",
            minHeight: 52,
            transition: "color 0.3s",
          }}>
            {isDoppelganger
              ? "You've crossed the 90 % threshold — only 5 % of people make it here. Upload your photo to discover your celebrity match."
              : bracket.desc}
          </p>

          {/* Spacer to push CTA to bottom */}
          <div style={{ flex: 1 }} />

          {/* ── Inline CTA button (inside card) ── */}
          <div style={{
            marginTop: 14,
            padding: "14px 28px",
            background: isDoppelganger ? colors.yellow : "transparent",
            color: colors.black,
            borderRadius: 14,
            fontFamily: fonts.body,
            fontSize: 15,
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: 1.2,
            textAlign: "center",
            border: `3px solid ${isDoppelganger ? colors.black : "transparent"}`,
            boxShadow: isDoppelganger
              ? cardHover
                ? `6px 6px 0 ${colors.yellow}55`
                : `4px 4px 0 ${colors.yellow}44`
              : "none",
            opacity: isDoppelganger ? 1 : 0,
            maxHeight: isDoppelganger ? 60 : 0,
            overflow: "hidden",
            transition: "opacity 0.4s, max-height 0.4s, background 0.3s, border-color 0.3s, box-shadow 0.2s",
          }}>
            📸 Upload My Photo
          </div>
        </div>

        {/* ── Interactive Slider ── */}
        <div style={{ position: "relative", userSelect: "none" }}>

          {/* Tick labels */}
          <div style={{
            display: "flex", justifyContent: "space-between",
            marginBottom: 6, padding: "0 2px",
          }}>
            {ticks.map(t => (
              <span key={t} style={{
                fontFamily: fonts.body, fontSize: 9, fontWeight: 700,
                color: t === 90 ? colors.black : "rgba(0,0,0,0.28)",
                width: 0, textAlign: "center", whiteSpace: "nowrap",
              }}>
                {t}
              </span>
            ))}
          </div>

          {/* Track + fill + thumb */}
          <div
            ref={trackRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            style={{
              position: "relative", height: 14, borderRadius: 7,
              background: "rgba(0,0,0,0.1)", cursor: "pointer",
              touchAction: "none",
            }}
          >
            {/* Fill */}
            <div style={{
              position: "absolute", top: 0, left: 0, height: "100%",
              width: `${value}%`, borderRadius: 7,
              background: bracket.color,
              transition: "background 0.25s",
            }} />

            {/* 90 % threshold line */}
            <div style={{
              position: "absolute", left: "90%", top: -4, bottom: -4,
              width: 2.5, background: colors.black, opacity: 0.35,
              transform: "translateX(-50%)", borderRadius: 2,
            }} />
            <div style={{
              position: "absolute", left: "90%", top: -20,
              transform: "translateX(-50%)",
              fontFamily: fonts.body, fontSize: 8, fontWeight: 800,
              color: "rgba(0,0,0,0.45)", textTransform: "uppercase",
              letterSpacing: 0.8, whiteSpace: "nowrap",
            }}>
              Threshold
            </div>

            {/* Value tooltip */}
            <div style={{
              position: "absolute", left: `${value}%`, top: -30,
              transform: "translateX(-50%)",
              background: colors.black, color: colors.yellow,
              borderRadius: 6, padding: "2px 8px",
              fontFamily: fonts.body, fontSize: 11, fontWeight: 800,
              whiteSpace: "nowrap", pointerEvents: "none",
            }}>
              {value}%
            </div>

            {/* Thumb */}
            <div style={{
              position: "absolute", top: "50%", left: `${value}%`,
              transform: "translate(-50%, -50%)",
              width: 30, height: 30, borderRadius: "50%",
              background: isDoppelganger ? colors.yellow : colors.black,
              border: `3px solid ${isDoppelganger ? colors.black : colors.yellow}`,
              boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
              cursor: "grab",
              transition: "background 0.2s, border-color 0.2s",
              animation: !hasInteracted ? "simExpPulse 2s ease infinite" : "none",
            }} />
          </div>

          {/* Tick lines */}
          <div style={{
            display: "flex", justifyContent: "space-between",
            padding: "0 2px", marginTop: 3,
          }}>
            {ticks.map(t => (
              <div key={t} style={{
                width: 1.5, height: t === 90 ? 10 : 5,
                background: t === 90 ? colors.black : "rgba(0,0,0,0.18)",
                borderRadius: 1,
              }} />
            ))}
          </div>
        </div>

        {/* ── Drag hint (before first interaction) ── */}
        {!hasInteracted && (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            gap: 10, marginTop: 18,
          }}>
            <span style={{
              fontFamily: fonts.body, fontSize: 13, fontWeight: 700,
              color: "rgba(0,0,0,0.35)",
            }}>←</span>
            <span style={{ animation: "simExpWiggle 1.5s ease-in-out infinite", fontSize: 22 }}>
              👆
            </span>
            <span style={{
              fontFamily: fonts.body, fontSize: 11, fontWeight: 700,
              color: "rgba(0,0,0,0.4)", textTransform: "uppercase", letterSpacing: 1,
            }}>
              Drag to explore →
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
