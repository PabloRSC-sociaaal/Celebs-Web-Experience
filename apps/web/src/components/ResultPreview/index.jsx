import { useEffect, useState } from "react";
import { colors, fonts } from "../../design/tokens";

// Pool of "could-be-you" names — cycles to convey "anyone is possible".
const POOL = [
  { name: "TAYLOR SWIFT",      pct: 97 },
  { name: "TIMOTHÉE CHALAMET", pct: 91 },
  { name: "ZENDAYA",           pct: 88 },
  { name: "HARRY STYLES",      pct: 84 },
  { name: "BILLIE EILISH",     pct: 93 },
  { name: "HENRY CAVILL",      pct: 89 },
  { name: "DUA LIPA",          pct: 86 },
  { name: "RIHANNA",           pct: 95 },
  { name: "BAD BUNNY",         pct: 82 },
  { name: "SELENA GOMEZ",      pct: 90 },
];

export function ResultPreview() {
  const [idx, setIdx] = useState(0);
  const [flip, setFlip] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setFlip(true);
      setTimeout(() => {
        setIdx(i => (i + 1) % POOL.length);
        setFlip(false);
      }, 220);
    }, 1800);
    return () => clearInterval(id);
  }, []);

  const { name, pct } = POOL[idx];

  return (
    <div style={{
      width: 220, borderRadius: 20, background: colors.white, overflow: "hidden",
      boxShadow: `6px 6px 0 ${colors.black}`, border: `3px solid ${colors.black}`,
    }}>
      <div style={{ height: 180, display: "flex", background: "linear-gradient(135deg, #f0d0a0, #e8b88a)" }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #f5deb3, #deb887)", borderRight: "2px solid rgba(255,255,255,0.5)", fontSize: 40 }}>👤</div>
        <div style={{
          flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
          background: "linear-gradient(135deg, #e8b88a, #d4a574)",
          fontSize: 56, fontWeight: 800, fontFamily: fonts.display,
          color: colors.black,
          textShadow: `2px 2px 0 ${colors.yellow}`,
        }}>?</div>
      </div>
      <div style={{ padding: "16px 20px", textAlign: "center" }}>
        <div style={{ fontFamily: fonts.body, fontSize: 11, color: "#999", fontWeight: 500 }}>You could look like</div>
        <div style={{
          fontFamily: fonts.body, fontSize: 16, fontWeight: 800,
          color: colors.black, marginTop: 4,
          minHeight: 22,
          opacity: flip ? 0 : 1,
          transform: flip ? "translateY(8px)" : "translateY(0)",
          transition: "opacity 0.22s ease, transform 0.22s ease",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {name}
        </div>
        <div style={{
          margin: "10px auto 0", width: 50, height: 50, borderRadius: "50%",
          background: `linear-gradient(135deg, ${colors.yellow}, #FFC300)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: fonts.display, fontSize: 18, fontWeight: 700, color: colors.black,
          border: `2px solid ${colors.black}`,
          opacity: flip ? 0.3 : 1,
          transform: flip ? "scale(0.92)" : "scale(1)",
          transition: "opacity 0.22s ease, transform 0.22s ease",
        }}>
          {pct}%
        </div>
      </div>
    </div>
  );
}
