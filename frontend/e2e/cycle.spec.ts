import { expect, test } from "@playwright/test";

// 各テストは同じ一時 DB を共有するので、仮説の文は一意にし、件数には依存しない。
test("仮説を作り、記録して振り返ると、これまでの一覧に並ぶ", async ({ page }) => {
  const hypothesis = `散歩をすると気分がよくなる ${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  await page.goto("/");
  await page.getByRole("button", { name: "仮説を追加" }).click();

  await page.getByRole("textbox", { name: "仮説", exact: true }).fill(hypothesis);
  await page.getByRole("textbox", { name: "検証方法", exact: true }).fill("毎朝10分歩く");
  await page.getByRole("button", { name: "作成する" }).click();

  await expect(page.getByRole("heading", { level: 2, name: hypothesis })).toBeVisible();

  await page.getByRole("checkbox", { name: "実行した" }).check();
  await page
    .getByRole("radiogroup", { name: "幸福度" })
    .getByRole("radio", { name: "4 よい" })
    .check();
  await page.getByRole("button", { name: "記録を保存" }).click();
  await expect(page.getByRole("status")).toHaveText("記録を保存しました");

  const stats = page.getByRole("region", { name: "集計" });
  await expect(stats.getByRole("group", { name: "記録した日数" })).toContainText("1日");

  await page.getByRole("button", { name: "振り返る" }).click();
  await page
    .getByRole("radiogroup", { name: "判定" })
    .getByRole("radio", { name: "支持された" })
    .check();
  await page.getByRole("textbox", { name: "わかったこと" }).fill("歩いた日は気分がよかった");
  await page.getByRole("button", { name: "完了する" }).click();

  await expect(page.getByRole("heading", { level: 2, name: hypothesis })).toBeVisible();
  await expect(page.getByText("判定: 支持された")).toBeVisible();

  // 本番の SPA フォールバックで、詳細画面の URL を直接開いても表示される。
  await page.reload();
  await expect(page.getByRole("heading", { level: 2, name: hypothesis })).toBeVisible();
  await expect(page.getByText("判定: 支持された")).toBeVisible();

  await page
    .getByRole("navigation", { name: "メイン" })
    .getByRole("link", { name: "これまで" })
    .click();
  await expect(page.getByRole("heading", { level: 2, name: "これまで" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 3, name: hypothesis })).toBeVisible();
});
