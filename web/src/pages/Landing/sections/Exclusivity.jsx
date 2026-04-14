import { colors, fonts } from "../../../design/tokens";
import { Button }        from "../../../components/Button";

export function Exclusivity() {
  return (
    <section className="halftone" style={{ background: colors.yellow, padding: "90px 24px", position: "relative", overflow: "hidden" }}>
      <div style={{ maxWidth: 1140, margin: "0 auto" }}>
        <div className="excl-grid" style={{ display: "flex", gap: 56, alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
          <div style={{ flex: "1 1 340px", maxWidth: 500 }}>
            <h2 style={{ fontFamily: fonts.display, fontSize: "clamp(42px, 6vw, 68px)", fontWeight: 700, color: colors.black, lineHeight: 0.95, textShadow: `3px 3px 0 ${colors.blue}` }}>
              Only 5%<br />Find Their<br />Doppelganger
            </h2>
            <p style={{ fontFamily: fonts.body, fontSize: 15, color: "rgba(0,0,0,0.7)", marginTop: 18, lineHeight: 1.65, fontWeight: 400, maxWidth: 420 }}>
              Our AI analyzes over 4,000 reference points on your face — bone structure, eye spacing, jawline, and more. Will you be part of the elite 5%?
            </p>
            <div style={{ marginTop: 28 }}>
              <Button variant="black" size="lg">🎯 Discover My Doppelganger</Button>
            </div>
          </div>

          <div style={{ flex: "0 0 auto", position: "relative", width: 260, height: 260 }}>
            <div style={{
              width: 200, height: 200, borderRadius: "50%",
              background: colors.white, border: `5px solid ${colors.black}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 72, boxShadow: `8px 8px 0 ${colors.black}`,
              animation: "pulse 2.5s ease-in-out infinite",
              position: "absolute", top: 30, left: 30,
            }}>📷</div>
            {[
              { top: 0, left: -10, pct: "97%", bg: colors.green, anim: "badgeFloat1" },
              { top: 20, right: -25, pct: "94%", bg: colors.blue, anim: "badgeFloat2" },
              { bottom: 5, left: 10, pct: "91%", bg: colors.pink, anim: "badgeFloat3" },
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
              <svg key={i} style={{ position: "absolute", top: d.top, bottom: d.bottom, right: d.right, animation: `spin ${8 + i * 4}s linear infinite` }}
                width={d.s} height={d.s} viewBox="0 0 24 24" fill={colors.black}>
                <path d="M12 0l2.5 8.5L24 12l-9.5 3.5L12 24l-2.5-8.5L0 12l9.5-3.5z" />
              </svg>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
