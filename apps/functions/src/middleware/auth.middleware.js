// ─────────────────────────────────────────────────────────────────────────────
// auth.middleware.js
//
// Verifies the Firebase ID token on `Authorization: Bearer <token>` headers
// and attaches the decoded uid to `res.locals.uid`.
//
// Per architecture.mdc, every route under the `api` Express app is protected
// by this middleware. Identity must NEVER be read from the request body.
// ─────────────────────────────────────────────────────────────────────────────

const admin = require("firebase-admin");

async function requireAuth(req, res, next) {
  const header = req.get("Authorization") || "";
  if (!header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or malformed Authorization header" });
  }

  const idToken = header.slice("Bearer ".length).trim();
  if (!idToken) return res.status(401).json({ error: "Empty Bearer token" });

  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    res.locals.uid   = decoded.uid;
    res.locals.email = decoded.email || "";
    return next();
  } catch (err) {
    console.warn("[requireAuth] token verification failed:", err.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

module.exports = { requireAuth };
