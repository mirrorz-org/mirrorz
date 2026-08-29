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

  test("download filter can be cleared", async ({ page }) => {
    await page.goto(baseUrl + "/os");
    const input = page.locator(".mini-search input");
    const clear = page.locator(".mini-search .search-clear");

    await expect(clear).toBeHidden();
    await input.fill("ubuntu");
    await expect(clear).toBeVisible();
    await clear.click();
    await expect(input).toHaveValue("");
    await expect(clear).toBeHidden();
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
  test("filter can be cleared from the search field", async ({ page }) => {
    await page.goto(baseUrl + "/list/");
    const input = page.locator(".search input");
    const clear = page.locator(".search-clear");

    await expect(page.locator(".search-leading .material-icons")).toHaveText(
      "search"
    );
    await expect(clear).toBeHidden();
    await input.fill("ubuntu");
    await expect(clear).toBeVisible();
    await clear.click();

    await expect(input).toHaveValue("");
    await expect(clear).toBeHidden();
    await expect(page).toHaveURL(/\/list\/?$/);
  });

  test("groups expand without leaving gaps in other columns", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(baseUrl + "/list/");
    await page.waitForTimeout(1000);

    const columns = page.locator(".mirror-column");
    await expect(columns).toHaveCount(3);
    const firstHeader = columns.nth(0).locator(".group-header").nth(0);
    const secondHeader = columns.nth(1).locator(".group-header").nth(0);
    const nextInSecondColumn = columns.nth(1).locator(".group-header").nth(1);
    const secondBefore = await secondHeader.boundingBox();
    const nextBefore = await nextInSecondColumn.boundingBox();

    await firstHeader.click();

    const expandedFirst = await firstHeader.boundingBox();
    const firstDetails = await firstHeader
      .locator("xpath=../following-sibling::*[1]")
      .boundingBox();
    const secondAfter = await secondHeader.boundingBox();
    const nextAfter = await nextInSecondColumn.boundingBox();
    expect(expandedFirst).not.toBeNull();
    expect(firstDetails).not.toBeNull();
    expect(firstDetails!.x).toBeGreaterThanOrEqual(expandedFirst!.x);
    expect(firstDetails!.x + firstDetails!.width).toBeLessThanOrEqual(
      expandedFirst!.x + expandedFirst!.width
    );
    expect(secondAfter!.y).toBeCloseTo(secondBefore!.y, 1);
    expect(nextAfter!.y).toBeCloseTo(nextBefore!.y, 1);

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

test.describe("desktop site layout", () => {
  test("repositories can be filtered and cleared", async ({ page }) => {
    await page.goto(baseUrl + "/site/CQUPT");
    const input = page.locator(".site-repo-search input");
    const clear = page.locator(".site-repo-search .search-clear");
    const repos = page.locator(".site-group");
    await expect(repos.first()).toBeVisible();
    const total = await repos.count();

    await input.fill("__no_such_repository__");
    await expect(repos).toHaveCount(0);
    await expect(page.locator(".site-repo-empty")).toBeVisible();
    await clear.click();

    await expect(input).toHaveValue("");
    await expect(repos).toHaveCount(total);
    await expect(clear).toBeHidden();
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
