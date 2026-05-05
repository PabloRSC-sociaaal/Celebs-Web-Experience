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
// Each user portrait is paired with one celebrity in Gallery.jsx so every
// 'YOU' side of the PolaroidCard is unique. Pairings are curated for
// visual coherence (similar haircut / skin tone / vibe).
export const USERS = {
  user1: { path: "/samples/user1.png", status: STATUS.FINAL, note: "Gallery — paired with Michael B. Jordan" },
  user2: { path: "/samples/user2.png", status: STATUS.FINAL, note: "Gallery — paired with Lisa (BLACKPINK)" },
  user3: { path: "/samples/user3.png", status: STATUS.FINAL, note: "Gallery — paired with Timothée Chalamet" },
  user4: { path: "/samples/user4.png", status: STATUS.FINAL, note: "Gallery — paired with Taylor Swift" },
  user5: { path: "/samples/user5.png", status: STATUS.FINAL, note: "Gallery — paired with Henry Cavill" },
  user6: { path: "/samples/user6.png", status: STATUS.FINAL, note: "Gallery — paired with Billie Eilish" },
  user7: { path: "/samples/user7.png", status: STATUS.FINAL, note: "Gallery — paired with Selena Gomez" },
  user8: { path: "/samples/user8.png", status: STATUS.FINAL, note: "Gallery — paired with Harry Styles" },
};

// ── SimilarityExplorer brackets (each bracket needs a pair of comparison images) ──
export const SIMILARITY_BRACKETS = {
  bracket_0_10:   { left: "/samples/bracket_0_10_left.png",   right: "/samples/bracket_0_10_right.png",   status: STATUS.FINAL,       note: "Egg vs Dwayne Johnson" },
  bracket_11_20:  { left: "/samples/bracket_11_20_left.png",  right: "/samples/bracket_11_20_right.png",  status: STATUS.FINAL,       note: "Egyptian statue vs Michael Jackson" },
  bracket_21_30:  { left: "/samples/bracket_21_30_left.png",  right: "/samples/bracket_21_30_right.png",  status: STATUS.FINAL,       note: "Botero painting vs Bella Ramsey" },
  bracket_31_40:  { left: "/samples/bracket_31_40_left.png",  right: "/samples/bracket_31_40_right.png",  status: STATUS.FINAL,       note: "Hasbulla vs Daniel Radcliffe" },
  bracket_41_50:  { left: "/samples/bracket_41_50_left.png",  right: "/samples/bracket_41_50_right.png",  status: STATUS.FINAL,       note: "Indian elder vs George Clooney" },
  bracket_51_60:  { left: "/samples/bracket_51_60_left.png",  right: "/samples/bracket_51_60_right.png",  status: STATUS.FINAL,       note: "Young man w/ bowtie vs Timothée Chalamet" },
  bracket_61_70:  { left: "/samples/bracket_61_70_left.png",  right: "/samples/bracket_61_70_right.png",  status: STATUS.FINAL,       note: "Latin girl w/ mic vs Zendaya" },
  bracket_71_80:  { left: "/samples/bracket_71_80_left.png",  right: "/samples/bracket_71_80_right.png",  status: STATUS.FINAL,       note: "Bob woman vs Dua Lipa" },
  bracket_81_90:  { left: "/samples/bracket_81_90_left.png",  right: "/samples/bracket_81_90_right.png",  status: STATUS.FINAL,       note: "Matt Bomer vs Henry Cavill" },
  bracket_91_100: { left: null, right: null, status: STATUS.PLACEHOLDER, note: "Intentionally blank — represents the user themselves" },
};

/** Get a bracket image pair by bracket key (e.g. 'bracket_41_50') */
export function bracketImg(key) {
  const b = SIMILARITY_BRACKETS[key];
  return b ? { left: b.left, right: b.right } : { left: null, right: null };
}

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
