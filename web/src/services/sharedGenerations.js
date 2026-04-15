// ─────────────────────────────────────────────────────────
//  Shared Generations — Viral Share Loop
//
//  DEMO: localStorage (same browser). In production, replace
//  with Firestore reads/writes so the link works cross-device:
//
//    Collection: sharedGenerations/{shareId}
//    Fields:     status, requestContext, createdAt, result,
//                senderUid, recipientUid, recipientPhoto
//
//    + Firebase Storage for the photos
// ─────────────────────────────────────────────────────────

const KEY = "celebs_shared_v1";

function generateId() {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let id = "";
  for (let i = 0; i < 8; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

function getAll() {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); }
  catch { return []; }
}

function persist(all) {
  try { localStorage.setItem(KEY, JSON.stringify(all)); } catch { /* silent */ }
}

/**
 * Create a pending shared generation request.
 * @param {{ type: string, label: string, labelSub: string|null, hint: object }} ctx
 * @returns {{ shareId: string, shareUrl: string, ... }}
 */
export function createSharedRequest(ctx) {
  const shareId = generateId();
  const record = {
    shareId,
    status: "pending",          // "pending" | "completed"
    requestContext: ctx,         // { type, label, labelSub, hint: { emoji, text, color } }
    createdAt: Date.now(),
    completedAt: null,
    result: null,                // filled when recipient completes
    recipientPhoto: null,        // base64 data URL of recipient's selfie
    notificationSeen: false,     // has the sender dismissed the notification?
  };

  persist([record, ...getAll()]);

  const shareUrl = `${window.location.origin}/share/${shareId}`;
  return { ...record, shareUrl };
}

/**
 * Get a shared generation by ID.
 * @returns {object|null}
 */
export function getSharedRequest(shareId) {
  return getAll().find(r => r.shareId === shareId) || null;
}

/**
 * Complete a shared generation — called after the recipient finishes.
 * @param {string} shareId
 * @param {{ celeb: object, others: object[], recipientPhoto: string }} data
 */
export function completeSharedRequest(shareId, { celeb, others, recipientPhoto }) {
  const all = getAll();
  const rec = all.find(r => r.shareId === shareId);
  if (!rec) return null;

  rec.status = "completed";
  rec.completedAt = Date.now();
  rec.result = { celeb, others };
  rec.recipientPhoto = recipientPhoto;

  persist(all);
  return rec;
}

/**
 * Mark the completion notification as seen by the sender.
 */
export function markNotificationSeen(shareId) {
  const all = getAll();
  const rec = all.find(r => r.shareId === shareId);
  if (rec) rec.notificationSeen = true;
  persist(all);
}

/**
 * Get all shared requests (for the dashboard).
 */
export function getAllSharedRequests() {
  return getAll();
}

/**
 * Count unseen completed notifications.
 */
export function getUnseenCount() {
  return getAll().filter(r => r.status === "completed" && !r.notificationSeen).length;
}

/**
 * Find a pending shared request for a specific Camino step or Dice hint.
 * Used to check if a step is "locked" by a share link.
 * @param {string} type - "camino" or "dice"
 * @param {number|null} step - Camino step index (null for dice)
 * @returns {object|null}
 */
export function getPendingForStep(type, step) {
  return getAll().find(r =>
    r.status === "pending" &&
    r.requestContext?.type === type &&
    (step === null || r.requestContext?.step === step)
  ) || null;
}

/**
 * Cancel (delete) a shared request — returns the step to unlocked state.
 */
export function cancelSharedRequest(shareId) {
  persist(getAll().filter(r => r.shareId !== shareId));
}

/**
 * Delete a shared request.
 */
export function deleteSharedRequest(shareId) {
  persist(getAll().filter(r => r.shareId !== shareId));
}
