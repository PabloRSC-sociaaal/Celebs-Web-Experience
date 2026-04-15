import { useState, useEffect, useRef, useCallback } from "react";
import { colors, fonts } from "../../../design/tokens";

const NOISE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#$%@&*";
const WORD  = "DOPPELGANGER";

function useScramble(word, active) {
  const [letters, setLetters] = useState(() => word.split("").map(() => "·"));
  const triggered = useRef(false);
  const timer     = useRef(null);

  useEffect(() => {
    if (!active || triggered.current) return;
    triggered.current = true;

    let tick = 0;
    const total = 32;

    const run = () => {
      tick++;
      setLetters(
        word.split("").map((ch, i) => {
          if (tick > Math.floor((i / word.length) * total * 0.8)) return ch;
          return NOISE[Math.floor(Math.random() * NOISE.length)];
        }),
      );
      if (tick < total) timer.current = setTimeout(run, 50);
      else setLetters(word.split(""));
    };

    timer.current = setTimeout(run, 50);
    return () => clearTimeout(timer.current);
  }, [active, word]);

  return letters;
}

function smoothstep(p, from, to) {
  if (p <= from) return 0;
  if (p >= to)   return 1;
  const t = (p - from) / (to - from);
  return t * t * (3 - 2 * t);
}

// ── Tech-metric mini badges ──────────────────────────────────
const TECH_METRICS = [
  { label: "Facial landmarks",  value: "4,847" },
  { label: "Bone structure",    value: "AI" },
  { label: "Eye spacing",       value: "0.02mm" },
  { label: "Jawline symmetry",  value: "98.7%" },
  { label: "Skin-tone map",     value: "16M" },
];

