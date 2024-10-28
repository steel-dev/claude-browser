import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import ReactGA from "react-ga4";
import reportWebVitals from "./reportWebVitals";
import { SessionProvider } from "./SessionContext/session.context";

// Only initialize GA if tracking ID exists
if (process.env.REACT_APP_GA_TRACKING_ID) {
  ReactGA.initialize(process.env.REACT_APP_GA_TRACKING_ID);
  ReactGA.send({ hitType: "pageview", page: window.location.pathname });
}


const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <React.StrictMode>
    <SessionProvider>
      <App />
    </SessionProvider>
  </React.StrictMode>
);

reportWebVitals();
