// Results Page — re-exporta con integración de router + store
import { useEffect } from "react";
import { useNavigate }  from "react-router-dom";
import { useAppStore }  from "../../store/appStore";
import ResultsPageOriginal from "../../ResultsPage";

export function ResultsPage() {
  const navigate         = useNavigate();
  const photo            = useAppStore(s => s.uploadedPhoto);
  const preloaded        = useAppStore(s => s.preloadedResult);
  const apiResult        = useAppStore(s => s.apiResult);
  const reset            = useAppStore(s => s.reset);
  const setHasDashboard  = useAppStore(s => s.setHasDashboard);
  const returnContext         = useAppStore(s => s.returnContext);
  const setDashSubPage        = useAppStore(s => s.setDashSubPage);
  const setJustCompletedStep  = useAppStore(s => s.setJustCompletedStep);

  useEffect(() => {
    if (!photo) navigate("/");
  }, [photo, navigate]);

  if (!photo) return null;

  // Smart "back to intranet" navigation — goes to the right sub-page
  const handleDashboard = () => {
    if (returnContext?.returnTo === "camino") {
      // Signal CaminoPage to animate the step that just got completed
      if (typeof returnContext.step === "number") {
        setJustCompletedStep(returnContext.step);
      }
      setDashSubPage("camino");
    } else {
      setDashSubPage("main");
    }
    navigate("/dashboard");
  };

  return (
    <ResultsPageOriginal
      photo={photo}
      preloaded={preloaded}
      apiResult={apiResult}
      returnContext={returnContext}
      onReset={() => { reset(); navigate("/"); }}
      onDashboard={handleDashboard}
      onMount={() => setHasDashboard(true)}
    />
  );
}
