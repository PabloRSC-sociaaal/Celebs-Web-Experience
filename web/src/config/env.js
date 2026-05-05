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

// Firebase client config — read from env. The (publishable) defaults below
// are kept for the demo deploy so the dev box still works without env files;
// production must set every key via VITE_FIREBASE_*. There is NO secret here
// (Firebase web keys are not secrets) but moving them to env is what the
// architecture document mandates.
export const FIREBASE_API_KEY              = import.meta.env.VITE_FIREBASE_API_KEY              || "AIzaSyDaZ7_44sjR9bIfIUB-A8W_k836wk1jGdk";
export const FIREBASE_AUTH_DOMAIN          = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN          || "celebs-dev.firebaseapp.com";
export const FIREBASE_PROJECT_ID           = import.meta.env.VITE_FIREBASE_PROJECT_ID           || "celebs-dev";
export const FIREBASE_STORAGE_BUCKET       = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET       || "celebs-dev.firebasestorage.app";
export const FIREBASE_MESSAGING_SENDER_ID  = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID  || "836280488487";
export const FIREBASE_APP_ID               = import.meta.env.VITE_FIREBASE_APP_ID               || "1:836280488487:web:2d952414e95fb5c46f3402";

// Backend HTTP base URL — points at the `api` Express function, e.g.
//   https://us-central1-celebs-dev.cloudfunctions.net/api
// The web app talks to /api/* exclusively through this base. Local dev with
// the Firebase emulator: http://localhost:5001/celebs-dev/us-central1/api
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

// App meta
export const APP_URL = import.meta.env.VITE_APP_URL || window.location.origin;
