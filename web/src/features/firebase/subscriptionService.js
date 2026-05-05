/**
 * subscriptionService.js — Firestore subscription listener + checkout helper
 *
 * In DEMO_MODE: all functions are no-ops or return empty values.
 * Per architecture.mdc, the checkout call goes through apiClient (fetch +
 * Bearer) — never via httpsCallable.
 */

import { DEMO_MODE } from "../../config";
import { getFirestore, doc, onSnapshot } from "firebase/firestore";
import { firebaseApp } from "./app";
import { apiFetch }    from "../../lib/apiClient";

const db = getFirestore(firebaseApp);

/**
 * Listen to the user's subscription status in real time.
 * Returns an unsubscribe function.
 */
export function initSubscriptionListener(uid, callback) {
  if (DEMO_MODE) {
    callback(null); // no subscription in demo
    return () => {};
  }
  return onSnapshot(
    doc(db, "users", uid),
    (snap) => {
      const data = snap.data();
      callback(data?.subscription ?? null);
    },
    (err) => {
      console.warn("[subscription] listener error:", err);
      callback(null);
    },
  );
}

/**
 * Create a Lemon Squeezy checkout URL for the given variant.
 * Returns the hosted checkout URL string.
 */
export async function createCheckout(variantId) {
  if (DEMO_MODE) {
    console.info("[DEMO] createCheckout → no-op");
    return "#";
  }
  const response = await apiFetch("/api/checkouts", {
    method: "POST",
    body: { variantId },
  });
  return response?.url;
}

/**
 * Check if a subscription object represents an active premium user.
 */
export function isPremium(subscription) {
  if (!subscription) return false;
  return subscription.status === "active" || subscription.status === "on_trial";
}
