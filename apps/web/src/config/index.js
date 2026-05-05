// ─── App Configuration — public API ───────────────────────────────────────────
//
// import { getFlag, DEMO_MODE } from "../../config";
//
// getFlag("CAMINO")   → true/false (respects env overrides)
// DEMO_MODE           → shortcut for getFlag("DEMO_MODE")
// ──────────────────────────────────────────────────────────────────────────────

export { FLAG_DEFINITIONS, resolveFlag } from "./featureFlags";
export * from "./env";

import { resolveFlag, FLAG_DEFINITIONS } from "./featureFlags";

/**
 * Check if a feature flag is enabled.
 * @param {string} flagId — key from FLAG_DEFINITIONS
 * @returns {boolean}
 */
export function getFlag(flagId) {
  return resolveFlag(flagId);
}

/** Backward-compatible export — same as getFlag("DEMO_MODE") */
export const DEMO_MODE = resolveFlag("DEMO_MODE");

/**
 * Returns all flags with their resolved values (useful for debug panels).
 */
export function getAllFlags() {
  return Object.fromEntries(
    Object.keys(FLAG_DEFINITIONS).map(id => [id, resolveFlag(id)])
  );
}
