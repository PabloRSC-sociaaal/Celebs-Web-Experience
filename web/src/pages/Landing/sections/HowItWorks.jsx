import { colors, fonts } from "../../../design/tokens";
import { Button }         from "../../../components/Button";
import { ScanningVisual } from "../../../components/ScanningVisual";
import { ResultPreview }  from "../../../components/ResultPreview";

const STEPS = [
  { step: "01", icon: "📸", title: "Upload your selfie",       desc: "Drag your photo or take one with your webcam. No sign-up needed.",                                        color: colors.yellow },
  { step: "02", icon: "🧠", title: "AI scans your face",       desc: "We analyze over 4,000 facial points and compare against our celebrity database.",                        color: colors.blue   },
  { step: "03", icon: "🌟", title: "Meet your Doppelganger",   desc: "See a split-face comparison with your celebrity match and similarity score.",                            color: colors.pink   },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="halftone-light" style={{ background: colors.black, padding: "90px 24px", position: "relative" }}>
      <div style={{ maxWidth: 1140, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{
            display: "inline-block", background: `${colors.blue}22`, borderRadius: 30, padding: "6px 18px",
            fontFamily: fonts.body, fontSize: 12, fontWeight: 800,
            color: colors.blue, letterSpacing: 1, border: `1px solid ${colors.blue}44`, textTransform: "uppercase",
          }}>Super Simple</div>
          <h2 style={{ fontFamily: fonts.display, fontSize: "clamp(38px, 5vw, 58px)", fontWeight: 700, color: colors.yellow, marginTop: 14, textShadow: `3px 3px 0 ${colors.blue}` }}>
            How Does It Work?
          </h2>
          <p style={{ fontFamily: fonts.body, color: "rgba(255,255,255,0.55)", marginTop: 8, fontSize: 15, fontWeight: 400 }}>
            3 steps. 10 seconds. Zero hassle.
          </p>
        </div>

        <div className="steps-row" style={{ display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap" }}>
          {STEPS.map((s, i) => (
            <div key={i} className="step-card" style={{
              flex: "1 1 280px", maxWidth: 320,
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 22, padding: "36px 28px", textAlign: "center",
              transition: "all 0.35s ease", cursor: "default",
              boxShadow: `4px 4px 0 ${s.color}33`, position: "relative", overflow: "hidden",
            }}>
              <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: `${s.color}08`, filter: "blur(15px)" }} />
              <div style={{ fontFamily: fonts.body, fontSize: 12, fontWeight: 800, color: s.color, letterSpacing: 4, marginBottom: 14, textTransform: "uppercase" }}>
                Step {s.step}
              </div>
              <div style={{ fontSize: 48, marginBottom: 14 }}>{s.icon}</div>
              <h3 style={{ fontFamily: fonts.display, fontSize: 22, fontWeight: 700, color: colors.white, letterSpacing: 0.5, marginBottom: 10 }}>
                {s.title}
              </h3>
              <p style={{ fontFamily: fonts.body, fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.65, fontWeight: 400 }}>
                {s.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="how-demo" style={{ display: "flex", gap: 40, justifyContent: "center", alignItems: "center", marginTop: 60, flexWrap: "wrap" }}>
          <ScanningVisual />
          <div style={{ fontSize: 36, color: colors.yellow, fontFamily: fonts.display }}>→</div>
          <ResultPreview />
        </div>

        <div style={{ textAlign: "center", marginTop: 48 }}>
          <Button size="lg">Try It Now — Free</Button>
        </div>
      </div>
    </section>
  );
}
