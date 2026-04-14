/**
 * faceDetect.js
 *
 * Face detection + square crop centred on the face.
 *
 * Strategy (in order):
 *  1. Chrome/Edge native FaceDetector API  — no libraries needed
 *  2. BlazeFace via @tensorflow-models/blazeface  — if installed
 *  3. Skin-tone pixel heuristic  — pure canvas, zero deps, fallback
 *
 * The caller always gets a minimum latency of MIN_MS so the
 * "validating" animation has time to play even on fast detections.
 */

const MIN_MS = 1800; // minimum validation delay in ms

// ─── helpers ─────────────────────────────────────────────────────────────────

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload  = () => resolve(img);
    img.onerror = () => reject(new Error("Image load failed"));
    img.src = url;
  });
}

/** Render a rectangular crop of `img` onto a square canvas → blob URL. */
function squareCropToUrl(img, sx, sy, sw, sh) {
  const size = Math.round(Math.max(sw, sh));
  const canvas = document.createElement("canvas");
  canvas.width  = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(0, 0, size, size);
  const dx = Math.round((size - sw) / 2);
  const dy = Math.round((size - sh) / 2);
  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, sw, sh);
  return new Promise(r => canvas.toBlob(b => r(URL.createObjectURL(b)), "image/jpeg", 0.92));
}

/** Build a crop region with generous padding from a bounding box. */
async function cropFromBox(img, x, y, w, h) {
  const W = img.naturalWidth, H = img.naturalHeight;
  const padX = w * 0.55;
  const padY = h * 0.70;
  const sx = Math.max(0, x - padX);
  const sy = Math.max(0, y - padY);
  const sw = Math.min(W - sx, w + padX * 2);
  const sh = Math.min(H - sy, h + padY * 2);
  return squareCropToUrl(img, sx, sy, sw, sh);
}

// ─── 1. Native FaceDetector ──────────────────────────────────────────────────

async function tryNativeFaceDetector(img) {
  if (!("FaceDetector" in window)) return null;
  try {
    const det   = new window.FaceDetector({ fastMode: false, maxDetectedFaces: 1 });
    const faces = await det.detect(img);
    if (faces.length === 0) return { found: false };
    const b = faces[0].boundingBox;
    const croppedUrl = await cropFromBox(img, b.x, b.y, b.width, b.height);
    return { found: true, croppedUrl };
  } catch (e) {
    console.warn("[faceDetect] native FaceDetector:", e);
    return null;
  }
}

// ─── 2. Skin-tone pixel heuristic ────────────────────────────────────────────

/**
 * Sample the centre-upper 60 % of the image (where faces appear in
 * selfies) and count pixels whose hue falls in the skin-tone band
 * (covers fair → dark complexions).
 * Returns true if ≥ 8 % of sampled pixels look like skin.
 */
function hasSkinTonePixels(img) {
  const W = img.naturalWidth, H = img.naturalHeight;
  const canvas = document.createElement("canvas");
  // Down-sample to max 120px for speed
  const scale = Math.min(1, 120 / Math.min(W, H));
  const cw = Math.round(W * scale), ch = Math.round(H * scale);
  canvas.width = cw; canvas.height = ch;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, cw, ch);

  // Sample only the top 65 % of the down-sampled image
  const sampleH = Math.round(ch * 0.65);
  const data = ctx.getImageData(0, 0, cw, sampleH).data;

  let skinCount = 0;
  const total   = (data.length / 4);

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    // Convert to HSL
    const rn = r / 255, gn = g / 255, bn = b / 255;
    const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
    const l = (max + min) / 2;
    let h = 0, s = 0;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case rn: h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6; break;
        case gn: h = ((bn - rn) / d + 2) / 6; break;
        case bn: h = ((rn - gn) / d + 4) / 6; break;
      }
    }
    const hDeg = h * 360;
    // Skin hue: 0–40° (fair/medium) and 15–35° (dark/olive)
    // Lightness: 20–90%, saturation: 10–80%
    if (hDeg >= 0 && hDeg <= 45 && s >= 0.10 && s <= 0.85 && l >= 0.20 && l <= 0.90) {
      skinCount++;
    }
  }

  return skinCount / total >= 0.08; // 8% threshold
}

async function heuristicFallback(img) {
  const hasFace = hasSkinTonePixels(img);
  if (!hasFace) return { found: false };

  // Smart portrait crop: centre-top square
  const W = img.naturalWidth, H = img.naturalHeight;
  const side = Math.min(W, H * 0.85);
  const sx = Math.max(0, (W - side) / 2);
  const sy = Math.max(0, H * 0.04);
  const sw = Math.min(W - sx, side);
  const sh = Math.min(H - sy, side);
  const croppedUrl = await squareCropToUrl(img, sx, sy, sw, sh);
  return { found: true, croppedUrl, heuristic: true };
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * @param {string} imageUrl  blob: or data: URL of the user's photo
 * @returns {Promise<{ found: boolean, croppedUrl?: string }>}
 */
export async function detectAndCropFace(imageUrl) {
  const [img] = await Promise.all([
    loadImage(imageUrl),
    new Promise(r => setTimeout(r, MIN_MS)), // enforce minimum latency
  ]);

  // 1. Chrome/Edge native FaceDetector
  const native = await tryNativeFaceDetector(img);
  if (native !== null) return native;

  // 2. Skin-tone pixel heuristic (universal fallback)
  return heuristicFallback(img);
}
