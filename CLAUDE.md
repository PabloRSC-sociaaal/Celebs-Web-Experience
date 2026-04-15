# CELEBS — Project Context for AI Agents

> **Read this first.** Single source of truth for any AI agent working on this codebase.
> Last updated: v0.7.0 — feature flags, analytics layer, asset manifest, legacy cleanup.

---

## 1. What This Project Is

**CELEBS** is a web app where users upload a selfie and an AI reveals which celebrity they most resemble. It is a **marketing/viral funnel** disguised as a game: addictive, shareable, designed to convert free users to premium subscribers.

**Current state:** Fully functional with real AI backend (toggled via `DEMO_MODE`). Face detection, celebrity matching, auth, paywall, morph slider, boomerang animation, and viral share loop are all implemented.

---

## 2. Monorepo Structure

```
celebs-preview/
├── web/            ← React frontend (Vite) — the main app
├── api/            ← Express backend stub (@STUB — not wired to app)
├── functions/      ← Firebase Cloud Functions (@STUB — secrets not configured)
├── package.json    ← root scripts (concurrently)
├── firebase.json   ← Functions + Firestore config
├── firestore.rules ← Subscription read rules
├── CLAUDE.md       ← this file (project context for AI agents)
├── CHANGELOG.md    ← history of features by session
├── PRODUCTION_READINESS.md ← ★ @STUB audit: 18 modules cataloged with priorities
├── LEMON_SQUEEZY_SETUP.md  ← step-by-step payment setup guide
```

