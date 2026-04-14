// ─────────────────────────────────────────────────────────
//  PUNTO DE ENTRADA DEL BACKEND
//
//  Para cambiar de backend, solo cambia esta línea:
//    · Desarrollo local:  "./adapters/local.js"
//    · Supabase:          "./adapters/supabase.js"
//    · Firebase:          "./adapters/firebase.js"
//    · API REST propia:   "./adapters/api.js"
// ─────────────────────────────────────────────────────────

export {
  getAll,
  getGenerations,
  hasGenerations,
  saveGeneration,
  updateLabel,
  deleteGeneration,
  clearGenerations,
} from "./adapters/local.js";
