const ITEMS = [
  "Taylor Swift 97%", "Timothée Chalamet 94%", "Zendaya 96%", "Bad Bunny 91%",
  "Selena Gomez 93%", "Henry Cavill 89%", "Billie Eilish 90%", "Messi 88%",
  "Ana de Armas 92%", "Harry Styles 87%", "Rihanna 95%", "LeBron 85%",
];

export function Marquee() {
  return (
    <div style={{
      overflow: "hidden", width: "100%", padding: "14px 0",
      position: "relative",
      maskImage: "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
      WebkitMaskImage: "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
    }}>
      <div style={{ display: "flex", gap: 12, animation: "marquee 40s linear infinite", width: "max-content" }}>
        {[...ITEMS, ...ITEMS].map((item, i) => (
          <div key={i} style={{
            background: "rgba(0,0,0,0.25)", backdropFilter: "blur(8px)",
            borderRadius: 30, padding: "8px 18px",
            fontFamily: "'Oxanium', sans-serif", fontSize: 13, fontWeight: 600,
            color: "#fff", whiteSpace: "nowrap",
            border: "1px solid rgba(255,255,255,0.15)",
          }}>
            ⭐ {item}
          </div>
        ))}
      </div>
    </div>
  );
}
