import "@fontsource-variable/noto-sans-jp";
import "@fontsource/zen-maru-gothic/400.css";
import "./design/index.css";
import { lazy, StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { App } from "./App";
import { ThemeProvider } from "./design/theme/ThemeProvider";

// 開発時だけ /__design で部品の見本を表示します。本番ビルドでは条件ごと取り除かれます。
const Page =
  import.meta.env.DEV && location.pathname === "/__design"
    ? lazy(() => import("./design/Gallery").then((module) => ({ default: module.Gallery })))
    : RoutedApp;

function RoutedApp() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}

const root = document.getElementById("root");
if (!root) {
  throw new Error("root 要素が見つかりません");
}

createRoot(root).render(
  <StrictMode>
    <ThemeProvider>
      <Suspense>
        <Page />
      </Suspense>
    </ThemeProvider>
  </StrictMode>,
);
