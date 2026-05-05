// Analyzing Page — wraps the original component with router + store integration
// + calls GenerateComparisonAsync in parallel with the animation.
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../../store/appStore";
import AnalyzingPageOriginal from "../../AnalyzingPage";
import { generateComparison } from "../../features/firebase/generateComparison";
import { track, EVENTS } from "../../analytics";

export function AnalyzingPage() {
  const navigate        = useNavigate();
  const photo           = useAppStore(s => s.uploadedPhoto);
  const faceGeometry    = useAppStore(s => s.faceGeometry);
  const returnContext   = useAppStore(s => s.returnContext);
  const setDashSubPage  = useAppStore(s => s.setDashSubPage);
  const reset           = useAppStore(s => s.reset);
  const setApiResult    = useAppStore(s => s.setApiResult);

  // Two flags: animation done + API done → then navigate
  const [animDone, setAnimDone] = useState(false);
  const [apiDone,  setApiDone]  = useState(false);
  const didNavigate = useRef(false);

  // Redirect to home if someone navigates to /analyzing without a photo
  useEffect(() => {
    if (!photo) navigate("/");
  }, [photo, navigate]);

  // ── Fire the API call as soon as we have the photo ──
  useEffect(() => {
    if (!photo) return;
    track(EVENTS.ANALYSIS_START);

    let cancelled = false;
    generateComparison(photo)
      .then(results => {
        if (cancelled) return;
        console.log("[Analyzing] API OK →", results.length, "matches");
        track(EVENTS.ANALYSIS_COMPLETE, { matchCount: results.length, topPct: results[0]?.pct });
        setApiResult(results);
      })
      .catch(err => {
        if (cancelled) return;
        console.warn("[Analyzing] API failed, will use fallback:", err.message);
        setApiResult(null); // null = ResultsPage will use mock fallback
      })
      .finally(() => {
        if (!cancelled) setApiDone(true);
      });

    return () => { cancelled = true; };
  }, [photo]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Navigate when both animation and API are done ──
  useEffect(() => {
    if (!animDone || !apiDone || didNavigate.current) return;
    didNavigate.current = true;
    navigate("/results");
  }, [animDone, apiDone, navigate]);

  if (!photo) return null;

  // Cancel — clear the scan and go back to where we came from
  const handleCancel = () => {
    reset();
    if (returnContext?.returnTo === "camino") {
      setDashSubPage("camino");
      navigate("/dashboard");
    } else if (returnContext?.returnTo === "dashboard") {
      setDashSubPage("main");
      navigate("/dashboard");
    } else {
      navigate("/");
    }
  };

  return (
    <AnalyzingPageOriginal
      photo={photo}
      faceGeometry={faceGeometry}
      onComplete={() => setAnimDone(true)}
      onCancel={handleCancel}
    />
  );
}
