import { expect, test } from "@playwright/test";

test("トップページで API に接続できる", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Happiness Spiral" })).toBeVisible();
  await expect(page.getByText("API: 正常")).toBeVisible();
});

test("テーマを切り替えると再読み込み後も保たれる", async ({ page }) => {
  await page.goto("/");
  const html = page.locator("html");

  await page.getByRole("button", { name: /テーマ: システム設定/ }).click();
  await expect(html).toHaveAttribute("data-theme", "light");

  await page.getByRole("button", { name: /テーマ: ライト/ }).click();
  await expect(html).toHaveAttribute("data-theme", "dark");

  await page.reload();
  await expect(html).toHaveAttribute("data-theme", "dark");
});
