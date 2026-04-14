# CELEBS — Project Context for AI Agents

> **Read this first.** This document is the single source of truth for any AI agent working on this codebase. Every non-obvious decision is explained here. Last updated after the v0.1.0 refactor by Cursor.

---

## 1. What This Project Is

**CELEBS** is a web app where users upload a selfie and an AI reveals which celebrity they most resemble. It is a **marketing/viral funnel** disguised as a game: addictive, shareable, designed to convert.

**Current state:** Interactive prototype. Face detection is real; AI matching is randomized from a pool of 8 celebrities. The architecture is already wired for a real backend.

---

## 2. Monorepo Structure

```
celebs-preview/              ← root (monorepo)
├── web/                     ← React frontend (Vite)
├── api/                     ← Express backend (stub, ready for real impl)
├── package.json             ← root scripts only (uses --prefix)
└── CLAUDE.md                ← this file
```

### Root scripts
```bash
npm run dev          # web only (port 5173)
npm run dev:api      # api only (port 3001)
npm run dev:all      # both concurrently
npm run build        # production build of web
npm run install:all  # install deps in both web/ and api/
```

---

## 3. Frontend — `web/`

### Stack

| Tool | Version | Role |
|---|---|---|
| React | 19.2.4 | UI (StrictMode enabled) |
| react-router-dom | 7.14.1 | Client-side routing |
| zustand | 5.0.12 | Global state management |
| Vite | 8.0.4 | Build tool, dev server port 5173 |
| Fonts | Google Fonts | Fredoka 700 + Oxanium 400–800 |

### Full folder tree

```
web/src/
├── main.jsx                         ← Entry: StrictMode + RouterProvider
├── router/
│   └── index.jsx                    ← createBrowserRouter — 4 routes
├── store/
│   └── appStore.js                  ← Zustand store (global state)
├── design/
│   ├── tokens.js                    ← ★ colors, fonts, radii, shadows
│   └── globalStyles.js              ← @keyframes + global CSS string
├── services/
│   ├── index.js                     ← ★ Active backend switch (change 1 line)
│   └── adapters/
│       ├── local.js                 ← localStorage (active)
│       ├── supabase.js              ← Supabase stub (ready to fill)
│       └── firebase.js              ← Firebase stub (ready to fill)
├── features/
│   └── face/
│       └── detect.js                ← Face detection + crop
├── hooks/
│   └── useInView.js                 ← IntersectionObserver hook
├── components/                      ← Reusable UI components
│   ├── Button/index.jsx
│   ├── Counter/index.jsx
│   ├── HeroUpload/index.jsx         ← Upload widget (phase machine)
│   ├── Logo/index.jsx
│   ├── Marquee/index.jsx
│   ├── PolaroidCard/index.jsx
│   ├── ResultPreview/index.jsx
│   ├── ScanningVisual/index.jsx
│   └── Stars/index.jsx
├── pages/
│   ├── Landing/
│   │   ├── index.jsx                ← Orchestrates all sections + navbar + footer
│   │   └── sections/
│   │       ├── Hero.jsx             ← Hero section (HeroUpload lives here)
│   │       ├── StatsBar.jsx
│   │       ├── HowItWorks.jsx
│   │       ├── Exclusivity.jsx
│   │       ├── Gallery.jsx
│   │       ├── Reviews.jsx
│   │       ├── UseCases.jsx
│   │       └── FinalCTA.jsx
│   ├── Analyzing/
│   │   └── index.jsx                ← Thin wrapper: router+store → AnalyzingPage
│   ├── Results/
│   │   └── index.jsx                ← Thin wrapper: router+store → ResultsPage
│   └── Dashboard/
│       └── index.jsx                ← Thin wrapper: router+store → DashboardPage
│
│   ── Legacy page files (still active, wrapped by pages/) ──
├── AnalyzingPage.jsx                ← Core analyze UI
├── ResultsPage.jsx                  ← Core results UI
├── DashboardPage.jsx                ← Core dashboard UI
├── CelebsWebExperience.jsx          ← LEGACY root (no longer used as entry point)
├── db.js                            ← LEGACY (superseded by services/adapters/local.js)
├── faceDetect.js                    ← LEGACY (superseded by features/face/detect.js)
└── index.css                        ← Minimal global reset
```

