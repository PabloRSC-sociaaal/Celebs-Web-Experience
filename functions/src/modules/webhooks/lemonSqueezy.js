// ─────────────────────────────────────────────────────────────────────────────
// modules/webhooks/lemonSqueezy.js
//
// Webhook handler for Lemon Squeezy subscription lifecycle events.
// Validates the HMAC-SHA256 signature on `X-Signature` and writes the
// resulting subscription state to Firestore at `users/{firebaseUid}`.
// ─────────────────────────────────────────────────────────────────────────────

const crypto = require("crypto");
const admin  = require("firebase-admin");

const HANDLED_EVENTS = [
  "subscription_created",
  "subscription_updated",
  "subscription_cancelled",
  "subscription_expired",
];

function mapStatus(lsStatus) {
  const map = {
    active:    "active",
    on_trial:  "on_trial",
    past_due:  "past_due",
    paused:    "paused",
    cancelled: "cancelled",
    expired:   "expired",
    unpaid:    "past_due",
  };
  return map[lsStatus] || lsStatus || "unknown";
}

function verifySignature(rawBody, signatureHeader, secret) {
  if (!signatureHeader) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signatureHeader, "utf8"),
      Buffer.from(expected,        "utf8"),
    );
  } catch {
    return false;
  }
}

function makeLemonSqueezyWebhookHandler({ getWebhookSecret }) {
  return async function lemonSqueezyWebhookHandler(req, res) {
    const signature = req.get("X-Signature");
    const rawBody   = req.rawBody
      ? req.rawBody.toString("utf8")
      : (typeof req.body === "string" ? req.body : JSON.stringify(req.body));

    if (!verifySignature(rawBody, signature, getWebhookSecret())) {
      console.warn("[LS webhook] signature mismatch");
      return res.status(401).send("Invalid signature");
    }

    const body         = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const eventName    = body?.meta?.event_name;
    const customData   = body?.meta?.custom_data || {};
    const firebaseUid  = customData.firebase_uid;

    if (!firebaseUid) {
      console.warn("[LS webhook] missing firebase_uid:", eventName);
      return res.status(200).send("OK (no uid)");
    }

    if (!HANDLED_EVENTS.includes(eventName)) {
      return res.status(200).send("OK (ignored event)");
    }

    const attrs = body?.data?.attributes || {};
    const subscriptionData = {
      status:           mapStatus(attrs.status),
      variantId:        String(attrs.variant_id || ""),
      subscriptionId:   String(body?.data?.id || ""),
      customerId:       String(attrs.customer_id || ""),
      currentPeriodEnd: attrs.renews_at || null,
      updatedAt:        admin.firestore.FieldValue.serverTimestamp(),
    };

    await admin.firestore()
      .doc(`users/${firebaseUid}`)
      .set({ subscription: subscriptionData }, { merge: true });

    console.log(`[LS webhook] ${eventName} for ${firebaseUid}: ${subscriptionData.status}`);
    return res.status(200).send("OK");
  };
}

module.exports = { makeLemonSqueezyWebhookHandler, verifySignature, mapStatus };
