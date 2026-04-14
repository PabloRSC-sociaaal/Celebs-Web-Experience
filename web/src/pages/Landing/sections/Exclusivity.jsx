import { useState, useEffect, useRef } from "react";
import { colors, fonts } from "../../../design/tokens";
import { Button }        from "../../../components/Button";

// ─────────────────────────────────────────────────────────
//  Exclusivity — Scroll-driven pinned animation
//
//  La sección ocupa 3× la altura del viewport.
//  El contenido queda fijo (sticky) mientras el usuario
//  hace scroll, y los elementos aparecen progresivamente
//  según cuánto ha avanzado el scroll dentro de la sección.
//
//  Mapa de progreso (0 → 1):
//    0.00 – 0.12  → "Only 5% Find Their" entra
//    0.12 – 0.30  → "DOPPELGANGER" scramble
//    0.30 – 0.55  → pill + primera línea de definición
//    0.55 – 0.72  → barra de similitud + segunda línea
//    0.72 – 0.88  → CTA aparece
//    0.88 – 1.00  → visual de la derecha escala / brilla
// ─────────────────────────────────────────────────────────

const NOISE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#$%@!?&*";
const WORD  = "DOPPELGANGER";

function useScramble(word, active) {
  const [letters, setLetters] = useState(() => word.split("").map(() => "·"));
  const frameRef   = useRef(null);
  const wasActive  = useRef(false);

  useEffect(() => {
    if (!active || wasActive.current) return;
    wasActive.current = true;
    let tick = 0;
    const total = 30;

    const run = () => {
      tick++;
      setLetters(
        word.split("").map((char, i) => {
          const lockAt = Math.floor((i / word.length) * total * 0.82);
          if (tick > lockAt) return char;
          return NOISE[Math.floor(Math.random() * NOISE.length)];
        })
      );
      if (tick < total) frameRef.current = setTimeout(run, 52);
      else setLetters(word.split(""));
    };
    frameRef.current = setTimeout(run, 52);
    return () => clearTimeout(frameRef.current);
  }, [active, word]);

  return letters;
}

// Ease helper — aplica una curva suave entre dos puntos de progreso
function ease(progress, from, to) {
  if (progress <= from) return 0;
  if (progress >= to)   return 1;
  const t = (progress - from) / (to - from);
  // ease-out cubic
  return 1 - Math.pow(1 - t, 3);
}

