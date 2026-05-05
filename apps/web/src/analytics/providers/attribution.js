// ─── Attribution / MMP Provider ───────────────────────────────────────────────
// @STUB — MMP / Attribution provider
// Status:    DUMMY — console.debug only, no real SDK connected
// Missing:   Real SDK integration (AppsFlyer, Adjust, or Branch)
// Priority:  P1 — needed before paid acquisition campaigns
// Effort:    ~2h — install SDK, replace init/track/identify with real calls
// Depends:   MMP platform selection + account setup + API keys
// ──────────────────────────────────────────────────────────────────────────────
//
// Handles install attribution, campaign tracking, and deferred deep links.
//
// Integration candidates:
//   - AppsFlyer Web SDK  → https://dev.appsflyer.com/hc/docs/web-sdk
//   - Adjust Web SDK     → https://dev.adjust.com/en/sdk/web
//   - Branch Web SDK     → https://help.branch.io/developers-hub/docs/web-full-reference
//
// When ready to integrate:
//   1. Install the SDK package (npm install appsflyer-web-sdk / adjust-sdk-js / branch-sdk)
//   2. Replace the stub methods below with real SDK calls
//   3. Add the SDK script tag to web/index.html at the [ANALYTICS:MMP] marker
// ──────────────────────────────────────────────────────────────────────────────

const TAG = "[analytics:attribution]";

export const attributionProvider = {
  name: "attribution",

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
    // MMPs typically don't track page views — intentional no-op
  },

  revenue(amount, currency, meta) {
    if (import.meta.env.DEV) console.debug(TAG, "revenue", { amount, currency, ...meta });
  },
};
