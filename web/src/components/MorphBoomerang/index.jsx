import { useState, useEffect, useRef } from "react";
import { detectLandmarks68 } from "../../features/face/detect";
import { prepareMorph, renderMorphFrame, renderCrossFade } from "../../features/face/morph";

const CANVAS_SIZE = 320;
const CYCLE_MS    = 2000;
const PAUSE_MS    = 500;

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

function loadImg(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

/**
 * MorphBoomerang — renders an automatic back-and-forth morph animation
 * between two face-aligned images. Used in dashboard cards.
 *
 * Only animates when visible (IntersectionObserver) for performance.
 * Falls back to cross-fade if landmarks fail, or static image if
 * only one image loads.
 */
export function MorphBoomerang({ userPhoto, celebPhoto, style }) {
  const canvasRef  = useRef(null);
  const morphRef   = useRef(null);
  const imgsRef    = useRef({ a: null, b: null });
  const rafRef     = useRef(null);
  const visibleRef = useRef(false);
  const [ready, setReady] = useState(false);

  // ── Load images & detect landmarks ──
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [imgA, imgB] = await Promise.all([
          loadImg(userPhoto),
          loadImg(celebPhoto),
        ]);
        if (cancelled) return;
        imgsRef.current = { a: imgA, b: imgB };

        const [lmA, lmB] = await Promise.all([
          detectLandmarks68(imgA),
          detectLandmarks68(imgB),
        ]);
        if (cancelled) return;

        if (lmA && lmB) {
          const w = imgA.naturalWidth, h = imgA.naturalHeight;
          morphRef.current = prepareMorph(lmA, lmB, w, h);
        } else {
          morphRef.current = null;
        }
        setReady(true);
      } catch {
        if (!cancelled) setReady(true);
      }
    })();

    return () => { cancelled = true; };
  }, [userPhoto, celebPhoto]);

  // ── Visibility tracking — pause animation when off-screen ──
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const obs = new IntersectionObserver(
      ([entry]) => { visibleRef.current = entry.isIntersecting; },
      { threshold: 0.1 },
    );
    obs.observe(canvas);
    return () => obs.disconnect();
  }, []);

  // ── Animation loop ──
  useEffect(() => {
    if (!ready) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const { a: imgA, b: imgB } = imgsRef.current;
    if (!imgA || !imgB) return;

    const totalCycle = CYCLE_MS + PAUSE_MS;
    let start = performance.now();
    let drawn = false;

    const tick = (now) => {
      if (visibleRef.current || !drawn) {
        const elapsed = (now - start) % (totalCycle * 2);

        let t;
        if (elapsed < CYCLE_MS) {
          t = easeInOut(elapsed / CYCLE_MS);
        } else if (elapsed < totalCycle) {
          t = 1;
        } else if (elapsed < totalCycle + CYCLE_MS) {
          t = 1 - easeInOut((elapsed - totalCycle) / CYCLE_MS);
        } else {
          t = 0;
        }

        if (morphRef.current) {
          renderMorphFrame(ctx, imgA, imgB, morphRef.current, t);
        } else {
          renderCrossFade(ctx, imgA, imgB, t);
        }
        drawn = true;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [ready]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_SIZE}
      height={CANVAS_SIZE}
      style={{
        width: "100%", height: "100%",
        objectFit: "cover",
        display: "block",
        ...style,
      }}
    />
  );
}
