// ─────────────────────────────────────────────────────────────────────────────
//  DEMO MOCK DATA
//
//  Datos realistas que simulan la respuesta normalizada de GenerateComparisonAsync.
//  Formato idéntico al que devuelve generateComparison.js en producción.
//
//  Para cambiar qué celebridades aparecen en demo, edita este array.
// ─────────────────────────────────────────────────────────────────────────────

export const MOCK_CELEB_RESULTS = [
  {
    name:         "Taylor Swift",
    pct:          94,
    img:          "/samples/celeb_taylor.jpg",
    color:        "#FFE500",
    celebrityId:  "demo-001",
    comparisonId: "demo-comparison-001",
    age:          "34",
    gender:       "female",
    ethnicity:    "white",
    emotion:      "happy",
  },
  {
    name:         "Selena Gomez",
    pct:          87,
    img:          "/samples/celeb_selena.jpg",
    color:        "#2AABE2",
    celebrityId:  "demo-002",
    comparisonId: "demo-comparison-001",
    age:          "31",
    gender:       "female",
    ethnicity:    "hispanic",
    emotion:      "calm",
  },
  {
    name:         "Billie Eilish",
    pct:          81,
    img:          "/samples/celeb_billie.jpg",
    color:        "#FF3CAC",
    celebrityId:  "demo-003",
    comparisonId: "demo-comparison-001",
    age:          "22",
    gender:       "female",
    ethnicity:    "white",
    emotion:      "neutral",
  },
  {
    name:         "Lisa – BLACKPINK",
    pct:          76,
    img:          "/samples/celeb_lisa.jpg",
    color:        "#00E5FF",
    celebrityId:  "demo-004",
    comparisonId: "demo-comparison-001",
    age:          "27",
    gender:       "female",
    ethnicity:    "asian",
    emotion:      "happy",
  },
  {
    name:         "Harry Styles",
    pct:          71,
    img:          "/samples/celeb_harry.jpg",
    color:        "#22c55e",
    celebrityId:  "demo-005",
    comparisonId: "demo-comparison-001",
    age:          "30",
    gender:       "male",
    ethnicity:    "white",
    emotion:      "calm",
  },
  {
    name:         "Timothée Chalamet",
    pct:          68,
    img:          "/samples/celeb_timothee.jpg",
    color:        "#8B5CF6",
    celebrityId:  "demo-006",
    comparisonId: "demo-comparison-001",
    age:          "29",
    gender:       "male",
    ethnicity:    "white",
    emotion:      "neutral",
  },
  {
    name:         "Henry Cavill",
    pct:          63,
    img:          "/samples/celeb_henry.jpg",
    color:        "#FF6B6B",
    celebrityId:  "demo-007",
    comparisonId: "demo-comparison-001",
    age:          "41",
    gender:       "male",
    ethnicity:    "white",
    emotion:      "neutral",
  },
  {
    name:         "Michael B. Jordan",
    pct:          58,
    img:          "/samples/celeb_michael_jordan.jpg",
    color:        "#FFA500",
    celebrityId:  "demo-008",
    comparisonId: "demo-comparison-001",
    age:          "37",
    gender:       "male",
    ethnicity:    "black",
    emotion:      "happy",
  },
];

// Mock user — misma forma que un Firebase User object
export const MOCK_USER = {
  uid:         "demo-user-001",
  email:       "demo@celebs.app",
  displayName: "Demo User",
  photoURL:    null,
  isDemo:      true,   // flag extra para identificarlo en dev tools
};

// Simulated API latency in ms (min, max)
export const DEMO_API_DELAY = { min: 1200, max: 2400 };
