// ─────────────────────────────────────────────────────────
//  Generations route — STUB
//  El equipo de devs conectará aquí la base de datos real
//  (Supabase, Firebase, PostgreSQL, etc.)
// ─────────────────────────────────────────────────────────

import { Router } from "express";

const router = Router();

// GET /api/generations
// Devuelve todas las generaciones del usuario (stub: array vacío)
router.get("/", (_req, res) => {
  // TODO (devs): conectar a BD real y filtrar por usuario autenticado
  res.json({ data: [], total: 0 });
});

// POST /api/generations
// Guarda una nueva generación
router.post("/", (req, res) => {
  const { photoUrl, celeb, others } = req.body;
  if (!celeb) return res.status(400).json({ error: "celeb is required" });

  // TODO (devs): guardar en BD real
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
  // TODO (devs): borrar de BD real
  console.log("[stub] deleteGeneration:", id);
  res.json({ success: true });
});

// PATCH /api/generations/:id/label
router.patch("/:id/label", (req, res) => {
  const { id } = req.params;
  const { label, labelSub } = req.body;
  // TODO (devs): actualizar en BD real
  console.log("[stub] updateLabel:", id, label, labelSub);
  res.json({ success: true });
});

export default router;
