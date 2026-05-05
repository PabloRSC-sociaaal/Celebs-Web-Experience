// ─────────────────────────────────────────────────────────────────────────────
// @celebs/shared-types
//
// Single source of truth for the DTOs that travel between apps/web and
// apps/functions. The HTTP shapes here mirror apps/functions/openapi.yaml
// — keep them in lock-step (architecture.mdc requires it).
//
// JS values are exported alongside the .d.ts declarations so the runtime
// can use the enum-like constants without pulling in TypeScript.
// ─────────────────────────────────────────────────────────────────────────────

/** Subscription statuses that count as paid access in the web client. */
export const PREMIUM_STATUSES = Object.freeze(["active", "on_trial"]);

/** All subscription statuses we map from Lemon Squeezy. */
export const SUBSCRIPTION_STATUSES = Object.freeze([
  "active",
  "on_trial",
  "past_due",
  "paused",
  "cancelled",
  "expired",
  "unknown",
]);

/** LS webhook events the backend handles (others are 200-OK ignored). */
export const HANDLED_LS_EVENTS = Object.freeze([
  "subscription_created",
  "subscription_updated",
  "subscription_cancelled",
  "subscription_expired",
]);