### Root scripts
```bash
npm run dev          # web dev server (port 5174)
npm run dev:api      # api server (port 3001)
npm run dev:all      # both concurrently
npm run build        # production build of web/
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
| Vite | 8 | Build tool, dev server port 5174 |
| firebase | latest | Auth + Cloud Functions + Firestore |
| @vladmandic/face-api | latest | Face detection (TinyFaceDetector) |
| delaunator | latest | Delaunay triangulation for face morphing |
| Fonts | Google Fonts | Fredoka 700 + Oxanium 400–800 |

### Full folder tree

```
web/src/
├── main.jsx                         ← Entry: StrictMode + RouterProvider + auth listener + analytics init
├── config/
│   ├── index.js                     ← ★ getFlag(), DEMO_MODE, env re-exports (replaces old config.js)
│   ├── featureFlags.js              ← ★ FLAG_DEFINITIONS + resolveFlag (env override via VITE_FF_*)
│   └── env.js                       ← Centralized import.meta.env.VITE_* reads
├── analytics/
│   ├── index.js                     ← ★ Public API: init(), track(), identify(), page(), revenue()
│   ├── events.js                    ← Typed event catalog (EVENTS.UPLOAD_START, etc.)
│   ├── deeplink.js                  ← UTM parsing + sessionStorage persistence
│   └── providers/
│       ├── index.js                 ← Provider registry (initializes all active providers)
│       ├── attribution.js           ← Stub MMP (AppsFlyer / Adjust / Branch)
│       ├── userAnalytics.js         ← Stub analytics (Mixpanel / PostHog / Amplitude)
│       ├── revenue.js               ← Stub revenue (RevenueCat / Adapty / Lemon Squeezy)
│       └── experiments.js           ← Stub A/B testing (GrowthBook / LaunchDarkly)
├── router/
│   └── index.jsx                    ← createBrowserRouter — 5 routes (flag-guarded)
├── store/
│   └── appStore.js                  ← Zustand store (full global state)
├── design/
│   ├── tokens.js                    ← ★ colors, fonts, radii, shadows
│   └── globalStyles.js              ← @keyframes + global CSS string + navbar responsive
├── assets/
│   └── manifest.js                  ← ★ Central registry of all static assets (placeholder vs final)
├── services/
│   ├── index.js                     ← ★ Active backend switch (1 line to change)
│   ├── sharedGenerations.js         ← Viral share loop CRUD (localStorage, demo)
│   └── adapters/
│       ├── local.js                 ← localStorage celebs_db_v1 (ACTIVE)
│       ├── supabase.js              ← Supabase stub (ready to fill)
│       └── firebase.js              ← Firestore stub (ready to fill)
├── features/
│   ├── face/
│   │   ├── detect.js                ← Face detection + crop + align (v5 — face-api.js)
│   │   └── morph.js                 ← Delaunay triangulation + affine warping for morphing
│   ├── firebase/
│   │   ├── app.js                   ← ★ Shared Firebase app "celebs"
│   │   ├── authService.js           ← Auth (Google, email); respects DEMO_MODE
│   │   ├── generateComparison.js    ← Cloud Function wrapper + normalizer; respects DEMO_MODE
│   │   ├── subscriptionService.js   ← Firestore onSnapshot + createCheckout + isPremium
│   │   └── testPanel.jsx            ← 🧪 Dev-only debug panel (remove before prod)
│   └── auth/
│       ├── AuthModal.jsx            ← Sign in/up modal (Google + email/password)
│       └── PaywallModal.jsx         ← Premium paywall modal (uses env.js for variant IDs)
├── hooks/
│   ├── useCtaUpload.js              ← Shared upload trigger hook (any CTA → file picker)
│   ├── useFeatureFlag.js            ← React hook for feature flags: useFeatureFlag("CAMINO")
│   └── useInView.js                 ← IntersectionObserver hook
├── components/                      ← Reusable UI components
│   ├── Button/index.jsx
│   ├── Counter/index.jsx
│   ├── HeroUpload/index.jsx         ← Upload widget with face detection (phase machine)
│   ├── Logo/index.jsx
│   ├── Marquee/index.jsx
│   ├── MorphSlider/index.jsx        ← Interactive face morph (Delaunay + alpha blend)
│   ├── MorphBoomerang/index.jsx     ← Auto boomerang animation for dashboard cards
│   ├── PolaroidCard/index.jsx
│   ├── ResultPreview/index.jsx
│   ├── ScanningVisual/index.jsx
│   └── Stars/index.jsx
├── demo/
│   └── mockData.js                  ← Mock user + celebrity results (reads from assets/manifest.js)
├── pages/
│   ├── Landing/
│   │   ├── index.jsx                ← Navbar + auth + all sections (flag-guarded) + footer
│   │   └── sections/
│   │       ├── Hero.jsx
│   │       ├── StatsBar.jsx
│   │       ├── HowItWorks.jsx
│   │       ├── Exclusivity.jsx      ← Scroll-pinned sticky animation section
│   │       ├── SimilarityExplorer.jsx ← Interactive % slider (guarded by SIMILARITY_EXPLORER flag)
│   │       ├── Gallery.jsx          ← Uses assets/manifest.js for image paths
│   │       ├── Reviews.jsx          ← Includes viral CTA review card
│   │       ├── UseCases.jsx
│   │       └── FinalCTA.jsx         ← Upload CTA + Create Account + email capture
│   ├── Analyzing/
│   │   └── index.jsx                ← Thin wrapper: starts API call + tracks analytics events
│   ├── Results/
│   │   └── index.jsx                ← Thin wrapper: passes apiResult + tracks page view
│   ├── Dashboard/
│   │   └── index.jsx                ← Thin wrapper: router+store + tracks dashboard_view
│   └── Share/
│       └── index.jsx                ← Recipient page for viral share links (selfie-only)
│
│   ── Core page files (wrapped by pages/) ──
├── AnalyzingPage.jsx                ← Core animated scan UI (8s, landmark dots)
├── ResultsPage.jsx                  ← Core results UI (paywall, morph, match cards, share)
├── DashboardPage.jsx                ← Core dashboard UI (flag-guarded game cards, GenCards, SharedGenCard)
└── index.css                        ← Minimal global reset
```

---

## 4. Routing

`react-router-dom v7` with `createBrowserRouter`. **Five routes:**

```
/               → LandingPage     (always accessible)
/analyzing      → AnalyzingPage   (redirects to / if no photo in store)
/results        → ResultsPage     (redirects to / if no photo in store)
/dashboard      → DashboardPage   (always accessible)
/share/:shareId → SharePage       (viral share link for recipient)
```

Navigation is always done with `useNavigate()` — never `window.location` (except checkout which opens a new tab).

### Page wrapper pattern
Each page in `pages/` is a **thin adapter** that reads Zustand store, guards state, and passes props down:
```jsx
export function ResultsPage() {
  const navigate  = useNavigate();
  const photo     = useAppStore(s => s.uploadedPhoto);
  const apiResult = useAppStore(s => s.apiResult);
  return <ResultsPageCore photo={photo} apiResult={apiResult} onDashboard={handleDashboard} />;
}
```

---

## 5. Global State — Zustand

**File:** `web/src/store/appStore.js`

```js
{
  // Upload flow
  uploadedPhoto:    string | null,   // blob URL of face-cropped photo (640×640)
  pendingFile:      File | null,     // raw File from input (triggers HeroUpload)
  faceGeometry:     object | null,   // { center, box, ratio } — normalized face metrics

  // Results
  apiResult:        object[] | null, // normalized API results: [{ name, pct, img, color, ... }]
  preloadedResult:  object | null,   // saved gen for dashboard replay

  // Auth
  user:             FirebaseUser | null,
  subscription:     object | null,   // Firestore subscription doc (null = not premium)

  // Navigation context
  // Shape: { type:"camino"|"dice"|"free", returnTo:"camino"|"dashboard", step?:number }
  returnContext:    object | null,

  // Dashboard state
  dashSubPage:      "main" | "camino",
  hasDashboard:     boolean,
  justCompletedStep: number | null,  // triggers step animation on Camino return

  // UI
  spotlight:        boolean,

  // reset() — clears scan state but NOT user or subscription
  reset()
}
```

**Access pattern:** `const photo = useAppStore(s => s.uploadedPhoto)` — always use selectors.

---

## 6. Feature Flags & DEMO_MODE

**Config directory:** `web/src/config/`

```js
import { getFlag, DEMO_MODE } from "./config";

