/**
 * authService.js — Firebase Auth helpers
 *
 * When DEMO_MODE is true: auth runs entirely in-memory, no Firebase calls.
 *   • signInWithGoogle / signInWithEmail / signUpWithEmail → resolve instantly with MOCK_USER
 *   • signOutUser  → clears the mock user
 *   • initAuthListener → same as onAuthStateChanged but with local state
 *
 * When DEMO_MODE is false: delegates everything to Firebase Auth.
 */

import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider,
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
const appleProvider  = DEMO_MODE ? null : (() => {
  const p = new OAuthProvider("apple.com");
  p.addScope("email");
  p.addScope("name");
  return p;
})();

/**
 * Apple Sign-In is only available on Safari / iOS WebKit reliably.
 * Other browsers can use it through Firebase popup but the experience
 * is degraded and Apple may reject the OAuth flow.
 */
export function isAppleSignInAvailable() {
  if (typeof window === "undefined") return false;
  if (DEMO_MODE) return true; // surface the button so we can demo the flow
  const ua = window.navigator?.userAgent || "";
  const isApplePlatform = /iPhone|iPad|iPod|Macintosh/i.test(ua);
  const isSafari = /^((?!chrome|android|crios|fxios).)*safari/i.test(ua);
  // Show on Apple platforms regardless of browser, plus Safari on any platform.
  return isApplePlatform || isSafari;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function signInWithGoogle() {
  if (DEMO_MODE) {
    _setMockUser(MOCK_USER);
    return Promise.resolve({ user: MOCK_USER });
  }
  return signInWithPopup(auth, googleProvider);
}

export function signInWithApple() {
  if (DEMO_MODE) {
    const user = { ...MOCK_USER, email: "demo+apple@celebs.app", displayName: "Apple Demo" };
    _setMockUser(user);
    return Promise.resolve({ user });
  }
  return signInWithPopup(auth, appleProvider);
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
 * Calls callback(user) immediately with the current state,
 * and again whenever it changes. Returns a cleanup (unsubscribe) function.
 */
export function initAuthListener(callback) {
  if (DEMO_MODE) {
    callback(_mockUser); // initial state = null (not logged in)
    _mockListeners.add(callback);
    return () => _mockListeners.delete(callback);
  }
  return onAuthStateChanged(auth, callback);
}
