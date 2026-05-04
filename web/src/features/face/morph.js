/**
 * morph.js — Face morphing engine
 *
 * Given two face-aligned images and their 68 landmark points,
 * produces a morphed frame at any interpolation value t ∈ [0, 1].
 *
 * Algorithm:
 *   1. Add 8 boundary points (corners + edge midpoints) to the 68 landmarks
 *   2. Compute Delaunay triangulation on the source points (done once)
 *   3. For each frame: interpolate all points, then for each triangle
 *      affine-warp both source images into the interpolated triangle
 *      and alpha-blend them.
 */

import Delaunator from "delaunator";

// ─── Boundary points added around the 68 face landmarks ─────────────────────────

function addBoundaryPoints(landmarks, w, h) {
  return [
    ...landmarks,
    { x: 0, y: 0 },
    { x: w / 2, y: 0 },
    { x: w - 1, y: 0 },
    { x: w - 1, y: h / 2 },
    { x: w - 1, y: h - 1 },
    { x: w / 2, y: h - 1 },
    { x: 0, y: h - 1 },
    { x: 0, y: h / 2 },
  ];
}

// ─── Delaunay triangulation ──────────────────────────────────────────────────────

function triangulate(points) {
  const coords = new Float64Array(points.length * 2);
  for (let i = 0; i < points.length; i++) {
    coords[i * 2]     = points[i].x;
    coords[i * 2 + 1] = points[i].y;
  }
  const d = new Delaunator(coords);
  const triangles = [];
  for (let i = 0; i < d.triangles.length; i += 3) {
    triangles.push([d.triangles[i], d.triangles[i + 1], d.triangles[i + 2]]);
  }
  return triangles;
}

// ─── Affine warp helpers ─────────────────────────────────────────────────────────

/**
 * Compute the 2x3 affine matrix that maps triangle src → dst.
 * Returns [a, b, c, d, e, f] for ctx.setTransform(a, b, c, d, e, f).
 */
function affineTransform(src, dst) {
  const x0 = src[0].x, y0 = src[0].y;
  const x1 = src[1].x, y1 = src[1].y;
  const x2 = src[2].x, y2 = src[2].y;

  const u0 = dst[0].x, v0 = dst[0].y;
  const u1 = dst[1].x, v1 = dst[1].y;
  const u2 = dst[2].x, v2 = dst[2].y;

  const det = (x1 - x0) * (y2 - y0) - (x2 - x0) * (y1 - y0);
  if (Math.abs(det) < 1e-10) return null;

  const invDet = 1 / det;
  const a11 = (y2 - y0) * invDet, a12 = -(x2 - x0) * invDet;
  const a21 = -(y1 - y0) * invDet, a22 = (x1 - x0) * invDet;

  const a = (u1 - u0) * a11 + (u2 - u0) * a21;
  const c = (u1 - u0) * a12 + (u2 - u0) * a22;
  const e = u0 - a * x0 - c * y0;

  const b = (v1 - v0) * a11 + (v2 - v0) * a21;
  const d = (v1 - v0) * a12 + (v2 - v0) * a22;
  const f = v0 - b * x0 - d * y0;

  return [a, b, c, d, e, f];
}

/**
 * Draw one warped triangle from srcImg onto ctx.
 * tri = 3 points in source image space
 * dstTri = 3 points in output canvas space
 */
function warpTriangle(ctx, srcImg, tri, dstTri) {
  const M = affineTransform(tri, dstTri);
  if (!M) return;

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(dstTri[0].x, dstTri[0].y);
  ctx.lineTo(dstTri[1].x, dstTri[1].y);
  ctx.lineTo(dstTri[2].x, dstTri[2].y);
  ctx.closePath();
  ctx.clip();

  ctx.setTransform(M[0], M[1], M[2], M[3], M[4], M[5]);
  ctx.drawImage(srcImg, 0, 0);

  ctx.restore();
}

// ─── Public API ──────────────────────────────────────────────────────────────────

/**
 * Prepare morph data from two sets of landmarks.
 * Call once when both images + landmarks are ready.
 *
 * @param {{x:number,y:number}[]} lmA  68 landmarks of image A
 * @param {{x:number,y:number}[]} lmB  68 landmarks of image B
 * @param {number} w  image width (both images should be the same size)
 * @param {number} h  image height
 * @returns {{ ptsA, ptsB, triangles }}
 */
export function prepareMorph(lmA, lmB, w, h) {
  const ptsA = addBoundaryPoints(lmA, w, h);
  const ptsB = addBoundaryPoints(lmB, w, h);
  const triangles = triangulate(ptsA);
  return { ptsA, ptsB, triangles };
}

/**
 * Render a single morph frame.
 *
 * @param {CanvasRenderingContext2D} ctx  target canvas context
 * @param {HTMLImageElement} imgA  source image A (user)
 * @param {HTMLImageElement} imgB  source image B (celeb)
 * @param {{ ptsA, ptsB, triangles }} morphData  from prepareMorph()
 * @param {number} t  interpolation 0 = 100% A, 1 = 100% B
 */
// Draw an image scaled to cover the canvas (object-fit: cover) at alpha.
function drawCover(ctx, img, alpha, w, h) {
  if (alpha <= 0) return;
  ctx.globalAlpha = alpha;
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  if (!iw || !ih) return;
  const sAr = iw / ih;
  const cAr = w / h;
  let dw, dh, dx, dy;
  if (sAr > cAr) {
    dh = h; dw = h * sAr; dx = (w - dw) / 2; dy = 0;
  } else {
    dw = w; dh = w / sAr; dx = 0; dy = (h - dh) / 2;
  }
  ctx.drawImage(img, dx, dy, dw, dh);
}

export function renderMorphFrame(ctx, imgA, imgB, morphData, t) {
  const { ptsA, ptsB, triangles } = morphData;
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;

  const ptsMid = ptsA.map((pA, i) => ({
    x: (1 - t) * pA.x + t * ptsB[i].x,
    y: (1 - t) * pA.y + t * ptsB[i].y,
  }));

  ctx.clearRect(0, 0, w, h);

  // Backdrop: cross-fade both source images at cover-fit so the area
  // outside the face triangles never shows the bare black canvas.
  drawCover(ctx, imgA, 1 - t, w, h);
  drawCover(ctx, imgB, t,     w, h);

  // Foreground: warped face triangles paint over the backdrop with the
  // proper morph geometry.
  for (const [i0, i1, i2] of triangles) {
    const dstTri = [ptsMid[i0], ptsMid[i1], ptsMid[i2]];
    const triA   = [ptsA[i0],   ptsA[i1],   ptsA[i2]];
    const triB   = [ptsB[i0],   ptsB[i1],   ptsB[i2]];

    ctx.globalAlpha = 1 - t;
    warpTriangle(ctx, imgA, triA, dstTri);

    ctx.globalAlpha = t;
    warpTriangle(ctx, imgB, triB, dstTri);
  }

  ctx.globalAlpha = 1;
}

/**
 * Simple cross-fade fallback (no warping, just opacity blend).
 */
export function renderCrossFade(ctx, imgA, imgB, t) {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  ctx.clearRect(0, 0, w, h);

  ctx.globalAlpha = 1 - t;
  ctx.drawImage(imgA, 0, 0, w, h);

  ctx.globalAlpha = t;
  ctx.drawImage(imgB, 0, 0, w, h);

  ctx.globalAlpha = 1;
}