getFlag("CAMINO")     // → true/false (checks VITE_FF_CAMINO env override, then default)
getFlag("DEMO_MODE")  // → same as DEMO_MODE export
```

### Feature flags registry (`config/featureFlags.js`)
Each flag: `{ enabled: boolean, label: string }`. Override at build time with `VITE_FF_<FLAG_ID>=false`.

| Flag | Default | Controls |
|---|---|---|
| `DEMO_MODE` | `true` | Mock auth + API (bypass Firebase) |
| `PAYWALL` | `true` | Two-tier paywall on results |
| `MORPH_SLIDER` | `true` | Face morphing in results viewer |
| `MORPH_BOOMERANG` | `true` | Auto-morph animation on dashboard |
| `VIRAL_SHARE` | `true` | Share generation link flow + `/share/:shareId` route |
| `CAMINO` | `true` | Camino a la Fama game mode |
| `DICE` | `true` | Dice roll game mode |
| `ALBUM` | `false` | Album feature (coming soon) |
| `PREMIUM_CHECKOUT` | `true` | Lemon Squeezy checkout flow |
| `SIMILARITY_EXPLORER` | `true` | Interactive % slider on landing |
| `NAVBAR_AUTH` | `true` | Auth buttons in navbar |

### DEMO_MODE behavior
| Module | DEMO_MODE = true | DEMO_MODE = false |
|---|---|---|
| `authService.js` | In-memory mock user | Firebase Auth (Google + email) |
| `generateComparison.js` | mockData delay + CELEB_POOL | Firebase callable `GenerateComparisonAsync` |
| `subscriptionService.js` | No-op (subscription stays null) | Firestore `onSnapshot` + Lemon Squeezy |

### Centralized env vars (`config/env.js`)
All `import.meta.env.VITE_*` reads are centralized here. No other file reads env vars directly.

---

## 7. Firebase Integration

### Shared app — `features/firebase/app.js`
Single named Firebase app `"celebs"` (`projectId: "celebs-dev"`). All Firebase modules import from here.

### Auth — `features/firebase/authService.js`
```js
signInWithGoogle()        // Google OAuth popup
signInWithEmail(email, pw)
signUpWithEmail(email, pw)
signOutUser()
initAuthListener(cb)      // onAuthStateChanged → sets user in store
```

### Cloud Functions — `features/firebase/generateComparison.js`
Calls `GenerateComparisonAsync` on `us-central1`.
- Input: `base64Image`, `comparisonId`, `embeddings: []`, `describePicture: true`, `enrich: true`
- Output normalized: `[{ name, pct, img, color, celebrityId, comparisonId, age, gender, ethnicity, emotion }]`
- Colors by position: `[yellow, blue, pink, cyan, green, purple, red, orange]`
- Throws if API returns `{ success: false }` or empty → ResultsPage falls back to CELEB_POOL mock

### Subscription — `features/firebase/subscriptionService.js`
```js
initSubscriptionListener(uid, callback)  // onSnapshot users/{uid}
createCheckout(variantId)                // callable createCheckoutUrl → Lemon Squeezy URL
isPremium(subscription)                  // checks status === "active" || "on_trial"
```
Initialized in `main.jsx` after login, unsubscribed on logout.

### Cloud Functions — `functions/index.js`
```js
createCheckoutUrl  // authenticated callable → Lemon Squeezy checkout URL
lemonSqueezyWebhook // HTTP POST, HMAC-SHA256 verified, updates Firestore on payment
```

---

## 8. Full User Flow

```
1. UPLOAD (Landing or Dashboard)
   useCtaUpload() hook → native file input (any CTA)
   → HeroUpload: detectAndCropFace() [face-api.js + fallbacks]
   → 640×640 face-aligned JPEG blob URL
   → store: setUploadedPhoto() + setFaceGeometry()
   → navigate("/analyzing")

