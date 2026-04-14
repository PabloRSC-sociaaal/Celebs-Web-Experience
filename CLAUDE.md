# CELEBS — Project Context for AI Agents

> **Read this first.** This document lets you understand the entire codebase without asking questions. Every non-obvious decision is explained here.

---

## 1. What This Project Is

**CELEBS** is a web app where users upload a selfie and the AI reveals which celebrity they most resemble — their *doppelganger*. It is a **marketing/viral funnel** disguised as a game: the experience is deliberately addictive, shareable, and designed to convert.

The current codebase is a **working interactive prototype** (not yet connected to a real AI backend). All match results are randomized from a pool of 8 celebrities. The face detection is real (browser-native + canvas heuristic); everything after that is simulated.

---

## 2. Stack & Versions

| Tool | Version | Notes |
|---|---|---|
| React | 19.2.4 | StrictMode enabled (double-renders in dev — this matters, see §6) |
| Vite | 8.0.4 | Dev server on port 5174 |
| Fonts | Google Fonts | Fredoka 700 (headings/logo), Oxanium 400–800 (body/UI) |
| Storage | localStorage | Key: `celebs_db_v1`, JSON array |
| CSS | Inline styles + `<style>` tags | Zero CSS framework — all layout is JS objects |
| Face Detection | Browser FaceDetector API + canvas heuristic | No external ML lib |

**No CSS framework, no router, no state manager, no testing library.** Intentionally minimal.

---

## 3. Project Structure

```
celebs-preview/
├── public/
│   ├── favicon.svg
│   ├── samples/                 # Celebrity placeholder images (JPG)
│   │   ├── celeb_taylor.jpg     # Taylor Swift
│   │   ├── celeb_timothee.jpg   # Timothée Chalamet
│   │   ├── celeb_lisa.jpg       # Lisa (BLACKPINK)
│   │   ├── celeb_henry.jpg      # Henry Cavill
│   │   ├── celeb_michael_jordan.jpg
│   │   ├── celeb_billie.jpg     # Billie Eilish
│   │   ├── celeb_selena.jpg     # Selena Gomez
│   │   ├── celeb_harry.jpg      # Harry Styles
│   │   └── user1–5.jpg          # Sample user photos for UI demos
│   └── icons.svg
├── src/
│   ├── main.jsx                 # Entry point — mounts <CelebsWebExperience />
│   ├── CelebsWebExperience.jsx  # ★ Main router + Landing page (1360 lines)
│   ├── AnalyzingPage.jsx        # Full-screen scanning animation (330 lines)
│   ├── ResultsPage.jsx          # Results + slider + more matches (654 lines)
│   ├── DashboardPage.jsx        # "My generations" intranet (412 lines)
│   ├── db.js                    # localStorage CRUD + photo compression (91 lines)
│   ├── faceDetect.js            # Face detection + square crop (157 lines)
│   ├── App.jsx                  # UNUSED — Vite scaffold leftover, ignore
│   ├── App.css                  # UNUSED — do not modify
│   └── index.css                # Minimal global reset
├── CLAUDE.md                    # This file
├── package.json
└── vite.config.js
```

> **`App.jsx` is dead code.** `main.jsx` imports `CelebsWebExperience` directly. `App.jsx` can be deleted without consequence.

---

## 4. Page Flow & Routing

There is **no React Router**. Routing is a single `page` state variable in `CelebsWebExperience`:

```
"landing"  →  "analyzing"  →  "results"  →  "dashboard"
    ↑               ↑              ↑              |
    └───────────────┴──────────────┴── onReset ───┘
```

```js
// In CelebsWebExperience state:
const [page, setPage] = useState("landing");
// Values: "landing" | "analyzing" | "results" | "dashboard"
```

Full-screen pages (`analyzing`, `results`, `dashboard`) are rendered with an **early return** before the landing page JSX. The landing page is only rendered when `page === "landing"`.

### Key state in CelebsWebExperience

