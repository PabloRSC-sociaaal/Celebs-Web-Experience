import { useState, useEffect, useCallback } from "react";
import { colors, fonts } from "../../design/tokens";
import { useCtaUpload } from "../../hooks/useCtaUpload";

// Each marquee item carries enough context for the modal preview.
// `user` is a placeholder portrait that gets blurred in the privacy view.
const ITEMS = [
  { name: "Taylor Swift",      pct: 97, celeb: "/samples/celeb_taylor.jpg",         user: "/samples/user1.jpg" },
  { name: "Timothée Chalamet", pct: 94, celeb: "/samples/celeb_timothee.jpg",       user: "/samples/user3.jpg" },
  { name: "Zendaya",           pct: 96, celeb: "/samples/bracket_61_70_right.png",  user: "/samples/user2.jpg" },
  { name: "Bad Bunny",         pct: 91, celeb: "/samples/celeb_bad_bunny.webp",     user: "/samples/user4.jpg" },
  { name: "Selena Gomez",      pct: 93, celeb: "/samples/celeb_selena.jpg",         user: "/samples/user5.jpg" },
  { name: "Henry Cavill",      pct: 89, celeb: "/samples/celeb_henry.jpg",          user: "/samples/user1.jpg" },
  { name: "Billie Eilish",     pct: 90, celeb: "/samples/celeb_billie.jpg",         user: "/samples/user3.jpg" },
  { name: "Lisa (BLACKPINK)",  pct: 92, celeb: "/samples/celeb_lisa.jpg",           user: "/samples/user2.jpg" },
  { name: "Harry Styles",      pct: 87, celeb: "/samples/celeb_harry.jpg",          user: "/samples/user4.jpg" },
  { name: "Michael B. Jordan", pct: 88, celeb: "/samples/celeb_michael_jordan.jpg", user: "/samples/user1.jpg" },
  { name: "Dua Lipa",          pct: 95, celeb: "/samples/bracket_71_80_right.png",  user: "/samples/user5.jpg" },
  { name: "Dwayne Johnson",    pct: 86, celeb: "/samples/bracket_0_10_right.png",   user: "/samples/user2.jpg" },
  { name: "Sabrina Carpenter", pct: 93, celeb: "/samples/hero/sabrina.png",         user: "/samples/user5.jpg" },
];

// Minutes-ago timestamp generator — varies by index so each "match" feels recent.
function ago(i) {
  const mins = (i * 7 + 3) % 47 + 1;
  return mins < 60 ? `${mins} min ago` : `${Math.floor(mins / 60)} h ago`;
}

