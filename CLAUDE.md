# CELEBS — Project Context for AI Agents

> **Read this first.** Single source of truth for any AI agent working on this codebase.
> Last updated: session 5 — Firebase Auth + real API + paywall + 13-node Camino.

---

## 1. What This Project Is

**CELEBS** is a web app where users upload a selfie and an AI reveals which celebrity they most resemble. It is a **marketing/viral funnel** disguised as a game: addictive, shareable, designed to convert.

**Current state:** Fully functional with real AI backend. Face detection, celebrity matching, auth and paywall are all real and working. Persistence is still localStorage (Firestore adapter is stubbed).

---

## 2. Monorepo Structure

```
celebs-preview/
├── web/                     ← React frontend (Vite) — main app
├── api/                     ← Express backend (stub, ready for real impl)
├── package.json             ← root scripts
└── CLAUDE.md                ← this file
```

### Root scripts
```bash
npm run dev          # web dev server (port 5173)
npm run dev:api      # api server (port 3001)
npm run dev:all      # both concurrently
npm run build        # production build of web
npm run install:all  # install deps in both web/ and api/
```

---

## 3. Frontend — `web/`

### Stack

| Tool | Version | Role |
|---|---|---|
| React | 19 | UI (StrictMode enabled) |
| react-router-dom | 7 | Client-side routing |
| zustand | 5 | Global state management |
| Vite | 8 | Build tool, dev server port 5173 |
| firebase | latest | Auth + Cloud Functions |
| @vladmandic/face-api | latest | Face detection (TinyFaceDetector) |
| Fonts | Google Fonts | Fredoka 700 + Oxanium 400–800 |

### Full folder tree

```
web/src/
├── main.jsx                         ← Entry: StrictMode + RouterProvider + auth listener
├── router/
│   └── index.jsx                    ← createBrowserRouter — 4 routes
├── store/
│   └── appStore.js                  ← Zustand store (full global state)
├── design/
│   ├── tokens.js                    ← ★ colors, fonts, radii, shadows
│   └── globalStyles.js              ← @keyframes + global CSS string
├── services/
│   ├── index.js                     ← ★ Active backend switch (1 line to change)
│   └── adapters/
│       ├── local.js                 ← localStorage (ACTIVE)
│       ├── supabase.js              ← Supabase stub (ready to fill)
│       └── firebase.js              ← Firebase stub (ready to fill)
├── features/
│   ├── face/
│   │   └── detect.js                ← Face detection + crop (v5 — face-api.js)
│   ├── firebase/
│   │   ├── app.js                   ← ★ Shared Firebase app "celebs"
│   │   ├── authService.js           ← Auth functions (Google, email, listener)
│   │   ├── generateComparison.js    ← Cloud Function wrapper + normalizer
│   │   └── testPanel.jsx            ← 🧪 Dev-only debug panel (remove before prod)
│   └── auth/
│       └── AuthModal.jsx            ← Sign in/up modal (Google + email/password)
├── hooks/
│   ├── useCtaUpload.js              ← Shared upload trigger hook
│   └── useInView.js                 ← IntersectionObserver hook
├── components/                      ← Reusable UI components
│   ├── Button/index.jsx
│   ├── Counter/index.jsx
│   ├── HeroUpload/index.jsx         ← Upload widget with face detection (phase machine)
│   ├── Logo/index.jsx
│   ├── Marquee/index.jsx
│   ├── MorphSlider/index.jsx        ← Interactive face morph comparison
│   ├── PolaroidCard/index.jsx
│   ├── ResultPreview/index.jsx
│   ├── ScanningVisual/index.jsx
│   └── Stars/index.jsx
├── pages/
│   ├── Landing/
│   │   ├── index.jsx                ← Navbar + auth + all sections + footer
│   │   └── sections/
│   │       ├── Hero.jsx
│   │       ├── StatsBar.jsx
│   │       ├── HowItWorks.jsx
│   │       ├── Exclusivity.jsx
│   │       ├── SimilarityExplorer.jsx
│   │       ├── Gallery.jsx
│   │       ├── Reviews.jsx
│   │       ├── UseCases.jsx
│   │       └── FinalCTA.jsx         ← Upload CTA + Create Account + email capture
│   ├── Analyzing/
│   │   └── index.jsx                ← Thin wrapper: starts API call + gates navigation
│   ├── Results/
│   │   └── index.jsx                ← Thin wrapper: passes apiResult + returnContext
│   └── Dashboard/
│       └── index.jsx                ← Thin wrapper: router+store → DashboardPage
│
│   ── Core page files (wrapped by pages/) ──
├── AnalyzingPage.jsx                ← Core animated scan UI (8s, landmark dots)
├── ResultsPage.jsx                  ← Core results UI (paywall, match cards, share)
├── DashboardPage.jsx                ← Core dashboard UI (Camino, Dice, Album, GenCards)
│
│   ── Legacy (no longer used as entry, kept as reference) ──
├── CelebsWebExperience.jsx          ← LEGACY root component (not imported)
├── db.js                            ← LEGACY (superseded by services/adapters/local.js)
├── faceDetect.js                    ← LEGACY (superseded by features/face/detect.js)
└── index.css                        ← Minimal global reset
```

