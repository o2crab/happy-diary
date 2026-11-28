import addIcon from "@material-symbols/svg-400/rounded/add.svg";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { Button } from "./Button";
import { IconButton } from "./IconButton";

afterEach(() => {
  cleanup();
});

it("Button は押すと onPress を呼ぶ", () => {
  const onPress = vi.fn();
  render(
    <Button icon={addIcon} onPress={onPress}>
      追加
    </Button>,
  );

  fireEvent.click(screen.getByRole("button", { name: "追加" }));

  expect(onPress).toHaveBeenCalledOnce();
});

it("無効な Button は押しても onPress を呼ばない", () => {
  const onPress = vi.fn();
  render(
    <Button isDisabled onPress={onPress}>
      追加
    </Button>,
  );

  fireEvent.click(screen.getByRole("button", { name: "追加" }));

  expect(onPress).not.toHaveBeenCalled();
});

it("IconButton は label を読み上げ名にし、アイコンは読み上げない", () => {
  render(<IconButton icon={addIcon} label="記録を追加" />);

  const button = screen.getByRole("button", { name: "記録を追加" });
  expect(button.querySelector("[aria-hidden='true']")).toBeTruthy();
});
