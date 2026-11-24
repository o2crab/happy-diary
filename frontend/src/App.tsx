import { useEffect, useState } from "react";
import type { HealthResponse } from "./api/schema";

type ApiState = "checking" | HealthResponse["status"] | "error";

const LABELS: Record<ApiState, string> = {
  checking: "確認中",
  ok: "正常",
  error: "接続エラー",
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
    <main>
      <h1>Happiness Spiral</h1>
      <p>API: {LABELS[apiState]}</p>
    </main>
  );
}
