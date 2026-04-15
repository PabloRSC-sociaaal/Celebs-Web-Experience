// ─── Static Asset Manifest ────────────────────────────────────────────────────
// @STUB — ALL image assets are placeholders (28 entries, 0 final)
// Status:    DUMMY — every celebrity/user/bracket image is a mock placeholder
// Missing:   Real production images for all entries marked "placeholder"
// Priority:  P1 — app looks fake with placeholder images
// Effort:    ~4h — source real images, resize/optimize, update paths + status
// Audit:     Run getPlaceholders() in browser console to see full list
//
// Central registry of all static assets (images, icons, etc.).
// Every image path in the app should come from here — never hardcode "/samples/..."
//
// Status values:
//   "placeholder" — temporary/demo image, needs to be replaced with real content
//   "final"       — production-ready asset
//
// To find all placeholders:  getPlaceholders()
// To update an asset:        change the `path` and set status to "final"
// ──────────────────────────────────────────────────────────────────────────────

export const STATUS = { PLACEHOLDER: "placeholder", FINAL: "final" };

// ── Celebrity images (used in CELEB_POOL fallback, mockData, Gallery) ────────
export const CELEBRITIES = {
  taylor:         { path: "/samples/celeb_taylor.jpg",         status: STATUS.PLACEHOLDER, note: "Mock fallback + gallery" },
  timothee:       { path: "/samples/celeb_timothee.jpg",       status: STATUS.PLACEHOLDER, note: "Mock fallback + gallery" },
  lisa:           { path: "/samples/celeb_lisa.jpg",           status: STATUS.PLACEHOLDER, note: "Mock fallback + gallery" },
  henry:          { path: "/samples/celeb_henry.jpg",          status: STATUS.PLACEHOLDER, note: "Mock fallback + gallery" },
  michael_jordan: { path: "/samples/celeb_michael_jordan.jpg", status: STATUS.PLACEHOLDER, note: "Mock fallback + gallery" },
  billie:         { path: "/samples/celeb_billie.jpg",         status: STATUS.PLACEHOLDER, note: "Mock fallback + gallery" },
  selena:         { path: "/samples/celeb_selena.jpg",         status: STATUS.PLACEHOLDER, note: "Mock fallback + gallery" },
  harry:          { path: "/samples/celeb_harry.jpg",          status: STATUS.PLACEHOLDER, note: "Mock fallback + gallery" },
};

// ── Demo user photos (Gallery before/after cards) ────────────────────────────
export const USERS = {
  user1: { path: "/samples/user1.jpg", status: STATUS.PLACEHOLDER, note: "Gallery card — before photo" },
  user2: { path: "/samples/user2.jpg", status: STATUS.PLACEHOLDER, note: "Gallery card — before photo" },
  user3: { path: "/samples/user3.jpg", status: STATUS.PLACEHOLDER, note: "Gallery card — before photo" },
  user4: { path: "/samples/user4.jpg", status: STATUS.PLACEHOLDER, note: "Gallery card — before photo" },
  user5: { path: "/samples/user5.jpg", status: STATUS.PLACEHOLDER, note: "Gallery card — before photo" },
};

// ── SimilarityExplorer brackets (each bracket needs a pair of comparison images) ──
export const SIMILARITY_BRACKETS = {
  bracket_0_10:   { left: null, right: null, status: STATUS.PLACEHOLDER, note: "FacePlaceholder SVG used" },
  bracket_11_20:  { left: null, right: null, status: STATUS.PLACEHOLDER, note: "FacePlaceholder SVG used" },
  bracket_21_30:  { left: null, right: null, status: STATUS.PLACEHOLDER, note: "FacePlaceholder SVG used" },
  bracket_31_40:  { left: null, right: null, status: STATUS.PLACEHOLDER, note: "FacePlaceholder SVG used" },
  bracket_41_50:  { left: null, right: null, status: STATUS.PLACEHOLDER, note: "FacePlaceholder SVG used" },
  bracket_51_60:  { left: null, right: null, status: STATUS.PLACEHOLDER, note: "FacePlaceholder SVG used" },
  bracket_61_70:  { left: null, right: null, status: STATUS.PLACEHOLDER, note: "FacePlaceholder SVG used" },
  bracket_71_80:  { left: null, right: null, status: STATUS.PLACEHOLDER, note: "FacePlaceholder SVG used" },
  bracket_81_90:  { left: null, right: null, status: STATUS.PLACEHOLDER, note: "FacePlaceholder SVG used" },
  bracket_91_100: { left: null, right: null, status: STATUS.PLACEHOLDER, note: "FacePlaceholder SVG used" },
};

// ── Branding & UI ────────────────────────────────────────────────────────────
export const BRANDING = {
  favicon: { path: "/favicon.svg", status: STATUS.FINAL },
  icons:   { path: "/icons.svg",   status: STATUS.FINAL },
};

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Flat list of all placeholder entries — useful for auditing what needs replacement */
export function getPlaceholders() {
  const result = [];
  const sections = { CELEBRITIES, USERS, SIMILARITY_BRACKETS, BRANDING };
  for (const [category, entries] of Object.entries(sections)) {
    for (const [key, entry] of Object.entries(entries)) {
      if (entry.status === STATUS.PLACEHOLDER) {
        result.push({ category, key, ...entry });
      }
    }
  }
  return result;
}

/** Get a celebrity image path by key */
export function celebImg(key) {
  return CELEBRITIES[key]?.path || "";
}

/** Get a user demo image path by key */
export function userImg(key) {
  return USERS[key]?.path || "";
}
