// ─────────────────────────────────────────────────────────────────────────────
// generateShareCard.js — Renders a 1080×1920 vertical share card on a canvas
// for Snapchat / TikTok / Instagram Stories. Returns a PNG Blob.
// ─────────────────────────────────────────────────────────────────────────────

const W = 1080;
const H = 1920;

// Brand palette — kept here so the card stays on-brand without depending on
// CSS variables that don't apply to <canvas>.
const C = {
  yellow:   "#FFE500",
  yellowD:  "#FFC300",
  black:    "#0A0A0A",
  blue:     "#2AABE2",
  darkBlue: "#1B8DBF",
  white:    "#FFFFFF",
  pink:     "#FF3CAC",
};

function loadImg(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y,     x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x,     y + h, r);
  ctx.arcTo(x,     y + h, x,     y,     r);
  ctx.arcTo(x,     y,     x + w, y,     r);
  ctx.closePath();
}

function drawCoverIntoRect(ctx, img, x, y, w, h) {
  const sAr = img.naturalWidth / img.naturalHeight;
  const dAr = w / h;
  let sx, sy, sw, sh;
  if (sAr > dAr) {
    // Source wider — crop sides
    sh = img.naturalHeight;
    sw = sh * dAr;
    sx = (img.naturalWidth - sw) / 2;
    sy = 0;
  } else {
    sw = img.naturalWidth;
    sh = sw / dAr;
    sx = 0;
    sy = 0; // bias to top so faces stay in frame
  }
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

/**
 * Render the share card.
 * @param {{ celeb: {name, pct, img, color}, userPhotoUrl: string }} args
 * @returns {Promise<Blob>}
 */
export async function generateShareCard({ celeb, userPhotoUrl }) {
  const canvas = document.createElement("canvas");
  canvas.width  = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  // ── 1. Background gradient (brand) ──
  const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
  bgGrad.addColorStop(0,    "#0a1028");
  bgGrad.addColorStop(0.5,  "#050812");
  bgGrad.addColorStop(1,    "#0a1028");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // ── Halftone dot pattern ──
  ctx.fillStyle = "rgba(255,255,255,0.03)";
  for (let y = 0; y < H; y += 30) {
    for (let x = 0; x < W; x += 30) {
      ctx.beginPath();
      ctx.arc(x, y, 1.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ── Yellow ambient glow at top ──
  const glow = ctx.createRadialGradient(W / 2, 280, 0, W / 2, 280, 600);
  glow.addColorStop(0,   "rgba(255,229,0,0.18)");
  glow.addColorStop(0.6, "rgba(255,229,0,0.03)");
  glow.addColorStop(1,   "transparent");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, 600);

  // ── 2. Top branding strip ──
  // LIVE pill
  const pillX = W / 2 - 220, pillY = 130, pillW = 440, pillH = 64;
  ctx.fillStyle = "rgba(0,0,0,0.55)";
  roundRect(ctx, pillX, pillY, pillW, pillH, 32);
  ctx.fill();
  ctx.strokeStyle = C.yellow + "88";
  ctx.lineWidth = 2;
  roundRect(ctx, pillX, pillY, pillW, pillH, 32);
  ctx.stroke();

  // Green dot
  ctx.fillStyle = "#22c55e";
  ctx.beginPath();
  ctx.arc(pillX + 30, pillY + pillH / 2, 8, 0, Math.PI * 2);
  ctx.fill();

  // Pill text
  ctx.fillStyle = C.yellow;
  ctx.font = "800 26px 'Oxanium', sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("LIVE  •  CELEBS  •  SUPER LOOKALIKE", pillX + 50, pillY + pillH / 2 + 1);

  // ── 3. Headline ──
  ctx.textAlign = "center";
  ctx.fillStyle = C.white;
  ctx.font = "700 88px 'Fredoka', sans-serif";
  ctx.fillText("I FOUND MY", W / 2, 320);

  // "DOPPELGANGER" — gradient yellow→cyan
  const textGrad = ctx.createLinearGradient(0, 360, 0, 460);
  textGrad.addColorStop(0,   C.yellow);
  textGrad.addColorStop(0.5, "#00E5FF");
  textGrad.addColorStop(1,   C.yellow);
  ctx.fillStyle = textGrad;
  ctx.font = "700 110px 'Fredoka', sans-serif";
  ctx.fillText("DOPPELGANGER", W / 2, 440);

  // Black shadow underline for legibility
  ctx.shadowColor   = "rgba(0,0,0,0.6)";
  ctx.shadowBlur    = 0;
  ctx.shadowOffsetY = 0;

  // ── 4. Photo cards container ──
  const cardX = 80, cardY = 540;
  const cardW = W - 160, cardH = 920;

  // Outer black card with celeb-color border
  ctx.fillStyle = C.black;
  roundRect(ctx, cardX, cardY, cardW, cardH, 36);
  ctx.fill();
  ctx.strokeStyle = celeb.color || C.yellow;
  ctx.lineWidth = 8;
  roundRect(ctx, cardX, cardY, cardW, cardH, 36);
  ctx.stroke();

  // Inner photo grid
  const padding = 32;
  const photoW  = (cardW - padding * 3) / 2;
  const photoH  = 600;
  const photoY  = cardY + padding;
  const userX   = cardX + padding;
  const celebX  = userX + photoW + padding;

  // ── 4a. User photo (clear — it's their own photo) ──
  try {
    const userImg = await loadImg(userPhotoUrl);
    ctx.save();
    roundRect(ctx, userX, photoY, photoW, photoH, 24);
    ctx.clip();
    drawCoverIntoRect(ctx, userImg, userX, photoY, photoW, photoH);
    ctx.restore();
  } catch {
    ctx.save();
    roundRect(ctx, userX, photoY, photoW, photoH, 24);
    ctx.clip();
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(userX, photoY, photoW, photoH);
    ctx.restore();
  }

  // YOU tag bottom-left
  ctx.fillStyle = "rgba(0,0,0,0.78)";
  roundRect(ctx, userX + 16, photoY + photoH - 50, 86, 34, 8);
  ctx.fill();
  ctx.fillStyle = C.white;
  ctx.font = "800 18px 'Oxanium', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("YOU", userX + 16 + 43, photoY + photoH - 26);

  // ── 4b. Celeb photo (blurred + locked — the reward, gated by sign-up) ──
  try {
    const celebImg = await loadImg(celeb.img);
    ctx.save();
    roundRect(ctx, celebX, photoY, photoW, photoH, 24);
    ctx.clip();
    ctx.filter = "blur(36px) saturate(0.6) brightness(0.55)";
    drawCoverIntoRect(ctx, celebImg, celebX - 30, photoY - 30, photoW + 60, photoH + 60);
    ctx.filter = "none";
    // Dark scrim for readability of the lock UI
    const sc = ctx.createLinearGradient(celebX, photoY, celebX, photoY + photoH);
    sc.addColorStop(0, "rgba(0,0,0,0.25)");
    sc.addColorStop(1, "rgba(0,0,0,0.65)");
    ctx.fillStyle = sc;
    ctx.fillRect(celebX, photoY, photoW, photoH);
    ctx.restore();
  } catch {
    ctx.save();
    roundRect(ctx, celebX, photoY, photoW, photoH, 24);
    ctx.clip();
    ctx.fillStyle = "#2a2a3e";
    ctx.fillRect(celebX, photoY, photoW, photoH);
    ctx.restore();
  }

  // Lock icon + "TAP TO REVEAL" inside the celeb cell
  const lockCx = celebX + photoW / 2;
  const lockCy = photoY + photoH / 2 - 30;
  ctx.fillStyle = "rgba(255,229,0,0.22)";
  ctx.beginPath();
  ctx.arc(lockCx, lockCy, 60, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = C.yellow + "dd";
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.arc(lockCx, lockCy, 60, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = C.yellow;
  ctx.lineWidth = 5.5;
  ctx.lineCap   = "round";
  ctx.lineJoin  = "round";
  ctx.beginPath();
  ctx.rect(lockCx - 22, lockCy - 8, 44, 30);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(lockCx, lockCy - 8, 14, Math.PI, 0);
  ctx.stroke();

  ctx.fillStyle = C.yellow;
  ctx.font = "800 22px 'Oxanium', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("TAP TO REVEAL", lockCx, lockCy + 96);
  ctx.fillStyle = "rgba(255,255,255,0.8)";
  ctx.font = "700 16px 'Oxanium', sans-serif";
  ctx.fillText("celebs.app", lockCx, lockCy + 124);

  // CELEB tag bottom-right
  ctx.fillStyle = celeb.color || C.yellow;
  ctx.font = "800 18px 'Oxanium', sans-serif";
  const tagW = 86;
  roundRect(ctx, celebX + photoW - tagW - 16, photoY + photoH - 50, tagW, 34, 8);
  ctx.fill();
  ctx.fillStyle = (celeb.color === C.yellow || !celeb.color) ? C.black : C.white;
  ctx.textAlign = "center";
  ctx.fillText("CELEB", celebX + photoW - tagW - 16 + tagW / 2, photoY + photoH - 26);

  // ── 5. Center match badge — overlapping the gap between photos ──
  const badgeCx = cardX + cardW / 2;
  const badgeCy = photoY + photoH / 2;
  // Outer black ring
  ctx.fillStyle = C.black;
  ctx.beginPath();
  ctx.arc(badgeCx, badgeCy, 96, 0, Math.PI * 2);
  ctx.fill();
  // Color ring
  ctx.strokeStyle = celeb.color || C.yellow;
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(badgeCx, badgeCy, 96, 0, Math.PI * 2);
  ctx.stroke();
  // Yellow gradient fill
  const badgeGrad = ctx.createLinearGradient(badgeCx, badgeCy - 80, badgeCx, badgeCy + 80);
  badgeGrad.addColorStop(0, C.yellow);
  badgeGrad.addColorStop(1, C.yellowD);
  ctx.fillStyle = badgeGrad;
  ctx.beginPath();
  ctx.arc(badgeCx, badgeCy, 84, 0, Math.PI * 2);
  ctx.fill();
  // Pct text
  ctx.fillStyle = C.black;
  ctx.font = "900 64px 'Fredoka', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`${celeb.pct}%`, badgeCx, badgeCy + 4);

  // ── 6. Mystery teaser below photos (celeb identity is the reveal) ──
  const nameY = photoY + photoH + 78;
  ctx.fillStyle = C.white;
  ctx.font = "700 56px 'Fredoka', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillText("?  ?  ?  ?  ?", W / 2, nameY);

  // Doppelganger pill if pct >= 90 — keeps the FOMO without spoiling identity
  if (celeb.pct >= 90) {
    const pillTxt = "🔥 DOPPELGANGER";
    ctx.font = "800 24px 'Oxanium', sans-serif";
    const tw = ctx.measureText(pillTxt).width + 56;
    const px = W / 2 - tw / 2;
    const py = nameY + 30, ph = 50;
    const dpGrad = ctx.createLinearGradient(px, py, px + tw, py + ph);
    dpGrad.addColorStop(0, celeb.color || C.yellow);
    dpGrad.addColorStop(1, C.yellow);
    ctx.fillStyle = dpGrad;
    roundRect(ctx, px, py, tw, ph, 999);
    ctx.fill();
    ctx.fillStyle = C.black;
    ctx.textBaseline = "middle";
    ctx.fillText(pillTxt, W / 2, py + ph / 2 + 1);
    ctx.textBaseline = "alphabetic";
  }

  // ── 7. Hook + CTA at bottom ──
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.font = "700 38px 'Oxanium', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Could YOU be next?", W / 2, 1640);

  // CTA pill
  const ctaW = 740, ctaH = 110;
  const ctaX = W / 2 - ctaW / 2, ctaY = 1690;
  // Black shadow shifted
  ctx.fillStyle = C.black;
  roundRect(ctx, ctaX + 8, ctaY + 8, ctaW, ctaH, 24);
  ctx.fill();
  ctx.fillStyle = C.yellow;
  roundRect(ctx, ctaX, ctaY, ctaW, ctaH, 24);
  ctx.fill();
  ctx.strokeStyle = C.black;
  ctx.lineWidth = 6;
  roundRect(ctx, ctaX, ctaY, ctaW, ctaH, 24);
  ctx.stroke();
  ctx.fillStyle = C.black;
  ctx.font = "900 40px 'Fredoka', sans-serif";
  ctx.textBaseline = "middle";
  ctx.fillText("📸 FIND MINE AT CELEBS.APP", W / 2, ctaY + ctaH / 2 + 2);

  // ── 8. Brand mark — bottom of card ──
  ctx.font = "800 28px 'Oxanium', sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.4)";
  ctx.textBaseline = "alphabetic";
  ctx.fillText("✨ celebs.app  •  free  •  instant", W / 2, 1860);

  // ── Export ──
  return new Promise((resolve) => canvas.toBlob(b => resolve(b), "image/png", 0.95));
}
