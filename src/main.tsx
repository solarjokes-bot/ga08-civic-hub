import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { configureAmplify } from "@/lib/amplify";
import { AccountProvider } from "@/lib/account/AccountProvider";
import { SavedServicesProvider } from "@/lib/account/SavedServicesProvider";
import App from "./App";
import "./styles/index.css";

configureAmplify();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      {/*
        Accounts are optional and wrap the app only so the header and any
        resource card can read the same session and saved list. Signed out
        (or with no backend) both providers resolve to an inert state and
        the UI simply omits the account affordances.
      */}
      <AccountProvider>
        <SavedServicesProvider>
          <App />
        </SavedServicesProvider>
      </AccountProvider>
    </BrowserRouter>
  </StrictMode>
);
