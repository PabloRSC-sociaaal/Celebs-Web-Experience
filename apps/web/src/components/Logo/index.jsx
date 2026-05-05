import { colors } from "../../design/tokens";

export function Logo({ size = 42 }) {
  const strokeW = Math.max(5, size * 0.14);
  const svgW = size * 3.8;
  const svgH = size * 1.5;
  return (
    <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`} style={{ display: "block", overflow: "visible" }}>
      <defs>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@700&display=swap');`}</style>
      </defs>
      <text
        x={svgW / 2} y={svgH * 0.72}
        textAnchor="middle"
        fontFamily="'Fredoka', sans-serif"
        fontWeight="700"
        fontSize={size}
        fill={colors.black}
        stroke={colors.yellow}
        strokeWidth={strokeW}
        strokeLinejoin="round"
        paintOrder="stroke"
        letterSpacing="1"
      >celebs</text>
      <circle cx={svgW * 0.61} cy={svgH * 0.26} r={size * 0.065} fill={colors.blue} />
    </svg>
  );
}

export function LogoMini() {
  return (
    <svg width={52} height={18} viewBox="0 0 52 18" style={{ display: "block", margin: "0 auto" }}>
      <text x="26" y="14" textAnchor="middle" fontFamily="'Fredoka', sans-serif" fontWeight="700"
        fontSize="14" fill={colors.black} stroke={colors.yellow} strokeWidth="3"
        strokeLinejoin="round" paintOrder="stroke" letterSpacing="0.5"
      >celebs</text>
    </svg>
  );
}
