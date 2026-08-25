import { test, expect } from "@playwright/test";
import { server } from "./test-server";

const baseUrl = "http://localhost:8000";
const testPages = {
  home: "/",
  sites: "/site/",
  list: "/list/",
};

test.beforeAll(async () => {
  server.listen(8000);
});

Object.entries(testPages).map(([name, url]) =>
  test(name, async ({ browserName, page }) => {
    await page.goto(baseUrl + url);
    await page.waitForTimeout(1000);
    expect(await page.screenshot({ fullPage: true })).toMatchSnapshot(
      name + ".png",
      { threshold: 0.2 }
    );
  })
);

test.describe("mobile responsive layout", () => {
  test.skip(({ isMobile }) => !isMobile, "mobile project only");

  test("main routes do not overflow horizontally", async ({ page }) => {
    for (const width of [320, 390, 768]) {
      await page.setViewportSize({ width, height: 720 });
      for (const url of ["/", "/list/", "/site/", "/site/CQUPT", "/about"]) {
        await page.goto(baseUrl + url);
        await page.waitForTimeout(1000);
        const dimensions = await page.evaluate(() => ({
          clientWidth: document.documentElement.clientWidth,
          scrollWidth: document.documentElement.scrollWidth,
        }));
        expect(dimensions.scrollWidth).toBeLessThanOrEqual(
          dimensions.clientWidth
        );
      }
    }
  });

  test("navigation is a single touch-friendly row", async ({ page }) => {
    await page.goto(baseUrl + "/");
    await page.waitForTimeout(1000);

    const sidebar = await page.locator(".sidebar").boundingBox();
    const firstLink = await page.locator(".sidebar a").first().boundingBox();
    expect(sidebar?.height).toBeLessThanOrEqual(60);
    expect(firstLink?.height).toBeGreaterThanOrEqual(44);
  });

  test("active distro is visible in its horizontal selector", async ({
    page,
  }) => {
    await page.goto(baseUrl + "/os/ubuntu");
    await page.waitForTimeout(1000);

    const list = await page.locator(".distro").boundingBox();
    const active = await page.locator(".distro a.active").boundingBox();
    expect(active).not.toBeNull();
    expect(list).not.toBeNull();
    expect(active!.x).toBeGreaterThanOrEqual(list!.x);
    expect(active!.x + active!.width).toBeLessThanOrEqual(
      list!.x + list!.width
    );
  });

  test("site list drills down to detail and back", async ({ page }) => {
    await page.goto(baseUrl + "/site/");
    await page.waitForTimeout(1000);

    await expect(page.locator(".site-abbr")).toBeVisible();
    await page.locator(".site-abbr a").first().click();
    await expect(page.locator(".site-content")).toBeVisible();
    await expect(page.locator(".site-abbr")).toBeHidden();

    await page.locator(".site-mobile-header a").click();
    await expect(page.locator(".site-abbr")).toBeVisible();
  });
});

test.afterAll(async () => {
  server.close();
});
