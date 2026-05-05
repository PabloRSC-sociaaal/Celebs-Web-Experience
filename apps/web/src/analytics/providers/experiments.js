// ─── A/B Testing & Experiments Provider ───────────────────────────────────────
// @STUB — A/B Testing / Experiments provider
// Status:    DUMMY — getVariant() always returns fallback, no real experiments
// Missing:   Real SDK integration (GrowthBook, LaunchDarkly, or Firebase A/B)
// Priority:  P2 — needed when optimizing conversion, not blocking for launch
// Effort:    ~4h — install SDK, wire init/getVariant, configure experiment dashboard
// Depends:   A/B platform selection + experiment strategy defined
// ──────────────────────────────────────────────────────────────────────────────
//
// Feature experiments, variant assignment, conversion tracking.
//
// Integration candidates:
//   - GrowthBook     → https://docs.growthbook.io/lib/js (open source, self-hosted option)
//   - LaunchDarkly   → https://docs.launchdarkly.com/sdk/client-side/javascript
//   - Firebase A/B   → https://firebase.google.com/docs/ab-testing
//   - Statsig        → https://docs.statsig.com/client/jsClientSDK
//
// When ready to integrate:
//   1. Install SDK (npm install @growthbook/growthbook / launchdarkly-js-client-sdk)
//   2. Implement init() to fetch experiment configs
//   3. Implement getVariant() for experiment assignment
//   4. Track exposures via track() for statistical significance
// ──────────────────────────────────────────────────────────────────────────────

const TAG = "[analytics:experiments]";

let _experiments = {};

export const experimentsProvider = {
  name: "experiments",

  init() {
    if (import.meta.env.DEV) console.debug(TAG, "init (stub)");
  },

  identify(userId, traits) {
    if (import.meta.env.DEV) console.debug(TAG, "identify", userId, traits);
  },

  track(event, properties) {
    if (import.meta.env.DEV) console.debug(TAG, "track (exposure/conversion)", event, properties);
  },

  page() {},
  revenue() {},

  /**
   * Get variant for an experiment. Returns fallback until a real provider is connected.
   * @param {string} experimentId
   * @param {*} fallback — default value when experiment isn't running
   */
  getVariant(experimentId, fallback) {
    if (_experiments[experimentId] !== undefined) return _experiments[experimentId];
    if (import.meta.env.DEV) console.debug(TAG, "getVariant (fallback)", experimentId, fallback);
    return fallback;
  },
};
