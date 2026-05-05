import { useState } from "react";
import { colors, fonts } from "../../design/tokens";

const variants = {
  yellow:  { bg: colors.yellow,      color: colors.black, border: colors.black,  shadow: colors.black },
  black:   { bg: colors.black,       color: colors.yellow, border: colors.yellow, shadow: colors.yellow },
  outline: { bg: "transparent",      color: colors.white,  border: colors.white,  shadow: "rgba(255,255,255,0.2)" },
  blue:    { bg: colors.blue,        color: colors.white,  border: colors.black,  shadow: colors.black },
};

const sizes = {
  sm: { p: "10px 22px", fs: 13 },
  md: { p: "14px 32px", fs: 15 },
  lg: { p: "18px 44px", fs: 17 },
};

export function Button({ children, variant = "yellow", size = "md", onClick, style = {}, className = "" }) {
  const [hover, setHover] = useState(false);
  const v = variants[variant];
  const s = sizes[size];

  return (
    <button
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onClick}
      className={className}
      style={{
        fontFamily: fonts.body,
        fontWeight: 800,
        fontSize: s.fs,
        padding: s.p,
        background: v.bg,
        color: v.color,
        border: `3px solid ${v.border}`,
        borderRadius: 14,
        boxShadow: hover ? `6px 6px 0 ${v.shadow}` : `4px 4px 0 ${v.shadow}`,
        transform: hover ? "translate(-2px,-2px)" : "none",
        transition: "all 0.2s ease",
        cursor: "pointer",
        textTransform: "uppercase",
        letterSpacing: 1.2,
        ...style,
      }}
    >
      {children}
    </button>
  );
}
