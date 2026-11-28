import { cleanup, screen, within } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { mockFetch, renderApp } from "./test/renderApp";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it("ホームに見出しとナビゲーションを表示し、現在地を示す", async () => {
  mockFetch({ "GET /api/cycles?status=active": () => Response.json([]) });

  renderApp("/");

  expect(screen.getByRole("heading", { level: 1, name: "Happiness Spiral" })).toBeTruthy();
  expect(screen.getByRole("heading", { level: 2, name: "いまの検証" })).toBeTruthy();
  const navigation = screen.getByRole("navigation", { name: "メイン" });
  expect(
    within(navigation).getByRole("link", { name: "いまの検証" }).getAttribute("aria-current"),
  ).toBe("page");
  expect(within(navigation).getByRole("link", { name: "これまで" }).getAttribute("href")).toBe(
    "/history",
  );
  expect(await screen.findByText(/進行中の検証はありません/)).toBeTruthy();
});

it("ナビゲーションで「これまで」へ移動できる", async () => {
  mockFetch({
    "GET /api/cycles?status=active": () => Response.json([]),
    "GET /api/cycles?status=completed": () => Response.json([]),
  });

  renderApp("/");
  screen.getByRole("link", { name: "これまで" }).click();

  expect(await screen.findByRole("heading", { level: 2, name: "これまで" })).toBeTruthy();
  expect(screen.getByRole("link", { name: "これまで" }).getAttribute("aria-current")).toBe("page");
});

it("存在しないパスでは案内を表示する", () => {
  mockFetch({});

  renderApp("/unknown");

  expect(screen.getByText("ページが見つかりません")).toBeTruthy();
});
