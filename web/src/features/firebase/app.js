/**
 * @STUB — Firebase app config (HARDCODED credentials — needs env var migration)
 * Status:    FUNCTIONAL but INSECURE — API keys hardcoded in source
 * Missing:   Move all config values to env vars (VITE_FIREBASE_*) via config/env.js
 * Priority:  P0 — hardcoded keys must not ship to production
 * Effort:    30min — read from config/env.js, add to .env, update .env.example
 *
 * app.js — Shared Firebase app instance "celebs"
 * Both auth and functions import from here.
 */

import { initializeApp, getApps } from "firebase/app";

const FIREBASE_CONFIG = {
  apiKey:            "AIzaSyDaZ7_44sjR9bIfIUB-A8W_k836wk1jGdk",
  authDomain:        "celebs-dev.firebaseapp.com",
  projectId:         "celebs-dev",
  storageBucket:     "celebs-dev.firebasestorage.app",
  messagingSenderId: "836280488487",
  appId:             "1:836280488487:web:2d952414e95fb5c46f3402",
};

export const firebaseApp =
  getApps().find(a => a.name === "celebs") ||
  initializeApp(FIREBASE_CONFIG, "celebs");
