// ─────────────────────────────────────────────────────────────────────────────
// functions/index.js
//
// Two named Express apps — per architecture.mdc this is the only top-level
// HTTP surface for this service:
//
//   exports.api       → /api/*           (Firebase ID-token auth)
//   exports.internal  → /internal/api/*  (per-route signature validation)
//
// Firestore triggers and scheduled functions, if added later, are exported
// directly from this file too — they don't go through the Express apps.
// ─────────────────────────────────────────────────────────────────────────────

const { onRequest }     = require("firebase-functions/v2/https");
const { defineSecret }  = require("firebase-functions/params");
const admin             = require("firebase-admin");
const express           = require("express");
const cors              = require("cors");

admin.initializeApp();

const { requireAuth }       = require("./src/middleware/auth.middleware");
const { buildApiRouter }    = require("./src/api/router");
const { buildInternalRouter } = require("./src/internal/router");

// ── Secrets ──────────────────────────────────────────────────────────────────
const lsApiKey         = defineSecret("LEMON_SQUEEZY_API_KEY");
const lsWebhookSecret  = defineSecret("LEMON_SQUEEZY_WEBHOOK_SECRET");
const lsStoreId        = defineSecret("LEMON_SQUEEZY_STORE_ID");

// ── api app — authenticated user surface ─────────────────────────────────────
const apiApp = express();
apiApp.use(cors({
  origin: true,
  credentials: false,
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  maxAge: 600,
}));
apiApp.use(express.json({ limit: "10mb" }));
apiApp.use(requireAuth);
apiApp.use("/api", buildApiRouter({
  getLemonSqueezyApiKey:  () => lsApiKey.value(),
  getLemonSqueezyStoreId: () => lsStoreId.value(),
}));
apiApp.use((_req, res) => res.status(404).json({ error: "Route not found" }));
apiApp.use((err, _req, res, _next) => {
  console.error("[api] unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// ── internal app — webhooks ──────────────────────────────────────────────────
const internalApp = express();
// Capture raw body for signature verification (HMAC of the exact bytes).
internalApp.use(express.json({
  limit: "1mb",
  verify: (req, _res, buf) => { req.rawBody = buf; },
}));
internalApp.use("/internal/api", buildInternalRouter({
  getLemonSqueezyWebhookSecret: () => lsWebhookSecret.value(),
}));
internalApp.use((_req, res) => res.status(404).json({ error: "Route not found" }));
internalApp.use((err, _req, res, _next) => {
  console.error("[internal] unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// ── Exports ──────────────────────────────────────────────────────────────────
exports.api = onRequest(
  { secrets: [lsApiKey, lsStoreId], region: "us-central1" },
  apiApp,
);

exports.internal = onRequest(
  { secrets: [lsWebhookSecret], region: "us-central1" },
  internalApp,
);
