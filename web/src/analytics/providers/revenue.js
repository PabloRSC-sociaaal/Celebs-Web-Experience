// ─── Revenue Tracking Provider ────────────────────────────────────────────────
// @STUB — Revenue / Subscription Analytics provider
// Status:    DUMMY — console.debug only, no revenue tracking active
// Missing:   Real SDK integration (RevenueCat, Adapty, or Stripe Billing dashboard)
// Priority:  P0 — required before accepting real payments
// Effort:    ~3h — install SDK, wire to webhook events, avoid double-count with functions/index.js
// Depends:   Payment platform operational (Lemon Squeezy secrets configured)
// ──────────────────────────────────────────────────────────────────────────────
//
// Subscription lifecycle, MRR, churn, trial conversion, LTV monitoring.
//
// Integration candidates:
//   - RevenueCat      → https://www.revenuecat.com/docs/web-sdk (cross-platform subs)
//   - Adapty          → https://docs.adapty.io/docs/web (paywall optimization)
//   - Lemon Squeezy   → Dashboard webhooks already integrated in functions/index.js
//   - Stripe Billing  → https://docs.stripe.com/billing
//
// When ready to integrate:
//   1. Install SDK (npm install @revenuecat/purchases-js / adapty-js)
//   2. Replace stub methods with real SDK calls
//   3. Coordinate with functions/index.js webhook to avoid double-counting
// ──────────────────────────────────────────────────────────────────────────────

const TAG = "[analytics:revenue]";

export const revenueProvider = {
  name: "revenue",

  init() {
    if (import.meta.env.DEV) console.debug(TAG, "init (stub)");
  },

  identify(userId, traits) {
    if (import.meta.env.DEV) console.debug(TAG, "identify", userId, traits);
  },

  track(event, properties) {
    // Revenue provider only cares about monetization events
  },

  page() {
    // No-op for revenue tracking
  },

  revenue(amount, currency, meta) {
    if (import.meta.env.DEV) console.debug(TAG, "revenue", { amount, currency, ...meta });
  },
};
