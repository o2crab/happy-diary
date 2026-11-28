import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, it } from "vitest";
import { ThemeProvider } from "./ThemeProvider";
import { ThemeToggle } from "./ThemeToggle";

beforeEach(() => {
  localStorage.clear();
  delete document.documentElement.dataset.theme;
});

afterEach(() => {
  cleanup();
});

it("押すたびに システム設定 → ライト → ダーク → システム設定 の順で切り替わる", () => {
  render(
    <ThemeProvider>
      <ThemeToggle />
    </ThemeProvider>,
  );
  const button = screen.getByRole("button", { name: /テーマ: システム設定/ });

  fireEvent.click(button);
  expect(document.documentElement.dataset.theme).toBe("light");
  expect(button.getAttribute("aria-label")).toMatch(/テーマ: ライト/);

  fireEvent.click(button);
  expect(document.documentElement.dataset.theme).toBe("dark");

  fireEvent.click(button);
  expect(document.documentElement.dataset.theme).toBeUndefined();
  expect(button.getAttribute("aria-label")).toMatch(/テーマ: システム設定/);
});
