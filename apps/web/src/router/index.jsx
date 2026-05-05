import { createBrowserRouter, Navigate } from "react-router-dom";
import { LandingPage }   from "../pages/Landing";
import { AnalyzingPage } from "../pages/Analyzing";
import { ResultsPage }   from "../pages/Results";
import { DashboardPage } from "../pages/Dashboard";
import { SharePage }     from "../pages/Share";
import { MatchPage }     from "../pages/Match";
import { getFlag }       from "../config";

// ─────────────────────────────────────────────────────────
//  Application routes
//  Routes guarded by feature flags redirect to / when disabled.
//  To add a new page: add an entry here and create its folder in pages/
// ─────────────────────────────────────────────────────────
export const router = createBrowserRouter([
  { path: "/",              element: <LandingPage /> },
  { path: "/analyzing",     element: <AnalyzingPage /> },
  { path: "/results",       element: <ResultsPage /> },
  { path: "/dashboard",     element: <DashboardPage /> },
  { path: "/share/:shareId", element: getFlag("VIRAL_SHARE") ? <SharePage /> : <Navigate to="/" replace /> },
  { path: "/m/:matchId",     element: <MatchPage /> },
]);
