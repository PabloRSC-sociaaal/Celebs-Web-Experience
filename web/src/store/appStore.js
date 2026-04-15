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

  // Archivo pendiente de procesar (enviado desde cualquier CTA)
  pendingFile: null,
  setPendingFile: (file) => set({ pendingFile: file }),

  // Geometría facial normalizada (centro, bounding box, ratio)
  faceGeometry: null,
  setFaceGeometry: (geo) => set({ faceGeometry: geo }),

  // Si el usuario tiene generaciones previas (para mostrar botón Dashboard)
  hasDashboard: false,
  setHasDashboard: (val) => set({ hasDashboard: val }),

  // Contexto de retorno — de dónde vino el usuario al iniciar un scan
  // Shape: { type: "camino"|"dice"|"free", returnTo: "camino"|"dashboard",
  //          step?: number, hint?: { emoji, text, color } }
  returnContext: null,
  setReturnContext: (ctx) => set({ returnContext: ctx }),

  // Sub-página activa del dashboard (persiste al navegar a results y volver)
  dashSubPage: "main",   // "main" | "camino"
  setDashSubPage: (v) => set({ dashSubPage: v }),

  // Índice del paso que acaba de completarse (para trigger animation en Camino)
  justCompletedStep: null,   // number | null
  setJustCompletedStep: (n) => set({ justCompletedStep: n }),

  // Resultado real de la API (array normalizado de celebridades)
  apiResult: null,
  setApiResult: (result) => set({ apiResult: result }),

  // Firebase user (null = not logged in)
  user: null,
  setUser: (u) => set({ user: u }),

  // Lemon Squeezy subscription (null = not loaded / not subscribed)
  subscription: null,
  setSubscription: (sub) => set({ subscription: sub }),

  // Reset completo — limpia el scan pero NO cierra sesión
  reset: () => set({
    uploadedPhoto: null,
    preloadedResult: null,
    spotlight: false,
    returnContext: null,
    faceGeometry: null,
    apiResult: null,
    // user se mantiene intencionalmente — el logout es explícito
  }),
}));
