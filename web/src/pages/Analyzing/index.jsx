// Analyzing Page — re-exporta el componente original con integración de router + store
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../../store/appStore";
import AnalyzingPageOriginal from "../../AnalyzingPage";

export function AnalyzingPage() {
  const navigate = useNavigate();
  const photo    = useAppStore(s => s.uploadedPhoto);

  // Si alguien navega a /analyzing sin foto, lo manda de vuelta
  useEffect(() => {
    if (!photo) navigate("/");
  }, [photo, navigate]);

  if (!photo) return null;

  return (
    <AnalyzingPageOriginal
      photo={photo}
      onComplete={() => navigate("/results")}
    />
  );
}
