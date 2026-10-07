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

for (const width of [768, 1024, 1180, 1280, 1366, 1920]) {
  for (const lang of ["vi", "en"]) {
    test(`header stays on one row at ${width}px (${lang})`, async ({ page, isMobile }) => {
      test.skip(isMobile, "desktop widths only");
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/${lang}`);
      const header = await page.locator("header").boundingBox();
      expect(header!.height).toBeLessThanOrEqual(96);
      // Every visible header control is a single line (a wrapped label or pill is taller than 48px).
      for (const control of await page.locator('header nav a, header summary, header a[href$="/login"]').all()) {
        if (!(await control.isVisible())) continue;
        expect((await control.boundingBox())!.height).toBeLessThanOrEqual(48);
      }
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }
}

test("language menu closes after navigating", async ({ page, isMobile }) => {
  test.skip(isMobile, "desktop layout");
  await page.goto("/vi");
  await page.getByLabel("Ngôn ngữ").click();
  await expect(page.getByRole("link", { name: "English" })).toBeVisible();
  await page.getByRole("link", { name: /Mua vé/ }).click();
  await expect(page).toHaveURL(/\/vi\/tickets$/);
  await expect(page.getByRole("link", { name: "English" })).toBeHidden();
});

for (const width of [768, 1024, 1366, 1920]) {
  test(`hero shows the whole beach and the board hangs on the sand at ${width}px`, async ({ page, isMobile }) => {
    test.skip(isMobile, "desktop widths only");
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/vi");
    const hero = (await page.locator("main > section").first().boundingBox())!;
    // The artwork is 1366x1194 with a transparent wavy edge below y=1094: a hero at least 80% as tall as it is
    // wide never crops the sand, rocks or shell.
    expect(hero.height).toBeGreaterThanOrEqual(hero.width * 0.8 - 1);
    const pin = (await page.locator("#about svg circle").boundingBox())!;
    expect(pin.y + pin.height).toBeLessThan(hero.y + hero.height);
    const cta = (await page.getByRole("link", { name: "Thông tin sự kiện" }).boundingBox())!;
    expect(cta.y + cta.height + 16).toBeLessThan(pin.y);
  });
}

test("the board pin sits on the sand on phones too", async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile only");
  await page.goto("/vi");
  const hero = (await page.locator("main > section").first().boundingBox())!;
  const pin = (await page.locator("#about svg circle").boundingBox())!;
  expect(pin.y + pin.height).toBeLessThan(hero.y + hero.height);
  const cta = (await page.getByRole("link", { name: "Thông tin sự kiện" }).boundingBox())!;
  expect(cta.y + cta.height + 16).toBeLessThan(pin.y);
});

test("long text keeps a readable line length", async ({ page, isMobile }) => {
  test.skip(isMobile, "desktop widths only");
  await page.setViewportSize({ width: 1366, height: 900 });
  await page.goto("/vi");
  const blocks = page.locator('#about p, section[aria-labelledby="rules-title"] li, section[aria-labelledby="rules-title"] p');
  for (const block of await blocks.all()) {
    const ems = await block.evaluate((el) => el.getBoundingClientRect().width / parseFloat(getComputedStyle(el).fontSize));
    // About 46em of Lexend is roughly 80 characters per line.
    expect(ems).toBeLessThanOrEqual(46);
  }
});

test("header text is never smaller than 12px", async ({ page, isMobile }) => {
  test.skip(isMobile, "desktop layout");
  await page.setViewportSize({ width: 1366, height: 900 });
  await page.goto("/vi");
  const sizes = await page.locator("header").evaluate((header) =>
    [...header.querySelectorAll("*")]
      .filter((el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent!.trim() !== ""))
      .filter((el) => (el as HTMLElement).offsetParent !== null)
      .map((el) => parseFloat(getComputedStyle(el).fontSize)),
  );
  expect(Math.min(...sizes)).toBeGreaterThanOrEqual(12);
});

test("keyboard focus ring in the language menu is not clipped", async ({ page, isMobile }) => {
  test.skip(isMobile, "desktop layout");
  await page.goto("/vi");
  await page.getByLabel("Ngôn ngữ").click();
  await page.keyboard.press("Tab");
  const focused = page.locator(":focus");
  await expect(focused).toHaveText("Tiếng Việt");
  // The list clips overflow for its rounded corners, so the ring must be drawn inside the link.
  const offset = await focused.evaluate((el) => parseFloat(getComputedStyle(el).outlineOffset));
  expect(offset).toBeLessThan(0);
});
