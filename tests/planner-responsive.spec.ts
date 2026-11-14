import { expect, type Page, test } from "@playwright/test";

// 360 px is the narrowest common mobile width and the reference size for the
// QTR-027 acceptance criterion: no accidental horizontal scroll.
test.use({ viewport: { width: 360, height: 740 } });

async function expectNoHorizontalScroll(page: Page): Promise<void> {
  const overflow = await page.evaluate(() => {
    const root = document.documentElement;
    return root.scrollWidth - root.clientWidth;
  });

  expect(overflow, "the page must not overflow horizontally").toBeLessThan(1);
}

test("the planner flow fits a 360 px viewport", async ({ page }) => {
  await page.goto("/planner");

  await expect(
    page.getByRole("heading", { level: 1, name: "Planificador de viaje" }),
  ).toBeVisible();
  await expectNoHorizontalScroll(page);

  await page.getByRole("checkbox", { name: "Paisaje" }).check();
  await page.getByRole("button", { name: "Comparar estrategias" }).click();

  await expect(
    page.getByRole("group", { name: "Estrategias comparadas" }),
  ).toBeVisible();
  await expectNoHorizontalScroll(page);
});
