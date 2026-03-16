import { test, expect } from "@playwright/test";

test.describe("Mint Page", () => {
  test("loads and renders page heading", async ({ page }) => {
    await page.goto("/mint");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Mint");
  });

  test("shows connect wallet prompt when not connected", async ({ page }) => {
    await page.goto("/mint");
    await expect(
      page.getByText("Connect your wallet to mint an AI fighter")
    ).toBeVisible();
  });

  test("has Mint Your Agent heading", async ({ page }) => {
    await page.goto("/mint");
    await expect(
      page.getByRole("heading", { name: /Mint.*Your Agent/i })
    ).toBeVisible();
  });

  test("header is visible on mint page", async ({ page }) => {
    await page.goto("/mint");
    await expect(page.locator("header")).toBeVisible();
  });
});
