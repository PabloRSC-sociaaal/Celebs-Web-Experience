// ─────────────────────────────────────────────────────────
//  Adaptador SUPABASE — stub listo para implementar.
//
//  El equipo de devs solo necesita:
//    1. npm install @supabase/supabase-js
//    2. Añadir VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY a .env
//    3. Implementar las funciones de abajo
//    4. Cambiar services/index.js para exportar desde aquí
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
