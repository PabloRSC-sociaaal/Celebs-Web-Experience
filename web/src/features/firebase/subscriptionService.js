/**
 * subscriptionService.js — DEPRECATED, kept for backward-compatibility.
 *
 * The canonical payments module is now `features/payments/` — please
 * import from there in new code:
 *
 *   import { isPremium, initSubscriptionListener, createCheckout } from "features/payments";
 *
 * This file just re-exports for the existing call sites. Once they're
 * migrated, this shim can be deleted.
 */

export {
  initSubscriptionListener,
  isPremium,
  createCheckout,
} from "../payments";
