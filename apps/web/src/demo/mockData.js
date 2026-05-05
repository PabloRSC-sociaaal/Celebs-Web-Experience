// ─────────────────────────────────────────────────────────────────────────────
// @STUB — Mock celebrity results + mock user (DEMO_MODE only)
// Status:    DUMMY — hardcoded data, no real AI/API behind it
// Missing:   Nothing — this file is intentionally mock. Gets bypassed when DEMO_MODE=false.
// Priority:  P3 — keep for development/testing; irrelevant in production
// Note:      When DEMO_MODE=false, generateComparison.js calls the real Cloud Function.
//            This file only exists as a fallback during development.
//
//  Realistic data simulating the normalized response from GenerateComparisonAsync.
//  Format identical to what generateComparison.js returns in production.
//  Image paths are centralized in assets/manifest.js
// ─────────────────────────────────────────────────────────────────────────────
import { celebImg } from "../assets/manifest";

export const MOCK_CELEB_RESULTS = [
  {
    name:         "Taylor Swift",
    pct:          94,
    img:          celebImg("taylor"),
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
    img:          celebImg("selena"),
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
    img:          celebImg("billie"),
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
    img:          celebImg("lisa"),
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
    img:          celebImg("harry"),
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
    img:          celebImg("timothee"),
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
    img:          celebImg("henry"),
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
    img:          celebImg("michael_jordan"),
    color:        "#FFA500",
    celebrityId:  "demo-008",
    comparisonId: "demo-comparison-001",
    age:          "37",
    gender:       "male",
    ethnicity:    "black",
    emotion:      "happy",
  },
];

// Mock user — same shape as a Firebase User object
export const MOCK_USER = {
  uid:         "demo-user-001",
  email:       "demo@celebs.app",
  displayName: "Demo User",
  photoURL:    null,
  isDemo:      true,   // extra flag so we can spot it in dev tools
};

// Simulated API latency in ms (min, max)
export const DEMO_API_DELAY = { min: 1200, max: 2400 };
