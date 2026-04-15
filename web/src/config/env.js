// ─── Environment Variables ────────────────────────────────────────────────────
//
// Single source of truth for all import.meta.env.VITE_* reads.
// No other file should read import.meta.env directly (except featureFlags.js).
//
// When adding a new env var:
//   1. Add a line here with a sensible fallback
//   2. Document it in web/.env.example
// ──────────────────────────────────────────────────────────────────────────────

// Lemon Squeezy — payment variant IDs
export const LS_VARIANT_MONTHLY = import.meta.env.VITE_LS_VARIANT_MONTHLY || "";
export const LS_VARIANT_ANNUAL  = import.meta.env.VITE_LS_VARIANT_ANNUAL  || "";

// Firebase overrides (optional — defaults live in features/firebase/app.js)
export const FIREBASE_API_KEY      = import.meta.env.VITE_FIREBASE_API_KEY      || "";
export const FIREBASE_AUTH_DOMAIN  = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN  || "";
export const FIREBASE_PROJECT_ID   = import.meta.env.VITE_FIREBASE_PROJECT_ID   || "";

// App meta
export const APP_URL = import.meta.env.VITE_APP_URL || window.location.origin;