export function Exclusivity() {
  const sectionRef = useRef(null);
  const [progress, setProgress] = useState(0); // 0 → 1

  // Derivar fases del progreso
  const titleIn      = ease(progress, 0.00, 0.12);
  const scrambleOn   = progress > 0.12;
  const defLine1In   = ease(progress, 0.30, 0.48);
  const barFill      = ease(progress, 0.52, 0.70) * 90; // % de ancho (max 90%)
  const barDotOn     = progress > 0.55;
  const defLine2In   = ease(progress, 0.55, 0.70);
  const ctaIn        = ease(progress, 0.72, 0.86);
  const visualIn     = ease(progress, 0.05, 0.22);
  const visualGlow   = ease(progress, 0.80, 1.00);

  const scrambleLetters = useScramble(WORD, scrambleOn);

  // Scroll listener — calcula progreso dentro de la sección
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const onScroll = () => {
      const rect       = el.getBoundingClientRect();
      const total      = el.offsetHeight - window.innerHeight;
      const scrolled   = -rect.top;
      const p          = Math.max(0, Math.min(1, scrolled / total));
      setProgress(p);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // calcular en mount por si ya está en posición
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    // Sección alta: da espacio al scroll
    <section
      ref={sectionRef}
      className="halftone"
      style={{
        background: colors.yellow,
        position: "relative",
        height: "310vh",
      }}
    >
      {/* Contenido fijado al viewport mientras se hace scroll */}
      <div style={{
        position: "sticky",
        top: 0,
        height: "100vh",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
      }}>
        <div style={{ maxWidth: 1140, margin: "0 auto", padding: "0 24px", width: "100%" }}>
          <div
            className="excl-grid"
            style={{ display: "flex", gap: 56, alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}
          >

            {/* ── COLUMNA IZQUIERDA ── */}
            <div style={{ flex: "1 1 340px", maxWidth: 520 }}>

              {/* "Only 5% Find Their" */}
              <div style={{
                opacity:   titleIn,
                transform: `translateY(${(1 - titleIn) * 36}px)`,
                transition: "none",
              }}>
                <div style={{
                  fontFamily: fonts.display,
                  fontSize: "clamp(26px, 3.8vw, 44px)",
                  fontWeight: 700,
                  color: colors.black,
                  lineHeight: 1.1,
                  textShadow: `2px 2px 0 ${colors.blue}44`,
                }}>
                  Only 5% Find Their
                </div>
              </div>

              {/* DOPPELGANGER scramble */}
              <div style={{
                marginTop: 6,
                opacity: scrambleOn ? 1 : 0,
                transition: "opacity 0.25s ease",
              }}>
                <div style={{
                  fontFamily: "'Oxanium', monospace",
                  fontWeight: 800,
                  fontSize: "clamp(32px, 5.2vw, 64px)",
                  letterSpacing: "0.04em",
                  color: colors.black,
                  textShadow: `3px 3px 0 ${colors.blue}`,
                  display: "flex",
                  flexWrap: "wrap",
                  lineHeight: 1,
                }}>
                  {scrambleLetters.map((char, i) => (
                    <span key={i} style={{
                      display: "inline-block",
                      minWidth: "0.58em",
                      textAlign: "center",
                      color: char === WORD[i] ? colors.black : `${colors.blue}bb`,
                      transition: "color 0.1s",
                    }}>
                      {char}
                    </span>
                  ))}
                </div>
              </div>

              {/* ── Pill etiqueta ── */}
              <div style={{
                marginTop: 22,
                opacity:   defLine1In,
                transform: `translateY(${(1 - defLine1In) * 20}px)`,
                transition: "none",
              }}>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  background: colors.black, color: colors.yellow,
                  borderRadius: 30, padding: "5px 14px",
                  fontFamily: fonts.body, fontSize: 11, fontWeight: 800,
                  letterSpacing: 1.5, textTransform: "uppercase",
                  marginBottom: 14,
                }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: colors.green, display: "inline-block" }} />
                  Algorithm definition
                </div>

                {/* Caja de definición — primera línea */}
                <div style={{
                  background: "rgba(0,0,0,0.08)",
                  border: `2.5px solid ${colors.black}`,
                  borderRadius: 18,
                  padding: "18px 22px",
                  boxShadow: `4px 4px 0 ${colors.black}`,
                }}>
                  <div style={{
                    fontFamily: fonts.body,
                    fontSize: "clamp(13px, 1.6vw, 15px)",
                    fontWeight: 600,
                    color: colors.black,
                    lineHeight: 1.65,
                  }}>
                    Our algorithm labels you a{" "}
                    <strong style={{ fontWeight: 900 }}>Doppelganger</strong>{" "}
                    when it detects{" "}
                    <span style={{
                      display: "inline-block",
                      background: colors.black,
                      color: colors.yellow,
                      fontWeight: 900,
                      padding: "1px 8px",
                      borderRadius: 6,
                    }}>
                      +90% facial similarity
                    </span>
                    {" "}across 4,847 biometric landmarks.
                  </div>

                  {/* ── Barra de progreso — aparece con el scroll ── */}
                  <div style={{
                    marginTop: 16,
                    opacity:   defLine2In,
                    transform: `translateY(${(1 - defLine2In) * 14}px)`,
                    transition: "none",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontFamily: fonts.body, fontSize: 10, fontWeight: 700, color: "rgba(0,0,0,0.45)", textTransform: "uppercase", letterSpacing: 1 }}>
                        Similarity threshold
                      </span>
                      <span style={{ fontFamily: fonts.body, fontSize: 10, fontWeight: 800, color: colors.black }}>
                        90% → DOPPELGANGER ✓
                      </span>
                    </div>
                    <div style={{ height: 9, borderRadius: 5, background: "rgba(0,0,0,0.12)", overflow: "visible", position: "relative" }}>
                      <div style={{
                        height: "100%",
                        width: `${barFill}%`,
                        background: `linear-gradient(90deg, ${colors.blue}, ${colors.green})`,
                        borderRadius: 5,
                        position: "relative",
                        transition: "none",
                      }}>
                        {/* Dot marcador */}
                        {barDotOn && (
                          <div style={{
                            position: "absolute", right: -5, top: "50%",
                            transform: "translateY(-50%)",
                            width: 18, height: 18, borderRadius: "50%",
                            background: colors.black,
                            border: `2.5px solid ${colors.yellow}`,
                            boxShadow: `0 0 0 4px ${colors.green}44`,
                            zIndex: 2,
                          }} />
                        )}
                      </div>
                    </div>

                    <div style={{
                      marginTop: 12,
                      fontFamily: fonts.body, fontSize: 13, color: "rgba(0,0,0,0.6)",
                      lineHeight: 1.6, fontWeight: 400,
                    }}>
                      Bone structure · Eye spacing · Jawline symmetry · Skin tone mapping.{" "}
                      <strong style={{ color: colors.black }}>Only 5% of users reach that threshold.</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── CTA ── */}
              <div style={{
                marginTop: 24,
                opacity:   ctaIn,
                transform: `translateY(${(1 - ctaIn) * 18}px)`,
                transition: "none",
              }}>
                <Button variant="black" size="lg">🎯 Discover My Doppelganger</Button>
              </div>
            </div>

            {/* ── COLUMNA DERECHA: visual flotante ── */}
            <div style={{
              flex: "0 0 auto", position: "relative", width: 260, height: 260,
              opacity:   visualIn,
              transform: `scale(${0.82 + visualIn * 0.18 + visualGlow * 0.06})`,
              transition: "none",
              filter: visualGlow > 0.1 ? `drop-shadow(0 0 ${Math.round(visualGlow * 30)}px ${colors.blue}55)` : "none",
            }}>
              <div style={{
                width: 200, height: 200, borderRadius: "50%",
                background: colors.white, border: `5px solid ${colors.black}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 72, boxShadow: `8px 8px 0 ${colors.black}`,
                animation: "pulse 2.5s ease-in-out infinite",
                position: "absolute", top: 30, left: 30,
              }}>📷</div>

              {[
                { top: 0,    left: -10,  pct: "97%", bg: colors.green, anim: "badgeFloat1" },
                { top: 20,   right: -25, pct: "94%", bg: colors.blue,  anim: "badgeFloat2" },
                { bottom: 5, left: 10,   pct: "91%", bg: colors.pink,  anim: "badgeFloat3" },
              ].map((b, i) => (
                <div key={i} style={{
                  position: "absolute", top: b.top, bottom: b.bottom, left: b.left, right: b.right,
                  background: b.bg, color: colors.white,
                  fontFamily: fonts.display, fontSize: 17, fontWeight: 700,
                  padding: "6px 14px", borderRadius: 12, border: `2px solid ${colors.white}`,
                  boxShadow: "3px 3px 0 rgba(0,0,0,0.2)",
                  animation: `${b.anim} ${3 + i * 0.5}s ease-in-out infinite`, zIndex: 3,
                }}>{b.pct}</div>
              ))}

              {[{ top: -20, right: 20, s: 28 }, { bottom: -10, right: -15, s: 22 }].map((d, i) => (
                <svg key={i}
                  style={{ position: "absolute", top: d.top, bottom: d.bottom, right: d.right, animation: `spin ${8 + i * 4}s linear infinite` }}
                  width={d.s} height={d.s} viewBox="0 0 24 24" fill={colors.black}>
                  <path d="M12 0l2.5 8.5L24 12l-9.5 3.5L12 24l-2.5-8.5L0 12l9.5-3.5z" />
                </svg>
              ))}
            </div>

          </div>
        </div>

        {/* Indicador de scroll — desaparece cuando ya han visto todo */}
        {progress < 0.9 && (
          <div style={{
            position: "absolute", bottom: 28, left: "50%", transform: "translateX(-50%)",
            opacity: Math.min(1, (1 - progress / 0.9)),
            display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
            fontFamily: fonts.body, fontSize: 11, fontWeight: 700,
            color: "rgba(0,0,0,0.35)", textTransform: "uppercase", letterSpacing: 1.5,
            pointerEvents: "none",
          }}>
            <span>Scroll to discover</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.35)" strokeWidth="2.5" strokeLinecap="round">
              <path d="M12 5v14M5 12l7 7 7-7" />
            </svg>
          </div>
        )}
      </div>
    </section>
  );
}
