/**
 * faceDetect.js — v5
 *
 * Uses @vladmandic/face-api (TinyFaceDetector) for cross-browser face detection.
 * Works on Safari, Firefox, Chrome — any modern browser.
 *
 * Two public functions:
 *
 *   detectAndCropFace(blobUrl)   — for user-uploaded photos (with UX delay)
 *   cropFaceFromUrl(pathUrl)     — for reference/celebrity images (instant)
 *
 * Both produce a square OUTPUT_SIZE × OUTPUT_SIZE JPEG where:
 *   • face height  ≈ FACE_H_RATIO × OUTPUT_SIZE  (normalises zoom)
 *   • face centre  ≈ FACE_V_POS   × OUTPUT_SIZE from top (consistent framing)
 *   • letterbox    = #0a0a0a background
 *
 * Both return `faceGeometry` — normalised (0–1) face metrics relative to
 * the OUTPUT image (not the source) for downstream UI positioning.
 */

let faceapi = null;

const MIN_MS       = 1800;
const OUTPUT_SIZE  = 640;
const FACE_H_RATIO = 0.46;
const FACE_V_POS   = 0.45;

// ─── Model loading ──────────────────────────────────────────────────────────────

let modelsReady = false;
let modelLoadPromise = null;

async function ensureModelsLoaded() {
  if (modelsReady) return;
  if (modelLoadPromise) return modelLoadPromise;

  modelLoadPromise = (async () => {
    try {
      const mod = await import("@vladmandic/face-api");
      faceapi = mod.default ?? mod;
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
        faceapi.nets.faceLandmark68TinyNet.loadFromUri("/models"),
      ]);
      modelsReady = true;
      console.log("[faceDetect] TinyFaceDetector + Landmarks68Tiny loaded");
    } catch (err) {
      console.warn("[faceDetect] Failed to load models:", err);
      throw err;
    }
  })();

  return modelLoadPromise;
}

/**
 * getFaceApi — exposes the lazily-loaded faceapi instance for morph.js
 */
export async function getFaceApi() {
  await ensureModelsLoaded();
  return faceapi;
}

// ─── Core helpers ────────────────────────────────────────────────────────────────

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img  = new Image();
    img.crossOrigin = "anonymous";
    img.onload  = () => resolve(img);
    img.onerror = () => reject(new Error(`loadImage failed: ${url.slice(0, 60)}`));
    img.src = url;
  });
}

async function fetchAsBlobUrl(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`fetch ${url} → ${res.status}`);
  return URL.createObjectURL(await res.blob());
}

function buildOutputGeometry(faceW, faceH) {
  const faceAspect = faceW / faceH;
  const outW = FACE_H_RATIO * faceAspect;
  return {
    center: { x: 0.5, y: FACE_V_POS },
    box: {
      x: 0.5 - outW / 2,
      y: FACE_V_POS - FACE_H_RATIO / 2,
      w: outW,
      h: FACE_H_RATIO,
    },
    ratio: FACE_H_RATIO,
  };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

async function renderFaceAligned(img, faceCX, faceCY, faceH) {
  let scale = (OUTPUT_SIZE * FACE_H_RATIO) / faceH;

  // Guarantee the scaled image covers the entire canvas (no black borders).
  // If the face-based scale produces an image smaller than 640x640,
  // bump the scale so the image fills the canvas fully.
  const minScaleCover = Math.max(
    OUTPUT_SIZE / img.naturalWidth,
    OUTPUT_SIZE / img.naturalHeight,
  );
  if (scale < minScaleCover) scale = minScaleCover;

  const scaledW = Math.round(img.naturalWidth  * scale);
  const scaledH = Math.round(img.naturalHeight * scale);

  // Position the image so the face centre lands at the target point,
  // then clamp so the image edges never leave the canvas.
  const destX = clamp(
    Math.round(OUTPUT_SIZE / 2          - faceCX * scale),
    OUTPUT_SIZE - scaledW,
    0,
  );
  const destY = clamp(
    Math.round(OUTPUT_SIZE * FACE_V_POS - faceCY * scale),
    OUTPUT_SIZE - scaledH,
    0,
  );

  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = OUTPUT_SIZE;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, destX, destY, scaledW, scaledH);

  return new Promise(resolve =>
    canvas.toBlob(b => resolve(URL.createObjectURL(b)), "image/jpeg", 0.92)
  );
}

// ─── face-api.js detection (works on ALL browsers) ──────────────────────────────

async function detectWithFaceApi(img) {
  await ensureModelsLoaded();

  const detection = await faceapi.detectSingleFace(
    img,
    new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.4 }),
  );

  if (!detection) return null;

  const b = detection.box;
  return {
    x: b.x,
    y: b.y,
    width: b.width,
    height: b.height,
    centerX: b.x + b.width / 2,
    centerY: b.y + b.height / 2,
  };
}

// ─── Skin-tone heuristic (last-resort fallback) ─────────────────────────────────

function hasSkinTonePixels(img) {
  const W = img.naturalWidth, H = img.naturalHeight;
  const canvas = document.createElement("canvas");
  const sc = Math.min(1, 120 / Math.min(W, H));
  const cw = Math.round(W * sc), ch = Math.round(H * sc);
  canvas.width = cw; canvas.height = ch;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, cw, ch);

  const sH   = Math.round(ch * 0.65);
  const data = ctx.getImageData(0, 0, cw, sH).data;
  let skin = 0;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i+1], b = data[i+2];
    const rn = r/255, gn = g/255, bn = b/255;
    const max = Math.max(rn,gn,bn), min = Math.min(rn,gn,bn);
    const l = (max+min)/2;
    let h = 0, s = 0;
    if (max !== min) {
      const d = max-min;
      s = l > 0.5 ? d/(2-max-min) : d/(max+min);
      if      (max === rn) h = ((gn-bn)/d + (gn<bn?6:0))/6;
      else if (max === gn) h = ((bn-rn)/d + 2)/6;
      else                 h = ((rn-gn)/d + 4)/6;
    }
    const hd = h*360;
    if (hd>=0 && hd<=45 && s>=0.10 && s<=0.85 && l>=0.20 && l<=0.90) skin++;
  }
  return skin / (data.length/4) >= 0.08;
}

