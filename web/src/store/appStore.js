// ─────────────────────────────────────────────────────────
//  Global store (Zustand)
//  Shared state across all pages.
//
//  To add new state: add it here and consume via useAppStore()
// ─────────────────────────────────────────────────────────

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const useAppStore = create(persist((set) => ({
  // User-uploaded photo (blob URL)
  uploadedPhoto: null,
  setUploadedPhoto: (url) => set({ uploadedPhoto: url }),

  // Preloaded result (for replay from dashboard)
  preloadedResult: null,
  setPreloadedResult: (result) => set({ preloadedResult: result }),

  // Whether the spotlight (dark overlay) is active
  spotlight: false,
  setSpotlight: (val) => set({ spotlight: val }),

  // Pending file to process (sent from any CTA)
  pendingFile: null,
  setPendingFile: (file) => set({ pendingFile: file }),

  // Normalized face geometry (center, bounding box, ratio)
  faceGeometry: null,
  setFaceGeometry: (geo) => set({ faceGeometry: geo }),

  // Whether the user has previous generations (shows Dashboard button)
  hasDashboard: false,
  setHasDashboard: (val) => set({ hasDashboard: val }),

  // Return context — where the user came from when starting a scan
  // Shape: { type: "camino"|"dice"|"free", returnTo: "camino"|"dashboard",
  //          step?: number, hint?: { emoji, text, color } }
  returnContext: null,
  setReturnContext: (ctx) => set({ returnContext: ctx }),

  // Active dashboard sub-page (persists when navigating to results and back)
  dashSubPage: "main",   // "main" | "camino"
  setDashSubPage: (v) => set({ dashSubPage: v }),

  // Index of the just-completed step (triggers animation in Camino)
  justCompletedStep: null,   // number | null
  setJustCompletedStep: (n) => set({ justCompletedStep: n }),

  // Real API result (normalized celebrity array)
  apiResult: null,
  setApiResult: (result) => set({ apiResult: result }),

  // Firebase user (null = not logged in)
  user: null,
  setUser: (u) => set({ user: u }),

  // Lemon Squeezy subscription (null = not loaded / not subscribed)
  subscription: null,
  setSubscription: (sub) => set({ subscription: sub }),

  // Full reset — clears scan state but does NOT log out
  reset: () => set({
    uploadedPhoto: null,
    preloadedResult: null,
    spotlight: false,
    returnContext: null,
    faceGeometry: null,
    apiResult: null,
    // user is kept intentionally — logout is explicit via signOutUser()
  }),
}), {
  // Persist only the keys that actually survive a reload. Blob URLs and
  // transient runtime state (spotlight, pendingFile, faceGeometry, etc.)
  // are intentionally excluded. user/subscription come from Firebase
  // listeners on rehydrate so we don't store them either.
  name: "celebs-app-store-v1",
  storage: createJSONStorage(() => localStorage),
  partialize: (state) => ({
    uploadedPhoto:    typeof state.uploadedPhoto === "string"
                        && !state.uploadedPhoto.startsWith("blob:")
                        ? state.uploadedPhoto : null,
    preloadedResult:  state.preloadedResult,
    apiResult:        state.apiResult,
    returnContext:    state.returnContext,
    dashSubPage:      state.dashSubPage,
    hasDashboard:     state.hasDashboard,
  }),
}));
