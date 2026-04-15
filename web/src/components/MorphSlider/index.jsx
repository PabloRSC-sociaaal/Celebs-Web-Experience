import { useState, useEffect, useRef, useCallback } from "react";
import { detectLandmarks68 } from "../../features/face/detect";
import { prepareMorph, renderMorphFrame, renderCrossFade } from "../../features/face/morph";

const CANVAS_SIZE = 640;

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
 * MorphSlider — renders a face morph between two images on a canvas,
 * driven by a draggable slider (0 = 100% user, 1 = 100% celeb).
 *
 * Falls back to a cross-fade blend if landmark detection fails.
 */
export function MorphSlider({ userPhoto, celebPhoto, color }) {
  const canvasRef    = useRef(null);
  const containerRef = useRef(null);

  const [sliderT, setSliderT]     = useState(0);
  const [dragging, setDragging]   = useState(false);
  const [loading, setLoading]     = useState(true);

  const morphRef = useRef(null);
  const imgsRef  = useRef({ a: null, b: null });

  // ── Load images & detect landmarks on mount ──
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
          console.log("[MorphSlider] morph ready — warping mode");
        } else {
          morphRef.current = null;
          console.log("[MorphSlider] landmarks missing — crossfade fallback");
        }
      } catch (err) {
        console.warn("[MorphSlider] init error:", err);
        morphRef.current = null;
      }
      if (!cancelled) setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [userPhoto, celebPhoto]);

  // ── Render morph frame whenever sliderT changes ──
  useEffect(() => {
    if (loading) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const { a: imgA, b: imgB } = imgsRef.current;
    if (!imgA || !imgB) return;

    if (morphRef.current) {
      renderMorphFrame(ctx, imgA, imgB, morphRef.current, sliderT);
    } else {
      renderCrossFade(ctx, imgA, imgB, sliderT);
    }
  }, [sliderT, loading]);

  // ── Drag handling ──
  const handleMove = useCallback((e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const t = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    setSliderT(t);
  }, []);

  useEffect(() => {
    if (!dragging) return;
    const move = (e) => handleMove(e);
    const up   = () => setDragging(false);
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    window.addEventListener("touchmove", move, { passive: true });
    window.addEventListener("touchend", up);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
      window.removeEventListener("touchmove", move);
      window.removeEventListener("touchend", up);
    };
  }, [dragging, handleMove]);

  const sliderPct = sliderT * 100;

  return (
    <div style={{ width: "100%", position: "relative" }}>
      <div
        ref={containerRef}
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "1 / 1",
          borderRadius: 18,
          overflow: "hidden",
          border: `3px solid ${color}`,
          boxShadow: `0 0 50px ${color}44, 0 16px 50px rgba(0,0,0,0.5)`,
          cursor: dragging ? "grabbing" : "col-resize",
          userSelect: "none",
          background: "#0a0a0a",
        }}
      >
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          style={{ width: "100%", height: "100%", display: "block" }}
        />

        {/* Loading overlay */}
        {loading && (
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(10,10,10,0.85)",
            flexDirection: "column", gap: 12,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              border: `3px solid ${color}33`,
              borderTopColor: color,
              animation: "morphSpin 0.8s linear infinite",
            }} />
            <div style={{
              fontFamily: "'Oxanium', sans-serif", fontSize: 11,
              fontWeight: 600, color: "rgba(255,255,255,0.4)",
              letterSpacing: 1,
            }}>
              Preparing morph...
            </div>
          </div>
        )}

        {/* Slider line */}
        {!loading && (
          <div style={{
            position: "absolute", top: 0, bottom: 0,
            left: `${sliderPct}%`, transform: "translateX(-50%)",
            width: 2,
            background: `linear-gradient(to bottom, transparent, #fff8 20%, #fffa 50%, #fff8 80%, transparent)`,
            pointerEvents: "none", zIndex: 10,
            opacity: (sliderT > 0.02 && sliderT < 0.98) ? 1 : 0,
            transition: "opacity 0.2s",
          }} />
        )}

        {/* Slider handle */}
        {!loading && (
          <div
            onMouseDown={(e) => { setDragging(true); e.preventDefault(); }}
            onTouchStart={() => setDragging(true)}
            style={{
              position: "absolute", top: "50%", left: `${sliderPct}%`,
              transform: "translate(-50%,-50%)",
              width: 44, height: 44, borderRadius: "50%",
              background: "#fff", border: `3px solid ${color}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "col-resize", zIndex: 20,
              boxShadow: `0 0 20px ${color}88`,
              transition: dragging ? "none" : "left 0.05s",
            }}
          >
            <svg width={20} height={14} viewBox="0 0 20 14">
              <path
                d="M0 7h4M16 7h4M3 7l3-4M3 7l3 4M17 7l-3-4M17 7l-3 4"
                stroke={color} strokeWidth="2.2" strokeLinecap="round" fill="none"
              />
            </svg>
          </div>
        )}

        {/* Labels */}
        <div style={{
          position: "absolute", bottom: 12, left: 12,
          background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)",
          borderRadius: 7, padding: "4px 10px",
          fontFamily: "'Oxanium'", fontSize: 10, fontWeight: 800,
          color: "#fff", letterSpacing: 1,
          opacity: sliderT < 0.85 ? 1 : 0.3,
          transition: "opacity 0.3s",
        }}>YOU</div>

        <div style={{
          position: "absolute", bottom: 12, right: 12,
          background: `${color}cc`, backdropFilter: "blur(8px)",
          borderRadius: 7, padding: "4px 10px",
          fontFamily: "'Oxanium'", fontSize: 10, fontWeight: 800,
          color: color === "#FFE500" ? "#0A0A0A" : "#fff",
          letterSpacing: 1,
          opacity: sliderT > 0.15 ? 1 : 0.3,
          transition: "opacity 0.3s",
        }}>CELEB</div>
      </div>

      <style>{`@keyframes morphSpin { to { transform: rotate(360deg); } }`}</style>

      <div style={{
        textAlign: "center", marginTop: 8,
        fontFamily: "'Oxanium'", fontSize: 10,
        color: "rgba(255,255,255,0.28)",
      }}>
        ← drag to morph →
      </div>
    </div>
  );
}
