// ─────────────────────────────────────────────────────────────────────────────
// lib/apiClient.js
//
// The ONLY module in the web app that talks HTTP to the backend.
// Everything else imports `apiFetch` (or one of the typed helpers) from here.
//
// Per architecture.mdc:
//   - Calls /api/* on the `api` Express function
//   - Authorisation: Bearer <Firebase ID token>
//   - Never imports httpsCallable / getFunctions
// ─────────────────────────────────────────────────────────────────────────────

import { firebaseApp } from "../features/firebase/app";
import { getAuth }     from "firebase/auth";
import { API_BASE_URL } from "../config/env";

class ApiError extends Error {
  constructor(message, { status, body } = {}) {
    super(message);
    this.name   = "ApiError";
    this.status = status;
    this.body   = body;
  }
}

async function getIdToken({ forceRefresh = false } = {}) {
  const auth = getAuth(firebaseApp);
  const user = auth.currentUser;
  if (!user) throw new ApiError("Not authenticated", { status: 401 });
  return user.getIdToken(forceRefresh);
}

/**
 * Low-level helper. Prefer the typed wrappers below.
 *
 * @param {string} path  Path under the api root, e.g. "/comparisons/generate".
 * @param {object} [opts]
 * @param {string} [opts.method]      Default "GET".
 * @param {object} [opts.body]        Will be JSON-stringified.
 * @param {boolean} [opts.requireAuth] Default true. Set false for unauthenticated routes.
 * @param {AbortSignal} [opts.signal]
 */
export async function apiFetch(path, opts = {}) {
  const {
    method = "GET",
    body,
    requireAuth: needsAuth = true,
    signal,
  } = opts;

  const headers = { "Content-Type": "application/json" };

  if (needsAuth) {
    const token = await getIdToken();
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  });

  // Surface JSON when present, otherwise text — but always throw on !ok.
  const contentType = res.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await res.json().catch(() => null)
    : await res.text().catch(() => "");

  if (!res.ok) {
    const message = (payload && typeof payload === "object" && payload.error)
      ? payload.error
      : `HTTP ${res.status}`;
    throw new ApiError(message, { status: res.status, body: payload });
  }

  return payload;
}

export { ApiError };