---

## 4. Routing

`react-router-dom v7` with `createBrowserRouter`. Four routes:

```
/              → LandingPage    (always accessible)
/analyzing     → AnalyzingPage  (redirects to / if no photo in store)
/results       → ResultsPage    (redirects to / if no photo in store)
/dashboard     → DashboardPage  (always accessible)
```

Navigation is done with `useNavigate()` — never `window.location`.

### Page wrapper pattern
Each page in `pages/` is a **thin adapter** that reads Zustand store, guards state, and passes props to the legacy core component:
```jsx
export function ResultsPage() {
  const navigate  = useNavigate();
  const photo     = useAppStore(s => s.uploadedPhoto);
  const apiResult = useAppStore(s => s.apiResult);
  // ...
  return <ResultsPageOriginal photo={photo} apiResult={apiResult} onDashboard={handleDashboard} ... />;
}
```

---

## 5. Global State — Zustand

**File:** `web/src/store/appStore.js`

```js
{
  // Upload flow
  uploadedPhoto:    string | null,   // blob: URL of face-cropped photo (640×640)
  pendingFile:      File | null,     // raw File from input (triggers HeroUpload)
  faceGeometry:     object | null,   // { center, box, ratio } — normalized face metrics

  // Results
  apiResult:        object[] | null, // Real API results: [{ name, pct, img, color, ... }]
  preloadedResult:  object | null,   // Saved gen for dashboard replay

  // Auth
  user:             FirebaseUser | null,  // null = not logged in

  // Navigation context (set before leaving Dashboard)
  // Shape: { type:"camino"|"dice"|"free", returnTo:"camino"|"dashboard", step?:number }
  returnContext:    object | null,

  // Dashboard state
  dashSubPage:      "main" | "camino",
  hasDashboard:     boolean,
  justCompletedStep: number | null,  // triggers step animation on Camino return

  // UI
  spotlight:        boolean,

  // reset() — clears scan state but NOT user (user only clears on explicit logout)
  reset()
}
```

**Access pattern:** `const photo = useAppStore(s => s.uploadedPhoto)` — always use selectors.

---

## 6. Firebase Integration

### Shared app — `features/firebase/app.js`
Single named Firebase app `"celebs"`. Both auth and functions import from here.
```js
export const firebaseApp = getApps().find(a => a.name === "celebs")
                         || initializeApp(FIREBASE_CONFIG, "celebs");
```

### Auth — `features/firebase/authService.js`
```js
signInWithGoogle()                    // Google OAuth popup
signInWithEmail(email, password)      // signInWithEmailAndPassword
signUpWithEmail(email, password)      // createUserWithEmailAndPassword
signOutUser()                         // signOut
initAuthListener(callback)            // onAuthStateChanged → returns unsubscribe
```
Initialized in `main.jsx` before React renders:
```js
initAuthListener(user => useAppStore.getState().setUser(user));
```

