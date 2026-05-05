// ─────────────────────────────────────────────────────────────────────────────
// matchShare.js — Viral share loop for showcasing a Doppelganger match.
//
// Creates a public "showcase" record that anyone can land on via /m/:matchId.
// Distinct from sharedGenerations.js (which is the friend-to-friend selfie
// request flow). This service is for VIRAL show-off shares to social media.
//
// DEMO: localStorage (same-device only). In production, this should be a
// Firestore document so links work cross-device.
//   Collection: matchShares/{matchId}
//   Fields:     createdAt, celeb (name/img/pct/color), userPhotoThumb (low-res
//               blurred-friendly version), senderName? (optional)
// ─────────────────────────────────────────────────────────────────────────────

const KEY = "celebs_match_shares_v1";

function generateId() {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let id = "";
  for (let i = 0; i < 10; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return id;
}

function getAll() {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); }
  catch { return []; }
}

function persist(all) {
  try { localStorage.setItem(KEY, JSON.stringify(all)); }
  catch {
    // Storage full — drop oldest half and retry
    try { localStorage.setItem(KEY, JSON.stringify(all.slice(0, Math.floor(all.length / 2)))); }
    catch { /* silent */ }
  }
}

/**
 * Create a public match share record.
 * @param {{ celeb: object, userPhotoUrl: string, senderName?: string }} data
 * @returns {{ matchId: string, shareUrl: string }}
 */
export function createMatchShare({ celeb, userPhotoUrl, senderName = "" }) {
  const matchId = generateId();
  const record = {
    matchId,
    createdAt: Date.now(),
    celeb: {
      name:  celeb.name,
      pct:   celeb.pct,
      img:   celeb.img,
      color: celeb.color,
    },
    userPhotoThumb: userPhotoUrl,   // already a data URL or blob URL
    senderName,
  };

  persist([record, ...getAll()].slice(0, 50)); // cap at 50 entries

  const shareUrl = `${window.location.origin}/m/${matchId}`;
  return { matchId, shareUrl };
}

/**
 * Look up a match by id.
 * @returns {object|null}
 */
export function getMatchShare(matchId) {
  return getAll().find(r => r.matchId === matchId) || null;
}
