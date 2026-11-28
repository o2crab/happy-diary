import historyIcon from "@material-symbols/svg-400/rounded/history.svg";
import homeIcon from "@material-symbols/svg-400/rounded/home.svg";
import homeFillIcon from "@material-symbols/svg-400/rounded/home-fill.svg";
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { NavigationBar, type NavigationItem } from "./NavigationBar";

afterEach(() => {
  cleanup();
});

const ITEMS: NavigationItem[] = [
  { href: "/", label: "いまの検証", icon: homeIcon, selectedIcon: homeFillIcon },
  { href: "/cycles", label: "これまで", icon: historyIcon },
];

it("ナビゲーションと項目のリンクをラベルで特定でき、現在の項目だけに aria-current が付く", () => {
  render(<NavigationBar items={ITEMS} currentHref="/" />);

  const navigation = screen.getByRole("navigation", { name: "メイン" });
  const current = within(navigation).getByRole("link", { name: "いまの検証" });
  const other = within(navigation).getByRole("link", { name: "これまで" });

  expect(current.getAttribute("href")).toBe("/");
  expect(current.getAttribute("aria-current")).toBe("page");
  expect(other.getAttribute("href")).toBe("/cycles");
  expect(other.hasAttribute("aria-current")).toBe(false);
});

it("現在の項目は塗りのアイコンを使い、アイコンは読み上げない", () => {
  render(<NavigationBar items={ITEMS} currentHref="/" label="移動" />);

  const icon = screen.getByRole("link", { name: "いまの検証" }).querySelector("[aria-hidden]");
  expect(icon?.getAttribute("style")).toContain(homeFillIcon);
  expect(screen.getByRole("navigation", { name: "移動" })).toBeTruthy();
});
