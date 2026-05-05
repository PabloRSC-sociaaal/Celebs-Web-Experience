/**
 * app.js — Shared Firebase app instance "celebs"
 * Both auth and the HTTP API client (via getIdToken) import from here.
 *
 * Configuration is read from env vars (see config/env.js). The dev defaults
 * point at the demo Firebase project so the local box keeps working out of
 * the box; production deploys MUST set VITE_FIREBASE_* in their environment.
 */

import { initializeApp, getApps } from "firebase/app";
import {
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID,
} from "../../config/env";

const FIREBASE_CONFIG = {
  apiKey:            FIREBASE_API_KEY,
  authDomain:        FIREBASE_AUTH_DOMAIN,
  projectId:         FIREBASE_PROJECT_ID,
  storageBucket:     FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
  appId:             FIREBASE_APP_ID,
};

export const firebaseApp =
  getApps().find(a => a.name === "celebs") ||
  initializeApp(FIREBASE_CONFIG, "celebs");
