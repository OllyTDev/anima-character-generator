import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { initTheme } from "./store/themeStore";
import { App } from "./ui/App";
import "./ui/app.css";

initTheme();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