> **Important:** `CelebsWebExperience.jsx` and `db.js` are no longer imported anywhere. They are kept as reference. Safe to delete once the migration is confirmed stable.

---

## 4. Routing

`react-router-dom v7` with `createBrowserRouter`. Four routes:

```
/              → LandingPage
/analyzing     → AnalyzingPage  (redirects to / if no photo in store)
/results       → ResultsPage    (redirects to / if no photo in store)
/dashboard     → DashboardPage
```

Navigation is done with `useNavigate()` — never with `window.location`.

### Page wrapper pattern
Each page in `pages/` is a **thin adapter** that:
1. Reads state from the Zustand store
2. Guards against invalid states (e.g., `/results` without a photo → redirect to `/`)
3. Passes the right props + callbacks to the legacy core component
4. Navigates programmatically on user actions

```jsx
// Example: pages/Results/index.jsx
export function ResultsPage() {
  const navigate = useNavigate();
  const photo    = useAppStore(s => s.uploadedPhoto);
  // ... reads store, navigates on callbacks
  return <ResultsPageOriginal photo={photo} onReset={() => { reset(); navigate("/"); }} ... />;
}
```

---

## 5. Global State — Zustand

**File:** `web/src/store/appStore.js`

```js
{
  uploadedPhoto:    string | null,  // blob: URL or base64 data URL
  preloadedResult:  object | null,  // generation for dashboard replay
  spotlight:        boolean,        // dims landing when face detected
  hasDashboard:     boolean,        // shows "My Results" nav button

  // Actions
  setUploadedPhoto(url)
  setPreloadedResult(result)
  setSpotlight(val)
  setHasDashboard(val)
  reset()  // clears photo + preloaded + spotlight (used on "try again")
}
```

**Access pattern:** `const photo = useAppStore(s => s.uploadedPhoto)` — always use selectors, never destructure the whole store.

---

## 6. Design System

### `web/src/design/tokens.js` — single source of truth

```js
import { colors, fonts, fontImport, radii, shadows } from "../../design/tokens";

colors.yellow   // "#FFE500" — primary CTA
colors.blue     // "#2AABE2" — brand primary
colors.black    // "#0A0A0A" — background
colors.pink     // "#FF3CAC" — destructive / accent
colors.cyan     // "#00E5FF" — tertiary accent
colors.green    // "#22c55e" — success
colors.purple   // "#8B5CF6" — badge accent
colors.white    // "#FFFFFF"
colors.darkBlue // "#1B8DBF" — hero gradient

fonts.display   // "'Fredoka', sans-serif" — headings, logo
fonts.body      // "'Oxanium', sans-serif" — UI, buttons, labels

radii.sm / md / lg / xl / pill / full   // border-radius values
shadows.card / cardHover / pop(color) / popHover(color)
```

**Rule: never hardcode a hex color or font name.** Always import from tokens.

### `web/src/design/globalStyles.js`
Returns a CSS string with all `@keyframes` and responsive rules. Injected via `<style>{globalCSS}</style>` in `LandingPage`.

---

## 7. Services Layer — Swappable Backend

**File:** `web/src/services/index.js`

```js
// To switch backends, change only this one line:
export { ... } from "./adapters/local.js";      // ← active (localStorage)
// export { ... } from "./adapters/supabase.js"; // ← Supabase
// export { ... } from "./adapters/firebase.js"; // ← Firebase
```

All adapters export the same interface:
```js
getAll()                                 → generation[]
getGenerations()                         → generation[]
hasGenerations()                         → boolean
saveGeneration({ photoUrl, celeb, others }) → Promise<generation>
updateLabel(id, label, labelSub)
deleteGeneration(id)
clearGenerations()
```

