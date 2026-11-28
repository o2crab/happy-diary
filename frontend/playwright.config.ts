import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { defineConfig, devices } from "@playwright/test";

// 本番と同じく、ビルドした画面を FastAPI から配信して試します。
// DB は実行ごとの一時ディレクトリに作り、開発 DB には触れません。
const port = 8100;
const baseURL = `http://127.0.0.1:${port}`;
const databaseDir = mkdtempSync(join(tmpdir(), "happy-diary-e2e-"));

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `uv run --directory ../backend --locked uvicorn app.main:app --host 127.0.0.1 --port ${port}`,
    url: `${baseURL}/api/health`,
    reuseExistingServer: false,
    env: {
      DATABASE_URL: `sqlite:///${join(databaseDir, "e2e.db")}`,
      STATIC_DIR: resolve(import.meta.dirname, "dist"),
    },
  },
});