2. ANALYZING (parallel execution)
   ┌─ Animation: 8s, landmark dots, 7-stage progress text
   └─ API call: generateComparison(photoUrl)
               → base64 encode → Firebase callable (or mock)
               → normalize results → store.setApiResult()
   Both must finish → navigate("/results")
   If API fails → setApiResult(null) → ResultsPage uses CELEB_POOL mock

3. RESULTS (ResultsPage.jsx)
   Priority for celeb data:
     1. preloaded (dashboard replay) — bypasses all locks
     2. apiResult (real API)
     3. CELEB_POOL mock (API failed)

   allMatches = [primary, ...4 others] — FIXED ORDER, never reshuffled
   activeIdx = which match is shown in the viewer (default: last/5th for guests)

   PAYWALL LOGIC:
   ┌─ Not registered:
   │   freeIdx = allMatches.length - 1  (last match, index 4)
   │   viewer starts at freeIdx
   │   isLocked(pct, i) = true for all i !== freeIdx
   │   needsAuth = true when activeIdx !== freeIdx
   │   → all but last match card shows LockedCard with "Sign Up →"
   │   → viewer shows blurred morph + "Sign Up to reveal" overlay
   └─ Registered, non-premium, Doppelganger (pct >= 90):
       needsPremium(pct) = true
       → score % visible + "🔥 DOPPELGANGER 🔥" badge (creates desire)
       → celeb name + morph image blurred + "Unlock Premium" CTA

   Secondary match selection:
     Click ▶ on any unlocked card → setActiveIdx(i)
     List stays in fixed order; active card shows VIEWING badge
     Viewer header shows "#3 MATCH" when activeIdx > 0

   Celebrity face cropping: cropFaceFromUrl() aligns each celeb to same
   640×640 format; results cached in celebImgCache to avoid re-processing.

   Save: saveGeneration({ photoUrl, celeb: allMatches[0], others: allMatches.slice(1) })

4. DASHBOARD
   getAll() → grid of GenCards + SharedGenCards
   Sub-pages: main (grid + game cards) | camino (13-node path)
   "View →" → preload gen → navigate("/results")
   GenCard: MorphBoomerang plays automatically (user ↔ celeb loop)

5. VIRAL SHARE LOOP
   From IntranetUploadModal (Camino/Dice context):
   "🔗 Ask them to send their own selfie" → createSharedRequest() → unique ID
   → ShareLinkModal: shareable URL /share/:shareId
   → Step in Camino shows "🔗 SENT" + dashed border (upload blocked)

   Recipient opens /share/:shareId → SharePage:
   → Shows who requested + role (Dad/Friend/etc.)
   → Camera-only selfie (capture="user", no gallery)
   → detectAndCropFace → generateComparison → completeSharedRequest()
   → Requester's dashboard shows "🎉 LookAlike Ready!" card with notification badge
```

---

## 9. Face Detection & Morphing

### detect.js — Two public functions
```js
detectAndCropFace(imageUrl)  // user uploads — 1800ms min UX delay
cropFaceFromUrl(imageUrl)    // celeb images — instant, no delay
// Both return: { croppedUrl, faceGeometry?, faceDetected }
```

### Detection strategy (in order)
1. **@vladmandic/face-api TinyFaceDetector** — cross-browser, models from `/models`
2. **face_landmark_68_tiny** — 68 landmark points for precise face center
3. **Native `window.FaceDetector`** — Chrome/Edge fallback
4. **Skin-tone heuristic** — 8% skin-pixel threshold (user uploads only)
5. **Portrait heuristic** — fixed ratios: `faceCX = W*0.50, faceCY = H*0.33, faceH = H*0.40`

### renderFaceAligned — output geometry
```
OUTPUT_SIZE  = 640px  // square canvas
FACE_H_RATIO = 0.46   // face height / output side
FACE_V_POS   = 0.45   // face centre-y / output side

