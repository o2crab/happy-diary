import { cleanup, fireEvent, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { CycleDetail } from "../api/schema";
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

const WITH_ENTRY: CycleDetail = detail({
  entries: [
    { date: "2026-11-27", practiced: false, happiness: 2, note: "" },
    { date: "2026-11-28", practiced: true, happiness: 4, note: "ダミーのメモ" },
  ],
  stats: {
    recorded_days: 2,
    practiced_days: 1,
    avg_happiness_practiced: 4,
    avg_happiness_not_practiced: 2,
  },
});

it("仮説、検証方法、期間、集計、記録を表示する", async () => {
  mockFetch({ "GET /api/cycles/1": () => Response.json(WITH_ENTRY) });

  renderApp("/cycles/1");

  expect(await screen.findByRole("heading", { level: 2, name: "ダミーの仮説" })).toBeTruthy();
  expect(screen.getByText("ダミーの検証方法")).toBeTruthy();
  expect(screen.getByText("2026年11月20日〜2026年12月3日")).toBeTruthy();
  const stats = screen.getByRole("region", { name: "集計" });
  expect(within(stats).getByText("記録した日数").nextSibling?.textContent).toBe("2日");
  expect(within(stats).getByText("実行した日の平均幸福度").nextSibling?.textContent).toBe("4.0");
  const entries = screen.getByRole("region", { name: "記録" });
  expect(within(entries).getByText("2026年11月27日")).toBeTruthy();
  expect(within(entries).getByText("ダミーのメモ")).toBeTruthy();
  expect(screen.getByRole("button", { name: "振り返る" })).toBeTruthy();
});

it("今日の記録があればフォームに値を入れ、日付を変えるとその日の値に替わる", async () => {
  mockFetch({ "GET /api/cycles/1": () => Response.json(WITH_ENTRY) });
  renderApp("/cycles/1");

  const checkbox = (await screen.findByRole("checkbox", { name: "実行した" })) as HTMLInputElement;
  const date = screen.getByLabelText("日付") as HTMLInputElement;
  expect(date.value).toBe("2026-11-28");
  expect(checkbox.checked).toBe(true);
  expect((screen.getByRole("radio", { name: "4 よい" }) as HTMLInputElement).checked).toBe(true);
  expect((screen.getByLabelText("メモ") as HTMLTextAreaElement).value).toBe("ダミーのメモ");

  fireEvent.change(date, { target: { value: "2026-11-25" } });
  expect(checkbox.checked).toBe(false);
  expect((screen.getByRole("radio", { name: "4 よい" }) as HTMLInputElement).checked).toBe(false);
});

it("記録を保存すると集計と一覧を読み直す", async () => {
  let saved = false;
  const fetchMock = mockFetch({
    "GET /api/cycles/1": () => Response.json(saved ? WITH_ENTRY : detail()),
    "PUT /api/cycles/1/entries/2026-11-28": () => {
      saved = true;
      return Response.json(WITH_ENTRY.entries[1]);
    },
  });
  renderApp("/cycles/1");

  expect(await screen.findByText("まだ記録がありません")).toBeTruthy();
  screen.getByRole("checkbox", { name: "実行した" }).click();
  screen.getByRole("radio", { name: "4 よい" }).click();
  fireEvent.change(screen.getByLabelText("メモ"), { target: { value: "ダミーのメモ" } });
  screen.getByRole("button", { name: "記録を保存" }).click();

  expect(await screen.findByText("記録を保存しました")).toBeTruthy();
  expect(requestBody(fetchMock, "PUT /api/cycles/1/entries/2026-11-28")).toEqual({
    practiced: true,
    happiness: 4,
    note: "ダミーのメモ",
  });
  expect(screen.getByText("2026年11月27日")).toBeTruthy();
});

it("幸福度を選ばずに保存するとエラーを表示する", async () => {
  const fetchMock = mockFetch({ "GET /api/cycles/1": () => Response.json(detail()) });
  renderApp("/cycles/1");

  (await screen.findByRole("button", { name: "記録を保存" })).click();

  expect(await screen.findByText("幸福度を選んでください")).toBeTruthy();
  expect(fetchMock).toHaveBeenCalledTimes(1);
});

it("保存に失敗したらエラーを表示する", async () => {
  mockFetch({
    "GET /api/cycles/1": () => Response.json(WITH_ENTRY),
    "PUT /api/cycles/1/entries/2026-11-28": () => new Response(null, { status: 409 }),
  });
  renderApp("/cycles/1");

  (await screen.findByRole("button", { name: "記録を保存" })).click();

  expect((await screen.findByRole("alert")).textContent).toContain(
    "完了した検証には記録できません",
  );
});

it("完了したサイクルは記録フォームの代わりに判定とわかったことを表示する", async () => {
  mockFetch({
    "GET /api/cycles/1": () =>
      Response.json(
        detail({ status: "completed", verdict: "supported", learnings: "ダミーのわかったこと" }),
      ),
  });
  renderApp("/cycles/1");

  expect(await screen.findByText("判定: 支持された")).toBeTruthy();
  expect(screen.getByText("ダミーのわかったこと")).toBeTruthy();
  expect(screen.queryByRole("button", { name: "記録を保存" })).toBeNull();
  expect(screen.queryByRole("button", { name: "振り返る" })).toBeNull();
});

it("見つからなければその旨を表示する", async () => {
  mockFetch({ "GET /api/cycles/9": () => new Response(null, { status: 404 }) });

  renderApp("/cycles/9");

  expect((await screen.findByRole("alert")).textContent).toContain("検証が見つかりません");
});
