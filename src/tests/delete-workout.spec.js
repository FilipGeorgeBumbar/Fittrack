import { test, expect } from "@playwright/test";

test("delete workout", async ({ page }) => {
  await page.goto("/dashboard");

  const firstRow = page.locator("tbody tr").first();
  const firstWorkoutName = await firstRow.locator("td").first().textContent();

  await page.getByTitle("Delete").first().click();

  await expect(page.getByText(firstWorkoutName)).not.toBeVisible();
});