export function Exclusivity() {
  const sectionRef = useRef(null);
  const [progress, setProgress] = useState(0);

  // ── Screen A: fades in immediately, fades out earlier ──
  const screenAIn   = smoothstep(progress, 0.00, 0.07);
  const screenAOut  = 1 - smoothstep(progress, 0.24, 0.36);
  const screenA     = Math.min(screenAIn, screenAOut);

  // ── Screen B: definition ──
  const screenB     = smoothstep(progress, 0.32, 0.48);

  const scrambleActive  = progress > 0.36;
  const hintOpacity     = 1 - smoothstep(progress, 0.02, 0.10);

  const scrambleLetters = useScramble(WORD, scrambleActive);

  // ── Background geometry rotation driven by scroll ──
  const geoRotate  = progress * 360;
  const geoScale   = 0.8 + progress * 0.4;
  const geo2Rotate = progress * -240;

  const calcProgress = useCallback(() => {
    const el = sectionRef.current;
    if (!el) return;
    const rect  = el.getBoundingClientRect();
    const range = el.offsetHeight - window.innerHeight;
    if (range <= 0) return;
    const scrolled = -rect.top;
    setProgress(Math.max(0, Math.min(1, scrolled / range)));
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", calcProgress, { passive: true });
    calcProgress();
    return () => window.removeEventListener("scroll", calcProgress);
  }, [calcProgress]);

  return (
    <section
      ref={sectionRef}
      style={{
        position: "relative",
        height: "240vh",
        background: colors.yellow,
        zIndex: 1,
      }}
    >
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {/* Halftone background */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            backgroundImage:
              "radial-gradient(circle, rgba(0,0,0,0.07) 1px, transparent 1px)",
            backgroundSize: "16px 16px",
          }}
        />

        {/* ── Dynamic background shapes ── */}
        {/* Large ring */}
        <div style={{
          position: "absolute",
          width: "clamp(300px, 55vw, 700px)",
          height: "clamp(300px, 55vw, 700px)",
          borderRadius: "50%",
          border: "3px solid rgba(0,0,0,0.06)",
          top: "50%", left: "50%",
          transform: `translate(-50%,-50%) rotate(${geoRotate}deg) scale(${geoScale})`,
          pointerEvents: "none",
          transition: "none",
        }} />

        {/* Cross / plus */}
        <div style={{
          position: "absolute",
          width: "clamp(200px, 35vw, 450px)",
          height: "clamp(200px, 35vw, 450px)",
          top: "50%", left: "50%",
          transform: `translate(-50%,-50%) rotate(${geo2Rotate}deg)`,
          pointerEvents: "none",
        }}>
          <div style={{
            position: "absolute", top: "50%", left: 0, right: 0,
            height: 2, background: "rgba(0,0,0,0.05)",
            transform: "translateY(-50%)",
          }} />
          <div style={{
            position: "absolute", left: "50%", top: 0, bottom: 0,
            width: 2, background: "rgba(0,0,0,0.05)",
            transform: "translateX(-50%)",
          }} />
        </div>

        {/* Diagonal line */}
        <div style={{
          position: "absolute",
          width: "140vw", height: 1.5,
          background: "rgba(0,0,0,0.04)",
          top: "50%", left: "-20vw",
          transform: `rotate(${25 + progress * 30}deg)`,
          transformOrigin: "center center",
          pointerEvents: "none",
        }} />

        {/* Small floating dots */}
        {[
          { x: "15%", y: "25%", delay: 0 },
          { x: "80%", y: "20%", delay: 0.3 },
          { x: "75%", y: "75%", delay: 0.6 },
          { x: "20%", y: "70%", delay: 0.9 },
        ].map((dot, i) => (
          <div key={i} style={{
            position: "absolute",
            width: 6, height: 6, borderRadius: "50%",
            background: "rgba(0,0,0,0.08)",
            left: dot.x, top: dot.y,
            transform: `translate(${Math.sin((progress + dot.delay) * Math.PI * 2) * 20}px, ${Math.cos((progress + dot.delay) * Math.PI * 2) * 20}px)`,
            pointerEvents: "none",
          }} />
        ))}

        {/* ── SCREEN A — "Only 5% reach Doppelganger status" ── */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 24px",
            opacity: screenA,
            transform: `translateY(${(1 - screenA) * 30}px)`,
            pointerEvents: screenA > 0.1 ? "auto" : "none",
          }}
        >
          <div
            style={{
              fontFamily: fonts.display,
              fontSize: "clamp(100px, 18vw, 200px)",
              fontWeight: 700,
              lineHeight: 1,
              color: colors.black,
              textShadow: `6px 6px 0 ${colors.blue}`,
              letterSpacing: "-2px",
            }}
          >
            5%
          </div>

          <div
            style={{
              fontFamily: fonts.display,
              fontSize: "clamp(22px, 3.5vw, 42px)",
              fontWeight: 700,
              color: colors.black,
              textAlign: "center",
              marginTop: 12,
              lineHeight: 1.2,
              maxWidth: 600,
            }}
          >
            of users ever reach
            <br />
            <span style={{ color: colors.blue }}>Doppelganger</span> status
          </div>

          <p
            style={{
              fontFamily: fonts.body,
              fontSize: "clamp(13px, 1.5vw, 16px)",
              color: "rgba(0,0,0,0.55)",
              textAlign: "center",
              marginTop: 18,
              maxWidth: 460,
              lineHeight: 1.65,
              fontWeight: 400,
            }}
          >
            Our AI analyzes over 4,847 facial landmarks. Most people score
            between 60–85%. Very few cross the threshold. Are you one of them?
          </p>

          <div
            style={{
              marginTop: 48,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              opacity: hintOpacity,
            }}
          >
            <span
              style={{
                fontFamily: fonts.body,
                fontSize: 10,
                fontWeight: 700,
                color: "rgba(0,0,0,0.35)",
                textTransform: "uppercase",
                letterSpacing: 2,
              }}
            >
              Scroll to learn more ↓
            </span>
            <div style={{ animation: "floatCard 1.8s ease-in-out infinite" }}>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgba(0,0,0,0.35)"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <path d="M12 5v14M5 12l7 7 7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* ── SCREEN B — concise definition + tech metrics ── */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 24px",
            opacity: screenB,
            transform: `translateY(${(1 - screenB) * 40}px)`,
            pointerEvents: screenB > 0.1 ? "auto" : "none",
          }}
        >
          <div style={{ maxWidth: 640, width: "100%" }}>
            {/* Pill badge */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: colors.black, color: colors.yellow,
              borderRadius: 30, padding: "6px 16px",
              fontFamily: fonts.body, fontSize: 11, fontWeight: 800,
              letterSpacing: 1.5, textTransform: "uppercase",
              marginBottom: 20,
            }}>
              <span style={{
                width: 7, height: 7, borderRadius: "50%",
                background: colors.green, display: "inline-block",
                animation: "simExpPulse 2s ease infinite",
              }} />
              AI Analysis
            </div>

            {/* DOPPELGANGER scramble */}
            <div style={{
              fontFamily: "'Oxanium', monospace",
              fontWeight: 800,
              fontSize: "clamp(28px, 5vw, 58px)",
              letterSpacing: "0.05em",
              color: colors.black,
              textShadow: `3px 3px 0 ${colors.blue}55`,
              display: "flex", flexWrap: "wrap",
              lineHeight: 1, marginBottom: 20,
            }}>
              {scrambleLetters.map((ch, i) => (
                <span key={i} style={{
                  display: "inline-block", minWidth: "0.58em",
                  textAlign: "center",
                  color: ch === WORD[i] ? colors.black : `${colors.blue}99`,
                  transition: "color 0.1s",
                }}>
                  {ch}
                </span>
              ))}
            </div>

            {/* Short definition */}
            <div style={{
              background: "rgba(0,0,0,0.08)",
              border: `2.5px solid ${colors.black}`,
              borderRadius: 20, padding: "20px 24px",
              boxShadow: `5px 5px 0 ${colors.black}`,
            }}>
              <div style={{
                fontFamily: fonts.body,
                fontSize: "clamp(15px, 2vw, 18px)",
                fontWeight: 600, color: colors.black,
                lineHeight: 1.6, marginBottom: 18,
              }}>
                When our algorithm detects{" "}
                <span style={{
                  background: colors.black, color: colors.yellow,
                  fontWeight: 900, padding: "2px 10px",
                  borderRadius: 6, fontSize: "1.05em",
                  whiteSpace: "nowrap",
                }}>
                  +90 % similarity
                </span>{" "}
                with a celebrity, you're a <strong>Doppelganger</strong>.
              </div>

              {/* Tech metric chips */}
              <div style={{
                display: "flex", flexWrap: "wrap", gap: 8,
              }}>
                {TECH_METRICS.map((m) => (
                  <div key={m.label} style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    background: "rgba(0,0,0,0.06)",
                    border: "1.5px solid rgba(0,0,0,0.1)",
                    borderRadius: 10, padding: "5px 12px",
                  }}>
                    <span style={{
                      fontFamily: fonts.body, fontSize: 12, fontWeight: 800,
                      color: colors.blue,
                    }}>
                      {m.value}
                    </span>
                    <span style={{
                      fontFamily: fonts.body, fontSize: 10, fontWeight: 600,
                      color: "rgba(0,0,0,0.4)", textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}>
                      {m.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Side scroll indicator ── */}
        <div
          style={{
            position: "absolute",
            right: 28, top: "50%",
            transform: "translateY(-50%)",
            display: "flex", flexDirection: "column",
            alignItems: "center", gap: 10,
            opacity: progress < 0.92 ? 0.55 : 0,
            transition: "opacity 0.4s",
            pointerEvents: "none",
          }}
        >
          <div style={{
            width: 3, height: 80, borderRadius: 2,
            background: "rgba(0,0,0,0.12)",
            position: "relative", overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", top: 0, left: 0,
              width: "100%",
              height: `${Math.round(progress * 100)}%`,
              background: colors.black, borderRadius: 2,
            }} />
          </div>
          <div style={{ animation: "floatCard 1.6s ease-in-out infinite" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke={colors.black} strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 5v14M5 12l7 7 7-7" />
            </svg>
          </div>
          <span style={{
            fontFamily: fonts.body, fontSize: 9, fontWeight: 700,
            color: "rgba(0,0,0,0.45)", textTransform: "uppercase",
            letterSpacing: 1.5, writingMode: "vertical-rl",
            transform: "rotate(180deg)", marginTop: 4,
          }}>
            Keep scrolling
          </span>
        </div>
      </div>
    </section>
  );
}
