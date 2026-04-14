// Dashboard Page — re-exporta con integración de router + store
import { useNavigate }    from "react-router-dom";
import { useAppStore }    from "../../store/appStore";
import DashboardPageOriginal from "../../DashboardPage";

export function DashboardPage() {
  const navigate      = useNavigate();
  const reset         = useAppStore(s => s.reset);
  const setPhoto      = useAppStore(s => s.setUploadedPhoto);
  const setPreloaded  = useAppStore(s => s.setPreloadedResult);

  const handleViewResult = (gen) => {
    setPhoto(gen.preview);
    setPreloaded(gen);
    navigate("/results");
  };

  return (
    <DashboardPageOriginal
      onNew={() => { reset(); navigate("/"); }}
      onViewResult={handleViewResult}
      onBack={() => navigate("/")}
    />
  );
}
