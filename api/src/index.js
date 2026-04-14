// ─────────────────────────────────────────────────────────
//  Celebs API — Express server
//
//  Actualmente en modo "stub": todas las rutas devuelven
//  datos de ejemplo. El equipo de devs implementará la
//  lógica real cuando conecten el backend definitivo.
//
//  Para arrancar: npm run dev (desde la carpeta api/)
// ─────────────────────────────────────────────────────────

import "dotenv/config";
import express from "express";
import cors    from "cors";

import generationsRouter from "./routes/generations.js";
import healthRouter      from "./routes/health.js";

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:5173" }));
app.use(express.json({ limit: "10mb" }));

// ── Rutas ──
app.use("/api/health",      healthRouter);
app.use("/api/generations", generationsRouter);

// ── 404 handler ──
app.use((_, res) => res.status(404).json({ error: "Route not found" }));

// ── Error handler ──
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`✅  Celebs API running on http://localhost:${PORT}`);
});
