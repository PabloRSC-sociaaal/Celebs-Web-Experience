// ─── Analytics Event Catalog ──────────────────────────────────────────────────
//
// Every trackable event in the app. Import EVENTS.EVENT_NAME when calling track().
// Keeping all event names here ensures consistency and makes auditing easy.
//
// Convention: CATEGORY_ACTION (snake_case value, UPPER_SNAKE key)
// ──────────────────────────────────────────────────────────────────────────────

export const EVENTS = {
  // ── Onboarding ──
  LANDING_VIEW:          "landing_view",
  UPLOAD_START:          "upload_start",
  UPLOAD_FACE_DETECTED:  "upload_face_detected",
  UPLOAD_NO_FACE:        "upload_no_face",

  // ── Core funnel ──
  ANALYSIS_START:        "analysis_start",
  ANALYSIS_COMPLETE:     "analysis_complete",
  RESULT_VIEW:           "result_view",
  RESULT_SHARE:          "result_share",
  MATCH_SELECT:          "match_select",

  // ── Auth ──
  AUTH_MODAL_OPEN:       "auth_modal_open",
  AUTH_SIGNUP:           "auth_signup",
  AUTH_LOGIN:            "auth_login",
  AUTH_LOGOUT:           "auth_logout",

  // ── Monetization ──
  PAYWALL_VIEW:          "paywall_view",
  CHECKOUT_START:        "checkout_start",
  SUBSCRIPTION_ACTIVE:   "subscription_active",

  // ── Viral share ──
  SHARE_LINK_CREATE:     "share_link_create",
  SHARE_LINK_OPEN:       "share_link_open",
  SHARE_SELFIE_TAKEN:    "share_selfie_taken",
  SHARE_COMPLETE:        "share_complete",

  // ── Engagement / games ──
  DASHBOARD_VIEW:        "dashboard_view",
  CAMINO_NODE_DONE:      "camino_node_done",
  DICE_ROLL:             "dice_roll",
  GENERATION_VIEW:       "generation_view",
};
