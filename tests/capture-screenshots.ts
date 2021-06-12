import { server } from "./test-server";
import playwright from "playwright";

const browserTypes = [playwright.chromium, playwright.firefox, playwright.webkit];
const baseUrl = 'http://localhost:8000';
const testPages = {
    'home': '/',
    'sites': '/site/',
    'list': '/list/',
};

(async () => {
    for (const browserType of browserTypes) {
        const browserTypeName = browserType.name();
        const browser = await browserType.launch();
        const context = await browser.newContext();
        var tasks = Object.entries(testPages).map(async ([name, url]) => {
            const page = await context.newPage();
            await page.goto(baseUrl + url);
            await page.waitForTimeout(2000);
            await page.screenshot({ path: `drop/screenshots/${browserTypeName}/${name}.png` });
        });
        await Promise.all(tasks);
        await browser.close();
    }
    server.close();
})();