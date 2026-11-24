import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { TextField } from "./TextField";

afterEach(() => {
  cleanup();
});

it("ラベルと補足で入力欄を特定でき、入力すると data-filled が付く", () => {
  const onChange = vi.fn();
  render(<TextField label="仮説" description="試したいことを書きます" onChange={onChange} />);

  const input = screen.getByLabelText("仮説");
  expect(input.tagName).toBe("INPUT");
  expect(screen.getByText("試したいことを書きます").id).toBe(
    input.getAttribute("aria-describedby"),
  );

  const field = input.closest("[data-variant]");
  expect(field?.hasAttribute("data-filled")).toBe(false);

  fireEvent.change(input, { target: { value: "朝に散歩する" } });

  expect(onChange).toHaveBeenCalledWith("朝に散歩する");
  expect(field?.hasAttribute("data-filled")).toBe(true);
});

it("errorMessage を渡すとエラー状態になり、メッセージを表示する", () => {
  render(<TextField label="仮説" errorMessage="入力してください" />);

  const input = screen.getByLabelText("仮説");
  expect(input.getAttribute("aria-invalid")).toBe("true");
  expect(screen.getByText("入力してください")).toBeTruthy();
});

it("multiline なら textarea になる", () => {
  render(<TextField label="今日の記録" multiline defaultValue="よく眠れた" />);

  const textarea = screen.getByLabelText("今日の記録");
  expect(textarea.tagName).toBe("TEXTAREA");
  expect(textarea.closest("[data-variant]")?.hasAttribute("data-filled")).toBe(true);
});
