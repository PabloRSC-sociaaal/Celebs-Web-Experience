/**
 * generateComparison.js
 *
 * Wrapper for the Cloud Function GenerateComparisonAsync.
 * In DEMO_MODE returns mock data without touching Firebase.
 * In production converts the blob to base64 and calls the real function.
 */

import { DEMO_MODE } from "../../config";
import { MOCK_CELEB_RESULTS, DEMO_API_DELAY } from "../../demo/mockData";
import { getFunctions, httpsCallable } from "firebase/functions";
import { firebaseApp } from "./app";

// ─── Firebase Functions (shared app) ─────────────────────────────────────────
const functions = getFunctions(firebaseApp, "us-central1");

const generateComparisonFn = httpsCallable(functions, "GenerateComparisonAsync", {
  timeout: 120_000, // 2 min
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Converts a blob URL (or data URL) to pure base64 (without the data:... prefix).
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
 * Normalizes an API result to the internal format { name, pct, img, color }.
 */
function normalizeResult(r, index) {
  return {
    name:         r.name,
    pct:          Math.round(r.score),
    img:          r.imageData?.url ?? null,
    color:        RESULT_COLORS[index % RESULT_COLORS.length],
    // Extra fields for future use
    celebrityId:  r.celebrityId,
    comparisonId: r.comparisonId,
    age:          r.imageData?.age   ?? null,
    gender:       r.imageData?.gender    ?? null,
    ethnicity:    r.imageData?.ethnicity ?? null,
    emotion:      r.imageData?.emotion   ?? null,
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * generateComparison(photoUrl)
 *
 * @param {string} photoUrl  blob: URL of the face-cropped photo from face-detect
 * @returns {Promise<object[]>} Array of normalized celebrities, sorted by score desc.
 *
 * In DEMO_MODE: returns MOCK_CELEB_RESULTS after a simulated delay.
 * In production: calls GenerateComparisonAsync on Firebase.
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
  const base64        = await toBase64(photoUrl);
  const comparisonId  = typeof crypto?.randomUUID === "function"
    ? crypto.randomUUID()
    : `scan-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  const response = await generateComparisonFn({
    comparisonId,
    base64Image:    base64,
    embeddings:     [],
    describePicture: true,
    enrich:          true,
  });

  const raw = response.data;

  // The function may return { success: false } or an array
  if (!Array.isArray(raw) || raw.length === 0) {
    throw new Error(
      raw?.success === false
        ? "GenerateComparisonAsync returned success:false"
        : "GenerateComparisonAsync returned no results"
    );
  }

  return raw.map(normalizeResult);
}
