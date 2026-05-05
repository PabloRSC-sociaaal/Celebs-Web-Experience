// ─── Feature Flags Registry ───────────────────────────────────────────────────
//
// Central registry of all toggleable features. Each flag has:
//   enabled  — default state (can be overridden by VITE_FF_<FLAG_ID> env var)
//   label    — human-readable description for debug/admin panels
//
// Override via .env:   VITE_FF_CAMINO=false   → disables Camino at build time
// Future: Firebase Remote Config can override at runtime.
// ──────────────────────────────────────────────────────────────────────────────

export const FLAG_DEFINITIONS = {
  // Core behavior
  DEMO_MODE:           { enabled: true,  label: "Mock auth + API (bypass Firebase)" },

  // Landing sections
  SIMILARITY_EXPLORER: { enabled: true,  label: "Interactive % slider on landing" },
  NAVBAR_AUTH:         { enabled: true,  label: "Auth buttons in navbar" },

  // Results & viewer
  PAYWALL:             { enabled: true,  label: "Two-tier paywall on results" },
  MORPH_SLIDER:        { enabled: true,  label: "Face morphing in results viewer" },

  // Dashboard features
  MORPH_BOOMERANG:     { enabled: true,  label: "Auto-morph animation on dashboard cards" },
  CAMINO:              { enabled: false, label: "Camino a la Fama game mode" },
  DICE:                { enabled: false, label: "Dice roll game mode" },
  ALBUM:               { enabled: false, label: "Album feature (coming soon)" },

  // Monetization
  PREMIUM_CHECKOUT:    { enabled: true,  label: "Lemon Squeezy checkout flow" },

  // Viral loop
  VIRAL_SHARE:         { enabled: true,  label: "Share generation link flow" },
};

/**
 * Resolve a flag's value: env override takes priority, then the default.
 * Env var format: VITE_FF_<FLAG_ID> = "true" | "false"
 */
export function resolveFlag(flagId) {
  const def = FLAG_DEFINITIONS[flagId];
  if (!def) {
    console.warn(`[featureFlags] Unknown flag: "${flagId}"`);
    return false;
  }
  const envKey = `VITE_FF_${flagId}`;
  const envVal = import.meta.env[envKey];
  if (envVal !== undefined) {
    return envVal === "true" || envVal === "1";
  }
  return def.enabled;
}
