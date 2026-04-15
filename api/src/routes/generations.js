// ─────────────────────────────────────────────────────────
// @STUB — Generations REST endpoints
// Status:    DUMMY — returns empty arrays / logs to console, no real persistence
// Missing:   Database integration, user auth check, image storage
// Priority:  P1 — see api/src/index.js for full context
// ─────────────────────────────────────────────────────────

import { Router } from "express";

const router = Router();

// GET /api/generations
// Returns all generations for the authenticated user (stub: empty array)
router.get("/", (_req, res) => {
  // TODO: connect to real DB and filter by authenticated user
  res.json({ data: [], total: 0 });
});

// POST /api/generations
// Saves a new generation
router.post("/", (req, res) => {
  const { photoUrl, celeb, others } = req.body;
  if (!celeb) return res.status(400).json({ error: "celeb is required" });

  // TODO: save to real DB
  const stub = {
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    celeb,
    others: others ?? [],
    label: null,
    labelSub: null,
  };

  console.log("[stub] saveGeneration called for:", celeb?.name, "| photo length:", photoUrl?.length ?? 0);
  res.status(201).json({ data: stub });
});

// DELETE /api/generations/:id
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  // TODO: delete from real DB
  console.log("[stub] deleteGeneration:", id);
  res.json({ success: true });
});

// PATCH /api/generations/:id/label
router.patch("/:id/label", (req, res) => {
  const { id } = req.params;
  const { label, labelSub } = req.body;
  // TODO: update in real DB
  console.log("[stub] updateLabel:", id, label, labelSub);
  res.json({ success: true });
});

export default router;
