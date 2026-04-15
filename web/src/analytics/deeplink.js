// ─── Deep Link & UTM Context ──────────────────────────────────────────────────
// @STUB — UTM parsing works, but deferred deep links need MMP SDK
// Status:    PARTIAL — UTM parsing is functional; deferred deep links are a no-op
// Missing:   MMP SDK callback to inject resolved deep link data via setDeeplinkData()
// Priority:  P1 — works for basic UTM campaigns; full deep linking needs MMP
// Effort:    ~1h once MMP attribution.js is implemented
//
// Parses UTM parameters and deferred deep link data from the URL on first load.
// Persists to sessionStorage so the context survives SPA navigation.
// Automatically attached to every track() call via getDeeplinkContext().
//
// Supported parameters:
//   utm_source, utm_medium, utm_campaign, utm_content, utm_term
//   dl_type (deep link type), dl_target (deep link destination)
//
// MMP deferred deep links:
//   When an MMP provider is integrated, it can call setDeeplinkData() to inject
//   additional context resolved asynchronously (e.g. AppsFlyer OneLink data).
// ──────────────────────────────────────────────────────────────────────────────

const STORAGE_KEY = "celebs_dl_ctx";

const UTM_PARAMS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
const DL_PARAMS  = ["dl_type", "dl_target"];

let _context = null;

function parseFromUrl() {
  try {
    const params = new URLSearchParams(window.location.search);
    const ctx = {};
    let hasAny = false;

    for (const key of [...UTM_PARAMS, ...DL_PARAMS]) {
      const val = params.get(key);
      if (val) {
        ctx[key] = val;
        hasAny = true;
      }
    }

    if (hasAny) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(ctx));
      return ctx;
    }
  } catch { /* sessionStorage not available */ }
  return null;
}

function loadFromStorage() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return null;
}

/**
 * Initialize deep link context. Called automatically on first getDeeplinkContext().
 */
function ensureContext() {
  if (_context !== null) return;
  _context = parseFromUrl() || loadFromStorage() || {};
}

/**
 * Returns the current deep link / UTM context object.
 * Attach to every analytics event for campaign attribution.
 */
export function getDeeplinkContext() {
  ensureContext();
  return { ..._context };
}

/**
 * Inject additional deep link data (e.g. from an MMP SDK callback).
 * Merges with existing context and persists to session.
 */
export function setDeeplinkData(data) {
  ensureContext();
  _context = { ..._context, ...data };
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(_context));
  } catch { /* ignore */ }
}
