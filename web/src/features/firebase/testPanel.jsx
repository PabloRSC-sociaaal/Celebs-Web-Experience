/**
 * Firebase Cloud Function — Test Panel
 *
 * Small floating button (bottom-left corner) that opens a debug panel
 * to test GenerateComparisonAsync without touching the main app flow.
 *
 * USAGE: drop <FirebaseTestPanel /> anywhere in the component tree.
 * Remove when done testing.
 */

import { useState, useRef } from "react";
import { generateComparison } from "./generateComparison";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function prettyMs(ms) {
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function FirebaseTestPanel() {
  const [open,    setOpen]    = useState(false);
  const [phase,   setPhase]   = useState("idle"); // idle | calling | done | error
  const [preview, setPreview] = useState(null);
  const [results, setResults] = useState(null);   // normalized array
  const [err,     setErr]     = useState(null);
  const [elapsed, setElapsed] = useState(null);
  const fileRef = useRef(null);

  const reset = () => {
    setPhase("idle");
    setPreview(null);
    setResults(null);
    setErr(null);
    setElapsed(null);
  };

  const handleFile = async (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setResults(null);
    setErr(null);
    setPhase("calling");

    // Preview
    const blobUrl = URL.createObjectURL(file);
    setPreview(blobUrl);

    try {
      const t0 = Date.now();
      const normalized = await generateComparison(blobUrl);
      setElapsed(Date.now() - t0);
      setResults(normalized);
      setPhase("done");
    } catch (e) {
      setErr({ code: e.code ?? "unknown", message: e.message ?? String(e) });
      setPhase("error");
    }
  };

  const onFilePick = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  const onDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const STATUS_COLOR = {
    idle:    "rgba(255,255,255,0.4)",
    calling: "#FBBF24",
    done:    "#34D399",
    error:   "#F87171",
  };

  const top     = results?.[0]  ?? null;
  const others  = results?.slice(1, 6) ?? [];

  return (
    <>
      {/* ── Floating trigger ── */}
      <button
        onClick={() => setOpen(o => !o)}
        title="Firebase API test panel"
        style={{
          position:"fixed", bottom:16, left:16, zIndex:9000,
          width:36, height:36, borderRadius:10,
          background:"rgba(30,30,50,0.92)", backdropFilter:"blur(8px)",
          border:"1px solid rgba(255,255,255,0.12)",
          cursor:"pointer", fontSize:16,
          display:"flex", alignItems:"center", justifyContent:"center",
          boxShadow:"0 4px 16px rgba(0,0,0,0.5)",
          transition:"transform 0.15s",
        }}
        onMouseEnter={e => e.currentTarget.style.transform="scale(1.12)"}
        onMouseLeave={e => e.currentTarget.style.transform="scale(1)"}
      >🧪</button>

      {/* ── Panel ── */}
      {open && (
        <div style={{
          position:"fixed", bottom:60, left:16, zIndex:9000,
          width:340, maxHeight:"85vh",
          background:"rgba(12,12,24,0.97)", backdropFilter:"blur(20px)",
          border:"1px solid rgba(255,255,255,0.10)",
          borderRadius:18, overflow:"hidden",
          display:"flex", flexDirection:"column",
          boxShadow:"0 16px 64px rgba(0,0,0,0.7)",
          fontFamily:"'Oxanium', monospace",
        }}>
          {/* Header */}
          <div style={{
            padding:"12px 16px",
            borderBottom:"1px solid rgba(255,255,255,0.07)",
            display:"flex", alignItems:"center", justifyContent:"space-between",
          }}>
            <div>
              <div style={{ fontSize:12, fontWeight:700, color:"#fff", letterSpacing:0.5 }}>
                🧪 API Test Panel
              </div>
              <div style={{ fontSize:9, color:"rgba(255,255,255,0.3)", marginTop:2 }}>
                GenerateComparisonAsync · celebs-dev
              </div>
            </div>
            <div style={{ display:"flex", gap:6 }}>
              {phase !== "idle" && (
                <button onClick={reset} style={btnStyle("rgba(255,255,255,0.08)")}>↺ Reset</button>
              )}
              <button onClick={() => setOpen(false)} style={btnStyle("rgba(255,255,255,0.08)")}>✕</button>
            </div>
          </div>

          {/* Status bar */}
          <div style={{
            padding:"6px 16px",
            borderBottom:"1px solid rgba(255,255,255,0.05)",
            display:"flex", alignItems:"center", gap:8,
          }}>
            <div style={{
              width:7, height:7, borderRadius:"50%",
              background:STATUS_COLOR[phase],
              boxShadow:`0 0 6px ${STATUS_COLOR[phase]}`,
            }}/>
            <span style={{ fontSize:10, color:STATUS_COLOR[phase], fontWeight:700, letterSpacing:0.8, textTransform:"uppercase" }}>
              {phase === "idle"    && "Waiting for photo"}
              {phase === "calling" && "Calling Firebase…"}
              {phase === "done"    && `Done · ${prettyMs(elapsed)} · ${results?.length ?? 0} matches`}
              {phase === "error"   && "Error"}
            </span>
          </div>

          {/* Body */}
          <div style={{ overflowY:"auto", flex:1, padding:14, display:"flex", flexDirection:"column", gap:12 }}>

            {/* Drop zone */}
            {(phase === "idle" || phase === "done" || phase === "error") && (
              <div
                onClick={() => fileRef.current?.click()}
                onDrop={onDrop}
                onDragOver={e => e.preventDefault()}
                style={{
                  border:"1.5px dashed rgba(255,255,255,0.15)",
                  borderRadius:12, padding:"16px",
                  textAlign:"center", cursor:"pointer",
                  background:"rgba(255,255,255,0.02)",
                  transition:"border-color 0.2s",
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor="rgba(255,255,255,0.35)"}
                onMouseLeave={e => e.currentTarget.style.borderColor="rgba(255,255,255,0.15)"}
              >
                <div style={{ fontSize:24, marginBottom:6 }}>📸</div>
                <div style={{ fontSize:11, color:"rgba(255,255,255,0.5)", lineHeight:1.5 }}>
                  {phase === "done" ? "Try another photo" : "Drop a photo or click to pick"}<br/>
                  <span style={{ fontSize:9, color:"rgba(255,255,255,0.25)" }}>jpg · png · webp</span>
                </div>
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" onChange={onFilePick}
              style={{ display:"none" }} />

            {/* Spinner */}
            {phase === "calling" && (
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:12, padding:"16px 0" }}>
                {preview && (
                  <img src={preview} alt="preview"
                    style={{ width:72, height:72, borderRadius:12, objectFit:"cover" }} />
                )}
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{
                    width:16, height:16, borderRadius:"50%",
                    border:"2px solid rgba(255,255,255,0.1)",
                    borderTop:`2px solid ${STATUS_COLOR.calling}`,
                    animation:"spin 0.8s linear infinite",
                  }}/>
                  <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                  <span style={{ fontSize:11, color:"rgba(255,255,255,0.4)" }}>
                    Calling GenerateComparisonAsync…
                  </span>
                </div>
              </div>
            )}

            {/* ── Results ── */}
            {phase === "done" && top && (
              <>
                {/* Top match hero */}
                <div style={{
                  background:"rgba(255,255,255,0.04)", borderRadius:14,
                  border:"1px solid rgba(255,255,255,0.08)",
                  overflow:"hidden",
                }}>
                  <div style={{ display:"flex", gap:0 }}>
                    {/* User photo */}
                    {preview && (
                      <div style={{ position:"relative", width:100, flexShrink:0 }}>
                        <img src={preview} alt="you"
                          style={{ width:"100%", height:120, objectFit:"cover", objectPosition:"center top", display:"block" }} />
                        <div style={{
                          position:"absolute", bottom:4, left:4,
                          background:"rgba(0,0,0,0.7)", backdropFilter:"blur(6px)",
                          borderRadius:6, padding:"2px 6px",
                          fontSize:8, fontWeight:700, color:"rgba(255,255,255,0.6)",
                        }}>YOU</div>
                      </div>
                    )}
                    {/* Divider */}
                    <div style={{ width:2, background:`${top.color}44`, flexShrink:0 }} />
                    {/* Celeb photo */}
                    <div style={{ flex:1, position:"relative" }}>
                      {top.img ? (
                        <img src={top.img} alt={top.name}
                          style={{ width:"100%", height:120, objectFit:"cover", objectPosition:"center top", display:"block" }}
                          onError={e => e.target.style.display="none"} />
                      ) : (
                        <div style={{ width:"100%", height:120, background:`linear-gradient(135deg,${top.color}33,${top.color}66)`,
                          display:"flex", alignItems:"center", justifyContent:"center", fontSize:28 }}>⭐</div>
                      )}
                      {/* Score badge */}
                      <div style={{
                        position:"absolute", top:6, right:6,
                        background:top.color, borderRadius:8,
                        padding:"2px 8px",
                        fontFamily:"'Fredoka',sans-serif", fontWeight:700, fontSize:16,
                        color:"#000", boxShadow:`0 0 16px ${top.color}88`,
                      }}>{top.pct}%</div>
                    </div>
                  </div>
                  <div style={{ padding:"8px 12px" }}>
                    <div style={{ fontSize:11, fontWeight:700, color:top.color, letterSpacing:0.3 }}>
                      🥇 #{1} · {top.name}
                    </div>
                    <div style={{ fontSize:9, color:"rgba(255,255,255,0.3)", marginTop:2 }}>
                      {top.celebrityId}
                    </div>
                  </div>
                </div>

                {/* Other matches */}
                {others.length > 0 && (
                  <div>
                    <div style={{ fontSize:9, fontWeight:700, color:"rgba(255,255,255,0.3)", marginBottom:6, letterSpacing:0.8, textTransform:"uppercase" }}>
                      Also looks like…
                    </div>
                    <div style={{ display:"flex", gap:6 }}>
                      {others.map((c, i) => (
                        <div key={c.celebrityId || i} style={{
                          flex:1, borderRadius:10, overflow:"hidden",
                          border:"1px solid rgba(255,255,255,0.07)",
                          position:"relative",
                        }}>
                          {c.img ? (
                            <img src={c.img} alt={c.name}
                              style={{ width:"100%", height:64, objectFit:"cover", objectPosition:"center top", display:"block" }}
                              onError={e => e.target.style.display="none"} />
                          ) : (
                            <div style={{ width:"100%", height:64, background:"rgba(255,255,255,0.05)",
                              display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>⭐</div>
                          )}
                          <div style={{ padding:"4px 5px" }}>
                            <div style={{
                              fontSize:8, fontWeight:700, color:"rgba(255,255,255,0.6)",
                              overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
                            }}>{c.name.split(" ")[0]}</div>
                            <div style={{ fontSize:9, fontWeight:700, color:c.color }}>{c.pct}%</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Timing */}
                <div style={{ fontSize:9, color:"rgba(255,255,255,0.2)", textAlign:"center" }}>
                  ⏱ {prettyMs(elapsed)} · {results.length} celebrities returned
                </div>
              </>
            )}

            {/* Error */}
            {phase === "error" && err && (
              <div>
                <div style={{ fontSize:10, fontWeight:700, color:"#F87171", marginBottom:6 }}>
                  ✗ Error
                </div>
                <pre style={{
                  fontSize:9, color:"#F87171",
                  background:"rgba(248,113,113,0.06)",
                  border:"1px solid rgba(248,113,113,0.18)",
                  borderRadius:10, padding:10, margin:0,
                  whiteSpace:"pre-wrap", wordBreak:"break-word",
                }}>
                  code: {err.code}{"\n"}message: {err.message}
                </pre>
                <div style={{ fontSize:9, color:"rgba(255,255,255,0.3)", marginTop:8, lineHeight:1.6 }}>
                  Common causes: function not deployed · wrong region · CORS · auth required
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function btnStyle(bg) {
  return {
    background:bg, border:"1px solid rgba(255,255,255,0.08)",
    borderRadius:7, padding:"4px 8px", cursor:"pointer",
    fontSize:10, color:"rgba(255,255,255,0.5)", fontFamily:"inherit",
  };
}
