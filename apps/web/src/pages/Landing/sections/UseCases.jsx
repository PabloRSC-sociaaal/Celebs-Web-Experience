import { colors, fonts } from "../../../design/tokens";

const CASES = [
  { emoji: "😂", t: "Hilarious Results",  d: "Get unexpected matches that will make you cry laughing",       bg: colors.yellow, c: colors.black },
  { emoji: "👨‍👩‍👧‍👦", t: "Family & Friends",  d: "Try it in groups and compare your celebrity Doppelgangers",   bg: colors.pink,   c: colors.white },
  { emoji: "💑", t: "Couples",            d: "Find out which celebrity couple you'd be together",             bg: colors.purple, c: colors.white },
  { emoji: "📱", t: "Share Everywhere",   d: "Perfect results for Instagram, TikTok, and Snapchat",           bg: colors.cyan,   c: colors.black },
];

export function UseCases() {
  return (
    <section style={{ background: colors.blue, padding: "90px 24px", position: "relative", overflow: "hidden" }}>
      <div className="halftone-light" style={{ position: "absolute", inset: 0 }} />
      <div style={{ maxWidth: 1140, margin: "0 auto", position: "relative", zIndex: 2 }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{ fontFamily: fonts.display, fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 700, color: colors.yellow, textShadow: `3px 3px 0 rgba(0,0,0,0.25)` }}>
            A Thousand Ways to Have Fun
          </h2>
        </div>
        <div className="use-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
          {CASES.map((u, i) => (
            <div key={i} className="use-card" style={{
              background: u.bg, borderRadius: 22, padding: 28,
              border: `3px solid ${colors.black}`, boxShadow: `5px 5px 0 ${colors.black}`,
              transition: "all 0.3s ease", cursor: "default",
            }}>
              <div style={{ fontSize: 44, marginBottom: 14 }}>{u.emoji}</div>
              <h3 style={{ fontFamily: fonts.display, fontSize: 22, fontWeight: 700, color: u.c, letterSpacing: 0.5, marginBottom: 8 }}>{u.t}</h3>
              <p style={{ fontFamily: fonts.body, fontSize: 13, color: u.c, opacity: 0.8, lineHeight: 1.55, fontWeight: 400 }}>{u.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
