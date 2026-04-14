import { useState, useEffect, useRef, useCallback } from "react";
import { getAll, updateLabel, deleteGeneration } from "./services";

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

// ─── Camino a la Fama — step hints ──────────────────────────────────────────
const STEPS_REQUIRED = 10;
const STEP_HINTS = [
  { emoji: "🙋", text: "You",        color: C.cyan    },
  { emoji: "👨", text: "Dad",        color: C.pink    },
  { emoji: "👩", text: "Mom",        color: C.pink    },
  { emoji: "👫", text: "Friend",     color: C.green   },
  { emoji: "👦", text: "Brother",    color: C.pink    },
  { emoji: "👧", text: "Sister",     color: C.pink    },
  { emoji: "🧑‍💻", text: "Colleague", color: C.blue    },
  { emoji: "📚", text: "Teacher",    color: C.purple  },
  { emoji: "💘", text: "Crush",      color: "#FF6B9D" },
  { emoji: "👔", text: "Boss",       color: C.blue    },
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

// ─── Camino a la Fama — journey tracker ──────────────────────────────────────
function CaminoALaFama({ gens, onNew, onReveal }) {
  const filled     = Math.min(gens.length, STEPS_REQUIRED);
  const pct        = (filled / STEPS_REQUIRED) * 100;
  const isUnlocked = gens.length >= STEPS_REQUIRED;
  const filledGens = gens.slice(0, STEPS_REQUIRED);

  return (
    <div style={{
      gridColumn:"span 2",
      background:"linear-gradient(135deg,#0c0c1e 0%,#111128 100%)",
      border:`2px solid ${isUnlocked ? `${C.yellow}55` : "rgba(255,255,255,0.07)"}`,
      borderRadius:20, overflow:"hidden",
      transition:"border-color 0.5s ease, box-shadow 0.5s ease",
      boxShadow: isUnlocked ? `0 0 32px ${C.yellow}14` : "none",
    }}>
      {/* Header */}
      <div style={{ padding:"14px 16px 10px", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div>
            <div style={{ fontFamily:"'Fredoka'", fontSize:17, fontWeight:700, color:C.white, lineHeight:1 }}>
              🌟 Camino a la Fama
            </div>
            <div style={{ fontFamily:"'Oxanium'", fontSize:10, color:"rgba(255,255,255,0.35)", marginTop:3 }}>
              Build your celebrity gang · upload {STEPS_REQUIRED} people
            </div>
          </div>
          <div style={{
            fontFamily:"'Fredoka'", fontSize:20, fontWeight:700, lineHeight:1, flexShrink:0,
            color: isUnlocked ? C.yellow : "rgba(255,255,255,0.2)",
          }}>
            {filled}<span style={{ fontSize:13, fontWeight:400, color:"rgba(255,255,255,0.2)" }}>/{STEPS_REQUIRED}</span>
          </div>
        </div>
        {/* Progress bar */}
        <div style={{ marginTop:10, height:4, borderRadius:2, background:"rgba(255,255,255,0.07)", overflow:"hidden" }}>
          <div style={{
            height:"100%", borderRadius:2, transition:"width 0.6s ease",
            width:`${pct}%`,
            background: isUnlocked
              ? `linear-gradient(90deg, ${C.yellow}, ${C.green})`
              : `linear-gradient(90deg, ${C.blue}, ${C.cyan})`,
            boxShadow: isUnlocked ? `0 0 8px ${C.yellow}88` : "none",
          }} />
        </div>
      </div>

      {/* Steps scroll */}
      <div style={{
        display:"flex", gap:8, overflowX:"auto", padding:"12px 16px 10px",
        scrollSnapType:"x mandatory", WebkitOverflowScrolling:"touch",
        scrollbarWidth:"none", msOverflowStyle:"none",
      }}>
        {[...Array(STEPS_REQUIRED)].map((_, i) => {
          const gen  = filledGens[i];
          const hint = STEP_HINTS[i];
          return (
            <div key={i} style={{
              flexShrink:0, scrollSnapAlign:"start",
              width:72, display:"flex", flexDirection:"column", alignItems:"center", gap:4,
            }}>
              {gen ? (
                // Filled slot
                <div style={{
                  width:68, height:68, borderRadius:14, overflow:"hidden", position:"relative",
                  border:`2px solid ${gen.celeb?.color || C.yellow}`,
                  boxShadow:`0 0 10px ${gen.celeb?.color || C.yellow}33`,
                }}>
                  {gen.thumb
                    ? <img src={gen.thumb} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"top center" }} />
                    : <div style={{ width:"100%", height:"100%", background:"#1a1a2e", display:"flex", alignItems:"center", justifyContent:"center", fontSize:24 }}>👤</div>
                  }
                  <div style={{
                    position:"absolute", top:2, right:2,
                    background:gen.celeb?.color || C.yellow,
                    color:gen.celeb?.color === C.yellow ? C.black : C.white,
                    fontFamily:"'Fredoka'", fontWeight:700, fontSize:8,
                    padding:"1px 4px", borderRadius:5,
                  }}>{gen.celeb?.pct}%</div>
                </div>
              ) : (
                // Empty slot
                <div
                  onClick={onNew}
                  style={{
                    width:68, height:68, borderRadius:14,
                    border:"2px dashed rgba(255,255,255,0.1)",
                    background:"rgba(255,255,255,0.02)",
                    display:"flex", flexDirection:"column", alignItems:"center",
                    justifyContent:"center", gap:1, cursor:"pointer", transition:"all 0.2s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor=hint.color; e.currentTarget.style.background=`${hint.color}12`; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor="rgba(255,255,255,0.1)"; e.currentTarget.style.background="rgba(255,255,255,0.02)"; }}
                >
                  <span style={{ fontSize:20 }}>{hint.emoji}</span>
                  <span style={{ fontFamily:"'Oxanium'", fontSize:9, color:"rgba(255,255,255,0.25)", fontWeight:600 }}>+</span>
                </div>
              )}
              {/* Label */}
              <div style={{
                fontFamily:"'Oxanium'", fontSize:9, fontWeight:600, letterSpacing:0.2,
                color: gen ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.18)",
                textAlign:"center", maxWidth:68,
                overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
              }}>
                {gen ? gen.celeb?.name?.split(" ")[0] : hint.text}
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA footer */}
      <div style={{
        padding:"10px 16px 14px", borderTop:"1px solid rgba(255,255,255,0.05)",
        display:"flex", alignItems:"center", justifyContent:"space-between", gap:10,
      }}>
        {isUnlocked ? (
          <>
            <div style={{ fontFamily:"'Oxanium'", fontSize:11, color:C.yellow, fontWeight:600 }}>
              ✨ Gang complete!
            </div>
            <button onClick={onReveal} style={{
              background:C.yellow, color:C.black,
              fontFamily:"'Oxanium'", fontWeight:800, fontSize:11,
              padding:"9px 16px", border:`2px solid ${C.black}`,
              borderRadius:10, boxShadow:`3px 3px 0 ${C.black}`,
              cursor:"pointer", letterSpacing:0.8, textTransform:"uppercase",
              display:"flex", alignItems:"center", gap:5, whiteSpace:"nowrap",
            }}>🌟 Reveal Gang</button>
          </>
        ) : (
          <>
            <div style={{ fontFamily:"'Oxanium'", fontSize:10, color:"rgba(255,255,255,0.3)" }}>
              🔒 {STEPS_REQUIRED - filled} more step{STEPS_REQUIRED - filled !== 1 ? "s" : ""} to unlock Gang Reveal
            </div>
            <button onClick={onNew} style={{
              background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.12)",
              borderRadius:10, padding:"7px 12px", cursor:"pointer",
              fontFamily:"'Oxanium'", fontWeight:700, fontSize:10,
              color:"rgba(255,255,255,0.45)", whiteSpace:"nowrap",
            }}>+ Add step</button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Dice CTA card ────────────────────────────────────────────────────────────
function DiceCard({ onNew }) {
  const [phase, setPhase]     = useState("idle");   // idle | rolling | landed
  const [current, setCurrent] = useState(DICE_OPTIONS[0]);
  const [result, setResult]   = useState(null);
  const rollRef               = useRef(null);

  const roll = useCallback(() => {
    if (phase === "rolling") return;
    setPhase("rolling");
    setResult(null);

    const TOTAL_MS  = 1600;
    const intervals = [60, 60, 80, 80, 100, 120, 140, 160, 200]; // ease-out cadence
    let elapsed = 0;
    let idx = 0;

    const tick = () => {
      setCurrent(DICE_OPTIONS[Math.floor(Math.random() * DICE_OPTIONS.length)]);
      elapsed += intervals[Math.min(idx, intervals.length - 1)];
      idx++;
      if (elapsed < TOTAL_MS) {
        rollRef.current = setTimeout(tick, intervals[Math.min(idx, intervals.length - 1)]);
      } else {
        const winner = DICE_OPTIONS[Math.floor(Math.random() * DICE_OPTIONS.length)];
        setCurrent(winner);
        setResult(winner);
        setPhase("landed");
      }
    };
    rollRef.current = setTimeout(tick, intervals[0]);
  }, [phase]);

  useEffect(() => () => clearTimeout(rollRef.current), []);

  const reset = () => { setPhase("idle"); setResult(null); setCurrent(DICE_OPTIONS[0]); };

  const accentColor = phase === "landed" && result ? result.color : C.yellow;

  return (
    <div style={{
      gridColumn: "span 2",
      background: `linear-gradient(135deg, #111122 0%, #0d0d1a 100%)`,
      border: `2px solid ${accentColor}44`,
      borderRadius: 24,
      padding: "clamp(16px, 4vw, 28px) clamp(14px, 3vw, 24px)",
      display: "flex", flexDirection: "column", alignItems: "center",
      gap: 20, position: "relative", overflow: "hidden",
      boxShadow: phase === "landed" ? `0 0 40px ${accentColor}22` : "none",
      transition: "box-shadow 0.5s ease, border-color 0.4s ease",
      minHeight: 220,
    }}>
      <style>{`
        @keyframes diceFlip {
          0%   { transform: rotateY(0deg)   scale(1);    opacity: 1; }
          49%  { transform: rotateY(90deg)  scale(0.85); opacity: 0; }
          50%  { transform: rotateY(-90deg) scale(0.85); opacity: 0; }
          100% { transform: rotateY(0deg)   scale(1);    opacity: 1; }
        }
        @keyframes landedPop {
          0%   { transform: scale(0.7); opacity: 0; }
          60%  { transform: scale(1.08); }
          100% { transform: scale(1);   opacity: 1; }
        }
        @keyframes diceSpin {
          0%   { transform: rotate(0deg)   scale(1); }
          25%  { transform: rotate(8deg)   scale(1.05); }
          75%  { transform: rotate(-8deg)  scale(1.05); }
          100% { transform: rotate(0deg)   scale(1); }
        }
        .dice-rolling { animation: diceSpin 0.15s ease-in-out infinite; }
        .dice-landed  { animation: landedPop 0.5s cubic-bezier(0.34,1.56,0.64,1) both; }
      `}</style>

      {/* Ambient glow */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%,-50%)",
        width: 300, height: 300, borderRadius: "50%",
        background: `radial-gradient(circle, ${accentColor}12, transparent 65%)`,
        filter: "blur(40px)", pointerEvents: "none",
        transition: "background 0.4s ease",
      }} />

      {phase === "idle" && (
        <>
          <div style={{ textAlign: "center", zIndex: 1 }}>
            <div style={{ fontFamily: "'Fredoka'", fontSize: 15, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>
              Who's next?
            </div>
            <div style={{ fontFamily: "'Fredoka'", fontSize: 26, fontWeight: 700, color: C.white, lineHeight: 1.2 }}>
              Roll the dice and find out
            </div>
          </div>
          <div style={{ fontSize: 64, lineHeight: 1, zIndex: 1 }}>🎲</div>
          <button onClick={roll} style={{
            background: C.yellow, color: C.black,
            fontFamily: "'Oxanium'", fontWeight: 800, fontSize: 14,
            padding: "14px 36px", border: `3px solid ${C.black}`,
            borderRadius: 14, boxShadow: `4px 4px 0 ${C.black}`,
            cursor: "pointer", letterSpacing: 1.2, textTransform: "uppercase",
            zIndex: 1, display: "flex", alignItems: "center", gap: 10,
          }}>
            🎲 Roll the dice
          </button>
          <div style={{ fontFamily: "'Oxanium'", fontSize: 11, color: "rgba(255,255,255,0.2)", zIndex: 1 }}>
            12 options · family, friends, work & more
          </div>
        </>
      )}

      {phase === "rolling" && (
        <>
          <div style={{ textAlign: "center", zIndex: 1 }}>
            <div style={{ fontFamily: "'Fredoka'", fontSize: 15, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>
              Rolling...
            </div>
          </div>
          <div className="dice-rolling" style={{ fontSize: 72, lineHeight: 1, zIndex: 1 }}>
            {current.emoji}
          </div>
          <div style={{
            fontFamily: "'Fredoka'", fontSize: 22, fontWeight: 700,
            color: current.color, zIndex: 1, minHeight: 32,
            transition: "color 0.08s",
          }}>
            {current.text}
          </div>
        </>
      )}

      {phase === "landed" && result && (
        <>
          <div style={{ textAlign: "center", zIndex: 1 }}>
            <div style={{ fontFamily: "'Fredoka'", fontSize: 14, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>
              Next up
            </div>
          </div>

          <div className="dice-landed" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, zIndex: 1 }}>
            <div style={{
              width: 80, height: 80, borderRadius: "50%", fontSize: 40,
              background: `${result.color}22`, border: `3px solid ${result.color}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: `0 0 24px ${result.color}44`,
            }}>{result.emoji}</div>
            <div style={{ fontFamily: "'Fredoka'", fontSize: 28, fontWeight: 700, color: result.color, textAlign: "center" }}>
              {result.text}
            </div>
            <div style={{ fontFamily: "'Oxanium'", fontSize: 13, color: "rgba(255,255,255,0.5)", textAlign: "center" }}>
              Let's find their celebrity doppelganger!
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, zIndex: 1, flexWrap: "wrap", justifyContent: "center" }}>
            <button onClick={onNew} style={{
              background: result.color, color: result.color === C.yellow ? C.black : C.white,
              fontFamily: "'Oxanium'", fontWeight: 800, fontSize: 14,
              padding: "14px 28px", border: `3px solid ${C.black}`,
              borderRadius: 14, boxShadow: `4px 4px 0 ${C.black}`,
              cursor: "pointer", letterSpacing: 1.1, textTransform: "uppercase",
              display: "flex", alignItems: "center", gap: 8,
            }}>
              📸 Upload Photo
            </button>
            <button onClick={reset} style={{
              background: "transparent", border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 14, padding: "14px 20px",
              fontFamily: "'Oxanium'", fontWeight: 600, fontSize: 13,
              color: "rgba(255,255,255,0.4)", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6,
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.35)"; e.currentTarget.style.color = C.white; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}
            >
              🎲 Roll again
            </button>
          </div>
        </>
      )}
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

// ─── Generation card ─────────────────────────────────────────────────────────
function GenCard({ gen, onView, onDelete, onLabelUpdate }) {
  const [labelState, setLabelState] = useState({ label: gen.label, sub: gen.labelSub });
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleLabelUpdate = (label, sub) => {
    setLabelState({ label, sub });
    onLabelUpdate();
  };

  const date = new Date(gen.createdAt);
  const dateStr = date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  const timeStr = date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

  return (
    <div style={{
      background: "#111122", border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: 20, overflow: "hidden",
      display: "flex", flexDirection: "column",
      transition: "transform 0.2s, box-shadow 0.2s",
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.4)"; }}
    onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
    >
      {/* Photo + match overlay */}
      <div style={{ position: "relative", aspectRatio: "1/1", overflow: "hidden", cursor: "pointer" }}
        onClick={() => onView(gen)}>
        {gen.thumb ? (
          <img src={gen.thumb} alt="your photo"
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center", display: "block" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", background: "#1a1a2e", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>👤</div>
        )}

        {/* Match overlay (bottom) */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 55%)",
        }} />

        {/* Pct badge */}
        <div style={{
          position: "absolute", top: 10, right: 10,
          background: gen.celeb?.color || C.yellow,
          color: gen.celeb?.color === C.yellow ? C.black : C.white,
          fontFamily: "'Fredoka'", fontWeight: 700, fontSize: 15,
          padding: "3px 10px", borderRadius: 20,
          boxShadow: `0 0 12px ${gen.celeb?.color || C.yellow}66`,
        }}>{gen.celeb?.pct}%</div>

        {/* Celeb name */}
        <div style={{ position: "absolute", bottom: 10, left: 12, right: 12 }}>
          <div style={{ fontFamily: "'Oxanium'", fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.5)", letterSpacing: 1, textTransform: "uppercase" }}>
            Doppelganger
          </div>
          <div style={{ fontFamily: "'Fredoka'", fontWeight: 700, fontSize: 16, color: C.white, marginTop: 1 }}>
            {gen.celeb?.name}
          </div>
        </div>

        {/* Play button */}
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: 44, height: 44, borderRadius: "50%",
          background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18, opacity: 0,
          transition: "opacity 0.2s",
        }}
        className="card-play">▶</div>
      </div>

      {/* Card footer */}
      <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
        {/* Date */}
        <div style={{ fontFamily: "'Oxanium'", fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: 0.3 }}>
          {dateStr} · {timeStr}
        </div>

        {/* Label picker */}
        <LabelPicker
          genId={gen.id}
          label={labelState.label}
          labelSub={labelState.sub}
          onUpdate={handleLabelUpdate}
        />

        {/* Action row */}
        <div style={{ display: "flex", gap: 6, marginTop: "auto" }}>
          <button onClick={() => onView(gen)} style={{
            flex: 1, padding: "8px 0",
            background: C.yellow, color: C.black,
            fontFamily: "'Oxanium'", fontWeight: 800, fontSize: 11,
            border: "none", borderRadius: 10, cursor: "pointer",
            letterSpacing: 0.8, textTransform: "uppercase",
          }}>View results</button>

          {!confirmDelete ? (
            <button onClick={() => setConfirmDelete(true)} style={{
              padding: "8px 10px", background: "rgba(255,60,172,0.1)",
              border: "1px solid rgba(255,60,172,0.2)", borderRadius: 10,
              cursor: "pointer", color: C.pink, fontSize: 13,
            }}>🗑</button>
          ) : (
            <button onClick={() => onDelete(gen.id)} style={{
              padding: "8px 10px", background: C.pink,
              border: "none", borderRadius: 10,
              cursor: "pointer", color: C.white,
              fontFamily: "'Oxanium'", fontWeight: 700, fontSize: 10,
            }}>Sure?</button>
          )}
        </div>
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
export default function DashboardPage({ onNew, onViewResult, onBack }) {
  const [gens, setGens]               = useState([]);
  const [showGangReveal, setGangReveal] = useState(false);

  useEffect(() => { setGens(getAll()); }, []);

  const handleDelete = (id) => {
    deleteGeneration(id);
    setGens(prev => prev.filter(g => g.id !== id));
  };

  const handleLabelUpdate = () => {
    setGens(getAll());
  };

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
        .gen-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:12px; }
        @media(min-width:600px) { .gen-grid { gap:16px; } }
        @media(min-width:768px) { .gen-grid { grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:16px; } }
        .gen-card:hover .card-play { opacity: 1 !important; }
        .dash-header-inner { display:flex; justify-content:space-between; align-items:center; gap:10px; max-width:900px; margin:0 auto; }
        .dash-new-btn-text { display:none; }
        @media(min-width:480px) { .dash-new-btn-text { display:inline; } }
        @keyframes ctaPulse { 0%,100%{box-shadow:0 0 0 0 rgba(255,229,0,0.5)} 50%{box-shadow:0 0 0 8px rgba(255,229,0,0)} }
      `}</style>

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
            <div style={{ fontFamily:"'Fredoka'", fontSize:16, fontWeight:700, color:C.white, lineHeight:1, whiteSpace:"nowrap" }}>
              My Generations
            </div>
            <div style={{ fontFamily:"'Oxanium'", fontSize:10, color:"rgba(255,255,255,0.35)", marginTop:2 }}>
              {gens.length} result{gens.length !== 1 ? "s" : ""} saved
            </div>
          </div>

          {/* New photo */}
          <button onClick={onNew} style={{
            background: C.yellow, color: C.black,
            fontFamily: "'Oxanium'", fontWeight: 800, fontSize: 12,
            padding: "9px 14px", border: `2px solid ${C.black}`,
            borderRadius: 10, boxShadow: `3px 3px 0 ${C.black}`,
            cursor: "pointer", letterSpacing: 0.8, textTransform: "uppercase",
            display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap", flexShrink: 0,
          }}>📸 <span className="dash-new-btn-text">New photo</span></button>
        </div>
      </div>

      {/* ── Gang Reveal modal ── */}
      {showGangReveal && <GangReveal gens={gens} onClose={() => setGangReveal(false)} />}

      {/* ── Content ── */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "16px 16px 80px" }}>
        {gens.length === 0 ? (
          <EmptyState onNew={onNew} />
        ) : (
          <>
            {/* Discreet stats strip */}
            <div style={{
              display:"flex", gap:16, padding:"0 0 12px",
              borderBottom:"1px solid rgba(255,255,255,0.05)", marginBottom:14,
              flexWrap:"wrap", animation:"slideUp 0.4s ease-out",
            }}>
              {[
                { value: gens.length,                                                          label: "saved"      },
                { value: Math.max(...gens.map(g => g.celeb?.pct || 0)) + "%",                 label: "best match" },
                { value: new Set(gens.map(g => g.celeb?.name)).size,                          label: "celebs"     },
                { value: gens.filter(g => g.label).length,                                    label: "tagged"     },
              ].map(s => (
                <span key={s.label} style={{ display:"flex", alignItems:"baseline", gap:4 }}>
                  <span style={{ fontFamily:"'Fredoka'", fontSize:14, fontWeight:700, color:C.yellow }}>{s.value}</span>
                  <span style={{ fontFamily:"'Oxanium'", fontSize:10, color:"rgba(255,255,255,0.25)" }}>{s.label}</span>
                </span>
              ))}
            </div>

            {/* Grid — games first, then generations */}
            <div className="gen-grid" style={{ animation: "slideUp 0.5s ease-out 0.1s both" }}>
              {/* Game 1: Camino a la Fama */}
              <CaminoALaFama gens={gens} onNew={onNew} onReveal={() => setGangReveal(true)} />

              {/* Game 2: Dice CTA */}
              <DiceCard onNew={onNew} />

              {gens.map(gen => (
                <div key={gen.id} className="gen-card">
                  <GenCard
                    gen={gen}
                    onView={onViewResult}
                    onDelete={handleDelete}
                    onLabelUpdate={handleLabelUpdate}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