### Cloud Functions — `features/firebase/generateComparison.js`
Calls `GenerateComparisonAsync` on `us-central1`.
- Input: `base64Image`, `comparisonId`, `embeddings: []`, `describePicture: true`, `enrich: true`
- Output (normalized): `[{ name, pct, img, color, celebrityId, comparisonId, age, gender, ethnicity, emotion }]`
- Colors assigned by position: `[yellow, blue, pink, cyan, green, purple, red, orange]`
- Throws if API returns `{ success: false }` or empty array → ResultsPage falls back to mock

### Firebase config (celebs-dev project)
```js
apiKey: "AIzaSyDaZ7_44sjR9bIfIUB-A8W_k836wk1jGdk"
authDomain: "celebs-dev.firebaseapp.com"
projectId: "celebs-dev"
```

### 🧪 Test panel — `features/firebase/testPanel.jsx`
Floating 🧪 button (fixed bottom-left, 36×36px). Opens debug panel to test the Cloud Function by dropping a photo. Uses same `generateComparison()` wrapper. **Remove before production.**

---

## 7. Full User Flow

```
1. UPLOAD (Landing or Dashboard)
   useCtaUpload() hook → file input
   → HeroUpload: detectAndCropFace() [face-api.js + fallbacks]
   → 640×640 face-aligned JPEG
   → store: setUploadedPhoto() + setFaceGeometry()
   → navigate("/analyzing")

2. ANALYZING (parallel execution)
   ┌─ Animation: 8s, landmark dots, 7-stage progress text
   └─ API call: generateComparison(photoUrl)
               → base64 encode → Firebase callable
               → normalize results → store.setApiResult()
   Both must finish → navigate("/results")
   If API fails → setApiResult(null) → ResultsPage uses mock

3. RESULTS
   Priority for celeb data:
     1. preloaded (dashboard replay) — use as-is
     2. apiResult (real API) ← normal flow
     3. CELEB_POOL mock (API failed fallback)

   Paywall: if !user && !preloaded
     → #1 match card = blurred + 🔒 overlay + "Reveal Free →" button
     → Button opens AuthModal
     → After login: user state updates → blur disappears automatically

   Others scrollable: 2nd–5th match cards visible without auth.
   Save: saveGeneration({ photoUrl, celeb, others }) → localStorage

4. DASHBOARD
   getAll() → grid of GenCards
   Sub-pages: Camino (gamified path) | main (grid + games)
   "View →" → preload gen → navigate("/results")
   Camino return: justCompletedStep triggers node animation
```

---

## 8. Auth Modal — `features/auth/AuthModal.jsx`

Props: `{ isOpen, onClose, onSuccess, initialMode="signup", title, subtitle }`

- Full-screen fixed overlay, dark `#0d0d18` card, 400px wide
- Google button (white bg, `⊕ Continue with Google`)
- OR divider
- Email + Password inputs (yellow focus border)
- Submit: "Create Free Account" / "Sign In"
- Mode toggle at bottom
- Error display (red, with background)
- Close X top-right + click-outside-to-close

Usage example (paywall):
```jsx
<AuthModal
  isOpen={showAuthModal}
  onClose={() => setShowAuthModal(false)}
  onSuccess={() => setShowAuthModal(false)}
  title="🔒 Unlock Your Doppelganger"
  subtitle="Sign up free to reveal your #1 celebrity match"
/>
```

---

## 9. Auth CTAs — Where they appear

| Location | Trigger |
|---|---|
| Landing navbar (desktop + mobile) | "Sign In" ghost button |
| Landing navbar (logged in) | User avatar + "My Dashboard" |
| Dashboard header | Avatar circle (click = logout) or "Sign In" button |
| FinalCTA section | "Create Account" outline button |
| FinalCTA section | Email capture form (waitlist — success state only, no backend) |
| Results page | "Reveal Free →" button on blurred #1 match |

---

## 10. Dashboard (intranet) — DashboardPage.jsx

### Three game cards (always at top of grid)

**CaminoCTA (Camino a la Fama):**
- Mini SVG path showing 13 nodes and current position
- Progress counter badge (X/13)
- → arrow button navigates to full Camino sub-page

