import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { Checkbox } from "./Checkbox";

afterEach(() => {
  cleanup();
});

it("ラベルで特定でき、押すたびに選択が切り替わって onChange を呼ぶ", () => {
  const onChange = vi.fn();
  render(<Checkbox onChange={onChange}>実行した</Checkbox>);

  const checkbox = screen.getByRole("checkbox", { name: "実行した" });
  expect((checkbox as HTMLInputElement).checked).toBe(false);

  fireEvent.click(checkbox);

  expect(onChange).toHaveBeenCalledWith(true);
  expect((checkbox as HTMLInputElement).checked).toBe(true);

  fireEvent.click(checkbox);

  expect(onChange).toHaveBeenLastCalledWith(false);
});

it("無効な Checkbox は input が disabled になり、無効の見た目になる", () => {
  // ブラウザは disabled の input に click を送らないため、属性で確認します(jsdom は送ってしまう)
  render(<Checkbox isDisabled>実行した</Checkbox>);

  const checkbox = screen.getByRole("checkbox", { name: "実行した" });
  expect((checkbox as HTMLInputElement).disabled).toBe(true);
  expect(checkbox.closest("label")?.hasAttribute("data-disabled")).toBe(true);
});
