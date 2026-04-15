# Celebs — Celebrity lookalike platform

Monorepo: React web app, optional Express API stub, Firebase Cloud Functions (payments), Firestore rules.

**Handoff:** clone → install → copy `.env` from `*.env.example` → `npm run dev`.  
Deeper context: `CLAUDE.md`. Production gaps: `PRODUCTION_READINESS.md`. Payments: `LEMON_SQUEEZY_SETUP.md`.

---

## Requirements

- **Node.js** 20+ (LTS recommended)
- **npm** 9+

---

## First-time setup

From the **repository root**:

```bash
npm install
npm run install:all
```

This installs root tooling (`concurrently`), **`web/`**, **`api/`**, and **`functions/`** dependencies.

### Environment files (team fills in secrets)

| Package | Template | Create |
|-----------|--------------------|---------------|
| Web | `web/.env.example` | `web/.env`    |
| API       | `api/.env.example` | `api/.env`    |
| Functions | `functions/.env.example` | Use Firebase **secrets** for production (see `LEMON_SQUEEZY_SETUP.md`) |

Never commit `.env` or real API keys. Only commit `*.env.example`.

---

## Dev commands (from repo root)

| Command           | Description |
|-------------------|-------------|
| `npm run dev`     | Vite dev server for **`web/`** (default [http://localhost:5174](http://localhost:5174)) |
| `npm run dev:api` | Express **`api/`** on port 3001 |
| `npm run dev:all` | Frontend + API together |
| `npm run build`   | Production build of **`web/`** → `web/dist` |
| `npm run preview` | Preview production build locally |

---

## Repository layout

```
celebs-preview/
├── web/                 # React 19 + Vite — main product
├── api/                 # Express stub (not wired to the web app yet)
├── functions/           # Firebase Functions (Lemon Squeezy checkout + webhook)
├── firebase.json
├── firestore.rules
├── CLAUDE.md                    # Architecture & conventions for developers / AI agents
├── PRODUCTION_READINESS.md      # @STUB audit, priorities P0–P3
├── LEMON_SQUEEZY_SETUP.md       # Payment integration steps
└── CHANGELOG.md
```

---

## Switching persistence backend (`web/`)

Edit **`web/src/services/index.js`** — change the export from `./adapters/local.js` to `firebase.js` or `supabase.js` after those adapters are implemented.

---

## Firebase & payments

- Client config: `web/src/features/firebase/app.js` (move to env when ready).
- Deploy functions: see Firebase docs + `LEMON_SQUEEZY_SETUP.md`.
- Webhook and checkout require secrets configured on the Firebase/GCP side.

---

## License / ownership

Private project — distribute only to authorized team members.
