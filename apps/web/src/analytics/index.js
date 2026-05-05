// ─── Analytics — Public API ───────────────────────────────────────────────────
//
// Usage:
//   import { track, identify } from "./analytics";
//   import { EVENTS } from "./analytics/events";
//
//   track(EVENTS.UPLOAD_START, { source: "hero_cta" });
//   identify(user.uid, { email: user.email, plan: "free" });
//
// All calls are forwarded to every registered provider (MMP, analytics, revenue, A/B).
// Providers are stubs by default — replace them one by one as platforms are chosen.
// ──────────────────────────────────────────────────────────────────────────────

import { providers, experimentsProvider } from "./providers";
import { getDeeplinkContext } from "./deeplink";

export { EVENTS } from "./events";

/**
 * Initialize all analytics providers. Call once at app startup (main.jsx).
 */
export function init() {
  providers.forEach(p => p.init?.());
}

/**
 * Identify the current user across all providers.
 */
export function identify(userId, traits = {}) {
  providers.forEach(p => p.identify?.(userId, traits));
}

/**
 * Track a named event. Deeplink/UTM context is automatically attached.
 */
export function track(event, properties = {}) {
  const enriched = { ...getDeeplinkContext(), ...properties };
  providers.forEach(p => p.track?.(event, enriched));
}

/**
 * Track a page view.
 */
export function page(name, properties = {}) {
  const enriched = { ...getDeeplinkContext(), ...properties };
  providers.forEach(p => p.page?.(name, enriched));
}

/**
 * Track a revenue event (purchase, subscription activation, renewal).
 */
export function revenue(amount, currency = "USD", meta = {}) {
  providers.forEach(p => p.revenue?.(amount, currency, meta));
}

/**
 * Get the variant for an A/B experiment.
 * @param {string} experimentId
 * @param {*} fallback — returned when no experiment is running
 */
export function experiment(experimentId, fallback) {
  return experimentsProvider.getVariant(experimentId, fallback);
}
