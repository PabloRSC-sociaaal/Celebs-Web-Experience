// ─────────────────────────────────────────────────────────
// @STUB — Supabase persistence adapter
// Status:    DUMMY — throws on every call, not functional
// Missing:   Full Supabase CRUD implementation for generations
// Priority:  P1 — alternative to Firebase adapter; pick one
// Effort:    ~4h — install SDK, create table schema, implement all 6 exports
// Depends:   Supabase project created + env vars configured
//
//  Steps to implement:
//    1. npm install @supabase/supabase-js
//    2. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env
//    3. Implement the functions below
//    4. Change services/index.js to export from this file
// ─────────────────────────────────────────────────────────

// import { createClient } from "@supabase/supabase-js";
// const supabase = createClient(
//   import.meta.env.VITE_SUPABASE_URL,
//   import.meta.env.VITE_SUPABASE_ANON_KEY
// );

export function getGenerations() {
  // return supabase.from("generations").select("*").order("created_at", { ascending: false });
  throw new Error("Supabase adapter not yet implemented");
}

export function hasGenerations() {
  throw new Error("Supabase adapter not yet implemented");
}

export function saveGeneration(_generation) {
  // return supabase.from("generations").insert([_generation]);
  throw new Error("Supabase adapter not yet implemented");
}

export function clearGenerations() {
  throw new Error("Supabase adapter not yet implemented");
}
