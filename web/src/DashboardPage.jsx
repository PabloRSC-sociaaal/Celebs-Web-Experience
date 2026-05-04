import { useState, useEffect, useRef, useCallback } from "react";
import { getAll, updateLabel, deleteGeneration } from "./services";
import { detectAndCropFace } from "./features/face/detect";
import { useAppStore } from "./store/appStore";
import { FirebaseTestPanel } from "./features/firebase/testPanel";
import { MorphBoomerang } from "./components/MorphBoomerang";
import { signOutUser } from "./features/firebase/authService";
import { isPremium } from "./features/firebase/subscriptionService";
import { AuthModal } from "./features/auth/AuthModal";
import { getFlag } from "./config";
import {
  createSharedRequest,
  getAllSharedRequests,
  getUnseenCount,
  markNotificationSeen,
  deleteSharedRequest,
  getPendingForStep,
  cancelSharedRequest,
} from "./services/sharedGenerations";

const C = {
  blue: "#2AABE2", yellow: "#FFE500", black: "#0A0A0A", white: "#FFFFFF",
  pink: "#FF3CAC", cyan: "#00E5FF", green: "#22c55e", purple: "#8B5CF6",
  darkBlue: "#1B8DBF",
};

// ─── Dice options — all uploadable subjects ──────────────────────────────────
const DICE_OPTIONS = [
  { emoji: "🙋", text: "yourself",           color: C.cyan,     label: "me",      sub: null },
  { emoji: "👨", text: "your Dad",           color: C.pink,     label: "family",  sub: "dad" },
  { emoji: "👩", text: "your Mom",           color: C.pink,     label: "family",  sub: "mom" },
  { emoji: "👦", text: "your Brother",       color: C.pink,     label: "family",  sub: "brother" },
  { emoji: "👧", text: "your Sister",        color: C.pink,     label: "family",  sub: "sister" },
  { emoji: "👶", text: "your Son",           color: C.pink,     label: "family",  sub: "son" },
  { emoji: "🧒", text: "your Daughter",      color: C.pink,     label: "family",  sub: "daughter" },
  { emoji: "👫", text: "a Friend",           color: C.green,    label: "friend",  sub: null },
  { emoji: "📚", text: "a Teacher",          color: C.purple,   label: "teacher", sub: null },
  { emoji: "🧑‍💻", text: "a Colleague",      color: C.blue,     label: "work",    sub: "colleague" },
  { emoji: "👔", text: "your Boss",          color: C.blue,     label: "work",    sub: "boss" },
  { emoji: "💘", text: "your Platonic Love", color: "#FF6B9D",  label: "love",    sub: null },
];

// ─── Camino a la Fama — 13-node path ─────────────────────────────────────────
// Layout: Photo×3 → Special → Photo×2 → Special → Photo×4 → Special → Photo (Crush)
// Special nodes are at indices [3, 6, 11] — no photo needed, claimed with one tap.
const STEPS_REQUIRED = 13;
const STEP_HINTS = [
  { emoji: "🙋",  text: "You",       color: C.cyan    },  // 0  photo
  { emoji: "👨",  text: "Dad",       color: C.pink    },  // 1  photo
  { emoji: "👩",  text: "Mom",       color: C.pink    },  // 2  photo
  { emoji: "🎭",  text: "Reward",    color: C.pink    },  // 3  SPECIAL
  { emoji: "👫",  text: "Friend",    color: C.green   },  // 4  photo
  { emoji: "👦",  text: "Brother",   color: C.pink    },  // 5  photo
  { emoji: "⭐",  text: "Reward",    color: C.yellow  },  // 6  SPECIAL
  { emoji: "🧑‍💻", text: "Colleague", color: C.blue    },  // 7  photo
  { emoji: "📚",  text: "Teacher",   color: C.purple  },  // 8  photo
  { emoji: "👧",  text: "Sister",    color: C.pink    },  // 9  photo
  { emoji: "👔",  text: "Boss",      color: C.blue    },  // 10 photo
  { emoji: "🎬",  text: "Reward",    color: C.cyan    },  // 11 SPECIAL
  { emoji: "💘",  text: "Crush",     color: "#FF6B9D" },  // 12 photo — always last
];

// ─── Gang Reveal modal ────────────────────────────────────────────────────────
function GangReveal({ gens, onClose }) {
  const top10  = gens.slice(0, STEPS_REQUIRED);
  const avgPct = Math.round(top10.reduce((a, g) => a + (g.celeb?.pct || 0), 0) / top10.length);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 500,
      background: "rgba(5,5,18,0.96)", backdropFilter: "blur(20px)",
      display: "flex", flexDirection: "column", overflowY: "auto",
      fontFamily: "'Oxanium', sans-serif",
    }}>
      <style>{`
        @keyframes gangIn   { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes starGlow { 0%,100%{filter:drop-shadow(0 0 8px ${C.yellow})} 50%{filter:drop-shadow(0 0 20px ${C.yellow})} }
      `}</style>

      {/* Close bar */}
      <div style={{ padding:"14px 16px", display:"flex", justifyContent:"flex-end" }}>
        <button onClick={onClose} style={{
          background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.12)",
          borderRadius:10, padding:"8px 16px", cursor:"pointer",
          fontFamily:"'Oxanium'", fontWeight:600, fontSize:12, color:"rgba(255,255,255,0.6)",
        }}>✕ Close</button>
      </div>

      <div style={{
        maxWidth:580, margin:"0 auto", padding:"8px 16px 80px",
        display:"flex", flexDirection:"column", alignItems:"center", gap:24,
        animation:"gangIn 0.5s ease-out",
      }}>
        {/* Title */}
        <div style={{ textAlign:"center" }}>
          <div style={{ fontSize:48, lineHeight:1, animation:"starGlow 2s ease-in-out infinite" }}>🌟</div>
          <div style={{ fontFamily:"'Fredoka'", fontSize:"clamp(28px,7vw,40px)", fontWeight:700, color:C.yellow, marginTop:8, lineHeight:1 }}>
            Your Celebrity Gang
          </div>
          <div style={{ fontFamily:"'Oxanium'", fontSize:12, color:"rgba(255,255,255,0.4)", marginTop:8, lineHeight:1.5 }}>
            {top10.length} people matched · {avgPct}% avg Hollywood score
          </div>
        </div>

        {/* Gang grid */}
        <div style={{
          display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(90px,1fr))", gap:10, width:"100%",
        }}>
          {top10.map((gen, i) => (
            <div key={gen.id} style={{
              background:"#111122", borderRadius:14, overflow:"hidden",
              border:`1.5px solid ${gen.celeb?.color || C.yellow}44`,
              animation:`gangIn 0.4s ease-out ${i * 0.06}s both`,
            }}>
              <div style={{ position:"relative", aspectRatio:"1/1" }}>
                {gen.thumb
                  ? <img src={gen.thumb} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"top center", display:"block" }} />
                  : <div style={{ width:"100%", height:"100%", background:"#1a1a2e", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28 }}>👤</div>
                }
                <div style={{ position:"absolute", inset:0, background:"linear-gradient(transparent 40%, rgba(0,0,0,0.7))" }} />
                <div style={{
                  position:"absolute", top:4, right:4,
                  background:gen.celeb?.color || C.yellow,
                  color: gen.celeb?.color === C.yellow ? C.black : C.white,
                  fontFamily:"'Fredoka'", fontWeight:700, fontSize:9,
                  padding:"2px 6px", borderRadius:6,
                }}>{gen.celeb?.pct}%</div>
              </div>
              <div style={{ padding:"6px 8px 8px" }}>
                <div style={{
                  fontFamily:"'Oxanium'", fontSize:9, fontWeight:700, color:gen.celeb?.color || C.yellow,
                  overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
                }}>{gen.celeb?.name}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Gang score */}
        <div style={{
          background:`${C.yellow}10`, border:`1.5px solid ${C.yellow}33`,
          borderRadius:18, padding:"20px 24px", textAlign:"center", width:"100%",
          boxShadow:`0 0 30px ${C.yellow}10`,
        }}>
          <div style={{ fontFamily:"'Fredoka'", fontSize:48, fontWeight:700, color:C.yellow, lineHeight:1 }}>
            {avgPct}%
          </div>
          <div style={{ fontFamily:"'Oxanium'", fontSize:12, color:"rgba(255,255,255,0.45)", marginTop:6 }}>
            Average celebrity match across your entire gang
          </div>
        </div>

        {/* Actions */}
        <div style={{ display:"flex", gap:10, flexWrap:"wrap", justifyContent:"center", width:"100%" }}>
          <button style={{
            flex:"1 1 160px", background:C.yellow, color:C.black,
            fontFamily:"'Oxanium'", fontWeight:800, fontSize:13,
            padding:"14px 0", border:`3px solid ${C.black}`,
            borderRadius:12, boxShadow:`4px 4px 0 ${C.black}`,
            cursor:"pointer", letterSpacing:1, textTransform:"uppercase",
          }}>🔗 Share my Gang</button>
          <button onClick={onClose} style={{
            flex:"1 1 120px", background:"transparent",
            border:"1px solid rgba(255,255,255,0.15)",
            borderRadius:12, padding:"14px 0",
            fontFamily:"'Oxanium'", fontWeight:600, fontSize:13,
            color:"rgba(255,255,255,0.45)", cursor:"pointer",
          }}>Close</button>
        </div>
      </div>
    </div>
  );
}

