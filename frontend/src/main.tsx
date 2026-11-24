import "@fontsource-variable/noto-sans-jp";
import "@fontsource/zen-maru-gothic/400.css";
import "./design/index.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { ThemeProvider } from "./design/theme/ThemeProvider";

const root = document.getElementById("root");
if (!root) {
  throw new Error("root 要素が見つかりません");
}

createRoot(root).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
);