**DiceCard:**
- Animated dice roll mechanic
- Shows "Time to Upload a picture of…" banner when landed
- Triggers upload with `returnTo: "dashboard"` context

**AlbumCard:**
- SOON — modal explains "The Album" group concept

### Camino a la Fama — 13 nodes

```
Index | Type    | Label      | Emoji
  0   | photo   | You        | 🙋
  1   | photo   | Dad        | 👨
  2   | photo   | Mom        | 👩
  3   | SPECIAL | Reward     | 🎭  ← Family Portrait (claim, no photo)
  4   | photo   | Friend     | 👫
  5   | photo   | Brother    | 👦
  6   | SPECIAL | Reward     | ⭐  ← Party Started (claim, no photo)
  7   | photo   | Colleague  | 🧑‍💻
  8   | photo   | Teacher    | 📚
  9   | photo   | Sister     | 👧
 10   | photo   | Boss       | 👔
 11   | SPECIAL | Reward     | 🎬  ← Celebrity Gang (claim, no photo)
 12   | photo   | Crush      | 💘  ← always last
```

`SPECIAL_IDXS = [3, 6, 11]`
`photoIdxs = [0,1,2,4,5,7,8,9,10,12]` (10 photo slots)

Special events: claimed via localStorage key `"celebs_claimed_events"`. No photo needed — shows ✨ "Claim" button.

Progress helpers:
```js
const isNodeDone = (i) =>
  isSpecialNode(i) ? claimed.includes(i)
                   : revGens[photoIdxs.indexOf(i)] !== undefined;
const currentIdx = NODES.findIndex((_, i) => !isNodeDone(i));
```

SVG path: viewBox `0 0 400 1060`, 12 cubic bezier segments. PATH_FULL is a single path string.

### GenCard (generation cards)
- Small label badge overlay (top-left) showing "Who is this"
- Small "View →" button
- 🏷 icon if untagged
- NO delete button (delete only from inside ResultsPage, hidden)

---

## 11. Face Detection — `features/face/detect.js` (v5)

### Two public functions

```js
// For user uploads — enforces 1800ms min UX delay
detectAndCropFace(imageUrl) → Promise<{ found, croppedUrl?, faceGeometry? }>

// For celeb/reference images — instant, no delay
cropFaceFromUrl(imageUrl) → Promise<{ croppedUrl, faceGeometry }>
```

### Detection strategy (in order)
1. **@vladmandic/face-api TinyFaceDetector** — cross-browser, model loaded from `/models`
2. **Native `window.FaceDetector`** — Chrome/Edge only, as extra fallback
3. **Skin-tone heuristic** — 8% skin-pixel threshold, user uploads only
4. **Portrait heuristic** — fixed ratios (center-x, 30% from top, 38% height), celeb path only

### Output geometry
```
OUTPUT_SIZE  = 640px
FACE_H_RATIO = 0.46   // face height / output side
FACE_V_POS   = 0.45   // face centre-y / output side
```

### CORS fix (`fetchAsBlobUrl`)
Celebrity images cached without `crossOrigin` → canvas taint → `SecurityError`. Fix: `fetch(url) → blob → createObjectURL()`. Always canvas-safe. Blob revoked in `finally`.

---

## 12. Services Layer — Swappable Backend

**File:** `web/src/services/index.js`
```js
// Change 1 line to switch backends:
export { ... } from "./adapters/local.js";       // ← ACTIVE (localStorage)
// export { ... } from "./adapters/supabase.js";
// export { ... } from "./adapters/firebase.js";
```

All adapters export the same interface:
```js
getAll() → generation[]
saveGeneration({ photoUrl, celeb, others }) → Promise<generation>
updateLabel(id, label, labelSub)
deleteGeneration(id)
clearGenerations()
```