// ─── Public API ──────────────────────────────────────────────────────────────────

/**
 * detectAndCropFace
 * For USER-UPLOADED photos. Enforces MIN_MS minimum latency for the UX.
 *
 * @param  {string} imageUrl  blob: or data: URL
 * @returns {Promise<{ found: boolean, croppedUrl?: string, faceGeometry?: object }>}
 */
export async function detectAndCropFace(imageUrl) {
  const [img] = await Promise.all([
    loadImage(imageUrl),
    new Promise(r => setTimeout(r, MIN_MS)),
  ]);

  // 1. Try face-api.js (cross-browser)
  try {
    const face = await detectWithFaceApi(img);
    if (face) {
      const croppedUrl = await renderFaceAligned(img, face.centerX, face.centerY, face.height);
      const faceGeometry = buildOutputGeometry(face.width, face.height);
      return { found: true, croppedUrl, faceGeometry };
    }
  } catch (err) {
    console.warn("[faceDetect] face-api.js detection failed:", err);
  }

  // 2. Try native FaceDetector (Chrome/Edge only, as extra fallback)
  if ("FaceDetector" in window) {
    try {
      const fd    = new window.FaceDetector({ fastMode: false, maxDetectedFaces: 1 });
      const faces = await fd.detect(img);
      if (faces.length) {
        const b = faces[0].boundingBox;
        const faceCX = b.x + b.width / 2;
        const faceCY = b.y + b.height / 2;
        const croppedUrl = await renderFaceAligned(img, faceCX, faceCY, b.height);
        const faceGeometry = buildOutputGeometry(b.width, b.height);
        return { found: true, croppedUrl, faceGeometry };
      }
    } catch (e) {
      console.warn("[faceDetect] native FaceDetector error:", e);
    }
  }

  // 3. Skin-tone heuristic (last resort)
  if (hasSkinTonePixels(img)) {
    const W = img.naturalWidth, H = img.naturalHeight;
    const faceCX = W * 0.50, faceCY = H * 0.33, faceH = H * 0.40;
    const faceW = faceH * 0.78;
    const croppedUrl = await renderFaceAligned(img, faceCX, faceCY, faceH);
    const faceGeometry = buildOutputGeometry(faceW, faceH);
    return { found: true, croppedUrl, faceGeometry, heuristic: true };
  }

  return { found: false };
}

/**
 * cropFaceFromUrl
 * For REFERENCE / CELEBRITY images served from same-origin paths.
 *
 * @param  {string} imageUrl  path or URL of the reference image
 * @returns {Promise<{ croppedUrl: string, faceGeometry: object|null }>}
 */
export async function cropFaceFromUrl(imageUrl) {
  let blobUrl = null;
  try {
    blobUrl = await fetchAsBlobUrl(imageUrl);
    const img = await loadImage(blobUrl);

    // 1. face-api.js
    try {
      const face = await detectWithFaceApi(img);
      if (face) {
        const croppedUrl = await renderFaceAligned(img, face.centerX, face.centerY, face.height);
        const faceGeometry = buildOutputGeometry(face.width, face.height);
        return { croppedUrl, faceGeometry };
      }
    } catch (err) {
      console.warn("[cropFaceFromUrl] face-api.js failed:", err);
    }

    // 2. native FaceDetector
    if ("FaceDetector" in window) {
      try {
        const fd    = new window.FaceDetector({ fastMode: false, maxDetectedFaces: 1 });
        const faces = await fd.detect(img);
        if (faces.length) {
          const b = faces[0].boundingBox;
          const croppedUrl = await renderFaceAligned(img, b.x + b.width/2, b.y + b.height/2, b.height);
          const faceGeometry = buildOutputGeometry(b.width, b.height);
          return { croppedUrl, faceGeometry };
        }
      } catch (_) {}
    }

    // 3. heuristic fallback for celebrity images
    const W = img.naturalWidth, H = img.naturalHeight;
    const faceCX = W * 0.50, faceCY = H * 0.33, faceH = H * 0.40;
    const faceW = faceH * 0.78;
    const croppedUrl = await renderFaceAligned(img, faceCX, faceCY, faceH);
    const faceGeometry = buildOutputGeometry(faceW, faceH);
    return { croppedUrl, faceGeometry };

  } catch (err) {
    console.warn("[cropFaceFromUrl] failed, keeping original:", err);
    return { croppedUrl: imageUrl, faceGeometry: null };
  } finally {
    if (blobUrl) URL.revokeObjectURL(blobUrl);
  }
}

/**
 * detectLandmarks68
 * Detects 68 facial landmark points on an already-loaded HTMLImageElement.
 * Returns an array of {x, y} in pixel coordinates, or null if detection fails.
 *
 * @param  {HTMLImageElement} img
 * @returns {Promise<Array<{x:number, y:number}>|null>}
 */
export async function detectLandmarks68(img) {
  try {
    await ensureModelsLoaded();
    const result = await faceapi
      .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.3 }))
      .withFaceLandmarks(true);
    if (!result) return null;
    return result.landmarks.positions.map(p => ({ x: p.x, y: p.y }));
  } catch (err) {
    console.warn("[detectLandmarks68] failed:", err);
    return null;
  }
}
