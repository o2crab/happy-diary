import { cleanup, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { mockFetch, renderApp, summary } from "../test/renderApp";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it("完了したサイクルを判定付きで一覧する", async () => {
  mockFetch({
    "GET /api/cycles?status=completed": () =>
      Response.json([
        summary({
          id: 5,
          hypothesis: "ダミーの完了した仮説",
          status: "completed",
          verdict: "not_supported",
          completed_at: "2026-12-04T00:00:00Z",
        }),
      ]),
  });

  renderApp("/history");

  const link = await screen.findByRole("link", { name: /ダミーの完了した仮説/ });
  expect(link.getAttribute("href")).toBe("/cycles/5");
  expect(screen.getByText("判定: 支持されなかった")).toBeTruthy();
});

it("0 件なら案内を表示する", async () => {
  mockFetch({ "GET /api/cycles?status=completed": () => Response.json([]) });

  renderApp("/history");

  expect(await screen.findByText(/完了した検証はまだありません/)).toBeTruthy();
});

it("読み込みに失敗したらエラーを表示する", async () => {
  mockFetch({});

  renderApp("/history");

  expect((await screen.findByRole("alert")).textContent).toContain("読み込めませんでした");
});
