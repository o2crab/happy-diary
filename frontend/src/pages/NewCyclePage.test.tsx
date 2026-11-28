import { cleanup, fireEvent, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { detail, mockFetch, renderApp, requestBody } from "../test/renderApp";

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(2026, 10, 28, 9));
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

function input(label: string): HTMLInputElement {
  return screen.getByLabelText(label) as HTMLInputElement;
}

it("開始日は今日、終了予定日は 14 日後が既定になる", () => {
  mockFetch({});

  renderApp("/cycles/new");

  expect(input("開始日").value).toBe("2026-11-28");
  expect(input("終了予定日").value).toBe("2026-12-12");
});

it("未入力や終了日が開始日より前なら送信せずにエラーを表示する", async () => {
  const fetchMock = mockFetch({});
  renderApp("/cycles/new");

  fireEvent.change(input("終了予定日"), { target: { value: "2026-11-27" } });
  screen.getByRole("button", { name: "作成する" }).click();

  expect(await screen.findByText("仮説を入力してください")).toBeTruthy();
  expect(screen.getByText("検証方法を入力してください")).toBeTruthy();
  expect(screen.getByText("終了予定日は開始日以降にしてください")).toBeTruthy();
  expect(fetchMock).not.toHaveBeenCalled();
});

it("送信すると作成して詳細画面へ移る", async () => {
  const fetchMock = mockFetch({
    "POST /api/cycles": () =>
      Response.json(detail({ id: 7, hypothesis: "ダミーの新しい仮説" }), { status: 201 }),
    "GET /api/cycles/7": () => Response.json(detail({ id: 7, hypothesis: "ダミーの新しい仮説" })),
  });
  renderApp("/cycles/new");

  fireEvent.change(input("仮説"), { target: { value: "ダミーの新しい仮説" } });
  fireEvent.change(input("検証方法"), { target: { value: "ダミーの方法" } });
  screen.getByRole("button", { name: "作成する" }).click();

  expect(await screen.findByRole("heading", { level: 2, name: "ダミーの新しい仮説" })).toBeTruthy();
  expect(requestBody(fetchMock, "POST /api/cycles")).toEqual({
    hypothesis: "ダミーの新しい仮説",
    method: "ダミーの方法",
    start_date: "2026-11-28",
    end_date: "2026-12-12",
  });
});

it("作成に失敗したらエラーを表示する", async () => {
  mockFetch({ "POST /api/cycles": () => new Response(null, { status: 422 }) });
  renderApp("/cycles/new");

  fireEvent.change(input("仮説"), { target: { value: "ダミーの仮説" } });
  fireEvent.change(input("検証方法"), { target: { value: "ダミーの方法" } });
  screen.getByRole("button", { name: "作成する" }).click();

  expect((await screen.findByRole("alert")).textContent).toContain("保存できませんでした");
});
