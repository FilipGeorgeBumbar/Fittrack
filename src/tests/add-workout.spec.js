import { test, expect } from "@playwright/test";

test("add workout", async ({ page }) => {
  await page.goto("/dashboard");

  await page.getByRole("button", { name: /Add Workout/i }).click();

  await page.getByLabel("Workout Name *").fill("Silver Test Workout");
  await page.getByLabel("Date *").fill("2026-03-25");
  await page.getByLabel("Duration (minutes) *").fill("55");

  await page.getByRole("button", { name: /^Add Workout$/i }).last().click();

  await expect(page.getByText("Silver Test Workout")).toBeVisible();
});