export function Marquee() {
  const [openItem, setOpenItem] = useState(null);
  const { triggerUpload, inputProps } = useCtaUpload();

  // Esc closes
  useEffect(() => {
    if (!openItem) return;
    const onKey = (e) => { if (e.key === "Escape") setOpenItem(null); };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [openItem]);

  const handleCtaClick = useCallback(() => {
    setOpenItem(null);
    triggerUpload();
  }, [triggerUpload]);

  return (
    <>
      <input {...inputProps} />

      {/* ── Header above marquee ── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        gap: 8, marginBottom: 10, flexWrap: "wrap",
      }}>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: "rgba(0,0,0,0.32)",
          border: `1px solid ${colors.yellow}55`,
          borderRadius: 999, padding: "5px 12px",
          fontFamily: fonts.body, fontSize: 10, fontWeight: 800,
          letterSpacing: 1.4, textTransform: "uppercase",
          color: colors.yellow,
        }}>
          <span style={{
            width: 7, height: 7, borderRadius: "50%",
            background: "#22c55e",
            boxShadow: "0 0 0 0 rgba(34,197,94,0.7)",
            animation: "ctaPulse 1.8s ease-in-out infinite",
          }} />
          Live
        </span>
        <span style={{
          fontFamily: fonts.body, fontSize: 11, fontWeight: 700,
          color: "rgba(255,255,255,0.7)",
          letterSpacing: 0.8, textTransform: "uppercase",
        }}>
          🔥 Latest Super Lookalikes appearing
        </span>
      </div>

      {/* ── Marquee strip ── */}
      <div style={{
        overflow: "hidden", width: "100%", padding: "8px 0 14px",
        position: "relative",
        maskImage: "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
        WebkitMaskImage: "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
      }}>
        <div style={{ display: "flex", gap: 12, animation: "marquee 50s linear infinite", width: "max-content" }}>
          {[...ITEMS, ...ITEMS].map((item, i) => (
            <button
              key={i}
              onClick={() => setOpenItem(item)}
              style={{
                background: "rgba(0,0,0,0.28)", backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                borderRadius: 30, padding: "8px 16px 8px 8px",
                fontFamily: "'Oxanium', sans-serif", fontSize: 13, fontWeight: 600,
                color: "#fff", whiteSpace: "nowrap",
                border: "1px solid rgba(255,255,255,0.15)",
                cursor: "pointer",
                display: "inline-flex", alignItems: "center", gap: 9,
                transition: "transform 0.2s, border-color 0.2s, background 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.borderColor = `${colors.yellow}88`; e.currentTarget.style.background = "rgba(0,0,0,0.45)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; e.currentTarget.style.background = "rgba(0,0,0,0.28)"; }}
            >
              <span style={{
                width: 22, height: 22, borderRadius: "50%",
                overflow: "hidden", flexShrink: 0,
                border: `1.5px solid ${colors.yellow}88`,
                background: "rgba(255,255,255,0.08)",
              }}>
                <img src={item.celeb} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top" }} />
              </span>
              <span>{item.name}</span>
              <span style={{
                background: colors.yellow, color: colors.black,
                borderRadius: 10, padding: "1px 7px",
                fontSize: 11, fontWeight: 800,
                letterSpacing: 0.3,
              }}>{item.pct}%</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Lookalike preview modal ── */}
      {openItem && (
        <LookalikeModal
          item={openItem}
          onClose={() => setOpenItem(null)}
          onCta={handleCtaClick}
          timeAgo={ago(ITEMS.indexOf(openItem))}
        />
      )}
    </>
  );
}

// ────────────────────────────────────────────────────────────────────────────
function LookalikeModal({ item, onClose, onCta, timeAgo }) {
  return (
    <div
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed", inset: 0, zIndex: 2000,
        background: "rgba(0,0,0,0.78)",
        backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
        animation: "fadeIn 0.25s ease",
        overscrollBehavior: "contain",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="lookalike-modal"
        style={{
          background: colors.black,
          border: `3px solid ${colors.yellow}`,
          borderRadius: 22,
          width: "100%", maxWidth: 520,
          maxHeight: "calc(100vh - 32px)",
          overflowY: "auto",
          position: "relative",
          boxShadow: `0 30px 80px rgba(0,0,0,0.6), 0 0 60px ${colors.yellow}33`,
          animation: "slideUp 0.45s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        {/* Close button */}
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
            transition: "all 0.2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = colors.yellow; e.currentTarget.style.color = colors.black; e.currentTarget.style.borderColor = colors.yellow; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(0,0,0,0.65)"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; }}
        >×</button>

        {/* Header pill */}
        <div style={{ padding: "20px 22px 0", display: "flex", justifyContent: "center" }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: `${colors.yellow}18`,
            border: `1px solid ${colors.yellow}55`,
            color: colors.yellow,
            borderRadius: 999, padding: "5px 14px",
            fontFamily: fonts.body, fontSize: 10, fontWeight: 800,
            letterSpacing: 1.5, textTransform: "uppercase",
          }}>🔥 Super Lookalike · {timeAgo}</span>
        </div>

        {/* Photo pair */}
        <div className="lookalike-pair" style={{
          display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: 12, padding: "20px 22px 6px",
          position: "relative",
        }}>
          {/* Left: blurred user with privacy lock overlay */}
          <div style={{
            position: "relative",
            aspectRatio: "3/4", borderRadius: 14, overflow: "hidden",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.12)",
          }}>
            <img
              src={item.user}
              alt=""
              draggable={false}
              style={{
                position: "absolute", inset: 0,
                width: "100%", height: "100%",
                objectFit: "cover", objectPosition: "center top",
                filter: "blur(22px) saturate(0.7) brightness(0.85)",
                transform: "scale(1.15)",
              }}
            />
            <div style={{
              position: "absolute", inset: 0,
              background: `linear-gradient(180deg, rgba(0,0,0,0.1), rgba(0,0,0,0.45))`,
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              gap: 8, padding: 12,
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: "50%",
                background: `${colors.yellow}22`,
                border: `1.5px solid ${colors.yellow}88`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                  stroke={colors.yellow} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="11" width="16" height="10" rx="2" />
                  <path d="M8 11V8a4 4 0 1 1 8 0v3" />
                </svg>
              </div>
              <span style={{
                fontFamily: fonts.body, fontSize: 9, fontWeight: 800,
                color: colors.yellow, textTransform: "uppercase", letterSpacing: 1.2,
              }}>Privacy first</span>
            </div>
            <span style={{
              position: "absolute", bottom: 8, left: 8,
              background: "rgba(0,0,0,0.72)", color: "#fff",
              fontFamily: fonts.body, fontSize: 9, fontWeight: 700,
              padding: "3px 8px", borderRadius: 6,
              textTransform: "uppercase", letterSpacing: 1,
            }}>You</span>
          </div>

          {/* Center match badge — overlay between cards */}
          <div style={{
            position: "absolute", left: "50%", top: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 3,
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: "50%",
              background: `linear-gradient(135deg, ${colors.yellow}, #FFC300)`,
              border: `3px solid ${colors.black}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: fonts.body, fontSize: 17, fontWeight: 900,
              color: colors.black,
              boxShadow: `0 0 0 3px ${colors.yellow}55, 0 8px 22px rgba(0,0,0,0.5)`,
            }}>
              {item.pct}%
            </div>
          </div>

          {/* Right: clear celebrity photo */}
          <div style={{
            position: "relative",
            aspectRatio: "3/4", borderRadius: 14, overflow: "hidden",
            background: "rgba(255,255,255,0.04)",
            border: `1px solid ${colors.yellow}55`,
          }}>
            <img
              src={item.celeb}
              alt={item.name}
              draggable={false}
              style={{
                position: "absolute", inset: 0,
                width: "100%", height: "100%",
                objectFit: "cover", objectPosition: "center top",
              }}
            />
            <span style={{
              position: "absolute", bottom: 8, right: 8,
              background: colors.yellow, color: colors.black,
              fontFamily: fonts.body, fontSize: 9, fontWeight: 800,
              padding: "3px 8px", borderRadius: 6,
              textTransform: "uppercase", letterSpacing: 1,
            }}>Celeb</span>
          </div>
        </div>

        {/* Name + tagline */}
        <div style={{ padding: "8px 22px 0", textAlign: "center" }}>
          <h3 style={{
            fontFamily: fonts.display, fontSize: 22, fontWeight: 700,
            color: colors.white, margin: 0, letterSpacing: 0.3,
          }}>
            {item.name}
          </h3>
          <p style={{
            fontFamily: fonts.body, fontSize: 13, fontWeight: 500,
            color: "rgba(255,255,255,0.65)", marginTop: 6, lineHeight: 1.5,
          }}>
            <strong style={{ color: colors.yellow }}>Privacy first</strong> — but this could be you.<br />
            We never share user faces. Your match stays yours.
          </p>
        </div>

        {/* CTA */}
        <div style={{ padding: "16px 22px 22px" }}>
          <button
            onClick={onCta}
            style={{
              width: "100%",
              fontFamily: fonts.body, fontWeight: 800, fontSize: 15,
              padding: "14px 18px",
              background: colors.yellow, color: colors.black,
              border: `3px solid ${colors.black}`,
              borderRadius: 14,
              boxShadow: `4px 4px 0 rgba(255,229,0,0.45)`,
              cursor: "pointer", textTransform: "uppercase", letterSpacing: 1.2,
              transition: "transform 0.15s, box-shadow 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translate(-2px,-2px)"; e.currentTarget.style.boxShadow = `6px 6px 0 rgba(255,229,0,0.6)`; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = `4px 4px 0 rgba(255,229,0,0.45)`; }}
          >
            📸 Find Out If You're Next
          </button>
          <p style={{
            fontFamily: fonts.body, fontSize: 11, fontWeight: 500,
            color: "rgba(255,255,255,0.4)", marginTop: 10, textAlign: "center",
          }}>
            Free · Instant · No sign-up needed
          </p>
        </div>
      </div>
    </div>
  );
}
