import { colors, fonts } from "../../../design/tokens";
import { Button }        from "../../../components/Button";

export function FinalCTA() {
  return (
    <section style={{ background: colors.black, padding: "90px 24px" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <div style={{
          background: `linear-gradient(135deg, ${colors.yellow}0A, ${colors.blue}0A)`,
          border: `2px solid ${colors.yellow}25`,
          borderRadius: 32, padding: "60px 40px", textAlign: "center",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", top: -80, left: "50%", transform: "translateX(-50%)",
            width: 350, height: 350, borderRadius: "50%",
            background: `radial-gradient(circle, ${colors.yellow}12, transparent 60%)`, filter: "blur(50px)",
          }} />
          <div style={{ position: "relative", zIndex: 2 }}>
            <div style={{ fontSize: 52, marginBottom: 14 }}>🌟</div>
            <h2 style={{ fontFamily: fonts.display, fontSize: "clamp(36px, 5vw, 58px)", fontWeight: 700, color: colors.yellow, lineHeight: 1, textShadow: `3px 3px 0 ${colors.blue}` }}>
              Ready to Meet<br />Your Doppelganger?
            </h2>
            <p style={{ fontFamily: fonts.body, color: "rgba(255,255,255,0.55)", fontSize: 15, marginTop: 18, maxWidth: 440, margin: "18px auto 0", lineHeight: 1.6, fontWeight: 400 }}>
              Join over 12 million people who already found their celebrity doppelganger.
            </p>
            <div style={{ display: "flex", gap: 14, justifyContent: "center", marginTop: 36, flexWrap: "wrap" }}>
              <Button size="lg">🚀 Upload My Photo — It's Free</Button>
            </div>
            <p style={{ fontFamily: fonts.body, color: "rgba(255,255,255,0.3)", fontSize: 12, marginTop: 20, fontWeight: 500 }}>
              No sign-up · Instant results · Secure payment
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
