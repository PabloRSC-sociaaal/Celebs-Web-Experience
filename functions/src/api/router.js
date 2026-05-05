// ─────────────────────────────────────────────────────────────────────────────
// api/router.js
//
// All authenticated user-facing routes. Mounted at `/api/*` on the `api`
// Express app exported from index.js. Per architecture.mdc, every handler
// here is protected by `requireAuth` (applied app-wide in index.js) and
// must NOT read identity from the request body — use res.locals.uid.
//
// Routes here are documented in functions/openapi.yaml. Any change to the
// surface (new endpoint, renamed path, request/response shape) requires a
// matching update to that file in the same commit.
// ─────────────────────────────────────────────────────────────────────────────

const { Router } = require("express");
const { generateComparisonHandler } = require("../modules/comparisons/generate");
const { makeCreateCheckoutHandler } = require("../modules/checkouts/create");

function buildApiRouter({ getLemonSqueezyApiKey, getLemonSqueezyStoreId }) {
  const router = Router();

  router.get("/health", (_req, res) => {
    res.json({ status: "ok", uid: res.locals.uid });
  });

  router.post("/comparisons/generate", generateComparisonHandler);

  router.post("/checkouts", makeCreateCheckoutHandler({
    getApiKey:  getLemonSqueezyApiKey,
    getStoreId: getLemonSqueezyStoreId,
  }));

  return router;
}

module.exports = { buildApiRouter };
