// @STUB — Firebase Cloud Functions (code complete, but secrets NOT configured)
// Status:    CODE READY but NOT DEPLOYED — secrets must be set before deploy
// Missing:   1. Set secrets: firebase functions:secrets:set LEMON_SQUEEZY_API_KEY
//            2. Set secrets: firebase functions:secrets:set LEMON_SQUEEZY_WEBHOOK_SECRET
//            3. Set secrets: firebase functions:secrets:set LEMON_SQUEEZY_STORE_ID
//            4. Deploy: firebase deploy --only functions
//            5. Configure Lemon Squeezy webhook URL pointing to lemonSqueezyWebhook endpoint
// Priority:  P0 — payments don't work without this
// Effort:    ~1h — follow LEMON_SQUEEZY_SETUP.md step by step
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const crypto = require("crypto");

admin.initializeApp();
const db = admin.firestore();

const lsApiKey = defineSecret("LEMON_SQUEEZY_API_KEY");
const lsWebhookSecret = defineSecret("LEMON_SQUEEZY_WEBHOOK_SECRET");
const lsStoreId = defineSecret("LEMON_SQUEEZY_STORE_ID");

// ─── createCheckoutUrl ──────────────────────────────────────────────────────
// Callable function — requires authenticated user.
// Receives { variantId } and returns { url } for Lemon Squeezy hosted checkout.

exports.createCheckoutUrl = onCall(
  { secrets: [lsApiKey, lsStoreId], region: "us-central1" },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Must be logged in");
    }

    const { variantId } = request.data;
    if (!variantId) {
      throw new HttpsError("invalid-argument", "variantId is required");
    }

    const uid = request.auth.uid;
    const email = request.auth.token.email || "";

    const res = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
      method: "POST",
      headers: {
        Accept: "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
        Authorization: `Bearer ${lsApiKey.value()}`,
      },
      body: JSON.stringify({
        data: {
          type: "checkouts",
          attributes: {
            checkout_data: {
              email,
              custom: { firebase_uid: uid },
            },
          },
          relationships: {
            store: {
              data: { type: "stores", id: lsStoreId.value() },
            },
            variant: {
              data: { type: "variants", id: String(variantId) },
            },
          },
        },
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Lemon Squeezy checkout error:", res.status, text);
      throw new HttpsError("internal", "Failed to create checkout");
    }

    const json = await res.json();
    const url = json?.data?.attributes?.url;

    if (!url) {
      throw new HttpsError("internal", "No checkout URL in response");
    }

    return { url };
  },
);

// ─── lemonSqueezyWebhook ────────────────────────────────────────────────────
// HTTP endpoint — public, but validates HMAC-SHA256 signature.
// Processes subscription lifecycle events and writes to Firestore.

exports.lemonSqueezyWebhook = onRequest(
  { secrets: [lsWebhookSecret], region: "us-central1" },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).send("Method not allowed");
      return;
    }

    // Verify HMAC signature
    const signature = req.headers["x-signature"];
    if (!signature) {
      res.status(401).send("Missing signature");
      return;
    }

    const rawBody =
      typeof req.body === "string" ? req.body : JSON.stringify(req.body);

    const expected = crypto
      .createHmac("sha256", lsWebhookSecret.value())
      .update(rawBody)
      .digest("hex");

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
      console.warn("Webhook signature mismatch");
      res.status(401).send("Invalid signature");
      return;
    }

    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const eventName = body?.meta?.event_name;
    const customData = body?.meta?.custom_data || {};
    const firebaseUid = customData.firebase_uid;

    if (!firebaseUid) {
      console.warn("Webhook missing firebase_uid in custom_data:", eventName);
      res.status(200).send("OK (no uid)");
      return;
    }

    const attrs = body?.data?.attributes || {};

    const HANDLED_EVENTS = [
      "subscription_created",
      "subscription_updated",
      "subscription_cancelled",
      "subscription_expired",
    ];

    if (!HANDLED_EVENTS.includes(eventName)) {
      res.status(200).send("OK (ignored event)");
      return;
    }

    const subscriptionData = {
      status: mapStatus(attrs.status),
      variantId: String(attrs.variant_id || ""),
      subscriptionId: String(body?.data?.id || ""),
      customerId: String(attrs.customer_id || ""),
      currentPeriodEnd: attrs.renews_at || null,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.doc(`users/${firebaseUid}`).set(
      { subscription: subscriptionData },
      { merge: true },
    );

    console.log(`Subscription ${eventName} for user ${firebaseUid}:`, subscriptionData.status);
    res.status(200).send("OK");
  },
);

// Map Lemon Squeezy status strings to our internal status values
function mapStatus(lsStatus) {
  const map = {
    active: "active",
    on_trial: "on_trial",
    past_due: "past_due",
    paused: "paused",
    cancelled: "cancelled",
    expired: "expired",
    unpaid: "past_due",
  };
  return map[lsStatus] || lsStatus || "unknown";
}
