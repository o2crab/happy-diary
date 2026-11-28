import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { Radio, RadioGroup } from "./RadioGroup";

afterEach(() => {
  cleanup();
});

it("グループと選択肢をラベルで特定でき、選ぶと onChange を呼ぶ", () => {
  const onChange = vi.fn();
  render(
    <RadioGroup label="幸福度" orientation="horizontal" onChange={onChange}>
      {[1, 2, 3, 4, 5].map((score) => (
        <Radio key={score} value={String(score)}>
          {score}
        </Radio>
      ))}
    </RadioGroup>,
  );

  const group = screen.getByRole("radiogroup", { name: "幸福度" });
  expect(group.getAttribute("aria-orientation")).toBe("horizontal");

  fireEvent.click(screen.getByRole("radio", { name: "4" }));

  expect(onChange).toHaveBeenCalledWith("4");
  expect((screen.getByRole("radio", { name: "4" }) as HTMLInputElement).checked).toBe(true);
});

it("無効な選択肢は input が disabled になり、グループ全体も無効にできる", () => {
  // ブラウザは disabled の input に click を送らないため、属性で確認します(jsdom は送ってしまう)
  const { rerender } = render(
    <RadioGroup label="判定">
      <Radio value="supported">支持された</Radio>
      <Radio value="inconclusive" isDisabled>
        判断できない
      </Radio>
    </RadioGroup>,
  );

  expect((screen.getByRole("radio", { name: "支持された" }) as HTMLInputElement).disabled).toBe(
    false,
  );
  expect((screen.getByRole("radio", { name: "判断できない" }) as HTMLInputElement).disabled).toBe(
    true,
  );

  rerender(
    <RadioGroup label="判定" isDisabled>
      <Radio value="supported">支持された</Radio>
    </RadioGroup>,
  );

  expect((screen.getByRole("radio", { name: "支持された" }) as HTMLInputElement).disabled).toBe(
    true,
  );
});

it("errorMessage を渡すとエラー状態になり、メッセージを表示する", () => {
  render(
    <RadioGroup label="判定" errorMessage="判定を選んでください">
      <Radio value="supported">支持された</Radio>
      <Radio value="not_supported">支持されなかった</Radio>
    </RadioGroup>,
  );

  const group = screen.getByRole("radiogroup", { name: "判定" });
  expect(group.getAttribute("aria-invalid")).toBe("true");
  expect(screen.getByText("判定を選んでください")).toBeTruthy();
});
