import checkCircleIcon from "@material-symbols/svg-400/rounded/check_circle.svg";
import errorIcon from "@material-symbols/svg-400/rounded/error.svg";
import syncIcon from "@material-symbols/svg-400/rounded/sync.svg";
import { useEffect, useState } from "react";
import styles from "./App.module.css";
import type { HealthResponse } from "./api/schema";
import { Card } from "./design/components/Card";
import { Icon } from "./design/components/Icon";
import { TopAppBar } from "./design/components/TopAppBar";
import { ThemeToggle } from "./design/theme/ThemeToggle";

type ApiState = "checking" | HealthResponse["status"] | "error";

const LABELS: Record<ApiState, string> = {
  checking: "確認中",
  ok: "正常",
  error: "接続エラー",
};

const ICONS: Record<ApiState, string> = {
  checking: syncIcon,
  ok: checkCircleIcon,
  error: errorIcon,
};

export function App() {
  const [apiState, setApiState] = useState<ApiState>("checking");

  useEffect(() => {
    const controller = new AbortController();

    async function loadHealth() {
      try {
        const response = await fetch("/api/health", { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const health = (await response.json()) as HealthResponse;
        setApiState(health.status);
      } catch {
        if (!controller.signal.aborted) {
          setApiState("error");
        }
      }
    }

    void loadHealth();
    return () => controller.abort();
  }, []);

  return (
    <>
      <TopAppBar title="Happiness Spiral" trailing={<ThemeToggle />} />
      <main className={styles.main}>
        <Card variant="filled" className={styles.status} data-state={apiState}>
          <Icon src={ICONS[apiState]} size={24} />
          <p>API: {LABELS[apiState]}</p>
        </Card>
      </main>
    </>
  );
}
