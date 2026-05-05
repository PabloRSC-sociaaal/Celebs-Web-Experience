// ─────────────────────────────────────────────────────────────────────────────
// modules/comparisons/generate.js
//
// Pure handler logic for POST /api/comparisons/generate.
// The router thin-wraps this; tests can call it directly.
//
// @STUB — wires the call shape but does not yet contact the real ML backend.
// The dev team must replace `runComparison()` with the actual integration
// (face embedding service, celebrity vector DB, etc.). The OUTPUT shape is
// the contract — the web app and packages/shared-types depend on it.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Run the comparison against the celebrity database.
 *
 * @param {{
 *   uid: string,
 *   comparisonId: string,
 *   base64Image: string,
 *   embeddings?: number[],
 *   describePicture?: boolean,
 *   enrich?: boolean,
 * }} input
 * @returns {Promise<Array<{
 *   name: string,
 *   score: number,                 // 0-100
 *   celebrityId: string,
 *   comparisonId: string,
 *   imageData: {
 *     url: string,                 // CORS-enabled URL
 *     age: string|null,
 *     gender: string|null,
 *     ethnicity: string|null,
 *     emotion: string|null,
 *   }
 * }>>}
 */
async function runComparison(_input) {
  // TODO(dev-team): Replace with real ML backend call.
  // Expected behaviour:
  //   1. Persist the upload (e.g. Storage) keyed by uid + comparisonId.
  //   2. Run face embedding + nearest-neighbour against celeb DB.
  //   3. Return up to 5 matches sorted by score desc.
  //   4. Throw on no-face / no-results so the HTTP layer can 422 it.

  throw new Error(
    "[generate.js] runComparison not implemented. Wire to real backend or "
    + "set VITE_FF_DEMO_MODE=true on the web app to use mock data."
  );
}

async function generateComparisonHandler(req, res) {
  const uid = res.locals.uid;
  const {
    comparisonId,
    base64Image,
    embeddings = [],
    describePicture = true,
    enrich = true,
  } = req.body || {};

  if (!comparisonId) {
    return res.status(400).json({ error: "comparisonId is required" });
  }
  if (!base64Image || typeof base64Image !== "string") {
    return res.status(400).json({ error: "base64Image is required" });
  }

  try {
    const matches = await runComparison({
      uid, comparisonId, base64Image, embeddings, describePicture, enrich,
    });

    if (!Array.isArray(matches) || matches.length === 0) {
      return res.status(422).json({ error: "No matches found" });
    }

    return res.status(200).json({ matches });
  } catch (err) {
    console.error("[POST /api/comparisons/generate] error:", err);
    return res.status(500).json({ error: "Comparison failed" });
  }
}

module.exports = { runComparison, generateComparisonHandler };
