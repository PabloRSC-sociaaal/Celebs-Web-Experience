/**
 * db.js — LocalStorage persistence for CELEBS generations
 *
 * Each generation record:
 * {
 *   id:         string        unique (timestamp)
 *   createdAt:  number        Date.now()
 *   thumb:      string        base64 JPEG 160×160  (for cards)
 *   preview:    string        base64 JPEG 320×320  (for results replay)
 *   celeb:      object        primary match  { name, pct, color, img }
 *   others:     object[]      secondary matches
 *   label:      string|null   e.g. "family"
 *   labelSub:   string|null   e.g. "Dad"
 * }
 */

const KEY = "celebs_db_v1";

// ─── Photo compressor ────────────────────────────────────────────────────────
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

// ─── CRUD ────────────────────────────────────────────────────────────────────

export function getAll() {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); }
  catch { return []; }
}

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
    // Storage full — drop oldest entry and retry once
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

export function hasGenerations() {
  return getAll().length > 0;
}
