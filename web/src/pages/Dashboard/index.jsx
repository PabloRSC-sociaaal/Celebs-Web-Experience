// Dashboard Page — wraps the original component with router + store integration
import { useEffect }     from "react";
import { useNavigate }    from "react-router-dom";
import { useAppStore }    from "../../store/appStore";
import DashboardPageOriginal from "../../DashboardPage";
import { page, EVENTS }  from "../../analytics";

export function DashboardPage() {
  const navigate          = useNavigate();
  const setPhoto          = useAppStore(s => s.setUploadedPhoto);
  const setPreloaded      = useAppStore(s => s.setPreloadedResult);
  const setReturnContext  = useAppStore(s => s.setReturnContext);
  const reset             = useAppStore(s => s.reset);

  useEffect(() => { page(EVENTS.DASHBOARD_VIEW); }, []);

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
