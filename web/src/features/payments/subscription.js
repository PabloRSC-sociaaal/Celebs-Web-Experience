// ─────────────────────────────────────────────────────────────────────────────
// payments/subscription.js
//
// Owner of the user's subscription state. Subscribes to Firestore via
// onSnapshot in production; returns null in DEMO_MODE.
//
// The Firestore document is written by the LS webhook handler in
// functions/src/modules/webhooks/lemonSqueezy.js — keep the field shape
// in sync with that module.
// ─────────────────────────────────────────────────────────────────────────────

import { DEMO_MODE } from "../../config";
import { getFirestore, doc, onSnapshot } from "firebase/firestore";
import { firebaseApp } from "../firebase/app";

const db = DEMO_MODE ? null : getFirestore(firebaseApp);

/**
 * Subscribe to the live subscription state of `uid`.
 * @param {string} uid
 * @param {(sub: Subscription | null) => void} callback
 * @returns {() => void} unsubscribe
 *
 * @typedef {{
 *   status: "active" | "on_trial" | "past_due" | "paused" | "cancelled" | "expired" | "unknown",
 *   variantId: string,
 *   subscriptionId: string,
 *   customerId: string,
 *   currentPeriodEnd: string | null,
 * }} Subscription
 */
export function initSubscriptionListener(uid, callback) {
  if (DEMO_MODE) {
    callback(null);
    return () => {};
  }
  return onSnapshot(
    doc(db, "users", uid),
    (snap) => {
      const data = snap.data();
      callback(data?.subscription ?? null);
    },
    (err) => {
      console.warn("[payments] subscription listener error:", err);
      callback(null);
    },
  );
}

/**
 * @param {Subscription | null} subscription
 * @returns {boolean}
 */
export function isPremium(subscription) {
  if (!subscription) return false;
  return subscription.status === "active" || subscription.status === "on_trial";
}