// ─── Camino a la Fama — CTA card (compact, same size as gen cards) ───────────
function CaminoCTA({ gens, onEnter }) {
  const filled     = Math.min(gens.length, STEPS_REQUIRED);
  const isUnlocked = gens.length >= STEPS_REQUIRED;

  // Build node data: index 0 = bottom/start (step 1), index N-1 = top/goal
  // We render the SVG from top to bottom, so visually node[N-1-i] is at row i
  const N   = STEPS_REQUIRED;
  // SVG coordinate space
  const VW  = 110, VH = 130;
  const padX = 18, padY = 14;
  const trackH = VH - padY * 2;
  // Nodes from bottom (step 1, i=0) to top (step N, i=N-1)
  // SVG y: bottom-most node = VH-padY, top-most = padY
  const nodes = Array.from({ length: N }, (_, i) => {
    const t  = i / (N - 1);                          // 0=bottom, 1=top
    const y  = VH - padY - t * trackH;               // SVG y (top-down)
    const x  = VW / 2 + (i % 2 === 0 ? -10 : 10);   // gentle zigzag
    const isDone    = i < filled;
    const isCurrent = i === filled && !isUnlocked;   // first incomplete
    const isMile    = i === 2 || i === 4;             // milestone steps (3rd & 5th)
    const color     = STEP_HINTS[i]?.color || C.yellow;
    return { x, y, isDone, isCurrent, isMile, color };
  });

  // Polyline path string through all nodes
  const polyline = nodes.map(n => `${n.x},${n.y}`).join(" ");

  // Filled polyline: only through completed + current nodes
  const filledNodes = nodes.slice(0, Math.min(filled + 1, N));
  const filledPoly  = filledNodes.map(n => `${n.x},${n.y}`).join(" ");

  return (
    <div
      onClick={onEnter}
      style={{
        background:"linear-gradient(145deg,#0c0c22 0%,#10102a 100%)",
        border:`2px solid ${isUnlocked ? `${C.yellow}55` : "rgba(255,255,255,0.08)"}`,
        borderRadius:20, overflow:"hidden",
        display:"flex", flexDirection:"column", cursor:"pointer",
        transition:"transform 0.2s, box-shadow 0.2s, border-color 0.3s",
        boxShadow: isUnlocked ? `0 0 28px ${C.yellow}14` : "none",
      }}
      onMouseEnter={e => { e.currentTarget.style.transform="translateY(-4px)"; e.currentTarget.style.boxShadow=isUnlocked?`0 12px 40px ${C.yellow}22`:"0 12px 40px rgba(0,0,0,0.4)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow=isUnlocked?`0 0 28px ${C.yellow}14`:"none"; }}
    >
      <style>{`
        @keyframes caminoPulse {
          0%,100% { r:5; opacity:1; }
          50%      { r:7; opacity:0.7; }
        }
        @keyframes caminoRing {
          0%,100% { opacity:0.6; r:9; }
          50%      { opacity:0.2; r:13; }
        }
      `}</style>

      {/* ── Visual area ── */}
      <div style={{ position:"relative", aspectRatio:"1/1", overflow:"hidden",
        display:"flex", alignItems:"center", justifyContent:"center" }}>

        {/* Background glow */}
        <div style={{
          position:"absolute", inset:0,
          background: isUnlocked
            ? `radial-gradient(circle at 50% 40%, ${C.yellow}14, #0c0c22 70%)`
            : filled > 0
              ? `radial-gradient(circle at 50% 40%, ${C.blue}10, #0c0c22 70%)`
              : "none",
        }} />

        {/* Mini path SVG */}
        <svg
          viewBox={`0 0 ${VW} ${VH}`}
          style={{ width:"72%", height:"72%", overflow:"visible" }}
        >
          {/* Base track (dim) */}
          <polyline
            points={polyline}
            fill="none"
            stroke="rgba(255,255,255,0.07)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Completed track */}
          {filled > 0 && (
            <polyline
              points={filledPoly}
              fill="none"
              stroke={`url(#caminoGrad)`}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Gradient def for completed track */}
          <defs>
            <linearGradient id="caminoGrad" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor={C.blue} />
              <stop offset="100%" stopColor={isUnlocked ? C.yellow : C.cyan} />
            </linearGradient>
          </defs>

          {/* Nodes */}
          {nodes.map((n, i) => (
            <g key={i}>
              {/* Pulse ring for current node */}
              {n.isCurrent && (
                <circle cx={n.x} cy={n.y} r={9} fill="none"
                  stroke={C.yellow} strokeWidth="1" opacity="0.35"
                  style={{ animation:"caminoRing 1.8s ease-in-out infinite" }}
                />
              )}
              {/* Node dot */}
              <circle
                cx={n.x} cy={n.y}
                r={n.isCurrent ? 5 : n.isMile && n.isDone ? 4.5 : n.isDone ? 3.5 : 2.5}
                fill={
                  isUnlocked    ? C.yellow :
                  n.isDone      ? n.color  :
                  n.isCurrent   ? C.yellow :
                  "rgba(255,255,255,0.1)"
                }
                style={n.isCurrent ? { animation:"caminoPulse 1.8s ease-in-out infinite" } : {}}
              />
              {/* Milestone star */}
              {n.isMile && n.isDone && (
                <text x={n.x} y={n.y + 0.9} textAnchor="middle" dominantBaseline="middle"
                  fontSize="5" style={{ userSelect:"none" }}>⭐</text>
              )}
            </g>
          ))}

          {/* Goal crown at the top */}
          <text
            x={nodes[N-1].x} y={nodes[N-1].y - 10}
            textAnchor="middle" fontSize="9"
            style={{ userSelect:"none" }}
            opacity={isUnlocked ? 1 : 0.35}
          >🏆</text>
        </svg>

        {/* Counter badge — top right */}
        <div style={{
          position:"absolute", top:8, right:8,
          background: isUnlocked ? C.yellow : "rgba(255,255,255,0.07)",
          color: isUnlocked ? C.black : "rgba(255,255,255,0.45)",
          fontFamily:"'Fredoka'", fontWeight:700, fontSize:12,
          padding:"2px 8px", borderRadius:20,
          boxShadow: isUnlocked ? `0 0 10px ${C.yellow}55` : "none",
          transition:"all 0.3s",
        }}>{filled}/{N}</div>
      </div>

      {/* ── Footer ── */}
      <CardFooter
        title="Camino a la Fama"
        sub={isUnlocked ? "✨ gang ready!" : `${N - filled} steps to go`}
        right={
          <CardBtn color={isUnlocked ? C.yellow : "rgba(255,255,255,0.4)"}>→</CardBtn>
        }
      />
    </div>
  );
}

// ─── Camino a la Fama — Duolingo-style path screen ───────────────────────────
const SPECIAL_IDXS  = [3, 6, 11];
const isSpecialNode = (i) => SPECIAL_IDXS.includes(i);

function CaminoPage({ gens, claimed = [], onClaim, onUpload, onBack, onReveal, sharedReqs = [], onResendShare, onCancelShare }) {
  // Animate the step that was just completed when returning from Results
  const justCompletedStep    = useAppStore(s => s.justCompletedStep);
  const setJustCompletedStep = useAppStore(s => s.setJustCompletedStep);
  const [animStep, setAnimStep] = useState(null);

  useEffect(() => {
    if (justCompletedStep !== null) {
      setAnimStep(justCompletedStep);
      setJustCompletedStep(null);
      const t = setTimeout(() => setAnimStep(null), 2200);
      return () => clearTimeout(t);
    }
  }, [justCompletedStep, setJustCompletedStep]);

  // ── Node definitions — 13 nodes total ────────────────────────────────────
  // Photo nodes: 0,1,2,4,5,7,8,9,10,12  (10 photo uploads)
  // Special nodes: 3,6,11               (3 free reward stops)
  const NODES = [
    { hint:{ emoji:"🙋",  text:"You",       color:C.cyan    }, special:null },
    { hint:{ emoji:"👨",  text:"Dad",       color:C.pink    }, special:null },
    { hint:{ emoji:"👩",  text:"Mom",       color:C.pink    }, special:null },
    { hint:{ emoji:"🎭",  text:"Reward",    color:C.pink    }, special:{ emoji:"🎭", label:"Family Portrait", desc:"AI portrait with your first 3 celebs", color:C.pink   } },
    { hint:{ emoji:"👫",  text:"Friend",    color:C.green   }, special:null },
    { hint:{ emoji:"👦",  text:"Brother",   color:C.pink    }, special:null },
    { hint:{ emoji:"⭐",  text:"Reward",    color:C.yellow  }, special:{ emoji:"⭐", label:"Party Started",   desc:"5 celebs, one epic crew!",            color:C.yellow } },
    { hint:{ emoji:"🧑‍💻", text:"Colleague", color:C.blue    }, special:null },
    { hint:{ emoji:"📚",  text:"Teacher",   color:C.purple  }, special:null },
    { hint:{ emoji:"👧",  text:"Sister",    color:C.pink    }, special:null },
    { hint:{ emoji:"👔",  text:"Boss",      color:C.blue    }, special:null },
    { hint:{ emoji:"🎬",  text:"Reward",    color:C.cyan    }, special:{ emoji:"🎬", label:"Celebrity Gang",  desc:"Your full crew revealed!",            color:C.cyan   } },
    { hint:{ emoji:"💘",  text:"Crush",     color:"#FF6B9D" }, special:null },   // always last
  ];

  // ── Progress helpers ──────────────────────────────────────────────────────
  const photoIdxs = NODES.map((_,i) => i).filter(i => !isSpecialNode(i)); // [0,1,2,4,5,7,8,9,10,12]
  const revGens   = [...gens].reverse(); // oldest first

  const isNodeDone = (i) => isSpecialNode(i) ? claimed.includes(i) : revGens[photoIdxs.indexOf(i)] !== undefined;
  const genForNode = (i) => isSpecialNode(i) ? null : (revGens[photoIdxs.indexOf(i)] || null);

  const currentIdx = NODES.findIndex((_, i) => !isNodeDone(i)); // -1 = all done
  const filled     = NODES.filter((_, i) => isNodeDone(i)).length;
  const isUnlocked = filled >= NODES.length;

  // Check if a node has a pending share link
  const pendingShareForNode = (i) =>
    sharedReqs.find(r => r.status === "pending" && r.requestContext?.type === "camino" && r.requestContext?.step === i) || null;

  // ── Node positions — viewBox 0 0 400 1060, 13 nodes ──────────────────────
  //  Zigzag: left(25%)↔right(75%), specials centered(50%)
  //  SVG y spacing ≈ 77 per node. cx_svg = left*4, cy_svg = top*10.6
  const NODE_POS = [
    { left:25.0, top: 6.6 },  // 0  photo  SVG(100, 70)
    { left:75.0, top:13.9 },  // 1  photo  SVG(300,147)
    { left:25.0, top:21.1 },  // 2  photo  SVG(100,224)
    { left:50.0, top:28.4 },  // 3  SPECIAL SVG(200,301)
    { left:75.0, top:35.7 },  // 4  photo  SVG(300,378)
    { left:25.0, top:42.9 },  // 5  photo  SVG(100,455)
    { left:50.0, top:50.2 },  // 6  SPECIAL SVG(200,532)
    { left:75.0, top:57.5 },  // 7  photo  SVG(300,609)
    { left:25.0, top:64.7 },  // 8  photo  SVG(100,686)
    { left:75.0, top:72.0 },  // 9  photo  SVG(300,763)
    { left:25.0, top:79.2 },  // 10 photo  SVG(100,840)
    { left:50.0, top:86.5 },  // 11 SPECIAL SVG(200,917)
    { left:50.0, top:93.4 },  // 12 photo  SVG(200,990) — Crush
  ];

  // ── Bezier path (12 segments for 13 nodes) ────────────────────────────────
  const PATH_FULL =
    "M 100 70  C 100 108,300 108,300 147 " +
    "C 300 185,100 185,100 224 " +
    "C 100 262,200 262,200 301 " +
    "C 200 339,300 339,300 378 " +
    "C 300 416,100 416,100 455 " +
    "C 100 493,200 493,200 532 " +
    "C 200 570,300 570,300 609 " +
    "C 300 647,100 647,100 686 " +
    "C 100 724,300 724,300 763 " +
    "C 300 801,100 801,100 840 " +
    "C 100 878,200 878,200 917 " +
    "C 200 953,200 953,200 990";

  const PATH_SEGS = [
    "M 100 70  C 100 108,300 108,300 147",   // 0→1
    "M 300 147 C 300 185,100 185,100 224",   // 1→2
    "M 100 224 C 100 262,200 262,200 301",   // 2→3 SPECIAL
    "M 200 301 C 200 339,300 339,300 378",   // 3→4
    "M 300 378 C 300 416,100 416,100 455",   // 4→5
    "M 100 455 C 100 493,200 493,200 532",   // 5→6 SPECIAL
    "M 200 532 C 200 570,300 570,300 609",   // 6→7
    "M 300 609 C 300 647,100 647,100 686",   // 7→8
    "M 100 686 C 100 724,300 724,300 763",   // 8→9
    "M 300 763 C 300 801,100 801,100 840",   // 9→10
    "M 100 840 C 100 878,200 878,200 917",   // 10→11 SPECIAL
    "M 200 917 C 200 953,200 953,200 990",   // 11→12 Crush
  ];

  // Segment color = destination node color
  const SEG_COLORS = [
    C.pink,     // →1 Dad
    C.pink,     // →2 Mom
    C.pink,     // →3 Family Portrait (special)
    C.green,    // →4 Friend
    C.pink,     // →5 Brother
    C.yellow,   // →6 Party (special)
    C.blue,     // →7 Colleague
    C.purple,   // →8 Teacher
    C.pink,     // →9 Sister
    C.blue,     // →10 Boss
    C.cyan,     // →11 Gang (special)
    "#FF6B9D",  // →12 Crush
  ];

  return (
    <div style={{ minHeight:"100vh", background:C.black, fontFamily:"'Oxanium',sans-serif", color:C.white }}>
      <style>{`
        @keyframes nodePulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(255,229,0,0.75), 0 0 24px rgba(255,229,0,0.25); }
          55%      { box-shadow: 0 0 0 16px rgba(255,229,0,0), 0 0 24px rgba(255,229,0,0.25); }
        }
        @keyframes goldGlow {
          0%,100% { filter: drop-shadow(0 0 6px rgba(255,229,0,0.5));  }
          50%      { filter: drop-shadow(0 0 22px rgba(255,229,0,1)); }
        }
        @keyframes caminoIn { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes stepPop {
          0%   { transform: translate(-50%,-50%) scale(0.4); opacity: 0; filter: brightness(2); }
          40%  { transform: translate(-50%,-50%) scale(1.25); opacity: 1; filter: brightness(1.6); }
          65%  { transform: translate(-50%,-50%) scale(0.92); }
          80%  { transform: translate(-50%,-50%) scale(1.06); }
          100% { transform: translate(-50%,-50%) scale(1);   opacity: 1; filter: brightness(1); }
        }
        @keyframes segFlash {
          0%,100% { opacity: 0.88; }
          30%     { opacity: 1; filter: brightness(2) drop-shadow(0 0 14px white); }
        }
        @keyframes pendingPulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(0,229,255,0.4), 0 0 16px rgba(0,229,255,0.15); }
          50%     { box-shadow: 0 0 0 10px rgba(0,229,255,0), 0 0 16px rgba(0,229,255,0.15); }
        }
        .node-current        { animation: nodePulse 2.2s ease-out infinite; }
        .node-pending-share  { animation: pendingPulse 2.5s ease-in-out infinite; }
        .node-final          { animation: goldGlow 2.5s ease-in-out infinite; }
        .node-just-done      { animation: stepPop 0.8s cubic-bezier(0.34,1.56,0.64,1) both; }
        .seg-just-done  { animation: segFlash 1.2s ease-out 0.3s both; }

        /* ── Milestone reward cards — responsive positioning ── */
        /* The cards are absolutely positioned as % of the path container.
           Node 2 is at left:25% (right edge ≈ 25%+nodeRadius%).
           Node 4 is at left:50% (right edge ≈ 50%+nodeRadius%).
           We offset the card left to clear the node circle + small gap.
           Node radius as % = (nodeSize/2) / containerWidth × 100.
           Container max-width = 480px (520 - 2×20px padding). */

        /* Small phones ≤ 390px viewport → container ≈ 310px */
        .mc-card-1 { left:41%; width:56%; }
        .mc-card-2 { left:65%; width:32%; }
        .mc-card-desc { display:none; }          /* hide description on tiny screens */

        /* Medium phones 391–520px → container ≈ 350–480px */
        @media(min-width:391px) {
          .mc-card-1 { left:38%; width:59%; }
          .mc-card-2 { left:62%; width:35%; }
          .mc-card-desc { display:block; }
        }

        /* Tablet 600px+ → container = 480px (maxWidth) */
        @media(min-width:600px) {
          .mc-card-1 { left:34%; width:63%; }
          .mc-card-2 { left:58%; width:39%; }
        }

        /* Camino header safe-area */
        .camino-header { padding-top: max(10px, env(safe-area-inset-top, 0px)); }

        /* ── Node size scaling — reduce on small phones to prevent crowding ──
           The transform on .camino-node scales the entire node stack (circle + label).
           translate(-50%,-50%) is in the inline style so we preserve it via
           a wrapper that ONLY scales; the absolute pos wrapper is separate. */
        @media(max-width:360px) {
          .camino-node-inner { transform: scale(0.82); transform-origin: center top; }
        }
        @media(min-width:361px) and (max-width:420px) {
          .camino-node-inner { transform: scale(0.90); transform-origin: center top; }
        }
      `}</style>

      {/* ── Sticky header ──────────────────────────────────────────────────── */}
      <div className="camino-header" style={{
        position:"sticky", top:0, zIndex:100,
        background:"rgba(10,10,10,0.94)", backdropFilter:"blur(16px)",
        borderBottom:"1px solid rgba(255,255,255,0.07)",
        padding:"10px 16px",
      }}>
        <div style={{ maxWidth:520, margin:"0 auto", display:"flex", alignItems:"center", gap:10 }}>
          <button onClick={onBack} style={{
            background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.12)",
            borderRadius:10, padding:"8px 12px", cursor:"pointer",
            fontFamily:"'Oxanium'", fontWeight:600, fontSize:12, color:"rgba(255,255,255,0.6)",
            display:"flex", alignItems:"center", gap:4, flexShrink:0,
          }}>← Back</button>

          <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", minWidth:0 }}>
            <div style={{ fontFamily:"'Fredoka'", fontSize:17, fontWeight:700, color:C.white, lineHeight:1 }}>
              🌟 Camino a la Fama
            </div>
            <div style={{ fontFamily:"'Oxanium'", fontSize:10, color:"rgba(255,255,255,0.35)", marginTop:2 }}>
              {filled}/{STEPS_REQUIRED} steps completed
            </div>
          </div>

          <div style={{
            flexShrink:0, borderRadius:10, padding:"6px 12px",
            background: isUnlocked ? `${C.yellow}22` : "rgba(255,255,255,0.06)",
            border:`1px solid ${isUnlocked ? C.yellow+"44" : "rgba(255,255,255,0.12)"}`,
            fontFamily:"'Fredoka'", fontSize:14, fontWeight:700,
            color: isUnlocked ? C.yellow : "rgba(255,255,255,0.4)",
          }}>{filled}/{STEPS_REQUIRED}</div>
        </div>
      </div>

      {/* ── Unlocked gang banner ──────────────────────────────────────────── */}
      {isUnlocked && (
        <div style={{ maxWidth:520, margin:"16px auto 0", padding:"0 16px" }}>
          <div style={{
            background:`${C.yellow}14`, border:`1.5px solid ${C.yellow}44`,
            borderRadius:16, padding:"14px 20px",
            display:"flex", alignItems:"center", justifyContent:"space-between", gap:12,
          }}>
            <div>
              <div style={{ fontFamily:"'Fredoka'", fontSize:16, fontWeight:700, color:C.yellow }}>✨ Gang Complete!</div>
              <div style={{ fontFamily:"'Oxanium'", fontSize:11, color:"rgba(255,255,255,0.4)", marginTop:3 }}>
                Your celebrity crew is ready
              </div>
            </div>
            <button onClick={onReveal} style={{
              background:C.yellow, color:C.black,
              fontFamily:"'Oxanium'", fontWeight:800, fontSize:12,
              padding:"10px 18px", border:`2px solid ${C.black}`,
              borderRadius:10, boxShadow:`3px 3px 0 ${C.black}`,
              cursor:"pointer", letterSpacing:0.8, textTransform:"uppercase", flexShrink:0,
            }}>🌟 Reveal</button>
          </div>
        </div>
      )}

      {/* ── Duolingo-style PATH MAP ───────────────────────────────────────── */}
      <div style={{
        maxWidth:520, margin:"0 auto",
        padding:"12px 16px calc(130px + env(safe-area-inset-bottom, 0px))",
        animation:"caminoIn 0.4s ease-out",
      }}>
        <div style={{ position:"relative" }}>

          {/* SVG: background dashed track + colored completed segments */}
          <svg
            viewBox="0 0 400 1060"
            style={{ display:"block", width:"100%", height:"auto" }}
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Glow for completed path segments */}
              <filter id="segGlow" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="6" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
              {/* Subtle shadow for node circles */}
              <filter id="nodeShadow" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="rgba(0,0,0,0.6)"/>
              </filter>
            </defs>

            {/* ── Full track (dashed, dim) ── */}
            <path
              d={PATH_FULL}
              fill="none"
              stroke="rgba(255,255,255,0.07)"
              strokeWidth="20"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="14 18"
            />

            {/* ── Completed segments (solid, glowing) ── */}
            {PATH_SEGS.map((seg, i) =>
              filled >= i + 2 ? (
                <path key={i} d={seg} fill="none"
                  stroke={SEG_COLORS[i]} strokeWidth="20"
                  strokeLinecap="round" strokeLinejoin="round"
                  opacity="0.88" filter="url(#segGlow)"
                  // Segment i connects node i → i+1. Flash when node i+1 just completed.
                  className={animStep === i + 1 ? "seg-just-done" : ""}
                />
              ) : null
            )}

            {/* ── Node drop-shadow circles (SVG layer, behind HTML nodes) ── */}
            {NODE_POS.map((pos, i) => (
              <circle key={`sh-${i}`}
                cx={pos.left * 4} cy={pos.top * 10.6 + 5}
                r={NODES[i].milestone ? 40 : 34}
                fill="rgba(0,0,0,0.45)"
                filter="url(#nodeShadow)"
              />
            ))}
          </svg>

          {/* ── HTML node overlays ──────────────────────────────────────── */}
          {NODES.map((node, i) => {
            const isSpecial   = isSpecialNode(i);
            const gen         = genForNode(i);
            const isCompleted = isNodeDone(i);
            const isCurrent   = i === currentIdx;
            const pendingShare = pendingShareForNode(i);
            const isLocked    = !isCompleted && !isCurrent;
            const isFinal     = i === NODES.length - 1;
            const pos         = NODE_POS[i];

            const nodeSize    = isSpecial ? 72 : isCurrent ? 72 : isLocked ? 56 : 64;
            const accentColor = isCompleted
              ? (isSpecial ? (node.special?.color || C.yellow) : (gen?.celeb?.color || C.yellow))
              : (isCurrent ? (isSpecial ? (node.special?.color || C.yellow) : C.yellow) : node.hint.color);

            return (
              <div key={i} style={{
                position:"absolute",
                left:`${pos.left}%`, top:`${pos.top}%`,
                transform:"translate(-50%,-50%)",
                zIndex: isCurrent ? 5 : 3,
              }}>
              <div className="camino-node-inner" style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:5 }}>

                {/* Special event label badge (above node) */}
                {isSpecial && (
                  <div style={{
                    background: isCompleted
                      ? `${node.special.color}28` : isCurrent
                      ? `${node.special.color}18` : "rgba(255,255,255,0.04)",
                    border:`1px solid ${isCompleted||isCurrent ? node.special.color+"55" : "rgba(255,255,255,0.07)"}`,
                    borderRadius:20, padding:"3px 10px",
                    fontFamily:"'Oxanium'", fontSize:9, fontWeight:700,
                    letterSpacing:0.7, textTransform:"uppercase", whiteSpace:"nowrap",
                    color: isCompleted||isCurrent ? node.special.color : "rgba(255,255,255,0.18)",
                    marginBottom:2,
                  }}>
                    {node.special.emoji} {node.special.label}
                  </div>
                )}

                {/* Node circle */}
                <div
                  onClick={
                    isCurrent && pendingShare
                      ? () => onResendShare?.(pendingShare)
                      : isCurrent && isSpecial
                        ? () => onClaim(i)
                        : isCurrent
                          ? () => onUpload({ type:"camino", returnTo:"camino", step:currentIdx, hint:node.hint })
                          : undefined
                  }
                  className={
                    animStep === i                ? "node-just-done"    :
                    isCurrent && pendingShare     ? "node-pending-share" :
                    isCurrent                     ? "node-current"      :
                    isFinal && isCompleted        ? "node-final"        : ""
                  }
                  style={{
                    width:nodeSize, height:nodeSize,
                    borderRadius: isSpecial ? "22%" : "50%",
                    overflow:"hidden", position:"relative", flexShrink:0,
                    cursor: isCurrent ? "pointer" : "default",
                    background: isCompleted
                      ? (isSpecial
                          ? `linear-gradient(145deg, ${node.special.color}22, #0d0d14)`
                          : "linear-gradient(145deg,#1e1e34,#111122)")
                      : isCurrent && pendingShare
                        ? `radial-gradient(circle at 40% 35%, ${C.cyan}18, rgba(10,10,22,0.8))`
                      : isCurrent
                        ? (isSpecial
                            ? `radial-gradient(circle at 40% 35%, ${node.special.color}30, rgba(0,0,0,0.5))`
                            : `radial-gradient(circle at 40% 35%, ${C.yellow}28, rgba(0,0,0,0.5))`)
                        : "rgba(255,255,255,0.04)",
                    border: isCompleted
                      ? `3px solid ${accentColor}`
                      : isCurrent && pendingShare
                        ? `2.5px dashed ${C.cyan}88`
                      : isCurrent
                        ? `3.5px solid ${accentColor}`
                        : `2px solid rgba(255,255,255,0.09)`,
                    boxShadow: isCompleted
                      ? `0 0 20px ${accentColor}55, inset 0 1px 0 rgba(255,255,255,0.1)`
                      : isCurrent
                        ? `0 0 28px ${accentColor}35, inset 0 1px 0 rgba(255,255,255,0.1)`
                        : "none",
                    transition:"all 0.3s ease",
                  }}
                >
                  {/* Content */}
                  {isSpecial ? (
                    isCompleted ? (
                      <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:nodeSize*0.44 }}>
                        {node.special.emoji}
                      </div>
                    ) : isCurrent ? (
                      <div style={{ width:"100%", height:"100%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:1 }}>
                        <span style={{ fontSize:nodeSize*0.38, lineHeight:1 }}>{node.special.emoji}</span>
                        <span style={{ fontFamily:"'Oxanium'", fontSize:nodeSize*0.22, fontWeight:900, color:accentColor, lineHeight:1 }}>✨</span>
                      </div>
                    ) : (
                      <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <span style={{ fontSize:nodeSize*0.4, opacity:0.18 }}>{node.special.emoji}</span>
                      </div>
                    )
                  ) : (
                    isCompleted && gen?.thumb ? (
                      <img src={gen.thumb} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"top center" }} />
                    ) : isCompleted ? (
                      <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:nodeSize*0.5 }}>👤</div>
                    ) : isCurrent && pendingShare ? (
                      <div style={{ width:"100%", height:"100%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:1 }}>
                        <span style={{ fontSize:nodeSize*0.32, lineHeight:1 }}>🔗</span>
                        <span style={{ fontFamily:"'Oxanium'", fontSize:nodeSize*0.15, fontWeight:800, color:C.cyan, lineHeight:1, letterSpacing:0.3 }}>SENT</span>
                      </div>
                    ) : isCurrent ? (
                      <div style={{ width:"100%", height:"100%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:1 }}>
                        <span style={{ fontSize:nodeSize*0.38, lineHeight:1 }}>{node.hint.emoji}</span>
                        <span style={{ fontFamily:"'Oxanium'", fontSize:nodeSize*0.24, fontWeight:900, color:C.yellow, lineHeight:1 }}>+</span>
                      </div>
                    ) : (
                      <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <span style={{ fontSize:nodeSize*0.4, opacity:0.2 }}>{node.hint.emoji}</span>
                      </div>
                    )
                  )}

                  {/* % badge — photo nodes only */}
                  {!isSpecial && isCompleted && gen?.celeb?.pct && (
                    <div style={{
                      position:"absolute", top:3, right:3,
                      background:gen.celeb?.color || C.yellow,
                      color:gen.celeb?.color === C.yellow ? C.black : C.white,
                      fontFamily:"'Fredoka'", fontWeight:700, fontSize:9,
                      padding:"2px 5px", borderRadius:6, lineHeight:1.3,
                    }}>{gen.celeb.pct}%</div>
                  )}

                  {/* Lock icon */}
                  {isLocked && (
                    <div style={{ position:"absolute", bottom:3, right:3, fontSize:9, opacity:0.2 }}>🔒</div>
                  )}

                  {/* Sheen */}
                  <div style={{
                    position:"absolute", top:0, left:0, right:0, height:"46%",
                    background:"linear-gradient(180deg,rgba(255,255,255,0.14) 0%,transparent 100%)",
                    borderRadius:"50% 50% 0 0", pointerEvents:"none",
                  }}/>
                </div>

                {/* Node label */}
                <div style={{
                  fontFamily:"'Oxanium'", fontSize:9, fontWeight:700, letterSpacing:0.4,
                  textAlign:"center", whiteSpace:"nowrap",
                  color: isCurrent && pendingShare ? C.cyan
                    : isCompleted ? accentColor
                    : isCurrent ? accentColor
                    : "rgba(255,255,255,0.18)",
                  textShadow: isCompleted||isCurrent ? `0 0 8px ${(isCurrent && pendingShare ? C.cyan : accentColor)}88` : "none",
                  maxWidth:80, overflow:"hidden", textOverflow:"ellipsis",
                }}>
                  {isCurrent && pendingShare
                    ? "Waiting..."
                    : isSpecial
                      ? (isCompleted ? "Claimed!" : isCurrent ? "Tap →" : node.special.label.split(" ")[0])
                      : (isCompleted ? gen?.celeb?.name?.split(" ")[0] ?? node.hint.text : node.hint.text)
                  }
                </div>
              </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Sticky bottom CTA ──────────────────────────────────────────────── */}
      {!isUnlocked && currentIdx !== -1 && (
        <div style={{
          position:"fixed", bottom:0, left:0, right:0, zIndex:200,
          background:"linear-gradient(transparent, rgba(10,10,10,0.97) 38%)",
          padding:`22px 20px calc(28px + env(safe-area-inset-bottom, 0px))`,
          pointerEvents:"none",
        }}>
          <div style={{ maxWidth:480, margin:"0 auto", pointerEvents:"all" }}>
            {isSpecialNode(currentIdx) ? (
              /* Special event — Claim Reward */
              <button onClick={() => onClaim(currentIdx)} style={{
                width:"100%",
                background:`linear-gradient(90deg, ${NODES[currentIdx].special.color}, ${NODES[currentIdx].special.color}cc)`,
                color: NODES[currentIdx].special.color === C.yellow ? C.black : C.white,
                fontFamily:"'Oxanium'", fontWeight:800, fontSize:15,
                padding:"17px", border:`3px solid ${C.black}`,
                borderRadius:16, boxShadow:`4px 4px 0 ${C.black}`,
                cursor:"pointer", letterSpacing:1, textTransform:"uppercase",
                display:"flex", alignItems:"center", justifyContent:"center", gap:10,
              }}>
                ✨ {NODES[currentIdx].special.emoji} Claim — {NODES[currentIdx].special.label}
              </button>
            ) : pendingShareForNode(currentIdx) ? (
              /* Pending share — Resend or Cancel */
              <div style={{ display:"flex", gap:10 }}>
                <button onClick={() => onResendShare?.(pendingShareForNode(currentIdx))} style={{
                  flex:2, padding:"15px",
                  background:C.cyan, color:C.black,
                  fontFamily:"'Oxanium'", fontWeight:800, fontSize:13,
                  border:`3px solid ${C.black}`, borderRadius:14, boxShadow:`3px 3px 0 ${C.black}`,
                  cursor:"pointer", letterSpacing:0.8, textTransform:"uppercase",
                  display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                }}>
                  🔗 Resend Link
                </button>
                <button onClick={() => onCancelShare?.(pendingShareForNode(currentIdx).shareId)} style={{
                  flex:1, padding:"15px",
                  background:"rgba(255,255,255,0.06)", color:"rgba(255,255,255,0.5)",
                  fontFamily:"'Oxanium'", fontWeight:700, fontSize:12,
                  border:"1px solid rgba(255,255,255,0.12)", borderRadius:14,
                  cursor:"pointer", letterSpacing:0.4,
                  display:"flex", alignItems:"center", justifyContent:"center", gap:6,
                }}>
                  ✕ Cancel
                </button>
              </div>
            ) : (
              /* Regular photo node — Upload */
              <button onClick={() => onUpload({ type:"camino", returnTo:"camino", step:currentIdx, hint:NODES[currentIdx]?.hint })} style={{
                width:"100%",
                background:C.yellow, color:C.black,
                fontFamily:"'Oxanium'", fontWeight:800, fontSize:15,
                padding:"17px", border:`3px solid ${C.black}`,
                borderRadius:16, boxShadow:`4px 4px 0 ${C.black}`,
                cursor:"pointer", letterSpacing:1, textTransform:"uppercase",
                display:"flex", alignItems:"center", justifyContent:"center", gap:10,
              }}>
                📸 Upload {NODES[currentIdx]?.hint.emoji} {NODES[currentIdx]?.hint.text}
                <span style={{ fontFamily:"'Oxanium'", fontWeight:400, fontSize:11, opacity:0.55 }}>
                  · step {filled + 1}/{NODES.length}
                </span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Share Link Modal ─────────────────────────────────────────────────────────
function ShareLinkModal({ shareData, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!shareData) return null;

  const { shareUrl, requestContext } = shareData;
  const hint = requestContext?.hint;
  const shareText = `Hey! I want to find your celebrity LookAlike. Take a quick selfie here: ${shareUrl}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* fallback below */ }
  };

  const shareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank");
  };

  const shareSMS = () => {
    window.open(`sms:?body=${encodeURIComponent(shareText)}`, "_self");
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Celebs - Find your LookAlike", text: shareText, url: shareUrl });
      } catch { /* user cancelled */ }
    }
  };

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:500,
      background:"rgba(5,5,18,0.97)", backdropFilter:"blur(24px)",
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      fontFamily:"'Oxanium',sans-serif", padding:24,
    }}>
      {/* Close */}
      <button onClick={onClose} style={{
        position:"absolute", top:16, right:16,
        background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.12)",
        borderRadius:10, padding:"8px 14px", cursor:"pointer",
        fontFamily:"'Oxanium'", fontWeight:600, fontSize:12, color:"rgba(255,255,255,0.5)",
      }}>✕ Close</button>

      <div style={{
        maxWidth:400, width:"100%",
        display:"flex", flexDirection:"column", alignItems:"center", gap:20,
      }}>
        <div style={{ fontSize:52, animation:"uploadPop 0.5s ease-out" }}>🔗</div>

        <div style={{ textAlign:"center" }}>
          <h2 style={{ fontFamily:"'Fredoka'", fontSize:22, fontWeight:700, color:C.white, margin:0 }}>
            Share the Link!
          </h2>
          <p style={{ color:"rgba(255,255,255,0.45)", fontSize:12, marginTop:6, lineHeight:1.5 }}>
            Send this link to{hint ? ` ${hint.emoji} ${hint.text}` : " the person"}.
            They'll take a selfie and you'll get their LookAlike result!
          </p>
        </div>

        {/* Link preview */}
        <div style={{
          width:"100%", background:"rgba(255,255,255,0.04)",
          border:"1px solid rgba(255,255,255,0.10)",
          borderRadius:14, padding:"12px 16px",
          display:"flex", alignItems:"center", gap:10,
        }}>
          <div style={{
            flex:1, fontFamily:"monospace", fontSize:12,
            color:"rgba(255,255,255,0.6)", wordBreak:"break-all",
            overflow:"hidden", textOverflow:"ellipsis",
          }}>{shareUrl}</div>
          <button onClick={copyLink} style={{
            background: copied ? C.green : C.yellow,
            color: C.black, border:"none", borderRadius:8,
            padding:"8px 14px", cursor:"pointer",
            fontFamily:"'Oxanium'", fontWeight:800, fontSize:11,
            whiteSpace:"nowrap", transition:"background 0.2s",
          }}>{copied ? "✓ Copied!" : "Copy"}</button>
        </div>

        {/* Share buttons */}
        <div style={{ display:"flex", gap:10, width:"100%", flexWrap:"wrap" }}>
          <button onClick={shareWhatsApp} style={{
            flex:"1 1 45%", padding:"14px",
            background:"#25D366", color:C.white,
            fontFamily:"'Oxanium'", fontWeight:700, fontSize:13,
            border:"none", borderRadius:14, cursor:"pointer",
            display:"flex", alignItems:"center", justifyContent:"center", gap:8,
          }}>💬 WhatsApp</button>

          <button onClick={shareSMS} style={{
            flex:"1 1 45%", padding:"14px",
            background:"#3478F6", color:C.white,
            fontFamily:"'Oxanium'", fontWeight:700, fontSize:13,
            border:"none", borderRadius:14, cursor:"pointer",
            display:"flex", alignItems:"center", justifyContent:"center", gap:8,
          }}>💬 iMessage / SMS</button>

          {navigator.share && (
            <button onClick={shareNative} style={{
              flex:"1 1 100%", padding:"14px",
              background:"rgba(255,255,255,0.08)", color:C.white,
              fontFamily:"'Oxanium'", fontWeight:700, fontSize:13,
              border:"1px solid rgba(255,255,255,0.15)", borderRadius:14, cursor:"pointer",
              display:"flex", alignItems:"center", justifyContent:"center", gap:8,
            }}>📤 More options...</button>
          )}
        </div>

        {/* Status hint */}
        <div style={{
          background:"rgba(255,229,0,0.06)", border:`1px solid ${C.yellow}33`,
          borderRadius:12, padding:"10px 16px", width:"100%", textAlign:"center",
        }}>
          <div style={{ fontFamily:"'Oxanium'", fontSize:11, color:"rgba(255,255,255,0.5)", lineHeight:1.5 }}>
            You'll see the result in your dashboard once they complete it.
            <br/><span style={{ color:C.yellow, fontWeight:700 }}>The link can only be used once.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Intranet Upload Modal ────────────────────────────────────────────────────
// ctx shape: { type:"camino"|"dice"|"free", returnTo:"camino"|"dashboard",
//              step?:number, hint?:{ emoji, text, color } }
function IntranetUploadModal({ ctx, onClose, onReady, onShareRequest }) {
  const [phase, setPhase]       = useState("idle"); // idle|validating|ready|error
  const [preview, setPreview]   = useState(null);
  const [msgIdx, setMsgIdx]     = useState(0);
  const [dragging, setDragging] = useState(false);
  const intervalRef = useRef(null);
  const fileRef     = useRef(null);
  const camRef      = useRef(null);

  const MSGS = ["Detecting face…", "Mapping landmarks…", "Almost ready…"];

  useEffect(() => {
    if (phase === "validating") {
      intervalRef.current = setInterval(() => setMsgIdx(i => (i + 1) % MSGS.length), 800);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [phase]);

  const processFile = async (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setPhase("validating");
    setPreview(null);
    const url = URL.createObjectURL(file);
    try {
      const res = await detectAndCropFace(url);
      URL.revokeObjectURL(url);
      if (res.found) { setPreview(res.croppedUrl); setPhase("ready"); }
      else           { setPhase("error"); }
    } catch {
      URL.revokeObjectURL(url);
      setPhase("error");
    }
  };

  const onFileInput = (e) => processFile(e.target.files?.[0]);
  const onDrop      = (e) => { e.preventDefault(); setDragging(false); processFile(e.dataTransfer.files?.[0]); };
  const retry       = () => { setPhase("idle"); setPreview(null); setMsgIdx(0); };

  // Context display strings
  const ctxTitle = ctx?.type === "camino"
    ? `🌟 Camino · Step ${(ctx.step ?? 0) + 1} of 10`
    : ctx?.type === "dice"
      ? `🎲 Dice Roll`
      : `📸 New Photo`;
  const ctxSub = ctx?.hint
    ? `Upload a photo of ${ctx.hint.emoji} ${ctx.hint.text}`
    : "Upload any photo with a face";

  const accentColor = ctx?.hint?.color || C.yellow;

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:400,
      background:"rgba(5,5,18,0.97)", backdropFilter:"blur(24px)",
      display:"flex", flexDirection:"column",
      fontFamily:"'Oxanium',sans-serif", overflowY:"auto",
    }}>
      <style>{`
        @keyframes uploadShake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-6px)} 40%,80%{transform:translateX(6px)} }
        @keyframes uploadPop { 0%{transform:scale(0.8);opacity:0} 60%{transform:scale(1.05)} 100%{transform:scale(1);opacity:1} }
        @keyframes spin { to{transform:rotate(360deg)} }
        .upload-shake { animation: uploadShake 0.4s ease; }
        .upload-pop   { animation: uploadPop 0.45s cubic-bezier(0.34,1.56,0.64,1) both; }
      `}</style>

      {/* Close bar */}
      <div style={{ padding:"14px 20px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div style={{ fontFamily:"'Fredoka'", fontSize:16, fontWeight:700, color:"rgba(255,255,255,0.5)" }}>
          Upload Photo
        </div>
        <button onClick={onClose} style={{
          background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.12)",
          borderRadius:10, padding:"8px 14px", cursor:"pointer",
          fontFamily:"'Oxanium'", fontWeight:600, fontSize:12, color:"rgba(255,255,255,0.5)",
        }}>✕ Cancel</button>
      </div>

      {/* Main content */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"12px 24px 48px", gap:24, maxWidth:480, margin:"0 auto", width:"100%" }}>

        {/* Context badge */}
        <div style={{
          background:`${accentColor}14`,
          border:`1.5px solid ${accentColor}44`,
          borderRadius:20, padding:"10px 20px", textAlign:"center",
          animation:"uploadPop 0.4s ease-out",
        }}>
          <div style={{ fontFamily:"'Fredoka'", fontSize:16, fontWeight:700, color:accentColor, lineHeight:1 }}>
            {ctxTitle}
          </div>
          <div style={{ fontFamily:"'Oxanium'", fontSize:11, color:"rgba(255,255,255,0.45)", marginTop:4 }}>
            {ctxSub}
          </div>
        </div>

        {/* ── IDLE: drop zone + buttons ── */}
        {phase === "idle" && (
          <>
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => fileRef.current?.click()}
              style={{
                width:"100%", aspectRatio:"1/1", maxHeight:300,
                borderRadius:24,
                border:`2.5px dashed ${dragging ? accentColor : "rgba(255,255,255,0.15)"}`,
                background: dragging ? `${accentColor}0e` : "rgba(255,255,255,0.03)",
                display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
                gap:14, cursor:"pointer", transition:"all 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor=accentColor; e.currentTarget.style.background=`${accentColor}0a`; }}
              onMouseLeave={e => { if (!dragging) { e.currentTarget.style.borderColor="rgba(255,255,255,0.15)"; e.currentTarget.style.background="rgba(255,255,255,0.03)"; } }}
            >
              <div style={{ fontSize:54, lineHeight:1 }}>{ctx?.hint?.emoji || "📸"}</div>
              <div style={{ textAlign:"center" }}>
                <div style={{ fontFamily:"'Fredoka'", fontSize:18, fontWeight:700, color:C.white }}>
                  Drop photo here
                </div>
                <div style={{ fontFamily:"'Oxanium'", fontSize:11, color:"rgba(255,255,255,0.3)", marginTop:4 }}>
                  or tap to choose from gallery
                </div>
              </div>
            </div>

            <div style={{ display:"flex", gap:12, width:"100%" }}>
              <button onClick={() => fileRef.current?.click()} style={{
                flex:1, padding:"14px 0",
                background:accentColor, color:accentColor===C.yellow?C.black:C.white,
                fontFamily:"'Oxanium'", fontWeight:800, fontSize:13,
                border:`2px solid ${C.black}`, borderRadius:14, boxShadow:`3px 3px 0 ${C.black}`,
                cursor:"pointer", letterSpacing:0.8, textTransform:"uppercase",
                display:"flex", alignItems:"center", justifyContent:"center", gap:8,
              }}>📁 Gallery</button>
              <button onClick={() => camRef.current?.click()} style={{
                flex:1, padding:"14px 0",
                background:"rgba(255,255,255,0.08)", color:C.white,
                fontFamily:"'Oxanium'", fontWeight:700, fontSize:13,
                border:"1px solid rgba(255,255,255,0.18)", borderRadius:14,
                cursor:"pointer", letterSpacing:0.8, textTransform:"uppercase",
                display:"flex", alignItems:"center", justifyContent:"center", gap:8,
              }}>📷 Camera</button>
            </div>

            {/* "Ask someone else" — only for Camino/Dice (not free uploads) */}
            {getFlag("VIRAL_SHARE") && onShareRequest && ctx?.type !== "free" && ctx?.hint && (
              <button onClick={() => onShareRequest(ctx)} style={{
                width:"100%", padding:"12px",
                background:"transparent",
                border:"1.5px dashed rgba(255,255,255,0.15)",
                borderRadius:14, cursor:"pointer",
                fontFamily:"'Oxanium'", fontWeight:600, fontSize:12,
                color:"rgba(255,255,255,0.5)", letterSpacing:0.3,
                display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                transition:"all 0.2s",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor="rgba(255,255,255,0.35)"; e.currentTarget.style.color="rgba(255,255,255,0.8)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor="rgba(255,255,255,0.15)"; e.currentTarget.style.color="rgba(255,255,255,0.5)"; }}
              >
                🔗 Ask them to send their own selfie
              </button>
            )}

            <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={onFileInput} />
            <input ref={camRef} type="file" accept="image/*" capture="user" style={{ display:"none" }} onChange={onFileInput} />
          </>
        )}

        {/* ── VALIDATING ── */}
        {phase === "validating" && (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:20, padding:"40px 0" }}>
            <div style={{
              width:80, height:80, borderRadius:"50%",
              border:`3px solid rgba(255,255,255,0.08)`,
              borderTopColor: accentColor,
              animation:"spin 0.9s linear infinite",
            }} />
            <div style={{ fontFamily:"'Fredoka'", fontSize:20, fontWeight:700, color:C.white, textAlign:"center" }}>
              {MSGS[msgIdx]}
            </div>
            <div style={{ fontFamily:"'Oxanium'", fontSize:11, color:"rgba(255,255,255,0.3)", textAlign:"center" }}>
              Scanning for a face in your photo
            </div>
          </div>
        )}

        {/* ── READY ── */}
        {phase === "ready" && preview && (
          <div className="upload-pop" style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:20, width:"100%" }}>

            {/* Photo preview with prominent × to swap it */}
            <div style={{ position:"relative", display:"inline-block" }}>
              <div style={{
                width:200, height:200, borderRadius:24, overflow:"hidden",
                border:`3px solid ${accentColor}`,
                boxShadow:`0 0 40px ${accentColor}44`,
              }}>
                <img src={preview} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"top center" }} />
              </div>

              {/* × remove button — always visible, top-right corner */}
              <button
                onClick={retry}
                title="Remove and upload another"
                style={{
                  position:"absolute", top:-10, right:-10,
                  width:32, height:32, borderRadius:"50%",
                  background:C.pink, color:C.white,
                  border:`2px solid ${C.black}`,
                  boxShadow:`2px 2px 0 ${C.black}`,
                  cursor:"pointer", fontSize:14, fontWeight:900,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  fontFamily:"'Oxanium'", lineHeight:1,
                  transition:"transform 0.15s",
                }}
                onMouseEnter={e => e.currentTarget.style.transform="scale(1.15)"}
                onMouseLeave={e => e.currentTarget.style.transform="scale(1)"}
              >✕</button>

              {/* ✓ detected badge — bottom-left corner */}
              <div style={{
                position:"absolute", bottom:-10, left:-10,
                background:C.green, borderRadius:20,
                padding:"4px 10px",
                border:`2px solid ${C.black}`,
                boxShadow:`2px 2px 0 ${C.black}`,
                display:"flex", alignItems:"center", gap:5,
              }}>
                <span style={{ fontSize:10, color:C.white, fontWeight:900 }}>✓</span>
                <span style={{ fontFamily:"'Oxanium'", fontSize:10, fontWeight:700, color:C.white }}>Face detected</span>
              </div>
            </div>

            {/* Start Scan CTA */}
            <button onClick={() => onReady(preview)} style={{
              width:"100%", padding:"17px",
              background:C.yellow, color:C.black,
              fontFamily:"'Oxanium'", fontWeight:800, fontSize:15,
              border:`3px solid ${C.black}`, borderRadius:16, boxShadow:`4px 4px 0 ${C.black}`,
              cursor:"pointer", letterSpacing:1, textTransform:"uppercase",
              display:"flex", alignItems:"center", justifyContent:"center", gap:10,
              marginTop:8,
            }}>
              ✨ Start Scan
            </button>
          </div>
        )}

        {/* ── ERROR ── */}
        {phase === "error" && (
          <div className="upload-pop" style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:20, width:"100%" }}>
            <div style={{ fontSize:56 }}>😕</div>
            <div style={{ textAlign:"center" }}>
              <div style={{ fontFamily:"'Fredoka'", fontSize:22, fontWeight:700, color:C.pink }}>
                No face detected
              </div>
              <div style={{ fontFamily:"'Oxanium'", fontSize:12, color:"rgba(255,255,255,0.4)", marginTop:8, lineHeight:1.6 }}>
                Try a clear, well-lit photo<br/>where the face is visible
              </div>
            </div>
            <button onClick={retry} style={{
              width:"100%", padding:"15px",
              background:"rgba(255,255,255,0.08)",
              border:"1px solid rgba(255,255,255,0.18)",
              borderRadius:14, cursor:"pointer",
              fontFamily:"'Oxanium'", fontWeight:700, fontSize:13,
              color:C.white, letterSpacing:0.8, textTransform:"uppercase",
            }}>↩ Try Again</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Shared card shell styles ─────────────────────────────────────────────────
// All special cards (Camino, Dice, Album) share these base styles.
const CARD_BASE = {
  background: "linear-gradient(145deg,#111118 0%,#0d0d14 100%)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 20, overflow: "hidden",
  display: "flex", flexDirection: "column",
  transition: "transform 0.2s, box-shadow 0.2s",
};
const cardHoverOn  = e => { e.currentTarget.style.transform="translateY(-4px)"; e.currentTarget.style.boxShadow="0 12px 36px rgba(0,0,0,0.45)"; };
const cardHoverOff = e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="none"; };

// Small 24×24 icon button used in all card footers
function CardBtn({ onClick, children, color = C.yellow, disabled = false, title }) {
  return (
    <div
      title={title}
      onClick={disabled ? undefined : onClick}
      style={{
        width:24, height:24, borderRadius:7, flexShrink:0,
        background: disabled ? "rgba(255,255,255,0.04)" : `${color}22`,
        border: `1px solid ${disabled ? "rgba(255,255,255,0.06)" : color + "44"}`,
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize:12, cursor: disabled ? "default" : "pointer",
        color: disabled ? "rgba(255,255,255,0.2)" : color,
        transition:"all 0.15s",
        userSelect:"none",
      }}
    >{children}</div>
  );
}

// Footer strip shared by all special cards
function CardFooter({ title, sub, right }) {
  return (
    <div style={{
      padding:"8px 12px",
      borderTop:"1px solid rgba(255,255,255,0.06)",
      display:"flex", alignItems:"center", justifyContent:"space-between",
    }}>
      <div>
        <div style={{ fontFamily:"'Fredoka'", fontSize:14, fontWeight:700, color:"rgba(255,255,255,0.82)", lineHeight:1 }}>
          {title}
        </div>
        <div style={{ fontFamily:"'Oxanium'", fontSize:9, color:"rgba(255,255,255,0.28)", marginTop:2, letterSpacing:0.3 }}>
          {sub}
        </div>
      </div>
      <div style={{ display:"flex", gap:5, alignItems:"center" }}>{right}</div>
    </div>
  );
}

// ─── Dice CTA card ────────────────────────────────────────────────────────────
function DiceCard({ onUpload }) {
  const [phase, setPhase]     = useState("idle");
  const [current, setCurrent] = useState(DICE_OPTIONS[0]);
  const [result, setResult]   = useState(null);
  const rollRef               = useRef(null);

  const roll = useCallback((e) => {
    if (e) e.stopPropagation();
    if (phase === "rolling") return;
    setPhase("rolling");
    setResult(null);
    const TOTAL_MS  = 1400;
    const intervals = [60, 60, 80, 80, 100, 120, 140, 160, 200];
    let elapsed = 0, idx = 0;
    const tick = () => {
      setCurrent(DICE_OPTIONS[Math.floor(Math.random() * DICE_OPTIONS.length)]);
      elapsed += intervals[Math.min(idx, intervals.length - 1)];
      idx++;
      if (elapsed < TOTAL_MS) {
        rollRef.current = setTimeout(tick, intervals[Math.min(idx, intervals.length - 1)]);
      } else {
        const winner = DICE_OPTIONS[Math.floor(Math.random() * DICE_OPTIONS.length)];
        setCurrent(winner); setResult(winner); setPhase("landed");
      }
    };
    rollRef.current = setTimeout(tick, intervals[0]);
  }, [phase]);

  useEffect(() => () => clearTimeout(rollRef.current), []);
  const reset = (e) => { e.stopPropagation(); setPhase("idle"); setResult(null); setCurrent(DICE_OPTIONS[0]); };

  const accent = phase === "landed" && result ? result.color : C.yellow;

  return (
    <div style={{ ...CARD_BASE, borderColor: `${accent}28`, boxShadow: phase==="landed" ? `0 0 20px ${accent}12` : "none" }}
      onMouseEnter={cardHoverOn} onMouseLeave={cardHoverOff}>
      <style>{`
        @keyframes diceSpin  { 0%{transform:rotate(0)scale(1)} 25%{transform:rotate(12deg)scale(1.1)} 75%{transform:rotate(-12deg)scale(1.1)} 100%{transform:rotate(0)scale(1)} }
        @keyframes landedPop { 0%{transform:scale(0.6);opacity:0} 65%{transform:scale(1.1)} 100%{transform:scale(1);opacity:1} }
        .dice-rolling { animation: diceSpin 0.13s ease-in-out infinite; }
        .dice-landed  { animation: landedPop 0.4s cubic-bezier(0.34,1.56,0.64,1) both; }
      `}</style>

      {/* Visual area */}
      <div
        onClick={phase === "idle" ? roll : phase === "landed" ? reset : undefined}
        style={{
          position:"relative", aspectRatio:"1/1", overflow:"hidden",
          display:"flex", alignItems:"center", justifyContent:"center",
          background:`radial-gradient(circle at 50% 50%, ${accent}0d, #0d0d14 68%)`,
          transition:"background 0.4s",
          cursor: phase === "rolling" ? "default" : "pointer",
        }}>
        {/* Idle */}
        {phase === "idle" && (
          <div style={{ fontSize:44, lineHeight:1 }}>🎲</div>
        )}
        {/* Rolling */}
        {phase === "rolling" && (
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
            <div className="dice-rolling" style={{ fontSize:44, lineHeight:1 }}>{current.emoji}</div>
            <div style={{ fontFamily:"'Oxanium'", fontSize:10, color:"rgba(255,255,255,0.3)", letterSpacing:1 }}>rolling…</div>
          </div>
        )}
        {/* Landed */}
        {phase === "landed" && result && (
          <div className="dice-landed" style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:10, width:"100%", padding:"0 12px" }}>
            {/* Banner top */}
            <div style={{
              fontFamily:"'Oxanium'", fontSize:10, fontWeight:700,
              color:"rgba(255,255,255,0.35)", letterSpacing:0.6, textAlign:"center",
              textTransform:"uppercase",
            }}>Time to upload a photo of…</div>
            {/* Result */}
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{
                width:48, height:48, borderRadius:"50%", fontSize:24, flexShrink:0,
                background:`${result.color}20`, border:`2px solid ${result.color}`,
                display:"flex", alignItems:"center", justifyContent:"center",
                boxShadow:`0 0 16px ${result.color}40`,
              }}>{result.emoji}</div>
              <div style={{ fontFamily:"'Fredoka'", fontSize:18, fontWeight:700, color:result.color, lineHeight:1.1 }}>
                {result.text}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <CardFooter
        title="Dice Roll"
        sub={phase === "rolling" ? "rolling…" : phase === "landed" && result ? result.text : "random pick"}
        right={phase === "landed" && result ? (
          <>
            <CardBtn onClick={() => onUpload({ type:"dice", returnTo:"dashboard", hint:result })} color={result.color} title="Upload photo">→</CardBtn>
            <CardBtn onClick={reset} color="rgba(255,255,255,0.4)" title="Re-roll">🎲</CardBtn>
          </>
        ) : (
          <CardBtn onClick={roll} disabled={phase === "rolling"} color={C.yellow} title="Roll">🎲</CardBtn>
        )}
      />
    </div>
  );
}

// ─── Label taxonomy ──────────────────────────────────────────────────────────
export const LABELS = [
  { id: "me",      emoji: "🙋",  text: "It's me",       color: C.cyan,   subs: null },
  { id: "family",  emoji: "👨‍👩‍👧",  text: "Family",        color: C.pink,   subs: [
    { id: "dad",      emoji: "👨",  text: "Dad" },
    { id: "mom",      emoji: "👩",  text: "Mom" },
    { id: "brother",  emoji: "👦",  text: "Brother" },
    { id: "sister",   emoji: "👧",  text: "Sister" },
    { id: "son",      emoji: "👶",  text: "Son" },
    { id: "daughter", emoji: "👶",  text: "Daughter" },
  ]},
  { id: "friend",  emoji: "👫",  text: "Friend",        color: C.green,  subs: null },
  { id: "teacher", emoji: "📚",  text: "Teacher",       color: C.purple, subs: null },
  { id: "work",    emoji: "💼",  text: "Work",          color: C.blue,   subs: [
    { id: "colleague", emoji: "🧑‍💻", text: "Colleague" },
    { id: "boss",      emoji: "👔",  text: "Boss" },
  ]},
  { id: "love",    emoji: "💘",  text: "Platonic Love", color: "#FF6B9D", subs: null },
];

function getLabelInfo(labelId, labelSub) {
  const group = LABELS.find(l => l.id === labelId);
  if (!group) return null;
  if (labelSub && group.subs) {
    const sub = group.subs.find(s => s.id === labelSub);
    if (sub) return { emoji: sub.emoji, text: sub.text, color: group.color };
  }
  return { emoji: group.emoji, text: group.text, color: group.color };
}

// ─── Label picker ────────────────────────────────────────────────────────────
function LabelPicker({ genId, label, labelSub, onUpdate }) {
  const [open, setOpen] = useState(false);
  const [subOf, setSubOf] = useState(null); // label id whose subs are showing

  const current = getLabelInfo(label, labelSub);

  const pick = (lId, sId = null) => {
    updateLabel(genId, lId, sId);
    onUpdate(lId, sId);
    setOpen(false);
    setSubOf(null);
  };

  const clear = (e) => {
    e.stopPropagation();
    updateLabel(genId, null, null);
    onUpdate(null, null);
  };

  return (
    <div style={{ position: "relative" }}>
      {/* Current label badge / add button */}
      {current ? (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div
            onClick={() => { setOpen(o => !o); setSubOf(null); }}
            style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              background: `${current.color}22`, border: `1px solid ${current.color}55`,
              borderRadius: 20, padding: "4px 10px", cursor: "pointer",
              fontFamily: "'Oxanium'", fontSize: 11, fontWeight: 700, color: current.color,
              transition: "all 0.2s",
            }}
          >
            {current.emoji} {current.text}
          </div>
          <button onClick={clear} style={{
            background: "rgba(255,255,255,0.08)", border: "none",
            borderRadius: "50%", width: 20, height: 20, cursor: "pointer",
            color: "rgba(255,255,255,0.4)", fontSize: 10, display: "flex",
            alignItems: "center", justifyContent: "center",
          }}>✕</button>
        </div>
      ) : (
        <button
          onClick={() => { setOpen(o => !o); setSubOf(null); }}
          style={{
            background: "rgba(255,255,255,0.06)", border: "1px dashed rgba(255,255,255,0.2)",
            borderRadius: 20, padding: "4px 12px", cursor: "pointer",
            fontFamily: "'Oxanium'", fontSize: 11, fontWeight: 600,
            color: "rgba(255,255,255,0.4)", display: "flex", alignItems: "center", gap: 5,
          }}
        >
          + Who is this?
        </button>
      )}

      {/* Dropdown */}
      {open && (
        <div style={{
          position: "absolute", bottom: "calc(100% + 8px)", left: 0,
          background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 16, padding: 10, zIndex: 200, minWidth: 220,
          boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
          animation: "fadeIn 0.15s ease",
        }}>
          {subOf ? (
            /* Sub-picker */
            <>
              <button onClick={() => setSubOf(null)} style={{
                background: "none", border: "none", color: "rgba(255,255,255,0.4)",
                fontFamily: "'Oxanium'", fontSize: 11, cursor: "pointer",
                padding: "0 0 8px 0", display: "flex", alignItems: "center", gap: 4,
              }}>← Back</button>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {LABELS.find(l => l.id === subOf)?.subs.map(sub => (
                  <button key={sub.id} onClick={() => pick(subOf, sub.id)} style={{
                    background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: 10, padding: "6px 12px", cursor: "pointer",
                    fontFamily: "'Oxanium'", fontSize: 12, fontWeight: 600, color: C.white,
                    display: "flex", alignItems: "center", gap: 5,
                  }}>{sub.emoji} {sub.text}</button>
                ))}
              </div>
            </>
          ) : (
            /* Main picker */
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {LABELS.map(l => (
                <button key={l.id} onClick={() => l.subs ? setSubOf(l.id) : pick(l.id)} style={{
                  background: label === l.id ? `${l.color}22` : "transparent",
                  border: `1px solid ${label === l.id ? l.color + "55" : "transparent"}`,
                  borderRadius: 10, padding: "8px 12px", cursor: "pointer",
                  fontFamily: "'Oxanium'", fontSize: 12, fontWeight: 600,
                  color: label === l.id ? l.color : C.white,
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  textAlign: "left",
                }}>
                  <span>{l.emoji} {l.text}</span>
                  {l.subs && <span style={{ opacity: 0.4, fontSize: 10 }}>▶</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── The Album — SOON card + modal ───────────────────────────────────────────

function AlbumModal({ onClose }) {
  const amber = "#F59E0B";
  return (
    <div
      style={{
        position:"fixed", inset:0, zIndex:600,
        background:"rgba(5,5,18,0.88)", backdropFilter:"blur(18px)",
        display:"flex", alignItems:"center", justifyContent:"center",
        padding:"20px 16px",
      }}
      onClick={onClose}
    >
      <style>{`
        @keyframes albumModalIn {
          from { opacity:0; transform:scale(0.85) translateY(16px); }
          to   { opacity:1; transform:scale(1)    translateY(0);     }
        }
      `}</style>
      <div
        style={{
          background:"linear-gradient(145deg,#1a1008 0%,#130e0a 100%)",
          border:`1px solid ${amber}30`,
          borderRadius:24, padding:"28px 24px",
          maxWidth:400, width:"100%",
          boxShadow:`0 0 60px ${amber}0c, 0 24px 64px rgba(0,0,0,0.7)`,
          animation:"albumModalIn 0.38s cubic-bezier(0.34,1.56,0.64,1) both",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:22 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ fontSize:38, lineHeight:1 }}>🎞️</div>
            <div>
              <div style={{ fontFamily:"'Fredoka'", fontSize:28, fontWeight:700, color:amber, lineHeight:1 }}>
                The Album
              </div>
              <div style={{
                display:"inline-block", marginTop:5,
                background:`${amber}18`, border:`1px solid ${amber}40`,
                borderRadius:6, padding:"2px 8px",
                fontFamily:"'Oxanium'", fontSize:9, fontWeight:800,
                color:amber, letterSpacing:1.8,
              }}>COMING SOON</div>
            </div>
          </div>
          <button onClick={onClose} style={{
            background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.10)",
            borderRadius:8, padding:"6px 10px", cursor:"pointer",
            fontFamily:"'Oxanium'", fontSize:11, color:"rgba(255,255,255,0.45)",
          }}>✕</button>
        </div>

        {/* Pitch */}
        <p style={{
          fontFamily:"'Oxanium'", fontSize:14, lineHeight:1.75,
          color:"rgba(255,255,255,0.65)", margin:"0 0 20px",
        }}>
          Create a <strong style={{ color:amber }}>group album</strong> for any crew — your class of 2010, your company team, your CrossFit box, your family — and scan every face in it.
        </p>

        {/* How it works steps */}
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {[
            { emoji:"👥", text:"Add your people to an album" },
            { emoji:"🔍", text:"Scan each person's celebrity lookalike" },
            { emoji:"🎬", text:"See your album vs. the celebrity twin album side by side" },
            { emoji:"🤩", text:"Share the collective result — and go viral" },
          ].map((step, i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{
                width:34, height:34, borderRadius:10, flexShrink:0,
                background:`${amber}12`, border:`1px solid ${amber}22`,
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:17,
              }}>{step.emoji}</div>
              <span style={{ fontFamily:"'Oxanium'", fontSize:13, color:"rgba(255,255,255,0.55)", lineHeight:1.4 }}>
                {step.text}
              </span>
            </div>
          ))}
        </div>

        {/* Notify strip */}
        <div style={{
          marginTop:22, padding:"14px 16px",
          background:`${amber}09`, border:`1px solid ${amber}18`,
          borderRadius:14, textAlign:"center",
        }}>
          <div style={{ fontFamily:"'Fredoka'", fontSize:15, color:`${amber}99`, lineHeight:1.4 }}>
            🔔 We'll let you know when The Album drops
          </div>
        </div>
      </div>
    </div>
  );
}

function AlbumCard() {
  const [open, setOpen] = useState(false);
  const amber = "#F59E0B";

  return (
    <>
      {open && <AlbumModal onClose={() => setOpen(false)} />}
      <div
        onClick={() => setOpen(true)}
        style={{ ...CARD_BASE, borderColor:`${amber}22`, cursor:"pointer" }}
        onMouseEnter={e => { cardHoverOn(e); e.currentTarget.style.borderColor=`${amber}44`; }}
        onMouseLeave={e => { cardHoverOff(e); e.currentTarget.style.borderColor=`${amber}22`; }}
      >
        {/* Visual area */}
        <div style={{
          position:"relative", aspectRatio:"1/1", overflow:"hidden",
          display:"flex", alignItems:"center", justifyContent:"center",
          background:`radial-gradient(circle at 50% 50%, ${amber}0a, #0d0d14 68%)`,
        }}>
          {/* SOON badge — top right */}
          <div style={{
            position:"absolute", top:8, right:8,
            background:`${amber}18`, border:`1px solid ${amber}40`,
            borderRadius:6, padding:"2px 7px",
            fontFamily:"'Oxanium'", fontSize:8, fontWeight:800,
            color:amber, letterSpacing:1.5,
          }}>SOON</div>

          {/* Central icon */}
          <div style={{ fontSize:44, lineHeight:1, opacity:0.75 }}>🎞️</div>
        </div>

        {/* Footer */}
        <CardFooter
          title="The Album"
          sub="group lookalikes"
          right={
            <CardBtn onClick={() => setOpen(true)} color={amber} title="Learn more">→</CardBtn>
          }
        />
      </div>
    </>
  );
}

// ─── Shared Generation Card ──────────────────────────────────────────────────
function SharedGenCard({ req, onView, onDismiss, onResend, onCancel }) {
  const isPending   = req.status === "pending";
  const isNew       = req.status === "completed" && !req.notificationSeen;
  const hint        = req.requestContext?.hint;
  const accentColor = hint?.color || C.cyan;

  const handleClick = () => {
    if (isPending) return;
    if (isNew) {
      markNotificationSeen(req.shareId);
      onDismiss?.();
    }
    if (req.result) onView(req);
  };

  return (
    <div
      onClick={handleClick}
      style={{
        borderRadius: 18, overflow: "hidden", position: "relative",
        background: isPending
          ? "linear-gradient(155deg, #0d1029, #151a3a)"
          : `linear-gradient(155deg, ${accentColor}11, ${accentColor}08)`,
        border: isNew
          ? `2px solid ${C.green}`
          : isPending
            ? `1.5px dashed ${C.cyan}33`
            : `1.5px solid ${accentColor}33`,
        cursor: isPending ? "default" : "pointer",
        minHeight: 180,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: 14, gap: 6, textAlign: "center",
        transition: "all 0.2s",
      }}
    >
      {/* Notification badge */}
      {isNew && (
        <div style={{
          position: "absolute", top: 8, right: 8,
          background: C.green, borderRadius: 20,
          padding: "3px 8px", display: "flex", alignItems: "center", gap: 4,
        }}>
          <span style={{ fontSize: 8 }}>🔔</span>
          <span style={{ fontFamily: "'Oxanium'", fontSize: 8, fontWeight: 800, color: C.white }}>NEW</span>
        </div>
      )}

      <div style={{ fontSize: isPending ? 28 : 36 }}>
        {isPending ? "🔗" : "🎉"}
      </div>

      <div style={{ fontFamily: "'Fredoka'", fontSize: 12, fontWeight: 700, color: C.white, lineHeight: 1.2 }}>
        {isPending ? "Waiting for selfie..." : "LookAlike Ready!"}
      </div>

      {hint && (
        <div style={{
          fontFamily: "'Oxanium'", fontSize: 10, fontWeight: 600,
          color: "rgba(255,255,255,0.4)",
          display: "flex", alignItems: "center", gap: 4,
        }}>
          <span>{hint.emoji}</span> {hint.text}
        </div>
      )}

      {isPending && (
        <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
          <button
            onClick={(e) => { e.stopPropagation(); onResend?.(req); }}
            style={{
              background: C.cyan, color: C.black, border: "none",
              borderRadius: 7, padding: "5px 10px", cursor: "pointer",
              fontFamily: "'Oxanium'", fontWeight: 800, fontSize: 9, letterSpacing: 0.3,
            }}
          >Resend</button>
          <button
            onClick={(e) => { e.stopPropagation(); onCancel?.(req.shareId); }}
            style={{
              background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.4)",
              border: "1px solid rgba(255,255,255,0.10)",
              borderRadius: 7, padding: "5px 10px", cursor: "pointer",
              fontFamily: "'Oxanium'", fontWeight: 600, fontSize: 9,
            }}
          >Cancel</button>
        </div>
      )}

      {!isPending && req.result?.celeb && (
        <div style={{
          display: "flex", alignItems: "center", gap: 6, marginTop: 4,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%", overflow: "hidden",
            border: `2px solid ${req.result.celeb.color || C.yellow}`,
          }}>
            <img
              src={req.result.celeb.img} alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontFamily: "'Oxanium'", fontSize: 10, fontWeight: 700, color: C.white }}>
              {req.result.celeb.name}
            </div>
            <div style={{
              fontFamily: "'Fredoka'", fontSize: 12, fontWeight: 700,
              color: req.result.celeb.color || C.yellow,
            }}>
              {req.result.celeb.pct}%
            </div>
          </div>
        </div>
      )}

      {/* "Generated by 3rd party" tag */}
      {!isPending && (
        <div style={{
          fontFamily: "'Oxanium'", fontSize: 8, fontWeight: 600,
          color: accentColor, letterSpacing: 0.5,
          background: `${accentColor}15`, borderRadius: 20,
          padding: "2px 8px", marginTop: 2,
        }}>
          📩 VIA SHARED LINK
        </div>
      )}
    </div>
  );
}

// ─── Generation card ─────────────────────────────────────────────────────────
function GenCard({ gen, onView, onLabelUpdate }) {
  const [labelState, setLabelState] = useState({ label: gen.label, sub: gen.labelSub });
  const [pickerOpen, setPickerOpen] = useState(false);
  const [subOf, setSubOf]           = useState(null);

  // ── Premium gating: any Doppelganger-tier match (≥90%) stays locked
  // until the user goes Premium. Blurred preview + reveal CTA.
  const subscription = useAppStore(s => s.subscription);
  const premium      = isPremium(subscription);
  const pct          = gen.celeb?.pct ?? 0;
  const locked       = !premium && pct >= 90;

  const current = getLabelInfo(labelState.label, labelState.sub);

  const pick = (lId, sId = null) => {
    updateLabel(gen.id, lId, sId);
    setLabelState({ label: lId, sub: sId });
    onLabelUpdate();
    setPickerOpen(false);
    setSubOf(null);
  };

  const dateStr = new Date(gen.createdAt).toLocaleDateString("en-GB", { day:"numeric", month:"short" });

  return (
    <div style={{
      background: "#111122", border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 20, overflow: "hidden",
      display: "flex", flexDirection: "column",
      transition: "transform 0.2s, box-shadow 0.2s",
    }}
    onMouseEnter={e => { e.currentTarget.style.transform="translateY(-4px)"; e.currentTarget.style.boxShadow="0 12px 40px rgba(0,0,0,0.4)"; }}
    onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="none"; }}
    >
      {/* ── Photo area with morph boomerang ── */}
      <div style={{ position:"relative", aspectRatio:"1/1", overflow:"hidden", cursor:"pointer" }}
        onClick={() => onView(gen)}>
        <div style={{
          width:"100%", height:"100%",
          filter: locked ? "blur(22px) saturate(0.7) brightness(0.65)" : "none",
          transform: locked ? "scale(1.12)" : "none",
          transition: "filter 0.3s",
        }}>
          {gen.thumb && gen.celeb?.img ? (
            <MorphBoomerang
              userPhoto={gen.preview || gen.thumb}
              celebPhoto={gen.celeb.img}
            />
          ) : gen.thumb ? (
            <img src={gen.thumb} alt="your photo"
              style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"center center", display:"block" }} />
          ) : (
            <div style={{ width:"100%", height:"100%", background:"#1a1a2e", display:"flex", alignItems:"center", justifyContent:"center", fontSize:40 }}>👤</div>
          )}
        </div>

        {/* Gradient overlay */}
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(0,0,0,0.88) 0%, transparent 52%)" }} />

        {/* ── Premium lock overlay (only when locked) ── */}
        {locked && (
          <div style={{
            position:"absolute", inset:0, zIndex:3,
            display:"flex", flexDirection:"column",
            alignItems:"center", justifyContent:"center",
            gap:8, padding:14, textAlign:"center",
            background: `radial-gradient(circle at center, rgba(0,0,0,0.45), rgba(0,0,0,0.78))`,
          }}>
            <div style={{
              width:48, height:48, borderRadius:"50%",
              background:`${C.yellow}22`,
              border:`1.5px solid ${C.yellow}88`,
              display:"flex", alignItems:"center", justifyContent:"center",
              boxShadow:`0 0 28px ${C.yellow}33`,
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                stroke={C.yellow} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="11" width="16" height="10" rx="2" />
                <path d="M8 11V8a4 4 0 1 1 8 0v3" />
              </svg>
            </div>
            <div style={{
              fontFamily:"'Oxanium'", fontSize:9, fontWeight:800,
              color:C.yellow, letterSpacing:1.4, textTransform:"uppercase",
            }}>
              Premium Exclusive
            </div>
            <button
              onClick={e => { e.stopPropagation(); onView(gen); }}
              style={{
                background:C.yellow, color:C.black,
                border:`2px solid ${C.black}`, borderRadius:10,
                padding:"7px 14px", cursor:"pointer",
                fontFamily:"'Oxanium'", fontWeight:800, fontSize:11,
                letterSpacing:0.6, textTransform:"uppercase",
                boxShadow:`2px 2px 0 ${C.black}`,
                whiteSpace:"nowrap",
              }}>
              👑 Reveal Doppelganger
            </button>
          </div>
        )}

        {/* % badge — top right */}
        <div style={{
          position:"absolute", top:8, right:8, zIndex:4,
          background: gen.celeb?.color || C.yellow,
          color: gen.celeb?.color === C.yellow ? C.black : C.white,
          fontFamily:"'Fredoka'", fontWeight:700, fontSize:13,
          padding:"2px 8px", borderRadius:20,
          boxShadow:`0 0 10px ${gen.celeb?.color || C.yellow}55`,
        }}>{gen.celeb?.pct}%</div>

        {/* Label badge — top left (only if set) */}
        {current && (
          <div style={{
            position:"absolute", top:8, left:8, zIndex:4,
            background:`${current.color}28`, border:`1px solid ${current.color}55`,
            borderRadius:20, padding:"2px 8px",
            fontFamily:"'Oxanium'", fontSize:10, fontWeight:700, color:current.color,
            backdropFilter:"blur(6px)",
          }}>
            {current.emoji} {current.text}
          </div>
        )}

        {/* Celeb name — bottom (hidden when locked) */}
        <div style={{ position:"absolute", bottom:8, left:10, right:10, zIndex:4 }}>
          <div style={{ fontFamily:"'Oxanium'", fontSize:8, fontWeight:600, color:"rgba(255,255,255,0.4)", letterSpacing:1, textTransform:"uppercase" }}>
            Doppelganger
          </div>
          <div style={{
            fontFamily:"'Fredoka'", fontWeight:700, fontSize:15, color:C.white, marginTop:1,
            letterSpacing: locked ? 4 : 0,
          }}>
            {locked ? "?????" : gen.celeb?.name}
          </div>
        </div>

        {/* Play hover */}
        <div className="card-play" style={{
          position:"absolute", top:"50%", left:"50%",
          transform:"translate(-50%,-50%)",
          width:40, height:40, borderRadius:"50%",
          background:"rgba(255,255,255,0.15)", backdropFilter:"blur(8px)",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:16, opacity:0, transition:"opacity 0.2s",
        }}>▶</div>
      </div>

      {/* ── Footer ── */}
      <div style={{ padding:"8px 12px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"relative" }}>
        {/* Date */}
        <div style={{ fontFamily:"'Oxanium'", fontSize:9, color:"rgba(255,255,255,0.22)" }}>
          {dateStr}
        </div>

        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          {/* Tag icon — only when no label set */}
          {!current && (
            <button
              onClick={e => { e.stopPropagation(); setPickerOpen(o => !o); setSubOf(null); }}
              title="Who is this?"
              style={{
                background:"none", border:"none", cursor:"pointer",
                fontSize:13, opacity:0.28, padding:"2px",
                lineHeight:1, transition:"opacity 0.2s",
              }}
              onMouseEnter={e => e.currentTarget.style.opacity="0.65"}
              onMouseLeave={e => e.currentTarget.style.opacity="0.28"}
            >🏷</button>
          )}

          {/* View → */}
          <button onClick={() => onView(gen)} style={{
            background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.11)",
            borderRadius:8, padding:"5px 10px",
            fontFamily:"'Oxanium'", fontWeight:700, fontSize:10,
            color:"rgba(255,255,255,0.65)", cursor:"pointer",
            letterSpacing:0.4, textTransform:"uppercase",
          }}>View →</button>
        </div>

        {/* Label picker dropdown */}
        {pickerOpen && (
          <div style={{
            position:"absolute", bottom:"calc(100% + 6px)", right:0,
            background:"#1a1a2e", border:"1px solid rgba(255,255,255,0.12)",
            borderRadius:16, padding:10, zIndex:200, minWidth:200,
            boxShadow:"0 8px 40px rgba(0,0,0,0.6)",
            animation:"fadeIn 0.15s ease",
          }}>
            {subOf ? (
              <>
                <button onClick={() => setSubOf(null)} style={{
                  background:"none", border:"none", color:"rgba(255,255,255,0.4)",
                  fontFamily:"'Oxanium'", fontSize:11, cursor:"pointer",
                  padding:"0 0 8px", display:"flex", alignItems:"center", gap:4,
                }}>← Back</button>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                  {LABELS.find(l => l.id === subOf)?.subs.map(sub => (
                    <button key={sub.id} onClick={() => pick(subOf, sub.id)} style={{
                      background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.12)",
                      borderRadius:10, padding:"6px 12px", cursor:"pointer",
                      fontFamily:"'Oxanium'", fontSize:12, fontWeight:600, color:C.white,
                    }}>{sub.emoji} {sub.text}</button>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                {LABELS.map(l => (
                  <button key={l.id} onClick={() => l.subs ? setSubOf(l.id) : pick(l.id)} style={{
                    background:"transparent", border:"1px solid transparent",
                    borderRadius:10, padding:"7px 12px", cursor:"pointer",
                    fontFamily:"'Oxanium'", fontSize:12, fontWeight:600, color:C.white,
                    display:"flex", alignItems:"center", justifyContent:"space-between", textAlign:"left",
                  }}>
                    <span>{l.emoji} {l.text}</span>
                    {l.subs && <span style={{ opacity:0.4, fontSize:10 }}>▶</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Empty state ─────────────────────────────────────────────────────────────
function EmptyState({ onNew }) {
  return (
    <div style={{ textAlign: "center", padding: "80px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
      <div style={{ fontSize: 64 }}>📸</div>
      <div style={{ fontFamily: "'Fredoka'", fontSize: 28, fontWeight: 700, color: C.white }}>
        No generations yet
      </div>
      <div style={{ fontFamily: "'Oxanium'", fontSize: 14, color: "rgba(255,255,255,0.4)", maxWidth: 320, lineHeight: 1.6 }}>
        Upload your first photo and find your celebrity Doppelganger. Your results will appear here.
      </div>
      <button onClick={onNew} style={{
        background: C.yellow, color: C.black,
        fontFamily: "'Oxanium'", fontWeight: 800, fontSize: 15,
        padding: "16px 40px", border: `3px solid ${C.black}`,
        borderRadius: 14, boxShadow: `4px 4px 0 ${C.black}`,
        cursor: "pointer", letterSpacing: 1.2, textTransform: "uppercase",
      }}>📸 Try It Now</button>
    </div>
  );
}

// ─── Dashboard main ───────────────────────────────────────────────────────────
const CLAIMED_KEY = "celebs_claimed_events";
const getClaimed  = () => JSON.parse(localStorage.getItem(CLAIMED_KEY) || "[]");
const saveClaimed = (arr) => localStorage.setItem(CLAIMED_KEY, JSON.stringify(arr));

export default function DashboardPage({ onViewResult, onBack, onStartScan }) {
  const [gens, setGens]               = useState([]);
  const [showGangReveal, setGangReveal] = useState(false);
  const [uploadCtx, setUploadCtx]      = useState(null);
  const [claimed, setClaimed]          = useState(getClaimed);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Shared generation state
  const [shareData, setShareData]     = useState(null);   // active share link modal
  const [sharedReqs, setSharedReqs]   = useState([]);     // all shared requests
  const [unseenCount, setUnseenCount] = useState(0);      // notification badge count

  const user       = useAppStore(s => s.user);
  const setUser    = useAppStore(s => s.setUser);

  const subPage    = useAppStore(s => s.dashSubPage);
  const setSubPage = useAppStore(s => s.setDashSubPage);

  const refreshData = useCallback(() => {
    setGens(getAll());
    setSharedReqs(getAllSharedRequests());
    setUnseenCount(getUnseenCount());
  }, []);

  useEffect(() => { refreshData(); }, [refreshData]);
  useEffect(() => { refreshData(); }, [subPage, refreshData]);

  // Poll for shared generation completions (DEMO: same browser, so poll localStorage)
  // PROD: replace with Firestore onSnapshot listener
  useEffect(() => {
    const interval = setInterval(() => {
      const count = getUnseenCount();
      if (count !== unseenCount) {
        setUnseenCount(count);
        setSharedReqs(getAllSharedRequests());
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [unseenCount]);

  const handleDelete = (id) => {
    deleteGeneration(id);
    setGens(prev => prev.filter(g => g.id !== id));
  };

  const handleLabelUpdate = () => setGens(getAll());

  // Single entry point for all intranet uploads — opens the modal with context
  const openUpload = useCallback((ctx = { type:"free", returnTo:"dashboard", hint:null }) => {
    setUploadCtx(ctx);
  }, []);

  // Called by IntranetUploadModal when face is confirmed
  const handleScanReady = useCallback((croppedUrl) => {
    setUploadCtx(null);
    onStartScan(croppedUrl, uploadCtx);
  }, [uploadCtx, onStartScan]);

  // Called when user chooses "Ask someone else" from the upload modal
  const handleShareRequest = useCallback((ctx) => {
    setUploadCtx(null);
    const data = createSharedRequest({
      type: ctx.type,
      label: ctx.hint?.text?.toLowerCase() || ctx.type,
      labelSub: ctx.hint?.text || null,
      hint: ctx.hint,
      step: ctx.step,
    });
    setShareData(data);
    refreshData();
  }, [refreshData]);

  // Claim a special-event node (no photo needed)
  const handleClaimEvent = useCallback((idx) => {
    const next = [...getClaimed(), idx].filter((v, i, a) => a.indexOf(v) === i);
    saveClaimed(next);
    setClaimed(next);
  }, []);

  // ── Camino sub-page ──────────────────────────────────────────────────────
  if (subPage === "camino") {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@700&family=Oxanium:wght@400;500;600;700;800&display=swap');
          * { box-sizing: border-box; margin: 0; padding: 0; }
        `}</style>
        {showGangReveal && <GangReveal gens={gens} onClose={() => setGangReveal(false)} />}
        {shareData && <ShareLinkModal shareData={shareData} onClose={() => setShareData(null)} />}
        {uploadCtx && (
          <IntranetUploadModal
            ctx={uploadCtx}
            onClose={() => setUploadCtx(null)}
            onReady={handleScanReady}
            onShareRequest={handleShareRequest}
          />
        )}
        <CaminoPage
          gens={gens}
          claimed={claimed}
          onClaim={handleClaimEvent}
          onUpload={openUpload}
          onBack={() => setSubPage("main")}
          onReveal={() => setGangReveal(true)}
          sharedReqs={sharedReqs}
          onResendShare={(req) => {
            setShareData({ ...req, shareUrl: `${window.location.origin}/share/${req.shareId}` });
          }}
          onCancelShare={(shareId) => {
            cancelSharedRequest(shareId);
            refreshData();
          }}
        />
      </>
    );
  }

  // ── Main dashboard ───────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: "100vh", background: C.black,
      fontFamily: "'Oxanium', sans-serif",
      color: C.white,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@700&family=Oxanium:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.05);opacity:0.8} }
        .gen-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:12px; align-items:stretch; }
        @media(min-width:600px) { .gen-grid { gap:16px; } }
        @media(min-width:768px) { .gen-grid { grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:16px; } }
        .gen-card { height:100%; }
        .gen-card > div { height:100%; }
        .gen-card:hover .card-play { opacity: 1 !important; }
        .dash-header-inner { display:flex; justify-content:space-between; align-items:center; gap:10px; max-width:900px; margin:0 auto; }
        .dash-new-btn-text { display:none; }
        @media(min-width:480px) { .dash-new-btn-text { display:inline; } }
        .camino-hover-arrow { display: none !important; }
      `}</style>

      {/* ── Share link modal ── */}
      {shareData && <ShareLinkModal shareData={shareData} onClose={() => setShareData(null)} />}

      {/* ── Upload modal (rendered above everything) ── */}
      {uploadCtx && (
        <IntranetUploadModal
          ctx={uploadCtx}
          onClose={() => setUploadCtx(null)}
          onReady={handleScanReady}
          onShareRequest={handleShareRequest}
        />
      )}

      {/* ── Gang Reveal modal ── */}
      {showGangReveal && <GangReveal gens={gens} onClose={() => setGangReveal(false)} />}

      {/* ── Header ── */}
      <div style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(10,10,10,0.92)", backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        padding: "10px 16px",
      }}>
        <div className="dash-header-inner">
          {/* Back */}
          <button onClick={onBack} style={{
            background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 10, padding: "8px 12px", cursor: "pointer",
            fontFamily: "'Oxanium'", fontWeight: 600, fontSize: 12, color: "rgba(255,255,255,0.6)",
            display: "flex", alignItems: "center", gap: 4, flexShrink: 0,
          }}>← Back</button>

          {/* Title */}
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", flex:1, minWidth:0 }}>
            <div style={{ fontFamily:"'Fredoka'", fontSize:16, fontWeight:700, color:C.white, lineHeight:1, whiteSpace:"nowrap", display:"flex", alignItems:"center", gap:6 }}>
              My Generations
              {unseenCount > 0 && (
                <span style={{
                  background: C.green, borderRadius: 20,
                  padding: "2px 7px", fontSize: 10,
                  fontFamily: "'Oxanium'", fontWeight: 800, color: C.white,
                  animation: "pulse 1.5s ease-in-out infinite",
                }}>
                  {unseenCount} new
                </span>
              )}
            </div>
            <div style={{ fontFamily:"'Oxanium'", fontSize:10, color:"rgba(255,255,255,0.35)", marginTop:2 }}>
              {gens.length} result{gens.length !== 1 ? "s" : ""} saved
              {sharedReqs.filter(r => r.status === "pending").length > 0 &&
                ` · ${sharedReqs.filter(r => r.status === "pending").length} pending`}
            </div>
          </div>

          {/* New photo — opens intranet upload modal */}
          <button onClick={() => openUpload()} style={{
            background: C.yellow, color: C.black,
            fontFamily: "'Oxanium'", fontWeight: 800, fontSize: 12,
            padding: "9px 14px", border: `2px solid ${C.black}`,
            borderRadius: 10, boxShadow: `3px 3px 0 ${C.black}`,
            cursor: "pointer", letterSpacing: 0.8, textTransform: "uppercase",
            display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap", flexShrink: 0,
          }}>📸 <span className="dash-new-btn-text">New photo</span></button>

          {/* User avatar or Sign In */}
          {user ? (
            <button
              onClick={() => { if (window.confirm("Sign out?")) { signOutUser().then(() => setUser(null)); } }}
              title="Sign out"
              style={{
                flexShrink: 0, width: 34, height: 34, borderRadius: "50%",
                overflow: "hidden", border: `2px solid ${C.yellow}66`,
                cursor: "pointer", background: "rgba(255,229,0,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: 0,
              }}
            >
              {user.photoURL ? (
                <img src={user.photoURL} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span style={{ fontFamily: "'Fredoka'", fontSize: 13, fontWeight: 700, color: C.yellow }}>
                  {(user.displayName || user.email || "U")[0].toUpperCase()}
                </span>
              )}
            </button>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              style={{
                flexShrink: 0, background: "transparent",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: 9, padding: "7px 12px",
                fontFamily: "'Oxanium'", fontWeight: 600, fontSize: 11,
                color: "rgba(255,255,255,0.55)", cursor: "pointer", whiteSpace: "nowrap",
              }}
            >Sign In</button>
          )}
        </div>
      </div>

      {/* Auth modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => setShowAuthModal(false)}
      />

      {/* ── Content ── */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "16px 16px 80px" }}>
        {gens.length === 0 ? (
          <EmptyState onNew={() => openUpload()} />
        ) : (
          <>
            {/* Discreet stats strip */}
            <div style={{
              display:"flex", gap:16, padding:"0 0 12px",
              borderBottom:"1px solid rgba(255,255,255,0.05)", marginBottom:14,
              flexWrap:"wrap", animation:"slideUp 0.4s ease-out",
            }}>
              {[
                { value: gens.length,                                          label: "saved"      },
                { value: Math.max(...gens.map(g => g.celeb?.pct || 0)) + "%", label: "best match" },
                { value: new Set(gens.map(g => g.celeb?.name)).size,          label: "celebs"     },
                { value: gens.filter(g => g.label).length,                    label: "tagged"     },
              ].map(s => (
                <span key={s.label} style={{ display:"flex", alignItems:"baseline", gap:4 }}>
                  <span style={{ fontFamily:"'Fredoka'", fontSize:14, fontWeight:700, color:C.yellow }}>{s.value}</span>
                  <span style={{ fontFamily:"'Oxanium'", fontSize:10, color:"rgba(255,255,255,0.25)" }}>{s.label}</span>
                </span>
              ))}
            </div>

            {/* Grid — games first, then generations */}
            <div className="gen-grid" style={{ animation: "slideUp 0.5s ease-out 0.1s both" }}>
              {/* Game 1: Camino a la Fama — compact CTA card */}
              {getFlag("CAMINO") && <CaminoCTA gens={gens} onEnter={() => setSubPage("camino")} />}

              {/* Game 2: Dice — compact card */}
              {getFlag("DICE") && <DiceCard onUpload={openUpload} />}

              {/* Game 3: The Album — SOON */}
              {getFlag("ALBUM") && <AlbumCard />}

              {/* Shared generations (pending + completed) */}
              {getFlag("VIRAL_SHARE") && sharedReqs.map(req => (
                <div key={`sh-${req.shareId}`} className="gen-card">
                  <SharedGenCard
                    req={req}
                    onView={(r) => {
                      if (r.result && r.recipientPhoto) {
                        onViewResult({
                          id: `shared-${r.shareId}`,
                          preview: r.recipientPhoto,
                          celeb: r.result.celeb,
                          others: r.result.others,
                          label: "shared",
                          labelSub: r.requestContext?.hint?.text || null,
                        });
                      }
                    }}
                    onDismiss={refreshData}
                    onResend={(r) => {
                      setShareData({ ...r, shareUrl: `${window.location.origin}/share/${r.shareId}` });
                    }}
                    onCancel={(shareId) => {
                      cancelSharedRequest(shareId);
                      refreshData();
                    }}
                  />
                </div>
              ))}

              {gens.map(gen => (
                <div key={gen.id} className="gen-card">
                  <GenCard
                    gen={gen}
                    onView={onViewResult}
                    onLabelUpdate={handleLabelUpdate}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Firebase test panel (dev only) ── */}
      <FirebaseTestPanel />
    </div>
  );
}
