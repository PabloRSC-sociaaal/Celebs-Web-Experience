import { colors, fonts } from "../../design/tokens";
import { Logo } from "../Logo";

export function ScanningVisual() {
  return (
    <div style={{
      width: 280, height: 360, borderRadius: 24, background: colors.yellow,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14,
      position: "relative", overflow: "hidden",
      boxShadow: `6px 6px 0 ${colors.black}`, border: `3px solid ${colors.black}`,
    }}>
      <div style={{ transform: "scale(0.65)", marginBottom: -8, marginTop: -8 }}>
        <Logo size={32} />
      </div>
      <div style={{ fontFamily: fonts.body, fontWeight: 700, fontSize: 15, color: colors.black }}>
        You look amazing...
      </div>
      <div style={{ position: "relative", width: 120, height: 120 }}>
        {[100, 80, 60].map((s, i) => (
          <div key={i} style={{
            position: "absolute", top: "50%", left: "50%",
            width: s + 20, height: s + 20, borderRadius: "50%",
            background: `rgba(200, 200, 0, ${0.15 + i * 0.1})`,
            transform: "translate(-50%, -50%)",
            animation: `pulseRing 2s ease-in-out infinite`,
            animationDelay: `${i * 0.3}s`,
          }} />
        ))}
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: 60, height: 60, borderRadius: "50%",
          background: "linear-gradient(135deg, #ddd, #bbb)",
          border: `3px solid ${colors.white}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 24, zIndex: 2,
        }}>🤳</div>
      </div>
      <div style={{ fontFamily: fonts.body, fontSize: 12, color: colors.black, textAlign: "center", lineHeight: 1.5, fontWeight: 600 }}>
        Wait a second...<br />We're finding your Doppelganger
      </div>
      <div style={{ width: "60%", height: 4, borderRadius: 2, background: "rgba(0,0,0,0.15)", overflow: "hidden" }}>
        <div style={{ width: "100%", height: "100%", background: colors.black, borderRadius: 2, animation: "loadBar 2.5s ease-in-out infinite" }} />
      </div>
    </div>
  );
}
