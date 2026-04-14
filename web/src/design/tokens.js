// ─────────────────────────────────────────────────────────
//  Design Tokens — única fuente de verdad visual del proyecto
//  Para cambiar toda la paleta: edita solo este archivo.
// ─────────────────────────────────────────────────────────

export const colors = {
  blue:     "#2AABE2",
  yellow:   "#FFE500",
  black:    "#0A0A0A",
  white:    "#FFFFFF",
  pink:     "#FF3CAC",
  purple:   "#8B5CF6",
  cyan:     "#00E5FF",
  green:    "#22c55e",
  darkBlue: "#1B8DBF",
};

export const fonts = {
  display: "'Fredoka', sans-serif",  // logos, headings
  body:    "'Oxanium', sans-serif",  // body, buttons, labels
};

export const fontImport =
  "https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700&family=Oxanium:wght@300;400;500;600;700;800&display=swap";

export const radii = {
  sm:   8,
  md:   12,
  lg:   18,
  xl:   24,
  pill: 30,
  full: 9999,
};

export const shadows = {
  card:   "0 8px 24px rgba(0,0,0,0.25)",
  cardHover: "0 16px 40px rgba(0,0,0,0.4)",
  pop:    (color) => `4px 4px 0 ${color}`,
  popHover: (color) => `6px 6px 0 ${color}`,
};