| State | Type | Purpose |
|---|---|---|
| `page` | string | Current page |
| `uploadedPhoto` | string \| null | blob: URL (new upload) or base64 data URL (dashboard replay) |
| `spotlight` | boolean | Dims landing page when valid face detected |
| `preloadedResult` | object \| null | Generation object when replaying from dashboard |
| `hasDashboard` | boolean | Whether to show "My Results" nav button |

---

## 5. Component Map

### `CelebsWebExperience.jsx` — internal components (all unexported)

| Component | Lines | Purpose |
|---|---|---|
| `useInView(threshold)` | ~12 | IntersectionObserver hook for scroll animations |
| `Counter` | ~15 | Animated number counter (starts on scroll into view) |
| `Logo` | ~30 | SVG logo: Fredoka font + yellow stroke + blue dot |
| `CTA` | ~25 | Reusable button: yellow/black/outline/blue variants |
| `PolaroidCard` | ~60 | Floating polaroid with user+celeb split photo |
| `LogoMini` | ~10 | Tiny inline logo used inside cards |
| `HeroUpload` | ~360 | **The upload widget** — most complex component |
| `ScanningVisual` | ~50 | Placeholder animation for hero area |
| `ResultPreview` | ~36 | Mini result card for hero section |
| `Stars` | ~12 | Star rating display |
| `Marquee` | ~25 | Scrolling ticker strip |

### `HeroUpload` — internal phase state machine

```
idle → validating → ready
           └──────→ error
```

- `idle`: camera icon + "Drop your photo" prompt
- `validating`: shows raw photo + scanning overlay (calls `detectAndCropFace`)
- `ready`: shows cropped face, "✓ Face detected" badge, triggers spotlight
- `error`: "No face detected" message + retry

```js
// HeroUpload props:
// onStartScan(photoUrl) — called when user clicks "FIND MY DOPPELGANGER"
// onSpotlight(bool)     — called to dim/undim the rest of the landing page
```

### `ResultsPage.jsx`

Props: `{ photo, onReset, onDashboard, preloaded=null, onMount }`

- `photo`: blob URL or 320px base64 data URL
- `preloaded`: if set (dashboard replay), uses `preloaded.celeb` and `preloaded.others` instead of rolling random
- `onMount()`: callback fired after auto-save completes (used to refresh navbar dashboard button)
- Auto-saves to localStorage on mount (skipped if `preloaded` is truthy)
- `savedRef` prevents double-save under React StrictMode

### `DashboardPage.jsx`

Props: `{ onNew, onViewResult(gen), onBack }`

- `onViewResult(gen)`: passes the full generation object back to the router, which sets `uploadedPhoto = gen.preview` and `preloadedResult = gen`

### `db.js` — data schema

```js
// Each generation record:
{
  id: string,          // Date.now().toString()
  createdAt: number,   // timestamp
  thumb: string,       // base64 JPEG 160×160 (for cards)
  preview: string,     // base64 JPEG 320×320 (for result replay)
  celeb: {             // primary match
    name: string,
    pct: number,       // 0–100
    color: string,     // hex — accent color for that celeb
    img: string,       // "/samples/celeb_xxx.jpg"
  },
  others: celeb[],     // 4 secondary matches, same shape
  label: string|null,  // e.g. "family"
  labelSub: string|null // e.g. "dad"
}
```

---

## 6. Critical Non-Obvious Decisions

### 6a. React StrictMode double-invocation
React 19 + StrictMode calls every `useEffect` twice in development (mount → unmount → remount). Two bugs were fixed because of this:

1. **`AnimatedPct`**: originally had a `started.current` ref guard to prevent double-animation. This broke in StrictMode because the flag stayed `true` after unmount. Fix: removed the guard entirely — rely on `return () => clearInterval(id)` cleanup.
2. **`ResultsPage` auto-save**: uses `savedRef.current` + checks `preloaded` to prevent a second save on StrictMode remount.

### 6b. `useState` for constant derived data
```js
// This pattern looks wrong but is correct:
const [celeb, others] = useState(() => { ... return [primary, rest]; })[0];
```
`useState` is used as a lazy initializer to compute random celeb data once at component creation. `[0]` discards the setter since this data never changes after mount. Do NOT convert to `useMemo` — it has different semantics and will re-run on every render.

