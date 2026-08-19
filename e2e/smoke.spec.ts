import { expect, test } from "@playwright/test";

test("creates a freelancer through the wizard", async ({ page }) => {
  await page.goto("./");
  await expect(page.getByRole("heading", { name: "Anima Character Generator" })).toBeVisible();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByLabel("Name").fill("Freelancer Test");
  await page.getByLabel("DEX").fill("7");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Add advantage" }).click();
  await page.getByRole("dialog", { name: "Add advantage" }).getByRole("button", { name: "Quick Reflexes" }).click();
  await page.getByRole("button", { name: "Add Quick Reflexes" }).click();
  await expect(page.locator("aside").getByText("Quick Reflexes")).toBeVisible();
  await expect(page.locator("aside").getByText("Freelancer Test")).toBeVisible();
});
