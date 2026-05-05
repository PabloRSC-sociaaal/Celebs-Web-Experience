// ─── User Analytics Provider ──────────────────────────────────────────────────
// @STUB — User Analytics / Product Analytics provider
// Status:    DUMMY — console.debug only, no data leaves the browser
// Missing:   Real SDK integration (Mixpanel, PostHog, Amplitude, or Plausible)
// Priority:  P0 — critical for understanding user behavior from day one
// Effort:    ~2h — install SDK, replace init/track/identify/page, add API key
// Depends:   Analytics platform selection + account setup
// ──────────────────────────────────────────────────────────────────────────────
//
// Product analytics: funnels, retention, user behavior, event streams.
//
// Integration candidates:
//   - Mixpanel       → https://docs.mixpanel.com/docs/tracking-methods/sdks/javascript
//   - Amplitude      → https://www.docs.developers.amplitude.com/data/sdks/browser-2/
//   - PostHog        → https://posthog.com/docs/libraries/js
//   - Plausible      → https://plausible.io/docs (lightweight, privacy-first)
//
// When ready to integrate:
//   1. Install the SDK (npm install posthog-js / mixpanel-browser / @amplitude/analytics-browser)
//   2. Replace stub methods with real SDK calls
//   3. Add script tag at [ANALYTICS:USER] marker in web/index.html if required
//   4. Set API key via VITE_ANALYTICS_KEY in web/.env
// ──────────────────────────────────────────────────────────────────────────────

const TAG = "[analytics:user]";

export const userAnalyticsProvider = {
  name: "userAnalytics",

  init() {
    if (import.meta.env.DEV) console.debug(TAG, "init (stub)");
  },

  identify(userId, traits) {
    if (import.meta.env.DEV) console.debug(TAG, "identify", userId, traits);
  },

  track(event, properties) {
    if (import.meta.env.DEV) console.debug(TAG, "track", event, properties);
  },

  page(name, properties) {
    if (import.meta.env.DEV) console.debug(TAG, "page", name, properties);
  },

  revenue(amount, currency, meta) {
    if (import.meta.env.DEV) console.debug(TAG, "revenue", { amount, currency, ...meta });
  },
};
