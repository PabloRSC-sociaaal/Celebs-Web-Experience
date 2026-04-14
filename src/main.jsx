import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import CelebsWebExperience from "./CelebsWebExperience.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <CelebsWebExperience />
  </StrictMode>
);
