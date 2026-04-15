/**
 * authService.js — Firebase Auth helpers
 *
 * En DEMO_MODE (config.js): auth completamente en memoria, sin Firebase.
 *   • signInWithGoogle / signInWithEmail / signUpWithEmail → resuelven al instante con MOCK_USER
 *   • signOutUser  → limpia el usuario mock
 *   • initAuthListener → igual que onAuthStateChanged pero con estado local
 *
 * En producción (DEMO_MODE = false): delega todo a Firebase Auth.
 */

import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

import { DEMO_MODE } from "../../config";
import { MOCK_USER } from "../../demo/mockData";
import { firebaseApp } from "./app";

// ─── DEMO: in-memory auth state ───────────────────────────────────────────────
let _mockUser = null;
const _mockListeners = new Set();

function _setMockUser(user) {
  _mockUser = user;
  _mockListeners.forEach(cb => cb(user));
}

// ─── Production: Firebase Auth instance (tree-shaken in demo builds) ──────────
export const auth = DEMO_MODE ? null : getAuth(firebaseApp);
const googleProvider = DEMO_MODE ? null : new GoogleAuthProvider();

// ─── Public API ───────────────────────────────────────────────────────────────

export function signInWithGoogle() {
  if (DEMO_MODE) {
    _setMockUser(MOCK_USER);
    return Promise.resolve({ user: MOCK_USER });
  }
  return signInWithPopup(auth, googleProvider);
}

export function signInWithEmail(email, password) {
  if (DEMO_MODE) {
    const user = { ...MOCK_USER, email, displayName: email.split("@")[0] };
    _setMockUser(user);
    return Promise.resolve({ user });
  }
  return signInWithEmailAndPassword(auth, email, password);
}

export function signUpWithEmail(email, password) {
  if (DEMO_MODE) {
    const user = { ...MOCK_USER, email, displayName: email.split("@")[0] };
    _setMockUser(user);
    return Promise.resolve({ user });
  }
  return createUserWithEmailAndPassword(auth, email, password);
}

export function signOutUser() {
  if (DEMO_MODE) {
    _setMockUser(null);
    return Promise.resolve();
  }
  return signOut(auth);
}

/**
 * initAuthListener(callback)
 * Llama a callback(user) inmediatamente con el estado actual,
 * y de nuevo cada vez que cambie. Devuelve función de cleanup (unsubscribe).
 */
export function initAuthListener(callback) {
  if (DEMO_MODE) {
    callback(_mockUser); // estado inicial = null (no logueado)
    _mockListeners.add(callback);
    return () => _mockListeners.delete(callback);
  }
  return onAuthStateChanged(auth, callback);
}
