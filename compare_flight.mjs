import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
    console.log('Launching Playwright Chromium browser for flight HUD comparison...');
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

    const scratchDir = 'C:/Users/xerohour/.gemini/antigravity-cli/brain/a2a1ac2c-4834-47ab-a2c8-b80ab523f8cf/scratch';
    if (!fs.existsSync(scratchDir)) {
        fs.mkdirSync(scratchDir, { recursive: true });
    }

    console.log('1. Navigating to SWF (Ruffle Emulation)...');
    await page.goto('http://localhost:8080/ruffle.html');
    await page.waitForTimeout(6000);

    // Click canvas inside Ruffle to focus & start game
    const canvas = await page.$('canvas');
    if (canvas) {
        const box = await canvas.boundingBox();
        if (box) {
            console.log('Clicking "Start game" on SWF menu (x=100, y=200)...');
            // Click "Start game" area on Flash menu (left side around y=200)
            await page.mouse.click(box.x + 100, box.y + 195);
            await page.waitForTimeout(1000);

            // Handle any profile dialog or spacebar presses to launch
            console.log('Pressing Spacebar to set angle & power...');
            await page.keyboard.press('Space');
            await page.waitForTimeout(300);
            await page.keyboard.press('Space');
            await page.waitForTimeout(300);
            await page.keyboard.press('Space');
            await page.waitForTimeout(1500);
        }
    }

    const swfFlightPath = path.join(scratchDir, 'swf_flight_ui.png');
    await page.screenshot({ path: swfFlightPath, fullPage: false });
    console.log('SWF Flight screenshot saved to:', swfFlightPath);

    console.log('2. Navigating to HTML5 V2 Engine...');
    await page.goto('http://localhost:8080/v2.html');
    await page.waitForTimeout(2000);

    console.log('Clicking "Start game" on HTML5 menu...');
    await page.click('#menu-start');
    await page.waitForTimeout(400);

    console.log('Locking angle & power for HTML5 launch...');
    await page.keyboard.press('Space');
    await page.waitForTimeout(300);
    await page.keyboard.press('Space');
    await page.waitForTimeout(1500);

    const html5FlightPath = path.join(scratchDir, 'html5_v2_flight_ui.png');
    await page.screenshot({ path: html5FlightPath, fullPage: false });
    console.log('HTML5 V2 Flight screenshot saved to:', html5FlightPath);

    await browser.close();
    console.log('Flight HUD comparison completed successfully!');
}

run().catch(err => {
    console.error('Error running Flight HUD comparison:', err);
    process.exit(1);
});
