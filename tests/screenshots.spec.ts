import { test } from '@playwright/test';
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
    await page.screenshot({ path: `drop/screenshots/${browserName}/${name}.png` });
}));

test.afterAll(async () => {
    server.close();
});