### Data schema (generation record)
```js
{
  id:         string,      // Date.now().toString()
  createdAt:  number,      // timestamp
  thumb:      string,      // base64 JPEG 160×160 (dashboard cards)
  preview:    string,      // base64 JPEG 320×320 (result replay)
  celeb:      {
    name:  string,
    pct:   number,         // 0–100
    color: string,         // hex from colors.*
    img:   string,         // "/samples/celeb_xxx.jpg"
  },
  others:     celeb[],     // 4 secondary matches
  label:      string|null, // "family" | "friend" | "teacher" | "work" | "love" | "me"
  labelSub:   string|null, // "dad" | "mom" | "brother" | etc.
}
```

---

## 8. Backend — `api/`

Express 5 server. Currently a **stub** — all routes log + return empty/fake data.

```
api/
├── src/
│   ├── index.js              ← Express app (port 3001)
│   └── routes/
│       ├── health.js         ← GET /api/health
│       └── generations.js    ← GET / POST / DELETE /:id / PATCH /:id/label
├── .env.example              ← Copy to .env and fill in
└── package.json
```

**To start:** `npm run dev:api` from root, or `npm run dev` from `api/`.

The API is ready for a real database — each route has a `// TODO (devs):` comment marking where to connect.

---

## 9. Face Detection

**File:** `web/src/features/face/detect.js` (identical to the original `faceDetect.js`)

Strategy (in order):
1. **Native `FaceDetector` API** (Chrome/Edge only) — zero dependencies
2. **Skin-tone HSL heuristic** (canvas, universal) — 8% pixel threshold in top 65% of image

Returns: `{ found: boolean, croppedUrl?: string }`

**Critical:** Do NOT add `@tensorflow/tfjs` or any `import()` calls for optional packages. Vite resolves all dynamic imports at build time — if the package isn't installed, the build fails even inside try/catch.

---

## 10. HeroUpload Component

**File:** `web/src/components/HeroUpload/index.jsx`

Phase state machine:
```
idle  →  validating  →  ready
                └──────→  error
```

- `idle` — drop zone + "Choose Photo" CTA
- `validating` — animated spinner, calls `detectAndCropFace`, cycles through 4 step labels
- `ready` — shows cropped face, "✓ Face detected" badge, triggers `onSpotlight(true)`, reveals "Find My Doppelganger" CTA
- `error` — "No face detected" with tips, retry button

Props: `{ onStartScan(photoUrl), onSpotlight(bool) }`

---

## 11. Critical Non-Obvious Decisions

### 11a. Spotlight z-index
The spotlight overlay is at `z-index: 1000`. `.hero-visual` is at `z-index: 1001` so the upload widget stays above it. This works because `.hero-section` has `position: relative` but **NO `z-index`** — so it does not create a stacking context. **Never add `z-index` to `.hero-section`** or the spotlight breaks.

### 11b. React StrictMode double-invocation
React 19 + StrictMode calls every `useEffect` twice in dev. Two fixes:
- `AnimatedPct` (ResultsPage): removed the `started.current` guard; uses only cleanup `return () => clearInterval(id)`
- `ResultsPage` auto-save: uses `savedRef.current` + `preloaded` check to prevent double-save

### 11c. `useState` as lazy initializer for constant data
```js
const [celeb, others] = useState(() => { ... return [primary, rest]; })[0];
```
`[0]` discards the setter. This computes random celeb data exactly once at mount. Do NOT convert to `useMemo` — different semantics.

### 11d. Photo storage
`blob:` URLs are session-only. For persistence, photos are canvas-compressed to base64:
- `thumb` (160×160, 0.70 quality) → dashboard cards
- `preview` (320×320, 0.82 quality) → result replay
localStorage limit ~5MB — overflow handled by dropping the oldest entry.

