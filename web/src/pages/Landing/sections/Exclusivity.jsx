import { useState, useEffect, useRef, useCallback } from "react";
import { colors, fonts } from "../../../design/tokens";
import { Button }        from "../../../components/Button";

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

export function Exclusivity() {
  const sectionRef = useRef(null);
  const [progress, setProgress] = useState(0);

  const screenAIn   = smoothstep(progress, 0.00, 0.15);
  const screenAOut  = 1 - smoothstep(progress, 0.35, 0.50);
  const screenA     = Math.min(screenAIn, screenAOut);

  const screenB     = smoothstep(progress, 0.45, 0.65);

  const scrambleActive = progress > 0.50;
  const barWidth       = smoothstep(progress, 0.55, 0.80) * 90;
  const ctaVisible     = smoothstep(progress, 0.72, 0.88);
  const hintOpacity    = 1 - smoothstep(progress, 0.05, 0.18);

  const scrambleLetters = useScramble(WORD, scrambleActive);

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
        height: "300vh",
        background: colors.yellow,
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

        {/* ── SCREEN B — "What is a Doppelganger?" ── */}
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
          <div style={{ maxWidth: 720, width: "100%" }}>
            {/* Pill badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: colors.black,
                color: colors.yellow,
                borderRadius: 30,
                padding: "6px 16px",
                fontFamily: fonts.body,
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: 1.5,
                textTransform: "uppercase",
                marginBottom: 20,
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: colors.green,
                  display: "inline-block",
                }}
              />
              Algorithm definition
            </div>

            {/* DOPPELGANGER scramble */}
            <div
              style={{
                fontFamily: "'Oxanium', monospace",
                fontWeight: 800,
                fontSize: "clamp(28px, 5vw, 58px)",
                letterSpacing: "0.05em",
                color: colors.black,
                textShadow: `3px 3px 0 ${colors.blue}55`,
                display: "flex",
                flexWrap: "wrap",
                lineHeight: 1,
                marginBottom: 24,
              }}
            >
              {scrambleLetters.map((ch, i) => (
                <span
                  key={i}
                  style={{
                    display: "inline-block",
                    minWidth: "0.58em",
                    textAlign: "center",
                    color:
                      ch === WORD[i] ? colors.black : `${colors.blue}99`,
                    transition: "color 0.1s",
                  }}
                >
                  {ch}
                </span>
              ))}
            </div>

            {/* Definition box */}
            <div
              style={{
                background: "rgba(0,0,0,0.08)",
                border: `2.5px solid ${colors.black}`,
                borderRadius: 20,
                padding: "24px 28px",
                boxShadow: `5px 5px 0 ${colors.black}`,
              }}
            >
              <div
                style={{
                  fontFamily: fonts.body,
                  fontSize: "clamp(14px, 1.8vw, 17px)",
                  fontWeight: 600,
                  color: colors.black,
                  lineHeight: 1.7,
                  marginBottom: 20,
                }}
              >
                You are a <strong>Doppelganger</strong> when our algorithm
                detects{" "}
                <span
                  style={{
                    background: colors.black,
                    color: colors.yellow,
                    fontWeight: 900,
                    padding: "2px 10px",
                    borderRadius: 6,
                    fontSize: "1.05em",
                  }}
                >
                  +90% facial similarity
                </span>{" "}
                with a celebrity — measured across bone structure, eye spacing,
                jawline symmetry and skin-tone mapping.
              </div>

              {/* Progress bar */}
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 8,
                    fontFamily: fonts.body,
                    fontSize: 11,
                    fontWeight: 700,
                    color: "rgba(0,0,0,0.5)",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                  }}
                >
                  <span>0% — No match</span>
                  <span style={{ color: colors.black }}>
                    90%+ → DOPPELGANGER ✓
                  </span>
                </div>
                <div
                  style={{
                    height: 10,
                    borderRadius: 5,
                    background: "rgba(0,0,0,0.12)",
                    overflow: "visible",
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${barWidth}%`,
                      borderRadius: 5,
                      background: `linear-gradient(90deg, ${colors.blue}, ${colors.green})`,
                      position: "relative",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        right: -7,
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: 20,
                        height: 20,
                        borderRadius: "50%",
                        background: colors.black,
                        border: `3px solid ${colors.yellow}`,
                        boxShadow: `0 0 0 4px ${colors.green}55`,
                        opacity: barWidth > 5 ? 1 : 0,
                      }}
                    />
                  </div>
                </div>
                <div
                  style={{
                    marginTop: 8,
                    fontFamily: fonts.body,
                    fontSize: 11,
                    color: "rgba(0,0,0,0.4)",
                    fontWeight: 500,
                  }}
                >
                  Most users score 60–85% · Only 5% cross the Doppelganger
                  threshold
                </div>
              </div>
            </div>

            {/* CTA */}
            <div
              style={{
                marginTop: 28,
                opacity: ctaVisible,
                transform: `translateY(${(1 - ctaVisible) * 16}px)`,
              }}
            >
              <Button variant="black" size="lg">
                🎯 Discover My Doppelganger
              </Button>
            </div>
          </div>
        </div>

        {/* Side progress dots */}
        <div
          style={{
            position: "absolute",
            right: 24,
            top: "50%",
            transform: "translateY(-50%)",
            display: "flex",
            flexDirection: "column",
            gap: 8,
            opacity: 0.4,
          }}
        >
          {[0.2, 0.6].map((threshold, i) => (
            <div
              key={i}
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background:
                  progress > threshold
                    ? colors.black
                    : "rgba(0,0,0,0.25)",
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
