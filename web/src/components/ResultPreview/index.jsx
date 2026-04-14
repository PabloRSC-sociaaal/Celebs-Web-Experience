import { colors, fonts } from "../../design/tokens";

export function ResultPreview() {
  return (
    <div style={{
      width: 220, borderRadius: 20, background: colors.white, overflow: "hidden",
      boxShadow: `6px 6px 0 ${colors.black}`, border: `3px solid ${colors.black}`,
    }}>
      <div style={{ height: 180, display: "flex", background: "linear-gradient(135deg, #f0d0a0, #e8b88a)" }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #f5deb3, #deb887)", borderRight: "2px solid rgba(255,255,255,0.5)", fontSize: 40 }}>👤</div>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #e8b88a, #d4a574)", fontSize: 40 }}>🌟</div>
      </div>
      <div style={{ padding: "16px 20px", textAlign: "center" }}>
        <div style={{ fontFamily: fonts.body, fontSize: 11, color: "#999", fontWeight: 500 }}>You look like</div>
        <div style={{ fontFamily: fonts.body, fontSize: 18, fontWeight: 800, color: colors.black, marginTop: 4 }}>TAYLOR SWIFT</div>
        <div style={{
          margin: "10px auto 0", width: 50, height: 50, borderRadius: "50%",
          background: `linear-gradient(135deg, ${colors.yellow}, #FFC300)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: fonts.display, fontSize: 18, fontWeight: 700, color: colors.black,
          border: `2px solid ${colors.black}`,
        }}>97%</div>
      </div>
    </div>
  );
}
