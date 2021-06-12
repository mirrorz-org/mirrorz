import { test, expect } from '@playwright/test';
import { server } from "./test-server";

const baseUrl = 'http://localhost:8000';
const testPages = {
    'home': '/',
    'sites': '/site/',
    'list': '/list/',
};

test.beforeAll(async () => {
    server.listen(8000);
});

Object.entries(testPages).map(([name, url]) => test(name, async ({ browserName, page }) => {
    await page.goto(baseUrl + url);
    await page.waitForTimeout(1000);
    expect(await page.screenshot({ fullPage: true })).toMatchSnapshot(name + '.png');
}));

test.afterAll(async () => {
    server.close();
});