### 6c. Spotlight z-index architecture
The spotlight overlay sits at `z-index: 1000`. The `.hero-visual` container is elevated to `z-index: 1001` — this works because `.hero-section` has `position: relative` but **no `z-index`** set, so it does NOT create a new stacking context. If you ever add `z-index` to `.hero-section`, the spotlight will break.

### 6d. No TensorFlow / BlazeFace
An earlier attempt to use `@tensorflow-models/blazeface` for face detection was abandoned because **Vite resolves all `import()` calls at build time**, even inside `try/catch` blocks. Since the package isn't installed, this caused a fatal build error. The final solution uses only:
1. Chrome/Edge native `FaceDetector` API (zero dependencies)
2. Skin-tone HSL pixel heuristic (pure canvas, works everywhere)

### 6e. CSS-in-JS only — no stylesheets
All component styles are inline React objects or `<style>` tags with `@keyframes`. There is no Tailwind, no CSS modules, no styled-components. When adding styles, continue this pattern. The only global CSS is a minimal reset in `index.css`.

### 6f. Viewport-breaking horizontal scroll
`MoreMatchesRow` uses a "full-bleed" technique to break out of its `maxWidth: 640` parent:
```css
width: 100vw;
position: relative;
left: 50%;
transform: translateX(-50%);
```
This is intentional — the scroll row spans the full viewport width.

### 6g. Photo storage strategy
blob: URLs are session-only (lost on page reload). For persistence, photos are compressed to base64 JPEG via canvas:
- `thumb` (160×160, quality 0.70) — for dashboard cards
- `preview` (320×320, quality 0.82) — for result replay

localStorage has a ~5MB limit. `saveGeneration` handles overflow by dropping the oldest entry.

---

## 7. Current State

### ✅ Working (fully implemented)

- **Landing page**: hero upload, spotlight effect, scroll sections (how it works, social proof, marquee, FAQ, footer)
- **Face detection**: native FaceDetector API + skin-tone heuristic fallback + auto-crop
- **Analyzing page**: animated progress bar, landmark dots overlay, stage text sequence
- **Results page**: comparison slider, animated % counter, trait badges, "More matches" horizontal scroll, share buttons, auto-save to localStorage
- **Dashboard page**: grid of generation cards, label picker (Family/Friends/Teachers/Work/Platonic Love), view past results, delete generations
- **Persistence**: localStorage via `db.js`, survives page reloads
- **Navigation**: "My Results" button in navbar (appears after first generation), dashboard back button

### 🔄 Simulated / Placeholder

- **AI matching**: results are random picks from `CELEB_POOL` (8 celebrities). Real AI API not connected.
- **"Get My Full Analysis" CTA**: button exists but does nothing (placeholder for paywall/upsell)
- **"SEE ALL" card** in More Matches row: visual only, no action
- **Share URLs**: point to `celebs.app` (placeholder domain)
- **Celebrity images**: real photos in `public/samples/` — these are the actual celebs

### ❌ Not Yet Built

- Backend / real AI face matching
- Authentication / user accounts
- Payment / subscription flow
- Real sharing (Open Graph meta tags, dynamic share images)
- Mobile responsive polish (works but not optimized)
- Analytics / event tracking

---

## 8. Code Conventions

```js
// Color palette — always use the C object, never hardcode hex
const C = {
  blue: "#2AABE2", yellow: "#FFE500", black: "#0A0A0A", white: "#FFFFFF",
  pink: "#FF3CAC", cyan: "#00E5FF", green: "#22c55e", purple: "#8B5CF6",
};

// Animations — always define in a <style> tag @keyframes block at top of component
// Use "animation-fill-mode: both" so elements animate in correctly

// Hover states — use onMouseEnter/onMouseLeave on the element, update inline style
// DO NOT use CSS :hover pseudo-class (inline styles can't use it)

// Responsive font sizes — use clamp():
fontSize: "clamp(32px, 6vw, 58px)"

// Section headers — ASCII separator style:
// ─── Section Name ─────────────────────────────────────────────────────────────
// ═══ Major Section ═══════════════════════════════════════════════════════════

// Component props — always destructure in the function signature
// Optional props — use default values: function Foo({ bar = null, baz = false })
```

