// ─────────────────────────────────────────────────────────
// @STUB — Express API server (entire api/ directory)
// Status:    DUMMY — server runs but all routes return stub data, no DB connected
// Missing:   Real database connection, authentication middleware, all route implementations
// Priority:  P1 — not used by the app yet (frontend uses Firebase Functions directly)
// Effort:    ~8h+ — define DB schema, implement auth middleware, wire all CRUD routes
// Depends:   Decision on whether to keep Express API or go full Firebase
// Note:      The frontend currently does NOT call this server. It uses:
//            - Firebase Functions for AI comparison + payments
//            - localStorage adapters for generation persistence
//            This server is scaffolded for a future standalone backend.
//
//  To start: npm run dev (from the api/ folder)
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

// ── Routes ──
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
