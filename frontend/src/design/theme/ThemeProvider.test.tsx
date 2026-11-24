import { act, cleanup, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { ThemeProvider, useTheme } from "./ThemeProvider";
import { THEME_STORAGE_KEY } from "./theme";

function wrapper({ children }: { children: ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}

beforeEach(() => {
  localStorage.clear();
  delete document.documentElement.dataset.theme;
});

afterEach(() => {
  cleanup();
});

it("保存がなければ system になり、data-theme を付けない", () => {
  const { result } = renderHook(() => useTheme(), { wrapper });

  expect(result.current.preference).toBe("system");
  expect(document.documentElement.dataset.theme).toBeUndefined();
});

it("保存済みの設定を読み込んで反映する", () => {
  localStorage.setItem(THEME_STORAGE_KEY, "dark");

  const { result } = renderHook(() => useTheme(), { wrapper });

  expect(result.current.preference).toBe("dark");
  expect(document.documentElement.dataset.theme).toBe("dark");
});

it("不正な保存値は system として扱う", () => {
  localStorage.setItem(THEME_STORAGE_KEY, "sepia");

  const { result } = renderHook(() => useTheme(), { wrapper });

  expect(result.current.preference).toBe("system");
});

it("切り替えると data-theme と保存値を更新し、system に戻すと両方消す", () => {
  const { result } = renderHook(() => useTheme(), { wrapper });

  act(() => result.current.setPreference("light"));
  expect(document.documentElement.dataset.theme).toBe("light");
  expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");

  act(() => result.current.setPreference("system"));
  expect(document.documentElement.dataset.theme).toBeUndefined();
  expect(localStorage.getItem(THEME_STORAGE_KEY)).toBeNull();
});

it("localStorage が使えなくても system で動作する", () => {
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
    throw new Error("blocked");
  });
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw new Error("blocked");
  });

  const { result } = renderHook(() => useTheme(), { wrapper });
  expect(result.current.preference).toBe("system");

  act(() => result.current.setPreference("dark"));
  expect(result.current.preference).toBe("dark");
  expect(document.documentElement.dataset.theme).toBe("dark");
});

it("ThemeProvider の外で useTheme を使うとエラーになる", () => {
  vi.spyOn(console, "error").mockImplementation(() => {});

  expect(() => renderHook(() => useTheme())).toThrow("ThemeProvider");
});
