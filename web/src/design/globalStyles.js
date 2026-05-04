import { colors, fontImport } from "./tokens";

// Global CSS injected once in App.jsx
// Kept separate so the product team can find and edit it easily.
export const globalCSS = `
  @import url('${fontImport}');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html { scroll-behavior: smooth; }

  @keyframes marquee      { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
  @keyframes floatCard    { 0%,100%{} 50%{transform:translateY(-8px)} }
  @keyframes float1       { 0%,100%{transform:translateY(0) rotate(-8deg)} 50%{transform:translateY(-12px) rotate(-6deg)} }
  @keyframes float2       { 0%,100%{transform:translateY(0) rotate(5deg)}  50%{transform:translateY(-10px) rotate(7deg)} }
  @keyframes float3       { 0%,100%{transform:translateY(0) rotate(-3deg)} 50%{transform:translateY(-14px) rotate(-5deg)} }
  @keyframes pulseRing    { 0%,100%{transform:translate(-50%,-50%) scale(1);opacity:0.4} 50%{transform:translate(-50%,-50%) scale(1.15);opacity:0.15} }
  @keyframes loadBar      { 0%{transform:translateX(-100%)} 50%{transform:translateX(0)} 100%{transform:translateX(100%)} }
  @keyframes pulse        { 0%,100%{transform:scale(1)} 50%{transform:scale(1.06)} }
  @keyframes shimmer      { 0%{background-position:-200% center} 100%{background-position:200% center} }
  @keyframes slideUp      { from{opacity:0;transform:translateY(50px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn       { from{opacity:0} to{opacity:1} }
  @keyframes badgeFloat1  { 0%,100%{transform:translate(0,0)} 33%{transform:translate(6px,-10px)} 66%{transform:translate(-4px,6px)} }
  @keyframes badgeFloat2  { 0%,100%{transform:translate(0,0)} 33%{transform:translate(-8px,6px)} 66%{transform:translate(5px,-8px)} }
  @keyframes badgeFloat3  { 0%,100%{transform:translate(0,0)} 33%{transform:translate(4px,8px)} 66%{transform:translate(-6px,-6px)} }
  @keyframes spin         { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  @keyframes scanLine     { 0%{top:0%} 50%{top:calc(100% - 3px)} 100%{top:0%} }
  @keyframes spotlightIn  { from{opacity:0} to{opacity:1} }
  @keyframes spotlightOut { from{opacity:1} to{opacity:0} }
  @keyframes ctaPulse {
    0%,100% { box-shadow: 4px 4px 0 ${colors.black}, 0 0 0 0 ${colors.yellow}66; transform: scale(1); }
    50%     { box-shadow: 4px 4px 0 ${colors.black}, 0 0 0 12px ${colors.yellow}00; transform: scale(1.02); }
  }

  /* ── Hero celebrity silhouettes — decorative, scan-on-loop ── */
  @keyframes celebEnterL  { from { opacity: 0; transform: translateX(-60px) rotate(-6deg) scale(0.92); } to { opacity: var(--celeb-op, 0.95); transform: translateX(0) rotate(-3deg) scale(1); } }
  @keyframes celebEnterR  { from { opacity: 0; transform: translateX(60px)  rotate(6deg)  scale(0.92); } to { opacity: var(--celeb-op, 0.95); transform: translateX(0) rotate(2deg)  scale(1); } }
  @keyframes celebEnterT  { from { opacity: 0; transform: translateY(-50px) rotate(3deg)  scale(0.95); } to { opacity: var(--celeb-op, 0.95); transform: translateY(0) rotate(-2deg) scale(1); } }
  @keyframes celebFloatL  { 0%,100% { transform: translateY(0) rotate(-3deg); } 50% { transform: translateY(-12px) rotate(-1.5deg); } }
  @keyframes celebFloatR  { 0%,100% { transform: translateY(0) rotate(2deg); }  50% { transform: translateY(-14px) rotate(3.5deg); } }
  @keyframes celebFloatT  { 0%,100% { transform: translateY(0) rotate(-2deg); } 50% { transform: translateY(-10px) rotate(-3deg); } }
  @keyframes celebScanV   { 0%,15% { top: -8%; opacity: 0; } 25% { opacity: 0.9; } 75% { opacity: 0.9; } 85%,100% { top: 108%; opacity: 0; } }
  @keyframes celebMatchPulse { 0%,100% { filter: drop-shadow(0 8px 20px rgba(0,0,0,0.35)); } 50% { filter: drop-shadow(0 8px 20px rgba(0,0,0,0.35)) drop-shadow(0 0 24px ${colors.yellow}88); } }

  .halftone       { background-image: radial-gradient(circle, rgba(0,0,0,0.07) 1px, transparent 1px); background-size: 16px 16px; }
  .halftone-light { background-image: radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px); background-size: 18px 18px; }
  .glow-text {
    background: linear-gradient(90deg, ${colors.yellow}, ${colors.cyan}, ${colors.yellow});
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: shimmer 3s linear infinite;
  }
  .step-card:hover   { transform: translateY(-8px) !important; box-shadow: 8px 8px 0 ${colors.yellow} !important; }
  .review-card:hover { border-color: ${colors.yellow} !important; transform: scale(1.03) !important; }
  .use-card:hover    { transform: rotate(-1deg) scale(1.04) !important; }
  .cta-main          { animation: ctaPulse 2.4s ease-in-out infinite !important; }

  /* ── Hero celebs only on very wide screens. The hero-grid is max 1140px,
       so we need ≥1700px to have ~280px of breathing room on each side
       before the silhouettes start overlapping the text / upload widget. ── */
  @media (max-width: 1700px) {
    .hero-celeb { display: none !important; }
  }

  /* ── 860 px and below (tablet portrait + mobile) ── */
  @media (max-width: 860px) {
    .nav-desktop      { display: none !important; }
    .nav-mobile-right { display: flex !important; }
    .nav-mobile-menu  { display: block !important; }
    .hero-section { padding: 80px 20px 32px !important; }
    .hero-grid    { flex-direction: column !important; text-align: center !important; align-items: center !important; gap: 28px !important; }
    .hero-left    { align-items: center !important; }
    .hero-left .hero-badge { align-self: center !important; }
    .hero-left > a { align-self: center !important; }
    .hero-visual  { display: flex !important; justify-content: center !important; width: 100% !important; }
    .hero-upload  { width: min(380px, 88vw) !important; }
    .hero-stats   { justify-content: center !important; }
    .steps-row    { flex-direction: column !important; align-items: center !important; }
    .excl-grid    { flex-direction: column !important; align-items: center !important; text-align: center !important; }
    .gallery-grid { grid-template-columns: repeat(2, 1fr) !important; }
    .reviews-grid { grid-template-columns: 1fr !important; }
    .use-grid     { grid-template-columns: 1fr !important; }
    .stats-row    { flex-wrap: wrap !important; gap: 24px !important; }
    .footer-inner { flex-direction: column !important; gap: 24px !important; text-align: center !important; align-items: center !important; }
    .footer-inner > div { display: flex !important; flex-direction: column !important; align-items: center !important; }
    .how-demo     { flex-direction: column !important; }
  }

  /* ── 600 px and below (mobile) ── */
  @media (max-width: 600px) {
    .hero-section   { padding: 72px 16px 24px !important; }
    .hero-upload    { width: calc(100vw - 48px) !important; max-width: 360px !important; }
    .upload-cta-btn { width: 90% !important; }
    .hero-stats     { gap: 8px !important; font-size: 12px !important; }
    .hero-stats-sep { display: none !important; }
    .footer-links   { flex-wrap: wrap !important; gap: 12px !important; justify-content: center !important; }
  }

  /* ── 400 px and below (small phones) ── */
  @media (max-width: 400px) {
    .hero-section   { padding: 64px 12px 20px !important; }
    .steps-row > *  { max-width: 100% !important; }
  }
`;
