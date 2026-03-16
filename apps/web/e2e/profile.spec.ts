import { test, expect } from "@playwright/test";

test.describe("Profile Page", () => {
  test("loads and renders page heading", async ({ page }) => {
    await page.goto("/profile");
    await expect(
      page.getByRole("heading", { name: /Your Profile/i })
    ).toBeVisible();
  });

  test("shows connect wallet prompt when not connected", async ({ page }) => {
    await page.goto("/profile");
    await expect(
      page.getByText("Connect your wallet to view your agents and match history")
    ).toBeVisible();
  });

  test("header is visible on profile page", async ({ page }) => {
    await page.goto("/profile");
    await expect(page.locator("header")).toBeVisible();
  });
});