### Generation record schema
```js
{
  id:       string,    // Date.now().toString()
  createdAt: number,
  thumb:    string,    // base64 JPEG 160×160 (dashboard cards)
  preview:  string,    // base64 JPEG 320×320 (result replay)
  celeb: {
    name:  string,
    pct:   number,          // 0–100 (real score from API)
    color: string,          // hex (position-based color from RESULT_COLORS)
    img:   string,          // CDN URL from API (e.g. https://cdn.sociaaal.com/...)
    // optional extra fields from API:
    celebrityId, comparisonId, age, gender, ethnicity, emotion
  },
  others:   celeb[],   // 4 secondary matches (same schema)
  label:    string|null,
  labelSub: string|null,
}
```

---

## 13. Design System

**File:** `web/src/design/tokens.js`
```js
colors.yellow   // "#FFE500" — primary CTA
colors.blue     // "#2AABE2" — brand primary
colors.black    // "#0A0A0A" — background
colors.pink     // "#FF3CAC" — accent
colors.cyan     // "#00E5FF" — tertiary
colors.green    // "#22c55e" — success
colors.purple   // "#8B5CF6" — badge
colors.white    // "#FFFFFF"

fonts.display   // "'Fredoka', sans-serif"
fonts.body      // "'Oxanium', sans-serif"
```

**Rule:** Never hardcode hex colors or font names in components. Always import from tokens.

### Shared card design system (DashboardPage)
```js
const CARD_BASE = {
  background: "linear-gradient(145deg,#111118 0%,#0d0d14 100%)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 20, display: "flex", flexDirection: "column",
  transition: "transform 0.2s, box-shadow 0.2s",
};
function CardBtn({ onClick, children, color, disabled }) { /* 24×24 icon button */ }
function CardFooter({ title, sub, right }) { /* standard footer */ }
```

---

## 14. Critical Non-Obvious Decisions

### 14a. User NOT cleared on reset()
`reset()` clears scan-related state (photo, result, context) but **NOT `user`**. Logout is explicit via `signOutUser()`. This means starting a new scan doesn't log the user out.

### 14b. Analyzing — dual gate before navigate
```js
const [animDone, setAnimDone] = useState(false);
const [apiDone,  setApiDone]  = useState(false);
// Both must be true to navigate to /results
useEffect(() => {
  if (animDone && apiDone) navigate("/results");
}, [animDone, apiDone]);
```
`onComplete` from AnalyzingPage sets `animDone`. API promise sets `apiDone`.

### 14c. Paywall — blur disappears automatically on login
The `user` state comes from Firebase listener in Zustand. When the user logs in via AuthModal, the listener fires, updates `user`, React re-renders, and the blur condition `!user && !preloaded` becomes false — no manual trigger needed.

### 14d. React StrictMode double-invocation
React 19 StrictMode calls effects twice in dev. The API call in Analyzing uses `cancelled = true` in cleanup to prevent double calls. The generation save in ResultsPage uses `savedRef.current`.

### 14e. Camino progress — newest-first storage
`saveGeneration` prepends (newest first in localStorage). Camino needs oldest-first. Fix:
```js
const revGens = [...gens].reverse(); // oldest first
```
Never sort in the storage layer.

### 14f. `useState` as lazy initializer for celeb data
```js
const [celeb, others] = useState(() => {
  if (preloaded) return [preloaded.celeb, preloaded.others];
  if (apiResult?.length) return [apiResult[0], apiResult.slice(1, 5)];
  // fallback mock...
})[0];
```
`[0]` discards the setter — computed once at mount. Do NOT convert to `useMemo`.

### 14g. CSS-in-JS only
All styles are inline React objects or `<style>` tags. No Tailwind, no CSS modules. Hover states use `onMouseEnter/onMouseLeave`. Font sizes use `clamp()` for responsiveness.

### 14h. Spotlight z-index
Overlay = `z-index: 1000`. `.hero-visual` = `z-index: 1001`. **Never add `z-index` to `.hero-section`** — it would create a stacking context that breaks the spotlight.

### 14i. Safe-area insets (iPhone notch/home indicator)
```js
paddingBottom: "calc(28px + env(safe-area-inset-bottom, 0px))"
```
`<meta name="viewport">` must include `viewport-fit=cover` in `web/index.html`.

### 14j. No `@tensorflow/tfjs` imports
Vite resolves all dynamic imports at build time. If the package isn't installed, build fails even inside try/catch. face-api.js from `@vladmandic/face-api` is the only vision library used.

