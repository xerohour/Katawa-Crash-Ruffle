import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
    console.log('Launching Playwright Chromium browser...');
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

    const scratchDir = 'C:/Users/xerohour/.gemini/antigravity-cli/brain/a2a1ac2c-4834-47ab-a2c8-b80ab523f8cf/scratch';
    if (!fs.existsSync(scratchDir)) {
        fs.mkdirSync(scratchDir, { recursive: true });
    }

    console.log('Navigating to SWF (Ruffle Emulation)...');
    await page.goto('http://localhost:8080/ruffle.html');
    await page.waitForTimeout(6000);
    const swfPath = path.join(scratchDir, 'swf_ui.png');
    await page.screenshot({ path: swfPath, fullPage: false });
    console.log('SWF screenshot saved to:', swfPath);

    console.log('Navigating to HTML5 V2 Engine...');
    await page.goto('http://localhost:8080/v2.html');
    await page.waitForTimeout(3000);
    const html5Path = path.join(scratchDir, 'html5_v2_ui.png');
    await page.screenshot({ path: html5Path, fullPage: false });
    console.log('HTML5 V2 screenshot saved to:', html5Path);

    await browser.close();
    console.log('Playwright comparison completed successfully!');
}

run().catch(err => {
    console.error('Error running Playwright comparison:', err);
    process.exit(1);
});