scale = max(OUTPUT_SIZE * FACE_H_RATIO / faceH, minScaleCover)
// clamp() prevents black borders: scale always covers full canvas
destX = clamp(OUTPUT_SIZE/2 - faceCX * scale, OUTPUT_SIZE - scaledW, 0)
destY = clamp(OUTPUT_SIZE * FACE_V_POS - faceCY * scale, OUTPUT_SIZE - scaledH, 0)
```

### morph.js — MorphSlider & MorphBoomerang
- Detects 68 landmarks on both user and celeb images
- Computes Delaunay triangulation on averaged point set
- For each triangle: affine transform from both images
- Alpha-blends at ratio `t` (0.0 = user, 1.0 = celeb)
- Canvas output: 640×640 JPEG

---

## 10. Services Layer — Swappable Backend

**File:** `web/src/services/index.js`
```js
// Change 1 line to switch backends:
export { ... } from "./adapters/local.js";       // ← ACTIVE (localStorage)
// export { ... } from "./adapters/supabase.js";
// export { ... } from "./adapters/firebase.js";
```

All adapters export the same interface:
```js
getAll()                              // generation[]
saveGeneration({ photoUrl, celeb, others }) // Promise<generation>
updateLabel(id, label, labelSub)
deleteGeneration(id)
clearGenerations()
```

### Generation record schema
```js
{
  id:        string,          // Date.now().toString()
  createdAt: number,
  thumb:     string,          // base64 JPEG 160×160 (dashboard cards)
  preview:   string,          // base64 JPEG 320×320 (result replay)
  celeb: {
    name:    string,
    pct:     number,          // 0–100
    color:   string,          // hex (position-based)
    img:     string,          // CDN URL (cdn.sociaaal.com/...)
    // optional: celebrityId, comparisonId, age, gender, ethnicity, emotion
  },
  others:    celeb[],         // 4 secondary matches
  label:     string | null,
  labelSub:  string | null,
}
```

### sharedGenerations.js — Viral share requests
```js
// localStorage key: "celebs_shared_v1"
createSharedRequest(ctx)              // creates pending request, returns { shareId, shareUrl }
getSharedRequest(shareId)             // get by ID
completeSharedRequest(shareId, data)  // mark done + save result
cancelSharedRequest(shareId)          // delete (re-enables local upload for that step)
getAllSharedRequests()                 // all requests for dashboard display
getUnseenCount()                      // notification badge count
markNotificationSeen(shareId)
getPendingForStep(type, step)         // find pending share for a Camino step
// TODO: replace localStorage with Firestore for multi-device support
```

---

## 11. Paywall — AuthModal & PaywallModal

### AuthModal — `features/auth/AuthModal.jsx`
Props: `{ isOpen, onClose, onSuccess, initialMode="signup", title, subtitle }`

### PaywallModal — `features/auth/PaywallModal.jsx`
- Full-screen modal with two plan options (monthly / annual)
- Plan variant IDs from env: `VITE_LS_VARIANT_MONTHLY` / `VITE_LS_VARIANT_ANNUAL`
- Calls `createCheckout(variantId)` → opens Lemon Squeezy URL in new tab
- Watches `subscription` in store; auto-closes when status becomes active

### Two-tier paywall logic (ResultsPage.jsx)
```
freeIdx = allMatches.length - 1   (index 4, the 5th match)

GUEST (not registered):
  → Viewer starts at freeIdx (5th match shown)
  → isLocked(pct, i) = i !== freeIdx  → cards 0–3 show LockedCard "Sign Up →"
  → needsAuth = activeIdx !== freeIdx → viewer blurred + "Sign Up to reveal"

REGISTERED, non-premium, pct >= 90:
  → needsPremium(pct) = true
  → isLocked(pct, i) = true for pct >= 90
  → Viewer shows score + DOPPELGANGER badge, but blurs identity
  → "👑 Reveal My Doppelganger" CTA opens PaywallModal

REGISTERED, premium (or preloaded):
  → All content visible
  → No blur, no locks
```

---

## 12. Dashboard — DashboardPage.jsx

### Game cards (top of grid)
- **CaminoCTA:** mini SVG path, progress counter, navigates to Camino sub-page
- **DiceCard:** animated roll, "Time to Upload..." banner, triggers upload with context
- **AlbumCard:** SOON modal

### Camino a la Fama — 13 nodes
```
Index | Type    | Label      | Emoji
  0   | photo   | You        | 🙋
  1   | photo   | Dad        | 👨
  2   | photo   | Mom        | 👩
  3   | SPECIAL | Reward     | 🎭  ← Family Portrait (claim)
  4   | photo   | Friend     | 👫
  5   | photo   | Brother    | 👦
  6   | SPECIAL | Reward     | ⭐  ← Party Started (claim)
  7   | photo   | Colleague  | 🧑‍💻
  8   | photo   | Teacher    | 📚
  9   | photo   | Sister     | 👧
 10   | photo   | Boss       | 👔
 11   | SPECIAL | Reward     | 🎬  ← Celebrity Gang (claim)
 12   | photo   | Crush      | 💘  ← always last