### 11e. CSS-in-JS only
All styles are inline React objects or `<style>` tags. No Tailwind, no CSS modules. Hover states use `onMouseEnter/onMouseLeave` (can't use CSS `:hover` with inline styles). Font sizes use `clamp()` for responsiveness.

### 11f. No CSS `:hover` on inline styles
Inline styles can't use pseudo-selectors. Always use:
```jsx
onMouseEnter={e => e.currentTarget.style.background = "..."}
onMouseLeave={e => e.currentTarget.style.background = "..."}
```

---

## 12. Code Conventions

```js
// 1. Import tokens, never hardcode
import { colors, fonts } from "../../design/tokens";
// Use: colors.yellow, fonts.display

// 2. Component exports — named exports (not default) for pages/components
export function MyComponent() { ... }

// 3. Section headers in files
// ─── Section Name ─────────────────────────────────────────────────────────────

// 4. Responsive font sizes
fontSize: "clamp(32px, 6vw, 58px)"

// 5. Zustand — always use selectors
const photo = useAppStore(s => s.uploadedPhoto);  // ✅
const { photo } = useAppStore();                   // ❌

// 6. Navigation — always useNavigate(), never window.location
const navigate = useNavigate();
navigate("/results");

// 7. Backend calls — always go through services/, never import adapters directly
import { saveGeneration } from "../../services";   // ✅
import { saveGeneration } from "../../services/adapters/local"; // ❌
```

---

## 13. Current State

### ✅ Working

- Landing page: hero upload, spotlight, all scroll sections, responsive navbar
- Face detection: native FaceDetector API + skin-tone heuristic + auto-crop
- Analyzing page: animated progress, landmark dots, 7-stage sequence
- Results page: comparison slider, animated %, trait badges, "more matches" row, share buttons
- Dashboard: grid of cards, label picker, view/delete generations
- Persistence: localStorage via services layer, survives reload
- Routing: react-router-dom with navigation guards
- Global state: Zustand store (no prop drilling)
- Architecture: monorepo, swappable backend, design tokens, component library

### 🔄 Simulated / Stub

- **AI matching:** random pick from `CELEB_POOL` (8 celebrities, hardcoded in `ResultsPage.jsx`)
- **API backend:** Express routes exist but return stub data; localStorage is still the active adapter
- **"Get My Full Analysis" CTA:** button exists, no action wired
- **"SEE ALL" matches card:** visual only
- **Share URLs:** point to `celebs.app` placeholder

### ❌ Not Yet Built

- Real AI face-matching API connection
- Authentication / user accounts
- Payment / subscription flow
- Dynamic OG share images
- Mobile responsive polish (works but not optimized for 375px)
- Analytics / event tracking

---

## 14. Next Steps (Priority Order)

### P0 — Must have before real users

1. **Connect real AI API**
   - Replace the random `CELEB_POOL` pick in `web/src/ResultsPage.jsx` (around line 224–238)
   - Call `POST /api/analyze` with the photo, receive `{ celeb, others }` in the same shape
   - The API stub is ready in `api/src/routes/generations.js`

2. **Mobile responsive pass**
   - Test at 375px, 390px (iPhone), 412px (Android)
   - Known issues: hero grid stacks, `MoreMatchesRow` cards may clip, comparison slider needs touch testing

3. **Real domain + OG tags**
   - Update share URLs from `celebs.app` placeholder in `ResultsPage.jsx`
   - Add `<meta property="og:image">` in `web/index.html`

### P1 — Core product

4. **Wire "Get My Full Analysis" CTA** — paywall, sign-up modal, or extended results reveal
5. **Expand CELEB_POOL** — currently 8 celebrities; add 20–50 for better perceived accuracy
6. **Real API progress** — wire `AnalyzingPage` to actual API call instead of fixed 8s timer

### P2 — UX polish

7. **Delete legacy files** — `CelebsWebExperience.jsx`, `db.js`, `faceDetect.js`, `App.jsx`, `App.css`, `src/assets/react.svg`, `src/assets/vite.svg` are no longer imported. Delete once stable.
8. **Dashboard: sort + filter** — by date, label, celeb name
9. **Dashboard: bulk delete**
10. **`api/.env`** — copy `.env.example`, add real secrets when connecting to a DB

### P3 — Growth

11. **Auth** — replace localStorage with Supabase (adapter is ready at `services/adapters/supabase.js`)
12. **Dynamic share image** — serverless function: user face + celeb face + % using Satori or Cloudinary
13. **Analytics** — Plausible or PostHog: track photo upload, face detected, results viewed, shared
14. **Referral loop** — "Your friend found their doppelganger! Find yours →"
