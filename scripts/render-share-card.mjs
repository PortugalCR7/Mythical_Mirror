// Headless renderer for the share card. Launches the Vite dev server (must be
// running on :3000), screenshots each layout at full 1080×1920, writes PNGs to
// scripts/out/. Uses the pre-installed system Chromium since the Playwright CDN
// is blocked by the network policy.
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, 'out');
mkdirSync(OUT, { recursive: true });

const EXECUTABLE = process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const BASE = process.env.PREVIEW_BASE || 'http://localhost:3000';

const browser = await chromium.launch({ executablePath: EXECUTABLE });
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });

await page.goto(`${BASE}/share-preview.html`, { waitUntil: 'networkidle' });
await page.waitForFunction(() => window.__CARD_READY__ === true, { timeout: 15000 });
const card = page.locator('#card-root > div');
await card.screenshot({ path: join(OUT, 'descent.png') });
console.log('rendered descent.png');

await browser.close();
console.log('done');
