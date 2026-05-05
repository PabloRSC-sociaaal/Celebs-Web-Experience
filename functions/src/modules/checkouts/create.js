// ─────────────────────────────────────────────────────────────────────────────
// modules/checkouts/create.js
//
// Pure handler for POST /api/checkouts. Creates a Lemon Squeezy hosted
// checkout for the authenticated user and returns its URL.
// ─────────────────────────────────────────────────────────────────────────────

async function createLemonSqueezyCheckout({ apiKey, storeId, uid, email, variantId }) {
  const res = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
    method: "POST",
    headers: {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
      Authorization: `Bearer ${apiKey}`,
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
          store:   { data: { type: "stores",   id: storeId } },
          variant: { data: { type: "variants", id: String(variantId) } },
        },
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("Lemon Squeezy checkout error:", res.status, text);
    throw new Error("LS_CHECKOUT_FAILED");
  }

  const json = await res.json();
  const url = json?.data?.attributes?.url;
  if (!url) throw new Error("LS_CHECKOUT_NO_URL");
  return url;
}

function makeCreateCheckoutHandler({ getApiKey, getStoreId }) {
  return async function createCheckoutHandler(req, res) {
    const uid   = res.locals.uid;
    const email = res.locals.email;
    const { variantId } = req.body || {};

    if (!variantId) {
      return res.status(400).json({ error: "variantId is required" });
    }

    try {
      const url = await createLemonSqueezyCheckout({
        apiKey:  getApiKey(),
        storeId: getStoreId(),
        uid, email, variantId,
      });
      return res.status(200).json({ url });
    } catch (err) {
      console.error("[POST /api/checkouts] error:", err.message);
      return res.status(500).json({ error: "Checkout creation failed" });
    }
  };
}

module.exports = { createLemonSqueezyCheckout, makeCreateCheckoutHandler };
