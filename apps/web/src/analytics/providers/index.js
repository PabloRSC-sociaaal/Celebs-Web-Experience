// ─── Analytics Providers Registry ─────────────────────────────────────────────
//
// Add or remove providers here. Each must implement the common interface:
//   { name, init, identify, track, page, revenue }
//
// Providers are initialized in order and receive every analytics call.
// ──────────────────────────────────────────────────────────────────────────────

import { attributionProvider }    from "./attribution";
import { userAnalyticsProvider }  from "./userAnalytics";
import { revenueProvider }        from "./revenue";
import { experimentsProvider }    from "./experiments";

export const providers = [
  attributionProvider,
  userAnalyticsProvider,
  revenueProvider,
  experimentsProvider,
];

export { experimentsProvider };
