import { cleanup, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { mockFetch, renderApp, summary } from "../test/renderApp";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it("進行中のサイクルをカードのリンクで一覧する", async () => {
  mockFetch({
    "GET /api/cycles?status=active": () =>
      Response.json([summary({ id: 3, hypothesis: "ダミーの仮説 A" })]),
  });

  renderApp("/");

  const link = await screen.findByRole("link", { name: /ダミーの仮説 A/ });
  expect(link.getAttribute("href")).toBe("/cycles/3");
  expect(screen.getByText("2026年11月20日〜2026年12月3日")).toBeTruthy();
});

it("0 件なら案内を表示し、「仮説を追加」で作成画面へ移る", async () => {
  mockFetch({ "GET /api/cycles?status=active": () => Response.json([]) });

  renderApp("/");

  expect(await screen.findByText(/進行中の検証はありません/)).toBeTruthy();
  screen.getByRole("button", { name: "仮説を追加" }).click();
  expect(await screen.findByRole("heading", { level: 2, name: "仮説を追加" })).toBeTruthy();
});

it("読み込みに失敗したらエラーを表示する", async () => {
  mockFetch({ "GET /api/cycles?status=active": () => new Response(null, { status: 500 }) });

  renderApp("/");

  expect(screen.getByRole("status").textContent).toBe("読み込み中…");
  expect((await screen.findByRole("alert")).textContent).toContain("読み込めませんでした");
});
