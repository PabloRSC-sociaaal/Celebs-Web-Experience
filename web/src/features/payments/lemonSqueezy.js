// ─────────────────────────────────────────────────────────────────────────────
// payments/lemonSqueezy.js
//
// Lemon Squeezy hosted-checkout flow. The variant catalogue lives in
// plans.js; this module turns "user wants the annual plan" into "we have
// a redirect URL to LS hosted checkout".
//
// Backend contract: POST /api/checkouts { variantId } → { url }
// (see functions/src/modules/checkouts/create.js)
// ─────────────────────────────────────────────────────────────────────────────

import { DEMO_MODE } from "../../config";
import { apiFetch }  from "../../lib/apiClient";
import { getPlan, isPaymentsConfigured } from "./plans";

/**
 * Create a Lemon Squeezy checkout for the given plan.
 *
 * @param {"monthly"|"annual"} planId
 * @returns {Promise<string>} hosted checkout URL
 */
export async function createCheckout(planId) {
  if (DEMO_MODE) {
    console.info("[DEMO] createCheckout → no-op");
    return "#";
  }
  if (!isPaymentsConfigured()) {
    throw new Error("Payments not configured: VITE_LS_VARIANT_* missing");
  }
  const plan = getPlan(planId);
  const response = await apiFetch("/api/checkouts", {
    method: "POST",
    body: { variantId: plan.variantId },
  });
  if (!response?.url) throw new Error("Checkout creation failed: no URL");
  return response.url;
}

/**
 * Convenience: create checkout + send the user to it. Top-level navigation
 * (rather than a popup) keeps the flow on iOS Safari and avoids popup blockers.
 *
 * @param {"monthly"|"annual"} planId
 */
export async function redirectToCheckout(planId) {
  const url = await createCheckout(planId);
  if (!url || url === "#") return;
  window.location.assign(url);
}
