// ─────────────────────────────────────────────────────────────────────────────
// payments/plans.js
//
// Single source of truth for the Pro subscription catalogue. The dev team
// fills in the variantIds (Lemon Squeezy dashboard) via env vars; this file
// turns those env values into a typed catalogue the UI can iterate over.
// ─────────────────────────────────────────────────────────────────────────────

import { LS_VARIANT_MONTHLY, LS_VARIANT_ANNUAL } from "../../config/env";

/**
 * @typedef {"monthly" | "annual"} PlanId
 *
 * @typedef {{
 *   id: PlanId,
 *   label: string,
 *   priceLabel: string,
 *   billingNote: string,
 *   variantId: string,
 *   recommended?: boolean,
 *   savingsLabel?: string,
 * }} Plan
 */

/** @type {Record<PlanId, Plan>} */
export const PLANS = {
  monthly: {
    id:          "monthly",
    label:       "Monthly",
    priceLabel:  "$4.99 / month",
    billingNote: "Billed monthly · cancel anytime",
    variantId:   LS_VARIANT_MONTHLY,
  },
  annual: {
    id:          "annual",
    label:       "Annual",
    priceLabel:  "$39.99 / year",
    billingNote: "Billed yearly · cancel anytime",
    variantId:   LS_VARIANT_ANNUAL,
    recommended: true,
    savingsLabel: "Save 33 %",
  },
};

/** @returns {Plan} */
export function getPlan(planId) {
  const plan = PLANS[planId];
  if (!plan) throw new Error(`Unknown plan: ${planId}`);
  return plan;
}

/** Iterable list of plans, useful for rendering pricing tables. */
export function listPlans() {
  return Object.values(PLANS);
}

/** True when both variants are configured (otherwise checkout is disabled). */
export function isPaymentsConfigured() {
  return Boolean(LS_VARIANT_MONTHLY) && Boolean(LS_VARIANT_ANNUAL);
}
