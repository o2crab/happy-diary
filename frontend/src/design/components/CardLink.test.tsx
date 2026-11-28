import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { CardLink } from "./CardLink";

afterEach(() => {
  cleanup();
});

it("カード全体が中身を読み上げ名にしたリンクになり、押すと onPress を呼ぶ", () => {
  const onPress = vi.fn();
  render(
    <CardLink href="/cycles/1" onPress={onPress}>
      <h3>朝の散歩</h3>
      <p>2 週間</p>
    </CardLink>,
  );

  const link = screen.getByRole("link", { name: /朝の散歩/ });
  expect(link.getAttribute("href")).toBe("/cycles/1");

  fireEvent.click(link);

  expect(onPress).toHaveBeenCalledOnce();
});

it("無効な CardLink は押しても onPress を呼ばない", () => {
  const onPress = vi.fn();
  render(
    <CardLink href="/cycles/1" isDisabled onPress={onPress}>
      朝の散歩
    </CardLink>,
  );

  const link = screen.getByRole("link", { name: "朝の散歩" });
  expect(link.getAttribute("aria-disabled")).toBe("true");

  fireEvent.click(link);

  expect(onPress).not.toHaveBeenCalled();
});
