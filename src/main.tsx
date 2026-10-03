import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./app/App";
import "./styles/app.css";
import { registerOffline } from "./platform/offline";
import { restoreSnapshot } from "./data/snapshot";

void restoreSnapshot().finally(() => {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
  registerOffline();
});
