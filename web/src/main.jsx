import { StrictMode }     from "react";
import { createRoot }     from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import "./index.css";
import { router } from "./router";
import { initAuthListener } from "./features/firebase/authService";
import { initSubscriptionListener } from "./features/firebase/subscriptionService";
import { useAppStore } from "./store/appStore";
import { init as initAnalytics, identify as identifyUser } from "./analytics";

// ── Analytics ────────────────────────────────────────────────────────────────
initAnalytics();

// ── Auth + subscription ──────────────────────────────────────────────────────
let unsubscribeSubscription = null;

initAuthListener((user) => {
  const store = useAppStore.getState();
  store.setUser(user);

  if (unsubscribeSubscription) {
    unsubscribeSubscription();
    unsubscribeSubscription = null;
  }

  if (user) {
    identifyUser(user.uid, { email: user.email, displayName: user.displayName });
    unsubscribeSubscription = initSubscriptionListener(user.uid, (sub) => {
      useAppStore.getState().setSubscription(sub);
    });
  } else {
    store.setSubscription(null);
  }
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
