/**
 * generateComparison.js
 *
 * Wrapper for POST /api/comparisons/generate.
 * In DEMO_MODE returns mock data without touching the backend.
 * In production posts to the `api` Express function via apiClient.
 *
 * Per architecture.mdc this module MUST NOT import httpsCallable /
 * getFunctions — the only allowed transport is fetch + Bearer token,
 * which is encapsulated in lib/apiClient.js.
 */

import { DEMO_MODE } from "../../config";
import { MOCK_CELEB_RESULTS, DEMO_API_DELAY } from "../../demo/mockData";
import { apiFetch } from "../../lib/apiClient";

// Color palette assigned to results by position
const RESULT_COLORS = [
  "#FFE500", // 1st — yellow
  "#2AABE2", // 2nd — blue
  "#FF3CAC", // 3rd — pink
  "#00E5FF", // 4th — cyan
  "#22c55e", // 5th — green
  "#8B5CF6", // 6th — purple
  "#FF6B6B", // 7th
  "#FFA500", // 8th
];

/**
 * Convert a blob URL (or data URL) to pure base64 (without the `data:...,` prefix).
 */
async function toBase64(blobUrl) {
  const res  = await fetch(blobUrl);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => {
      const full = reader.result;
      resolve(full.includes(",") ? full.split(",")[1] : full);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Normalize a single API match to the internal { name, pct, img, color } shape.
 */
function normalizeResult(r, index) {
  return {
    name:         r.name,
    pct:          Math.round(r.score),
    img:          r.imageData?.url ?? null,
    color:        RESULT_COLORS[index % RESULT_COLORS.length],
    celebrityId:  r.celebrityId,
    comparisonId: r.comparisonId,
    age:          r.imageData?.age       ?? null,
    gender:       r.imageData?.gender    ?? null,
    ethnicity:    r.imageData?.ethnicity ?? null,
    emotion:      r.imageData?.emotion   ?? null,
  };
}

/**
 * generateComparison(photoUrl)
 *
 * @param {string} photoUrl  blob: URL of the face-cropped photo
 * @returns {Promise<object[]>} Array of normalized celebrities, sorted by score desc.
 *
 * In DEMO_MODE: returns MOCK_CELEB_RESULTS after a simulated delay.
 * In production: POST /api/comparisons/generate (Bearer + Firebase ID token).
 */
export async function generateComparison(photoUrl) {
  // ── DEMO MODE ──────────────────────────────────────────────────────────────
  if (DEMO_MODE) {
    const delay = DEMO_API_DELAY.min +
      Math.random() * (DEMO_API_DELAY.max - DEMO_API_DELAY.min);
    await new Promise(r => setTimeout(r, delay));
    console.info("[DEMO] generateComparison → returning mock results");
    return MOCK_CELEB_RESULTS;
  }

  // ── PRODUCTION ─────────────────────────────────────────────────────────────
  const base64Image  = await toBase64(photoUrl);
  const comparisonId = typeof crypto?.randomUUID === "function"
    ? crypto.randomUUID()
    : `scan-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  const response = await apiFetch("/api/comparisons/generate", {
    method: "POST",
    body: {
      comparisonId,
      base64Image,
      embeddings:      [],
      describePicture: true,
      enrich:          true,
    },
  });

  const matches = response?.matches;
  if (!Array.isArray(matches) || matches.length === 0) {
    throw new Error("Comparison returned no matches");
  }

  return matches.map(normalizeResult);
}
