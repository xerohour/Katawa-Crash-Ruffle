import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
    console.log('Launching Playwright Chromium browser for ending summary comparison...');
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

    const scratchDir = 'C:/Users/xerohour/.gemini/antigravity-cli/brain/a2a1ac2c-4834-47ab-a2c8-b80ab523f8cf/scratch';
    if (!fs.existsSync(scratchDir)) {
        fs.mkdirSync(scratchDir, { recursive: true });
    }

    console.log('Navigating to HTML5 V2 Engine...');
    await page.goto('http://localhost:8080/v2.html');
    await page.waitForTimeout(1500);

    console.log('Triggering endGame() with 1:1 summary metrics...');
    await page.evaluate(() => {
        window.game.launch();
        window.game.distance = 227.036;
        window.game.maxAltitude = 7.797;
        window.game.topSpeed = 55.15;
        window.game.combos = 9;
        window.game.endGame();
    });
    await page.waitForTimeout(1000);

    const endingPath = path.join(scratchDir, 'html5_v2_ending_summary.png');
    await page.screenshot({ path: endingPath, fullPage: false });
    console.log('HTML5 V2 Ending Summary screenshot saved to:', endingPath);

    await browser.close();
    console.log('Ending summary test completed successfully!');
}

run().catch(err => {
    console.error('Error running ending summary test:', err);
    process.exit(1);
});
