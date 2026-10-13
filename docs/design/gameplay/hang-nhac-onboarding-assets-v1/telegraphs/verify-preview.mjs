import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const folder = dirname(fileURLToPath(import.meta.url));
const manifest = JSON.parse(await readFile(resolve(folder, 'manifest.json'), 'utf8'));
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 980 } });
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  for (const asset of manifest.assets) {
    const source = await readFile(resolve(folder, asset.file), 'utf8');
    assert.equal(createHash('sha256').update(source).digest('hex'), asset.sha256, asset.file);
    const result = await page.evaluate(source => {
      const parsed = new DOMParser().parseFromString(source, 'image/svg+xml');
      return { error: parsed.querySelector('parsererror')?.textContent, viewBox: parsed.documentElement.getAttribute('viewBox'), unsafe: !!parsed.querySelector('script,foreignObject,image,animate,animateTransform,set') };
    }, source);
    assert.equal(result.error, undefined, asset.file); assert.equal(result.unsafe, false, asset.file);
    assert.equal(result.viewBox, asset.viewBox.join(' '));
  }
  await page.goto(pathToFileURL(resolve(folder, 'preview.html')).href);
  await page.locator('img').evaluateAll(images => Promise.all(images.map(image => image.decode())));
  const capture = async name => { assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false); await page.screenshot({ path: resolve(folder, name), fullPage: true }); };
  await capture('preview-color.png');
  await page.locator('#mono').check(); await page.locator('#state').selectOption('depleted');
  await page.locator('[data-sample]').evaluateAll(images => Promise.all(images.map(image => image.decode())));
  assert.equal(await page.locator('[data-sample][src="sample-status-depleted.svg"]').count(), 3);
  await capture('preview-grayscale.png');
  await page.locator('#mono').uncheck(); await page.setViewportSize({ width: 390, height: 844 });
  await capture('preview-mobile.png');
  assert.deepEqual(errors, []);
  const result = { passed: true, svgCount: manifest.assets.length, backgrounds: ['light', 'dark', 'textured'], grayscale: true, mobileWidth: 390, errors, ownerMapEdited: false, runtimeImported: false, artApproved: false };
  await writeFile(resolve(folder, 'verification.json'), JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify(result, null, 2));
} finally { await browser.close(); }
