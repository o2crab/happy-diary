import { cleanup, fireEvent, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { detail, mockFetch, renderApp } from "./test/renderApp";

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

describe("上部のバーの「戻る」", () => {
  function pressBack() {
    fireEvent.click(screen.getByRole("button", { name: "戻る" }));
  }

  it("一覧の画面では表示しない", async () => {
    mockFetch({ "GET /api/cycles?status=active": () => Response.json([]) });

    renderApp("/");

    expect(await screen.findByText(/進行中の検証はありません/)).toBeTruthy();
    expect(screen.queryByRole("button", { name: "戻る" })).toBeNull();
  });

  it("進行中のサイクルの詳細から「いまの検証」へ戻る", async () => {
    mockFetch({
      "GET /api/cycles/1": () => Response.json(detail()),
      "GET /api/cycles?status=active": () => Response.json([]),
    });

    renderApp("/cycles/1");
    await screen.findByRole("heading", { level: 2, name: "ダミーの仮説" });
    pressBack();

    expect(await screen.findByRole("heading", { level: 2, name: "いまの検証" })).toBeTruthy();
  });

  it("完了したサイクルの詳細から「これまで」へ戻る", async () => {
    mockFetch({
      "GET /api/cycles/1": () =>
        Response.json(
          detail({ status: "completed", verdict: "supported", learnings: "ダミーの学び" }),
        ),
      "GET /api/cycles?status=completed": () => Response.json([]),
    });

    renderApp("/cycles/1");
    await screen.findByText("判定: 支持された");
    pressBack();

    expect(await screen.findByRole("heading", { level: 2, name: "これまで" })).toBeTruthy();
  });

  it("振り返りからそのサイクルの詳細へ戻る", async () => {
    mockFetch({ "GET /api/cycles/1": () => Response.json(detail()) });

    renderApp("/cycles/1/review");
    await screen.findByRole("heading", { level: 2, name: "振り返り" });
    pressBack();

    expect(await screen.findByRole("heading", { level: 2, name: "ダミーの仮説" })).toBeTruthy();
  });

  it("仮説の追加から「いまの検証」へ戻る", async () => {
    mockFetch({ "GET /api/cycles?status=active": () => Response.json([]) });

    renderApp("/cycles/new");
    pressBack();

    expect(await screen.findByRole("heading", { level: 2, name: "いまの検証" })).toBeTruthy();
  });

  it("見つからない id の詳細から「いまの検証」へ戻る", async () => {
    mockFetch({ "GET /api/cycles?status=active": () => Response.json([]) });

    renderApp("/cycles/abc");
    pressBack();

    expect(await screen.findByRole("heading", { level: 2, name: "いまの検証" })).toBeTruthy();
  });
});
