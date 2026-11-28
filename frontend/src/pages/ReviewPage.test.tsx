import { cleanup, fireEvent, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { detail, mockFetch, renderApp, requestBody } from "../test/renderApp";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const COMPLETED = detail({
  status: "completed",
  verdict: "inconclusive",
  learnings: "ダミーのわかったこと",
});

it("集計を表示し、判定とわかったことを送信すると詳細画面へ戻る", async () => {
  let completed = false;
  const fetchMock = mockFetch({
    "GET /api/cycles/1": () => Response.json(completed ? COMPLETED : detail()),
    "POST /api/cycles/1/complete": () => {
      completed = true;
      return Response.json(COMPLETED);
    },
  });
  renderApp("/cycles/1/review");

  expect(await screen.findByRole("heading", { level: 2, name: "振り返り" })).toBeTruthy();
  expect(screen.getByRole("region", { name: "集計" })).toBeTruthy();
  screen.getByRole("radio", { name: "判断できない" }).click();
  fireEvent.change(screen.getByLabelText("わかったこと"), {
    target: { value: "ダミーのわかったこと" },
  });
  screen.getByRole("button", { name: "完了する" }).click();

  expect(await screen.findByText("判定: 判断できない")).toBeTruthy();
  expect(screen.getByRole("heading", { level: 2, name: "ダミーの仮説" })).toBeTruthy();
  expect(requestBody(fetchMock, "POST /api/cycles/1/complete")).toEqual({
    verdict: "inconclusive",
    learnings: "ダミーのわかったこと",
  });
});

it("未入力なら送信せずにエラーを表示する", async () => {
  const fetchMock = mockFetch({ "GET /api/cycles/1": () => Response.json(detail()) });
  renderApp("/cycles/1/review");

  (await screen.findByRole("button", { name: "完了する" })).click();

  expect(await screen.findByText("判定を選んでください")).toBeTruthy();
  expect(screen.getByText("わかったことを入力してください")).toBeTruthy();
  expect(fetchMock).toHaveBeenCalledTimes(1);
});

it("完了に失敗したらエラーを表示する", async () => {
  mockFetch({
    "GET /api/cycles/1": () => Response.json(detail()),
    "POST /api/cycles/1/complete": () => new Response(null, { status: 409 }),
  });
  renderApp("/cycles/1/review");

  (await screen.findByRole("radio", { name: "支持された" })).click();
  fireEvent.change(screen.getByLabelText("わかったこと"), { target: { value: "ダミー" } });
  screen.getByRole("button", { name: "完了する" }).click();

  expect((await screen.findByRole("alert")).textContent).toContain("すでに完了しています");
});

it("完了済みのサイクルではフォームを出さない", async () => {
  mockFetch({ "GET /api/cycles/1": () => Response.json(COMPLETED) });
  renderApp("/cycles/1/review");

  expect(await screen.findByText("この検証はすでに完了しています")).toBeTruthy();
  expect(screen.queryByRole("button", { name: "完了する" })).toBeNull();
});

it("id が正の整数でなければ API を呼ばずに見つからない旨を表示する", async () => {
  const fetchMock = mockFetch({});

  renderApp("/cycles/abc/review");

  expect((await screen.findByRole("alert")).textContent).toContain("検証が見つかりません");
  expect(fetchMock).not.toHaveBeenCalled();
});
