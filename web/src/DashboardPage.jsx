import { useState, useEffect } from "react";
import { getAll, updateLabel, deleteGeneration } from "./services";

const C = {
  blue: "#2AABE2", yellow: "#FFE500", black: "#0A0A0A", white: "#FFFFFF",
  pink: "#FF3CAC", cyan: "#00E5FF", green: "#22c55e", purple: "#8B5CF6",
  darkBlue: "#1B8DBF",
};

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
  const [gens, setGens] = useState([]);

  useEffect(() => {
    setGens(getAll());
  }, []);

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
        .gen-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; }
        @media(max-width:600px) { .gen-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; } }
        @media(max-width:380px) { .gen-grid { grid-template-columns: 1fr; } }
        .gen-card:hover .card-play { opacity: 1 !important; }
      `}</style>

      {/* ── Header ── */}
      <div style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(10,10,10,0.92)", backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        padding: "14px 20px",
      }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {/* Logo + title */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <button onClick={onBack} style={{
              background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 10, padding: "7px 14px", cursor: "pointer",
              fontFamily: "'Oxanium'", fontWeight: 600, fontSize: 12, color: "rgba(255,255,255,0.6)",
              display: "flex", alignItems: "center", gap: 5,
            }}>← Back</button>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ fontFamily: "'Fredoka'", fontSize: 18, fontWeight: 700, color: C.white, lineHeight: 1 }}>
                My Generations
              </div>
              <div style={{ fontFamily: "'Oxanium'", fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>
                {gens.length} result{gens.length !== 1 ? "s" : ""} saved
              </div>
            </div>
          </div>

          {/* New photo CTA */}
          <button onClick={onNew} style={{
            background: C.yellow, color: C.black,
            fontFamily: "'Oxanium'", fontWeight: 800, fontSize: 13,
            padding: "10px 20px", border: `2px solid ${C.black}`,
            borderRadius: 12, boxShadow: `3px 3px 0 ${C.black}`,
            cursor: "pointer", letterSpacing: 1, textTransform: "uppercase",
            display: "flex", alignItems: "center", gap: 6, whiteSpace: "nowrap",
          }}>📸 New photo</button>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 20px 60px" }}>
        {gens.length === 0 ? (
          <EmptyState onNew={onNew} />
        ) : (
          <>
            {/* Stats bar */}
            <div style={{
              display: "flex", gap: 16, marginBottom: 28, flexWrap: "wrap",
              animation: "slideUp 0.4s ease-out",
            }}>
              {[
                { label: "Generations", value: gens.length },
                { label: "Best match", value: Math.max(...gens.map(g => g.celeb?.pct || 0)) + "%" },
                { label: "Celebrities", value: new Set(gens.map(g => g.celeb?.name)).size },
                { label: "Tagged", value: gens.filter(g => g.label).length },
              ].map(stat => (
                <div key={stat.label} style={{
                  background: "#111122", border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 14, padding: "12px 20px", flex: "1 1 100px",
                }}>
                  <div style={{ fontFamily: "'Fredoka'", fontSize: 22, fontWeight: 700, color: C.yellow }}>
                    {stat.value}
                  </div>
                  <div style={{ fontFamily: "'Oxanium'", fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Grid */}
            <div className="gen-grid" style={{ animation: "slideUp 0.5s ease-out 0.1s both" }}>
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
