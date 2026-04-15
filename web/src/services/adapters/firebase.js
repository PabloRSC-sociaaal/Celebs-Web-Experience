// ─────────────────────────────────────────────────────────
// @STUB — Firebase/Firestore persistence adapter
// Status:    DUMMY — throws on every call, not functional
// Missing:   Firestore CRUD for per-user generation storage
// Priority:  P0 — required for multi-device and real user data
// Effort:    ~4h — reuse firebase/app.js, create collection schema, implement exports
// Depends:   Firebase project operational (already set up for auth/functions)
//
//  Steps to implement:
//    1. npm install firebase (already installed)
//    2. Add VITE_FIREBASE_* variables to .env
//    3. Implement the functions below
//    4. Change services/index.js to export from this file
// ─────────────────────────────────────────────────────────

// import { initializeApp } from "firebase/app";
// import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";
// const app = initializeApp({ ... });
// const db = getFirestore(app);

export function getGenerations() {
  throw new Error("Firebase adapter not yet implemented");
}

export function hasGenerations() {
  throw new Error("Firebase adapter not yet implemented");
}

export function saveGeneration(_generation) {
  throw new Error("Firebase adapter not yet implemented");
}

export function clearGenerations() {
  throw new Error("Firebase adapter not yet implemented");
}
