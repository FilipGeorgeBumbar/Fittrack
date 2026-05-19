import { test, expect } from "@playwright/test";

test("edit workout", async ({ page }) => {
  await page.goto("/dashboard");

  await page.getByTitle("Edit").first().click();

  const nameInput = page.getByLabel("Workout Name *");
  await nameInput.fill("Edited Workout");

  await page.getByRole("button", { name: /Save Changes/i }).click();

  await expect(page.getByText("Edited Workout")).toBeVisible();
});