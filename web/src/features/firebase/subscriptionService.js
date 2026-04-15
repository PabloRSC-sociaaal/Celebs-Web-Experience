/**
 * subscriptionService.js — Firestore subscription listener + checkout helper
 *
 * In DEMO_MODE: all functions are no-ops or return empty values.
 */

import { DEMO_MODE } from "../../config";
import { getFirestore, doc, onSnapshot } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { firebaseApp } from "./app";

const db = getFirestore(firebaseApp);
const functions = getFunctions(firebaseApp, "us-central1");
const createCheckoutFn = httpsCallable(functions, "createCheckoutUrl");

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
  const result = await createCheckoutFn({ variantId });
  return result.data.url;
}

/**
 * Check if a subscription object represents an active premium user.
 */
export function isPremium(subscription) {
  if (!subscription) return false;
  return subscription.status === "active" || subscription.status === "on_trial";
}
