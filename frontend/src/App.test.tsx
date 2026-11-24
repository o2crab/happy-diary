import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { App } from "./App";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it("API が正常なら状態を表示する", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ status: "ok" })));

  render(<App />);

  expect(await screen.findByText("API: 正常")).toBeTruthy();
});

it("API に接続できなければエラーを表示する", async () => {
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));

  render(<App />);

  expect(await screen.findByText("API: 接続エラー")).toBeTruthy();
});
