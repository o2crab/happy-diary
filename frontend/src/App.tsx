import historyIcon from "@material-symbols/svg-400/rounded/history.svg";
import historyFillIcon from "@material-symbols/svg-400/rounded/history-fill.svg";
import homeIcon from "@material-symbols/svg-400/rounded/home.svg";
import homeFillIcon from "@material-symbols/svg-400/rounded/home-fill.svg";
import { RouterProvider } from "react-aria-components";
import { Route, Routes, useHref, useLocation, useNavigate } from "react-router";
import styles from "./App.module.css";
import { NavigationBar, type NavigationItem } from "./design/components/NavigationBar";
import { TopAppBar } from "./design/components/TopAppBar";
import { ThemeToggle } from "./design/theme/ThemeToggle";
import { CycleDetailPage } from "./pages/CycleDetailPage";
import { HistoryPage } from "./pages/HistoryPage";
import { HomePage } from "./pages/HomePage";
import { NewCyclePage } from "./pages/NewCyclePage";
import { ReviewPage } from "./pages/ReviewPage";
import { EmptyState } from "./pages/Status";

const NAVIGATION_ITEMS: NavigationItem[] = [
  { href: "/", label: "いまの検証", icon: homeIcon, selectedIcon: homeFillIcon },
  { href: "/history", label: "これまで", icon: historyIcon, selectedIcon: historyFillIcon },
];

/** アプリ全体の枠。BrowserRouter(テストでは MemoryRouter)の中で使います。 */
export function App() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const currentHref = pathname.startsWith("/history") ? "/history" : "/";

  return (
    <RouterProvider
      navigate={(path) => {
        void navigate(path);
      }}
      useHref={useHref}
    >
      <div className={styles.shell}>
        <TopAppBar title="Happiness Spiral" trailing={<ThemeToggle />} />
        <NavigationBar items={NAVIGATION_ITEMS} currentHref={currentHref} />
        <main className={styles.main}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/cycles/new" element={<NewCyclePage />} />
            <Route path="/cycles/:id" element={<CycleDetailPage />} />
            <Route path="/cycles/:id/review" element={<ReviewPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="*" element={<EmptyState>ページが見つかりません</EmptyState>} />
          </Routes>
        </main>
      </div>
    </RouterProvider>
  );
}
