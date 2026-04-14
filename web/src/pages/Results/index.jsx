// Results Page — re-exporta con integración de router + store
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore }  from "../../store/appStore";
import ResultsPageOriginal from "../../ResultsPage";

export function ResultsPage() {
  const navigate        = useNavigate();
  const photo           = useAppStore(s => s.uploadedPhoto);
  const preloaded       = useAppStore(s => s.preloadedResult);
  const reset           = useAppStore(s => s.reset);
  const setHasDashboard = useAppStore(s => s.setHasDashboard);

  useEffect(() => {
    if (!photo) navigate("/");
  }, [photo, navigate]);

  if (!photo) return null;

  return (
    <ResultsPageOriginal
      photo={photo}
      preloaded={preloaded}
      onReset={() => { reset(); navigate("/"); }}
      onDashboard={() => navigate("/dashboard")}
      onMount={() => setHasDashboard(true)}
    />
  );
}
