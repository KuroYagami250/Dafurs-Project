import { expect, test } from "@playwright/test";

test("root redirects to the Vietnamese landing page", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/vi$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "vi");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Địa điểm" })).toBeVisible();
});

test("switching language keeps the page and translates it", async ({ page }) => {
  await page.goto("/vi/tickets");
  await page.getByLabel("Ngôn ngữ").click();
  await page.getByRole("link", { name: "English" }).click();
  await expect(page).toHaveURL(/\/en\/tickets$/);
  await expect(page.getByRole("heading", { level: 1, name: "Tickets" })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});

test("buy ticket CTA leads to the coming soon page", async ({ page }) => {
  await page.goto("/vi");
  await page.getByRole("link", { name: /Mua vé/ }).click();
  await expect(page).toHaveURL(/\/vi\/tickets$/);
  await expect(page.getByText("Phần này đang được BTC chuẩn bị, các bạn quay lại sau nha!")).toBeVisible();
});

test("unknown locales and features return a real 404", async ({ request }) => {
  expect((await request.get("/fr")).status()).toBe(404);
  expect((await request.get("/vi/not-a-feature")).status()).toBe(404);
});

test("page has share metadata for both languages", async ({ page }) => {
  await page.goto("/en");
  await expect(page).toHaveTitle("DaFur 2026 · Paws Of Summer");
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /\/og\.png$/);
  await expect(page.locator('link[rel="alternate"][hreflang="vi"]')).toHaveAttribute("href", /\/vi$/);
});

test("mobile menu opens and navigates", async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile only");
  await page.goto("/vi");
  await page.getByRole("button", { name: "Mở menu" }).click();
  await page.getByRole("navigation").getByRole("link", { name: /Giới thiệu/ }).click();
  await expect(page).toHaveURL(/\/vi#about$/);
  await expect(page.getByRole("button", { name: "Mở menu" })).toBeVisible();
});

test("no horizontal scroll on the landing page", async ({ page }) => {
  await page.goto("/vi");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

test("coming soon gradient reaches the footer without a gap", async ({ page }) => {
  await page.goto("/en/tickets");
  const section = await page.locator("main > section").boundingBox();
  const footer = await page.locator("footer").boundingBox();
  expect(Math.abs(footer!.y - (section!.y + section!.height))).toBeLessThanOrEqual(1);
});
