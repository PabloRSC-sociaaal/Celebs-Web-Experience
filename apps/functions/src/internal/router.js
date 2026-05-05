// ─────────────────────────────────────────────────────────────────────────────
// internal/router.js
//
// Inbound webhooks from external services. Mounted at /internal/api/webhooks
// on the `internal` Express app. Per architecture.mdc, each route validates
// its own signature before doing any work — there is NO shared auth
// middleware on this surface.
//
// Routes here are documented in functions/internal.openapi.yaml.
// ─────────────────────────────────────────────────────────────────────────────

const { Router } = require("express");
const { makeLemonSqueezyWebhookHandler } = require("../modules/webhooks/lemonSqueezy");

function buildInternalRouter({ getLemonSqueezyWebhookSecret }) {
  const router = Router();

  router.post(
    "/webhooks/lemon-squeezy",
    makeLemonSqueezyWebhookHandler({
      getWebhookSecret: getLemonSqueezyWebhookSecret,
    }),
  );

  return router;
}

module.exports = { buildInternalRouter };