---

## 15. Code Conventions

```js
// 1. Import tokens, never hardcode
import { colors, fonts } from "../../design/tokens";

// 2. Named exports for components/pages
export function MyComponent() { ... }

// 3. Zustand — always selectors
const photo = useAppStore(s => s.uploadedPhoto);  // ✅
const { photo } = useAppStore();                   // ❌

// 4. Navigation
const navigate = useNavigate();
navigate("/results");                              // ✅ (never window.location)

// 5. Services — never import adapters directly
import { saveGeneration } from "../../services";  // ✅
import { saveGeneration } from "../../services/adapters/local"; // ❌

// 6. Firebase auth
import { signOutUser } from "../../features/firebase/authService";

// 7. Section headers in files
// ─── Section Name ─────────────────────────────────────────────────────────────
```

---

## 16. Current Status

### ✅ Real and working
- Face detection (face-api.js TinyFaceDetector + native API + heuristic fallbacks)
- Face crop + alignment (renderFaceAligned, 640×640 normalized output)
- Face morphing (MorphSlider — Delaunay triangulation)
- AI celebrity matching via Firebase Cloud Function (`GenerateComparisonAsync`, celebs-dev)
- Firebase Auth (Google Sign In + Email/Password)
- Auth state persistence (Firebase listener → Zustand → survives page navigation)
- Paywall (#1 match blurred until login, auto-unblurs on auth)
- Auth CTAs (navbar, dashboard, FinalCTA, results)
- Analyzing page parallel execution (animation + API, both must complete)
- Results page with real celeb photos from CDN (`cdn.sociaaal.com`)
- Dashboard with GenCards, label picker, replay
- Camino a la Fama — 13 nodes, 3 special events, localStorage claimed state
- DiceCard — roll animation + "Time to upload…" banner
- AlbumCard — SOON with modal
- Persistence via localStorage (services layer, swappable)
- Context-aware navigation (returnContext tracks origin)

### 🎭 Mock / fallback
- `CELEB_POOL` (8 hardcoded celebrities) — used if `generateComparison()` throws
- Email waitlist capture — shows success state but doesn't save anywhere
- "SEE ALL" matches card — visual only, no action
- Share URLs — point to `celebs.app` placeholder

### 🔲 Not yet built
- Firestore persistence (adapter stub ready at `services/adapters/firebase.js`)
- Server-side user-specific history
- Payment / subscription tiers
- Dynamic OG share images
- Analytics / event tracking
- Face embeddings (CTO plans to add; for now function works without them)

---

## 17. Next Steps (Priority Order)

### P0 — Before real users
1. **Firestore persistence** — Connect `services/adapters/firebase.js` so generations are stored per-user in the cloud (not localStorage)
2. **Remove test panel** — Delete `features/firebase/testPanel.jsx` import from DashboardPage + the file itself
3. **Firebase Functions region** — Confirm `us-central1` with CTO (currently assumed)
4. **Email waitlist backend** — Wire email capture in FinalCTA to Firestore or Mailchimp

### P1 — Core product
5. **Face embeddings** — When CTO adds embeddings support, update `generateComparison.js` to compute and pass them
6. **Mobile Camino Family Portrait card** — Layout issue on very small screens (deferred)
7. **Real domain + OG tags** — Update `celebs.app` placeholder, add `<meta og:image>`

### P2 — UX polish
8. **Delete legacy files** — `CelebsWebExperience.jsx`, `db.js`, `faceDetect.js`, `App.jsx`, `App.css` are no longer imported
9. **Dashboard sort/filter** — by date, label, celeb name
10. **Auth error messages** — Firebase error codes are verbose; map to friendly messages

### P3 — Growth
11. **Subscription tiers** — Stripe integration; gated features beyond #1 match
12. **Dynamic share image** — Serverless: user face + celeb face + % (Satori or Cloudinary)
13. **Analytics** — Plausible or PostHog: upload, detect, reveal, share events
14. **Referral loop** — "Your friend found their doppelganger! Find yours →"
