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

test.describe("home and download routes", () => {
  test("home and about show the user guide", async ({ page }) => {
    for (const url of ["/", "/about"]) {
      await page.goto(baseUrl + url);
      await expect(page.locator(".about")).toBeVisible();
      await expect(page.locator(".iso")).toHaveCount(0);
      await expect(page.locator(".para-description")).toHaveCount(5);
      await expect(page.locator(".about-guide-item").first()).toBeVisible();
    }
  });

  test("download navigation opens and tracks category routes", async ({
    page,
  }) => {
    await page.goto(baseUrl + "/");
    const download = page.locator('.sidebar a[href="/os"]');
    await expect(download).toBeVisible();
    await download.click();
    await expect(page.locator(".iso")).toBeVisible();
    await expect(download).toHaveClass(/active/);

    for (const url of ["/app", "/font"]) {
      await page.goto(baseUrl + url);
      await expect(download).toHaveClass(/active/);
    }
  });

  test("help navigation indicates that it opens a new tab", async ({
    page,
  }) => {
    await page.goto(baseUrl + "/");
    const help = page.locator('.sidebar a[target="_blank"]');
    await expect(help).toHaveAttribute("title", /.+/);
    const title = await help.getAttribute("title");
    await expect(help).toHaveAttribute("aria-label", new RegExp(title!));
    await expect(help.locator(".external-link-icon")).toHaveText("↗");
  });
});

test.describe("desktop list layout", () => {
  test("groups expand independently within their columns", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(baseUrl + "/list/");
    await page.waitForTimeout(1000);

    const headers = page.locator(".group-header");
    const firstId = await headers.nth(0).getAttribute("id");
    const secondId = await headers.nth(1).getAttribute("id");
    const firstHeader = page.locator(`#${firstId}`);
    const secondHeader = page.locator(`#${secondId}`);
    const first = await headers.nth(0).boundingBox();
    const second = await headers.nth(1).boundingBox();
    expect(first).not.toBeNull();
    expect(second).not.toBeNull();
    expect(Math.abs(first!.y - second!.y)).toBeLessThan(2);

    await firstHeader.click();

    const expandedFirst = await headers.nth(0).boundingBox();
    const expandedSecond = await headers.nth(1).boundingBox();
    const firstDetails = await firstHeader
      .locator("xpath=../following-sibling::*[1]")
      .boundingBox();
    await expect(headers.nth(1)).toBeVisible();
    expect(expandedFirst).not.toBeNull();
    expect(expandedSecond).not.toBeNull();
    expect(firstDetails).not.toBeNull();
    expect(Math.abs(expandedFirst!.y - expandedSecond!.y)).toBeLessThan(2);
    expect(firstDetails!.x).toBeGreaterThanOrEqual(expandedFirst!.x);
    expect(firstDetails!.x + firstDetails!.width).toBeLessThanOrEqual(
      expandedFirst!.x + expandedFirst!.width
    );

    await secondHeader.click();
    await expect(page.locator(".group-expanded")).toHaveCount(2);
    await expect(firstHeader.locator(".material-icons")).toHaveText(
      "expand_more"
    );
    await expect(secondHeader.locator(".material-icons")).toHaveText(
      "expand_more"
    );
  });
});

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
    for (const width of [320, 390, 402]) {
      await page.setViewportSize({ width, height: 720 });
      await page.goto(baseUrl + "/");
      await page.waitForTimeout(1000);

      const sidebar = await page.locator(".sidebar").boundingBox();
      const firstLink = await page.locator(".sidebar a").first().boundingBox();
      const dimensions = await page.locator(".sidebar").evaluate((element) => ({
        clientWidth: element.clientWidth,
        scrollWidth: element.scrollWidth,
      }));
      expect(sidebar?.height).toBeLessThanOrEqual(60);
      expect(firstLink?.height).toBeGreaterThanOrEqual(44);
      expect(dimensions.scrollWidth).toBeLessThanOrEqual(
        dimensions.clientWidth
      );
    }
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
