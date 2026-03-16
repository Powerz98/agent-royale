import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
  test("has correct title", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Agent Royale/);
  });

  test("renders hero section", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("Agent");
    await expect(page.locator("h1")).toContainText("Royale");
  });

  test("renders tagline", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Mint. Strategize. Spectate. Win.")).toBeVisible();
  });

  test("has Mint Your Agent CTA link", async ({ page }) => {
    await page.goto("/");
    const mintLink = page.getByRole("link", { name: "Mint Your Agent" });
    await expect(mintLink).toBeVisible();
    await expect(mintLink).toHaveAttribute("href", "/mint");
  });

  test("has Enter Arena CTA link", async ({ page }) => {
    await page.goto("/");
    const arenaLink = page.getByRole("link", { name: "Enter Arena" });
    await expect(arenaLink).toBeVisible();
    await expect(arenaLink).toHaveAttribute("href", "/arena");
  });

  test("renders How It Works section with feature cards", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("How It Works")).toBeVisible();
    await expect(page.getByText("Mint AI Fighters")).toBeVisible();
    await expect(page.getByText("Autonomous Battles")).toBeVisible();
    await expect(page.getByText("Win ETH Prizes")).toBeVisible();
    await expect(page.getByText("On Base Network")).toBeVisible();
  });

  test("renders stats bar", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("10,000")).toBeVisible();
    await expect(page.getByText("0.002 ETH")).toBeVisible();
    await expect(page.getByText("Max Agents")).toBeVisible();
  });

  test("header nav links are present", async ({ page }) => {
    await page.goto("/");
    const nav = page.locator("header nav").first();
    await expect(nav.getByRole("link", { name: "Mint" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "Arena" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "Profile" })).toBeVisible();
  });

  test("nav link to Mint page works", async ({ page }) => {
    await page.goto("/");
    await page.locator("header nav").first().getByRole("link", { name: "Mint" }).click();
    await expect(page).toHaveURL(/\/mint/);
  });

  test("nav link to Arena page works", async ({ page }) => {
    await page.goto("/");
    await page.locator("header nav").first().getByRole("link", { name: "Arena" }).click();
    await expect(page).toHaveURL(/\/arena/);
  });
});
