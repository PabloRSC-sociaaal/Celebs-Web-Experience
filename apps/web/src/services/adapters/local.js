// ─────────────────────────────────────────────────────────
// @STUB — Local persistence adapter (ACTIVE — demo only)
// Status:    FUNCTIONAL but TEMPORARY — uses localStorage, not a real backend
// Missing:   Replace with Firebase or Supabase adapter for production
// Priority:  P0 — data is lost if user clears browser; no multi-device; no server-side backup
// Effort:    0h here — implement firebase.js or supabase.js instead, then swap in services/index.js
// Limits:    ~5MB storage cap, no auth/user scoping, single browser only
//
//  To switch to Supabase or Firebase:
//    1. Implement adapters/firebase.js (or supabase.js) with the same interface
//    2. Change the export line in services/index.js
// ─────────────────────────────────────────────────────────

const KEY = "celebs_db_v1";

function compressToDataUrl(url, size, quality = 0.75) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = c.height = size;
      const ctx = c.getContext("2d");
      ctx.fillStyle = "#111";
      ctx.fillRect(0, 0, size, size);
      const s = Math.min(img.width, img.height);
      const sx = (img.width - s) / 2;
      const sy = (img.height - s) / 2;
      ctx.drawImage(img, sx, sy, s, s, 0, 0, size, size);
      resolve(c.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

export function getAll() {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); }
  catch { return []; }
}

export function getGenerations() {
  return getAll();
}

export function hasGenerations() {
  return getAll().length > 0;
}

/**
 * @param {{ photoUrl: string, celeb: object, others: object[] }} param
 * @returns {Promise<object>} generation record
 */
export async function saveGeneration({ photoUrl, celeb, others }) {
  const [thumb, preview] = await Promise.all([
    compressToDataUrl(photoUrl, 160, 0.70),
    compressToDataUrl(photoUrl, 320, 0.82),
  ]);

  const gen = {
    id: Date.now().toString(),
    createdAt: Date.now(),
    thumb,
    preview,
    celeb,
    others,
    label: null,
    labelSub: null,
  };

  const all = [gen, ...getAll()];
  try {
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    // Storage full — drop the oldest entry and retry
    const trimmed = [gen, ...getAll().slice(0, -1)];
    try { localStorage.setItem(KEY, JSON.stringify(trimmed)); } catch { /* silent */ }
  }

  return gen;
}

export function updateLabel(id, label, labelSub = null) {
  const all = getAll();
  const gen = all.find(g => g.id === id);
  if (gen) { gen.label = label; gen.labelSub = labelSub; }
  try { localStorage.setItem(KEY, JSON.stringify(all)); } catch { /* silent */ }
}

export function deleteGeneration(id) {
  const filtered = getAll().filter(g => g.id !== id);
  try { localStorage.setItem(KEY, JSON.stringify(filtered)); } catch { /* silent */ }
}

export function clearGenerations() {
  localStorage.removeItem(KEY);
}
