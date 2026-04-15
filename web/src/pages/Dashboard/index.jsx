// Dashboard Page — re-exporta con integración de router + store
import { useNavigate }    from "react-router-dom";
import { useAppStore }    from "../../store/appStore";
import DashboardPageOriginal from "../../DashboardPage";

export function DashboardPage() {
  const navigate          = useNavigate();
  const setPhoto          = useAppStore(s => s.setUploadedPhoto);
  const setPreloaded      = useAppStore(s => s.setPreloadedResult);
  const setReturnContext  = useAppStore(s => s.setReturnContext);
  const reset             = useAppStore(s => s.reset);

  const handleViewResult = (gen) => {
    setPhoto(gen.preview);
    setPreloaded(gen);
    navigate("/results");
  };

  // Called by IntranetUploadModal when a face is confirmed.
  // croppedUrl = the face-cropped photo blob URL
  // ctx        = { type, returnTo, step?, hint? }
  const handleStartScan = (croppedUrl, ctx) => {
    reset();                       // clear any previous scan state
    setPhoto(croppedUrl);          // set the photo for analyzing
    setReturnContext(ctx);         // remember where to return after results
    navigate("/analyzing");
  };

  return (
    <DashboardPageOriginal
      onStartScan={handleStartScan}
      onViewResult={handleViewResult}
      onBack={() => navigate("/")}
    />
  );
}
