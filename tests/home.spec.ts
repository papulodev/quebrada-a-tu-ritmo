import { expect, test } from "@playwright/test";

test("home renders the product identity", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/Quebrada a tu ritmo/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Quebrada a tu ritmo" }),
  ).toBeVisible();
});
