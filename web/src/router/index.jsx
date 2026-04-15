import { createBrowserRouter } from "react-router-dom";
import { LandingPage }   from "../pages/Landing";
import { AnalyzingPage } from "../pages/Analyzing";
import { ResultsPage }   from "../pages/Results";
import { DashboardPage } from "../pages/Dashboard";
import { SharePage }     from "../pages/Share";

// ─────────────────────────────────────────────────────────
//  Rutas de la aplicación
//  Para añadir una página nueva: añade una entrada aquí
//  y crea su carpeta en pages/
// ─────────────────────────────────────────────────────────
export const router = createBrowserRouter([
  { path: "/",              element: <LandingPage /> },
  { path: "/analyzing",     element: <AnalyzingPage /> },
  { path: "/results",       element: <ResultsPage /> },
  { path: "/dashboard",     element: <DashboardPage /> },
  { path: "/share/:shareId", element: <SharePage /> },
]);