```

Steps with pending share links: node shows "🔗 SENT" + dashed border; upload disabled; CTA switches to "Resend Link / Cancel".

### SharedGenCard
Shows in dashboard grid for viral share requests:
- **Pending:** "⏳ Waiting for selfie..." + Resend + Cancel buttons
- **Completed (unseen):** "🎉 LookAlike Ready!" + NEW badge
- Click completed → navigate to /results with preloaded data

---

## 13. Design System

**File:** `web/src/design/tokens.js`
```js
colors.yellow  // "#FFE500" — primary CTA
colors.blue    // "#2AABE2" — brand primary
colors.black   // "#0A0A0A" — background
colors.pink    // "#FF3CAC" — accent
colors.cyan    // "#00E5FF" — tertiary
colors.green   // "#22c55e" — success / notification
colors.purple  // "#8B5CF6" — badge
colors.white   // "#FFFFFF"

fonts.display  // "'Fredoka', sans-serif"
fonts.body     // "'Oxanium', sans-serif"
```

**Rule:** Never hardcode hex colors or font names in components. Always import from tokens.

### Responsive breakpoints (match cards)
```
≥600px  → match-card: 140×200px,  match-card--large: 170×240px
≤480px  → match-card: 88×125px,   match-card--large: 106×148px
≤380px  → match-card: 76×108px,   match-card--large: 92×130px
```

---

## 14. Critical Non-Obvious Decisions

### 14a. user NOT cleared on reset()
`reset()` clears scan-related state but **NOT `user` or `subscription`**. Logout is explicit via `signOutUser()`.

### 14b. Analyzing — dual gate before navigate
```js
const [animDone, setAnimDone] = useState(false);
const [apiDone,  setApiDone]  = useState(false);
useEffect(() => {
  if (animDone && apiDone) navigate("/results");
}, [animDone, apiDone]);
```

### 14c. Paywall blur disappears automatically on login
`user` state comes from Firebase listener in Zustand. On login, listener fires → Zustand updates → React re-renders → blur condition `needsAuth` becomes false automatically.

### 14d. React StrictMode double-invocation
Effects run twice in dev. API call in Analyzing uses `cancelled = true` cleanup. ResultsPage uses `savedRef.current` to prevent double save.

### 14e. Camino progress — newest-first storage
`saveGeneration` prepends. Camino needs oldest-first:
```js
const revGens = [...gens].reverse(); // oldest first — never sort in storage layer
```

### 14f. allMatches fixed order in ResultsPage
`allMatches` is computed once at mount via `useState` lazy initializer. The list is **never reshuffled** regardless of which match is active. Only `activeIdx` changes. This prevents jarring UI reordering when selecting secondary matches.

### 14g. CSS-in-JS only
All styles are inline React objects or `<style>` string tags. No Tailwind, no CSS modules. Hover states via `onMouseEnter/onMouseLeave`. Font sizes use `clamp()`.

### 14h. Spotlight z-index
Overlay = `z-index: 1000`. `.hero-visual` = `z-index: 1001`. **Never add `z-index` to `.hero-section`** — it creates a stacking context that breaks the spotlight.

### 14i. Safe-area insets (iPhone notch)
```js
paddingBottom: "calc(28px + env(safe-area-inset-bottom, 0px))"
```

### 14j. No `@tensorflow/tfjs` imports
Vite resolves dynamic imports at build time. face-api.js from `@vladmandic/face-api` is the only vision library.

### 14k. Celebrity face CORS
Celebrity images from CDN (`cdn.sociaaal.com`) trigger canvas tainting if loaded with `<img>`. Fix: `fetch(url) → blob → createObjectURL()` in `fetchAsBlobUrl()` inside detect.js. Always canvas-safe.

### 14l. MorphSlider key prop
```jsx
<MorphSlider key={celeb.name} userPhoto={photo} celebPhoto={celebImg} />
```
`key={celeb.name}` forces React to fully remount MorphSlider when the active celebrity changes, resetting all internal canvas/worker state cleanly.

### 14m. DEMO_MODE (now a feature flag)
When `DEMO_MODE = true` (or `VITE_FF_DEMO_MODE=true`): auth uses in-memory mock, generateComparison returns mockData with delay, subscription stays null. Flip to `false` for any real testing or production.

### 14n. Feature flags guard components, not routes only
Flag checks use `getFlag()` at render time. Game cards in Dashboard are wrapped with `{getFlag("CAMINO") && <CaminoCTA />}`. The `/share/:shareId` route renders `<Navigate to="/" />` when `VIRAL_SHARE` is disabled.

### 14o. Asset manifest single source of truth
All `/samples/*` paths go through `assets/manifest.js`. Use `celebImg("taylor")` / `userImg("user1")` helpers. Never hardcode image paths.

---

## 15. Analytics Layer

**Directory:** `web/src/analytics/`

### Public API (`analytics/index.js`)
```js
import { init, track, identify, page, revenue, experiment } from "./analytics";
import { EVENTS } from "./analytics/events";

init();                              // call once in main.jsx
identify(user.uid, { email });       // after login
track(EVENTS.UPLOAD_START, { src }); // anywhere in the app
page(EVENTS.RESULT_VIEW);           // page wrappers
revenue(4.99, "USD", { plan });     // after subscription
experiment("new_paywall", "control"); // A/B test variant
```

### Event catalog (`analytics/events.js`)
All event names defined as constants. Categories: Onboarding, Core funnel, Auth, Monetization, Viral, Engagement.

### Provider stubs (`analytics/providers/`)
Four providers, all stubs (console.debug in dev, no-op in prod). Each has integration instructions in comments:
- **attribution.js** — MMP (AppsFlyer / Adjust / Branch)
- **userAnalytics.js** — Product analytics (Mixpanel / PostHog / Amplitude)
- **revenue.js** — Revenue tracking (RevenueCat / Adapty)
- **experiments.js** — A/B testing (GrowthBook / LaunchDarkly / Firebase A/B)

### Deep links (`analytics/deeplink.js`)
Parses UTM parameters from URL on load, persists to `sessionStorage`, auto-attaches to every `track()` call.

### HTML markers (`web/index.html`)
```html
<!-- [ANALYTICS:MMP] --> <!-- [ANALYTICS:USER] --> <!-- [ANALYTICS:AB] --> <!-- [ANALYTICS:REVENUE] -->
```
Paste third-party SDK scripts at these markers.

---

## 16. Asset Management

**File:** `web/src/assets/manifest.js`

Central registry of all static assets. Every image path comes from here — never hardcode `/samples/...`.

```js
import { celebImg, userImg, getPlaceholders } from "./assets/manifest";

celebImg("taylor")     // → "/samples/celeb_taylor.jpg"
userImg("user1")       // → "/samples/user1.jpg"
getPlaceholders()      // → [{ category, key, path, status, note }, ...]
```

Each entry has: `{ path, status: "placeholder"|"final", note }`.

To update an asset: change the `path` and set `status` to `"final"`.

---

## 17. Code Conventions

```js
// 1. Import tokens, never hardcode
import { colors, fonts } from "../../design/tokens";

// 2. Named exports for all components/pages
export function MyComponent() { ... }

// 3. Zustand — always selectors
const photo = useAppStore(s => s.uploadedPhoto);  // ✅
const { photo } = useAppStore();                   // ❌

// 4. Navigation
const navigate = useNavigate();
navigate("/results");   // ✅ (never window.location except checkout new tab)

// 5. Services — never import adapters directly
import { saveGeneration } from "../../services";               // ✅
import { saveGeneration } from "../../services/adapters/local"; // ❌

// 6. Assets — always use manifest helpers
import { celebImg } from "../../assets/manifest";              // ✅
const img = "/samples/celeb_taylor.jpg";                       // ❌

// 7. Feature flags — use getFlag() or useFeatureFlag()
import { getFlag } from "../../config";                        // ✅
const enabled = someHardcodedBool;                             // ❌

// 8. Analytics — use track() with EVENTS constants
import { track, EVENTS } from "../../analytics";               // ✅

// 9. Section headers in files
// ─── Section Name ─────────────────────────────────────────────────────────────
```

---

## 18. Current Status

### ✅ Implemented and working
- Face detection (face-api.js TinyFaceDetector + native + heuristic fallbacks)
- Face crop + alignment (renderFaceAligned, 640×640 normalized, no black borders)
- Face morphing (MorphSlider — Delaunay triangulation, 68 landmarks)
- MorphBoomerang — auto-playing loop animation on dashboard GenCards
- AI celebrity matching via Firebase Cloud Function (`GenerateComparisonAsync`)
- Firebase Auth (Google Sign In + Email/Password)
- Auth state persistence (Firebase listener → Zustand)
- Two-tier paywall: guest (all hidden except 5th) + non-premium doppelganger (identity hidden)
- PaywallModal: monthly/annual plans via Lemon Squeezy
- Lemon Squeezy webhook (Cloud Function, HMAC verified)
- Secondary match selection (fixed list order, VIEWING badge)
- Viral Share Loop: request, /share/:shareId page, selfie-only, notify requester
- Camino a la Fama: 13 nodes, 3 special events, share link blocking per step
- SharedGenCard: pending/completed shared gen display in dashboard
- Notification badge for unseen completed shared gens
- Dashboard: GenCards, MorphBoomerang, DiceCard, AlbumCard, Camino
- Responsive design: mobile-first, 100dvh hero, match card media queries
- Navbar mobile: Sign Up / My Photos visible in top bar
- **Feature flags system:** 11 flags, env override, `getFlag()` API, guards in router/dashboard/landing/results
- **Analytics layer:** public API + event catalog + 4 provider stubs (MMP, analytics, revenue, A/B) + UTM/deeplink tracking
- **Asset manifest:** centralized registry, `celebImg()`/`userImg()` helpers, `getPlaceholders()` auditor
- **Legacy cleanup:** removed CelebsWebExperience.jsx, db.js, faceDetect.js, App.jsx, App.css, scaffold SVGs

### 🎭 Mock / stub / placeholder
- `CELEB_POOL` (8 hardcoded celebrities) — used only if API throws
- Email waitlist (FinalCTA) — shows success state but doesn't persist
- "SEE ALL" matches card — visual only
- `api/` Express server — stub, not wired to the app
- `services/adapters/firebase.js` + `supabase.js` — ready interfaces, empty impl
- `sharedGenerations.js` — localStorage only; TODO: replace with Firestore
- Analytics providers — all stubs (console.debug in dev); replace with real SDKs
- All image assets in `assets/manifest.js` — status: `"placeholder"`

### 🔲 Not yet built
- Firestore persistence for generations (per-user cloud storage)
- Multi-device shared generations (currently same browser only)
- Dynamic OG share images
- Real analytics SDK integration (providers are stubs)
- Face embeddings (CTO plans to add to Cloud Function)
- Real domain + `<meta og:image>`
- Firebase Remote Config integration for runtime flag overrides

---

## 19. @STUB System — Production Readiness Audit

Every module that is dummy, stub, or placeholder is tagged with `@STUB` in the source code.

```bash
grep -rn "@STUB" web/src/ api/src/ functions/ --include="*.js" --include="*.jsx"
```

Full catalog with priorities, effort estimates, and dependencies: **`PRODUCTION_READINESS.md`**

Summary: **18 modules tagged** — 8 P0, 4 P1, 4 P2, 2 P3. Estimated ~25h for launch readiness (P0+P1).

---

## 20. Next Steps (Priority Order)

> See `PRODUCTION_READINESS.md` for detailed checklists per module.

### P0 — Before real users (8 items, ~17h)
1. Move Firebase config to env vars (`app.js` — hardcoded API keys)
2. Configure + deploy Cloud Functions (Lemon Squeezy secrets)
3. Implement `services/adapters/firebase.js` for per-user generation persistence
4. Migrate `sharedGenerations.js` to Firestore + Firebase Storage
5. Integrate user analytics SDK (PostHog or Mixpanel)
6. Integrate revenue tracking (RevenueCat or Lemon Squeezy dashboard)
7. Remove `testPanel.jsx` from DashboardPage
8. Set `DEMO_MODE = false`

### P1 — Core product (4 items, ~8h)
9. Integrate MMP provider for campaign attribution
10. Wire email waitlist (FinalCTA → email service)
11. Replace placeholder images (28 entries in `assets/manifest.js`)
12. Real domain + OG meta tags

### P2 — UX polish (4 items, ~8h)
13. Set up A/B testing provider (GrowthBook recommended)
14. Replace hardcoded stats with real metrics
15. Real user testimonials (Reviews section)
16. Validate marketing claims (HowItWorks copy)

### P3 — Growth
17. Dynamic share image (Satori / Cloudinary)
18. Face embeddings (when CTO adds to Cloud Function)
19. Firebase Remote Config for runtime feature flag toggling
20. Dashboard sort/filter by date, label, celeb name
