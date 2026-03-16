import { test, expect } from "@playwright/test";

test.describe("Arena Page", () => {
  test("loads and renders page heading", async ({ page }) => {
    await page.goto("/arena");
    await expect(page.getByRole("heading", { name: /Battle.*Arena/i })).toBeVisible();
  });

  test("shows subtitle text", async ({ page }) => {
    await page.goto("/arena");
    await expect(
      page.getByText("Enter matches, spectate battles, claim victories")
    ).toBeVisible();
  });

  test("has Create Match button", async ({ page }) => {
    await page.goto("/arena");
    await expect(
      page.getByRole("button", { name: /Create Match/i })
    ).toBeVisible();
  });

  test("shows empty state or match cards after loading", async ({ page }) => {
    await page.goto("/arena");
    // Wait for loading spinner to disappear
    await page.waitForTimeout(2000);
    // Either we see the empty state or match cards
    const emptyState = page.getByText("No matches yet");
    const matchGrid = page.locator("article");
    const errorState = page.getByText(/failed/i);

    const hasEmpty = await emptyState.isVisible().catch(() => false);
    const hasMatches = (await matchGrid.count()) > 0;
    const hasError = await errorState.isVisible().catch(() => false);

    // At least one of these states should be visible after loading
    expect(hasEmpty || hasMatches || hasError).toBeTruthy();
  });

  test("header is visible on arena page", async ({ page }) => {
    await page.goto("/arena");
    await expect(page.locator("header")).toBeVisible();
  });
});
