// @STUB — Reviews section with hardcoded fake testimonials
// Status:    DUMMY — reviews are fabricated, not from real users
// Missing:   Real user testimonials or integration with review platform (Trustpilot, etc.)
// Priority:  P2 — replace with real social proof before marketing launch
// Effort:    ~2h — design review submission flow or pull from external API
import { colors, fonts } from "../../../design/tokens";
import { Stars }         from "../../../components/Stars";
import { useCtaUpload }  from "../../../hooks/useCtaUpload";

const REVIEWS = [
  { name: "Sarah K.", text: "I can't believe how accurate it is! My whole family couldn't stop laughing.", stars: 5, match: "Shakira 94%" },
  { name: "James R.", text: "Most fun I've had online this year. Everyone at the office tried it.",        stars: 5, match: "Brad Pitt 87%" },
  { name: "Laura M.", text: "Perfect icebreaker at parties. Everyone wants to know their Doppelganger.",  stars: 5, match: "Rihanna 91%" },
  { name: "Diego S.", text: "The AI is impressive. Tried old photos and current ones — always nails it!", stars: 4, match: "Messi 89%" },
];

export function Reviews() {
  const { triggerUpload, inputProps } = useCtaUpload();

  return (
    <section style={{ background: `linear-gradient(180deg, #0a0a1a, ${colors.black})`, padding: "90px 24px" }}>
      <input {...inputProps} />
      <div style={{ maxWidth: 1140, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div style={{
            display: "inline-block", background: `${colors.pink}22`, borderRadius: 30, padding: "6px 18px",
            fontFamily: fonts.body, fontSize: 12, fontWeight: 800,
            color: colors.pink, letterSpacing: 1, border: `1px solid ${colors.pink}44`, textTransform: "uppercase",
          }}>Real Reviews</div>
          <h2 style={{ fontFamily: fonts.display, fontSize: "clamp(36px, 5vw, 54px)", fontWeight: 700, color: colors.white, marginTop: 14 }}>
            What People Are <span className="glow-text">Saying</span>
          </h2>
        </div>
        <div className="reviews-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
          {REVIEWS.map((r, i) => (
            <div key={i} className="review-card" style={{
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 18, padding: 24, transition: "all 0.3s ease", cursor: "default",
            }}>
              <Stars n={r.stars} size={14} />
              <p style={{ fontFamily: fonts.body, fontSize: 13, color: "rgba(255,255,255,0.75)", marginTop: 14, lineHeight: 1.65, fontStyle: "italic", fontWeight: 400 }}>
                "{r.text}"
              </p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
                <span style={{ fontFamily: fonts.body, fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.4)" }}>— {r.name}</span>
                <span style={{ background: "rgba(255,255,255,0.08)", padding: "3px 10px", borderRadius: 14, fontFamily: fonts.body, fontSize: 11, fontWeight: 700, color: colors.yellow }}>{r.match}</span>
              </div>
            </div>
          ))}

          {/* ── CTA Review Card ── */}
          <div
            onClick={triggerUpload}
            className="review-card"
            style={{
              background: `linear-gradient(135deg, ${colors.yellow}12, ${colors.blue}12)`,
              border: `2px solid ${colors.yellow}44`,
              borderRadius: 18, padding: 24,
              transition: "all 0.3s ease", cursor: "pointer",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              textAlign: "center", gap: 12,
              minHeight: 200,
            }}
          >
            <div style={{ fontSize: 40 }}>🎯</div>
            <div style={{
              fontFamily: fonts.display, fontSize: "clamp(18px, 2.5vw, 22px)",
              fontWeight: 700, color: colors.yellow, lineHeight: 1.2,
            }}>
              The next one to freak out<br />is going to be you
            </div>
            <p style={{
              fontFamily: fonts.body, fontSize: 12, fontWeight: 500,
              color: "rgba(255,255,255,0.5)", lineHeight: 1.5,
            }}>
              Upload your photo and discover your celebrity match in seconds.
            </p>
            <div style={{
              marginTop: 4, padding: "12px 28px",
              background: colors.yellow, color: colors.black,
              borderRadius: 12, fontFamily: fonts.body, fontSize: 14,
              fontWeight: 800, textTransform: "uppercase", letterSpacing: 1,
              border: `3px solid ${colors.black}`,
              boxShadow: `4px 4px 0 ${colors.black}`,
              transition: "all 0.2s",
            }}>
              📸 Find My Doppelganger
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