---

## 9. Commands

```bash
npm run dev        # Start dev server → http://localhost:5174
npm run build      # Production build → dist/
npm run preview    # Preview production build locally
npm run lint       # ESLint check
```

---

## 10. Proposed Refactor: Splitting `CelebsWebExperience.jsx`

At **1360 lines**, `CelebsWebExperience.jsx` is the only file that's getting unwieldy. Here is the proposed split — **do not execute without user confirmation**:

```
src/
├── components/
│   ├── Logo.jsx          # Logo + LogoMini (currently lines 61–91, 184–193)
│   ├── CTA.jsx           # CTA button component (lines 95–119)
│   ├── HeroUpload.jsx    # Upload widget + phase machine (lines 197–555) ← biggest win
│   ├── PolaroidCard.jsx  # Floating polaroid card (lines 123–183)
│   └── Marquee.jsx       # Scrolling ticker (lines 658–683)
├── hooks/
│   └── useInView.js      # IntersectionObserver hook (lines 26–36)
└── CelebsWebExperience.jsx   # Reduced to ~400 lines: routing + landing sections
```

**Migration notes:**
- `HeroUpload` imports `detectAndCropFace` from `../faceDetect` — path changes to `./faceDetect` if kept in `src/`
- `C` color palette must be exported from a shared `src/constants.js` file so all components use the same values
- All `@keyframes` defined inside `HeroUpload`'s `<style>` tag stay with that component

---

## 11. Next Steps (Priority Order)

### P0 — Must have before any real users
1. **Connect real AI API** — replace random `CELEB_POOL` pick in `ResultsPage.jsx` with an actual API call. The result shape must match `{ name, pct, color, img }` for `celeb` and `others[]`.
2. **Mobile responsive pass** — test on 375px viewport. Key issues: hero layout stacks vertically, `MoreMatchesRow` cards may be too wide, comparison slider needs touch-friendliness review.
3. **Real domain + OG tags** — update share URLs from `celebs.app` placeholder, add `<meta property="og:image">` for link previews.

### P1 — Core product improvements
4. **"Get My Full Analysis" paywall** — wire the yellow CTA button in `ResultsPage`. Options: redirect to sign-up, open a modal, or reveal a locked extended results section.
5. **Expand celebrity pool** — `CELEB_POOL` currently has 8 celebrities (hardcoded in `ResultsPage.jsx`). Even with a real AI, a larger displayed pool improves perceived accuracy. Add 20–50 entries.
6. **Analyzing page: real progress** — `AnalyzingPage` currently runs on a fixed `SCAN_DURATION = 8000ms` timer. Wire it to the actual API call: advance progress based on real response, don't fake it.

### P2 — UX polish
7. **Refactor `CelebsWebExperience.jsx`** — split into modules as described in §10. Required before the file grows further.
8. **`App.jsx` cleanup** — delete `App.jsx`, `App.css`, `src/assets/react.svg`, `src/assets/vite.svg` (all are unused Vite scaffold leftovers).
9. **Dashboard: sort + filter** — add sort by date/label, filter by label category, search by celeb name.
10. **Dashboard: bulk delete** — currently only individual card deletion exists.

### P3 — Growth / monetization
11. **Auth system** — replace localStorage with a real database (Supabase recommended for quick setup). User needs to log in to preserve history across devices.
12. **Social sharing image** — generate a dynamic OG image (user face + celeb face + percentage) using a serverless function (Vercel Edge + Satori, or Cloudinary).
13. **Analytics** — add event tracking (Plausible or PostHog) for: photo uploaded, face detected, results viewed, shared, dashboard opened.
14. **Referral / viral loop** — "Your friend found their doppelganger! Find yours →" shared link flow.
