// ─────────────────────────────────────────────────────────
//  Store global con Zustand
//  Estado compartido entre todas las páginas.
//
//  Para añadir un nuevo estado: añade aquí y consume con useAppStore()
// ─────────────────────────────────────────────────────────

import { create } from "zustand";

export const useAppStore = create((set) => ({
  // Foto subida por el usuario (blob URL)
  uploadedPhoto: null,
  setUploadedPhoto: (url) => set({ uploadedPhoto: url }),

  // Resultado precargado (para replay desde dashboard)
  preloadedResult: null,
  setPreloadedResult: (result) => set({ preloadedResult: result }),

  // Si el spotlight (overlay oscuro) está activo
  spotlight: false,
  setSpotlight: (val) => set({ spotlight: val }),

  // Si el usuario tiene generaciones previas (para mostrar botón Dashboard)
  hasDashboard: false,
  setHasDashboard: (val) => set({ hasDashboard: val }),

  // Reset completo (volver a landing limpia)
  reset: () => set({
    uploadedPhoto: null,
    preloadedResult: null,
    spotlight: false,
  }),
}));
