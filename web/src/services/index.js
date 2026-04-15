// ─────────────────────────────────────────────────────────
//  BACKEND ENTRY POINT
//
//  To switch backends, change this single import line:
//    · Local dev:       "./adapters/local.js"
//    · Supabase:        "./adapters/supabase.js"
//    · Firebase:        "./adapters/firebase.js"
//    · Custom REST API: "./adapters/api.js"
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
