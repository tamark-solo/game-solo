import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true,
  args: ['--allow-file-access-from-files'] });
const errors = [];
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 1000 } });
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(pathToFileURL(resolve('docs/design/characters/gait-correction-v1/index.html')).href);
  await page.waitForFunction(() => document.querySelector('#new-caption').textContent.includes('pose'));
  await page.locator('#play').click();
  assert.equal(await page.locator('#actor option').count(), 3);
  for (const actor of ['male', 'female', 'wang-lin']) {
    await page.locator('#actor').selectOption(actor);
    for (const direction of ['south', 'west', 'east', 'north']) {
      await page.locator('#direction').selectOption(direction);
      await page.waitForFunction(({ actor, direction }) => {
        const d = window.GaitReviewData.actors.find(a => a.id === actor);
        return document.querySelector('#new-caption').textContent.includes(d.nextMeta.animations['walk_' + direction][0]);
      }, { actor, direction });
      assert.equal(await page.locator('.pose canvas').count(), 8);
      const hashes = await page.locator('.pose canvas').evaluateAll(canvases => canvases.map(c => c.toDataURL()));
      assert.equal(new Set(hashes).size, 8, 'eight distinct rendered source poses');
      for (const phase of [0, 4]) {
        await page.locator('#phase').fill(String(phase));
        assert.match(await page.locator('#new-caption').textContent(), new RegExp('_0' + phase + '$'));
      }
    }
  }
  await page.locator('#actor').selectOption('wang-lin');
  await page.locator('#direction').selectOption('east');
  await page.waitForFunction(() => document.querySelector('#new-caption').textContent.includes('wanglin_gray_walk_east'));
  await page.locator('#phase').fill('0');
  await page.locator('#back').click(); assert.equal(await page.locator('#phase').inputValue(), '7');
  await page.locator('#next').click(); assert.equal(await page.locator('#phase').inputValue(), '0');
  await mkdir('artifacts', { recursive: true });
  await page.screenshot({ path: 'artifacts/gait-review-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 360, height: 900 });
  const size = await page.evaluate(() => ({ viewport: innerWidth, content: document.documentElement.scrollWidth }));
  assert.ok(size.content <= size.viewport, 'review has no page overflow at 360 px');
  await page.screenshot({ path: 'artifacts/gait-review-mobile.png', fullPage: true });
  assert.deepEqual(errors, []);
  const result = { passed: true, actors: 3, directionsPerActor: 4, posesPerDirection: 8,
    checks: ['all_96_new_poses_render', 'opposite_contact_selection', 'manual_loop_wrap', 'mobile_360_no_page_overflow'],
    browserErrors: errors, visualMotionApproval: 'pending_owner_review' };
  await writeFile('artifacts/gait-review-verification.json', JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify(result));
} finally { await browser.close(); }
