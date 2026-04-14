import { useState } from "react";
import { colors } from "../../design/tokens";
import { LogoMini } from "../Logo";

export function PolaroidCard({ name, pct, color = colors.blue, rotation = 0, delay = 0, userImg = null, celebImg = null }) {
  const [hover, setHover] = useState(false);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: colors.white, borderRadius: 12, padding: "10px 10px 16px",
        boxShadow: hover ? "0 16px 40px rgba(0,0,0,0.4)" : "0 8px 24px rgba(0,0,0,0.25)",
        transform: `rotate(${hover ? 0 : rotation}deg) scale(${hover ? 1.08 : 1})`,
        transition: "all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
        width: 160, cursor: "default",
        animation: `floatCard 4s ease-in-out infinite`,
        animationDelay: `${delay}s`,
      }}
    >
      <div style={{ width: "100%", height: 130, borderRadius: 8, display: "flex", overflow: "hidden", position: "relative" }}>
        <div style={{ flex: 1, overflow: "hidden" }}>
          {userImg
            ? <img src={userImg} alt="user" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center" }} />
            : <div style={{ width: "100%", height: "100%", background: `${color}33`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>👤</div>
          }
        </div>
        <div style={{ width: 2.5, background: colors.white, flexShrink: 0, zIndex: 2, boxShadow: "0 0 6px rgba(0,0,0,0.15)" }} />
        <div style={{ flex: 1, overflow: "hidden" }}>
          {celebImg
            ? <img src={celebImg} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center" }} />
            : <div style={{ width: "100%", height: "100%", background: `linear-gradient(160deg, ${color}44, ${color}99)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>⭐</div>
          }
        </div>
        <div style={{
          position: "absolute", top: -5, right: -5,
          width: 38, height: 38, borderRadius: "50%",
          background: color, color: color === colors.yellow ? colors.black : colors.white,
          fontFamily: "'Fredoka'", fontSize: 12, fontWeight: 700,
          display: "flex", alignItems: "center", justifyContent: "center",
          border: `2.5px solid ${colors.white}`, zIndex: 3,
          boxShadow: "0 2px 10px rgba(0,0,0,0.25)",
        }}>{pct}%</div>
        <div style={{ position: "absolute", bottom: 5, left: 5, background: "rgba(0,0,0,0.55)", borderRadius: 4, padding: "2px 5px", fontFamily: "'Oxanium'", fontSize: 8, fontWeight: 700, color: "#fff", letterSpacing: 0.5 }}>YOU</div>
        <div style={{ position: "absolute", bottom: 5, right: 5, background: "rgba(0,0,0,0.55)", borderRadius: 4, padding: "2px 5px", fontFamily: "'Oxanium'", fontSize: 8, fontWeight: 700, color: "#fff", letterSpacing: 0.5 }}>CELEB</div>
      </div>
      <div style={{
        textAlign: "center", marginTop: 8,
        fontFamily: "'Oxanium'", fontWeight: 700, fontSize: 10, color: colors.black,
        lineHeight: 1.3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
      }}>{name}</div>
      <div style={{ textAlign: "center", marginTop: 3 }}>
        <LogoMini />
      </div>
    </div>
  );
}
