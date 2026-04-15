// @STUB — Stats bar with hardcoded vanity metrics
// Status:    DUMMY — numbers are hardcoded, not fetched from any real source
// Missing:   Real metrics from backend (total users, photos, countries, celebs)
// Priority:  P2 — cosmetic; update when real data exists
// Effort:    ~1h — fetch from API or Firestore aggregate, or use analytics data
import { colors, fonts } from "../../../design/tokens";
import { Counter } from "../../../components/Counter";

const STATS = [
  { v: 12,    s: "M+", l: "Users" },
  { v: 500,   s: "M+", l: "Photos Analyzed" },
  { v: 150,   s: "+",  l: "Countries" },
  { v: 50000, s: "+",  l: "Celebrities" },
];

export function StatsBar() {
  return (
    <div style={{
      background: colors.yellow, padding: "32px 24px",
      borderTop: `4px solid ${colors.black}`, borderBottom: `4px solid ${colors.black}`,
    }}>
      <div className="stats-row" style={{ maxWidth: 960, margin: "0 auto", display: "flex", justifyContent: "space-around", alignItems: "center", gap: 16 }}>
        {STATS.map((st, i) => (
          <div key={i} style={{ textAlign: "center", flex: 1, minWidth: 100 }}>
            <div style={{ fontFamily: fonts.display, fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 700, color: colors.black, lineHeight: 1 }}>
              <Counter end={st.v} suffix={st.s} />
            </div>
            <div style={{ fontFamily: fonts.body, fontSize: 12, fontWeight: 700, color: "rgba(0,0,0,0.55)", marginTop: 4, textTransform: "uppercase", letterSpacing: 1 }}>
              {st.l}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
