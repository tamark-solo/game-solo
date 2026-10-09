import {editorClick,editorSelect,editorCheck,revealEditorControl} from '../support/editor-ui.mjs';
import assert from 'node:assert/strict';
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { chromium } from 'playwright';
import { startService } from '../support/services.mjs';

const base = 'http://127.0.0.1:5191';
let service, browser, page;
const errors = [], checks = [];
const diag = () => page.evaluate(() => window.__mapEditorDiagnostics());
const level = d => d.project.levels.find(l => l.id === d.project.activeLevelId);
const point = async (x, y) => { const d = await diag(), b = await page.locator('#map-canvas').boundingBox(); return { x: b.x + d.view.x + x * d.view.zoom, y: b.y + d.view.y + y * d.view.zoom }; };
const mouseClick = async (x, y) => { const p = await point(x, y); await page.mouse.click(p.x, p.y); };
async function fixture(width, height, color) {
  return Buffer.from((await page.evaluate(({ width, height, color }) => { const c = document.createElement('canvas'); c.width = width; c.height = height; const ctx = c.getContext('2d'); ctx.fillStyle = color; ctx.fillRect(0, 0, width, height); return c.toDataURL(); }, { width, height, color })).split(',')[1], 'base64');
}
try {
  service = await startService(['node_modules/vite/bin/vite.js', '--config', 'vite.config.ts', '--port', '5191'], base, { MAP_EDITOR_STORAGE: 'artifacts/map-studio-test-store' });
  browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  page = await browser.newPage({ viewport: { width: 1440, height: 960 } }); page.setDefaultTimeout(12000);
  page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(base + '/map-editor.html'); await page.waitForFunction(() => window.__mapEditorDiagnostics?.().ready);
  assert.equal(await page.locator('#empty-canvas').isVisible(), true);
  assert.equal(await page.locator('#remove').isDisabled(), true);
  const original = level(await diag());
  const untouchedRegions = JSON.stringify(original.regions);
  await mkdir('artifacts', { recursive: true }); await page.screenshot({ path: 'artifacts/map-studio-empty.png' });
  await page.keyboard.press('Control+k'); assert.equal(await page.locator('#command-dialog').isVisible(), true);
  await page.locator('#command-search').fill('vung chan');
  assert.equal(await page.locator('#command-results button').count(), 3);
  await page.locator('#command-search').press('Enter'); assert.equal((await diag()).tool, 'block-rect');
  assert.match(await page.locator('#tool-name').innerText(), /Vùng chặn/);
  await editorClick(page,'[data-tool="walk-poly"]');
  assert.equal(await page.locator('#finish-polygon').isVisible(), true); assert.equal(await page.locator('#finish-polygon').isDisabled(), true);
  await mouseClick(100, 100); await mouseClick(300, 100); await mouseClick(300, 300);
  assert.equal(await page.locator('#finish-polygon').isDisabled(), false);
  await page.locator('#viewport').press('Escape');
  assert.equal(JSON.stringify(level(await diag()).regions), untouchedRegions);
  checks.push('search_commands_without_accents_contextual_polygon_actions_and_escape_cancel');

  const ground = await fixture(1280, 768, '#9baf8c');
  await page.locator('#import-asset').setInputFiles({ name: 'test-ground.png', mimeType: 'image/png', buffer: ground });
  await page.waitForFunction(() => window.__mapEditorDiagnostics().project.assets.length === 1);
   await editorClick(page,'#asset-background');
  let d = await diag(), l = level(d), o = l.objects[0];
  assert.equal(l.width, 1280); assert.equal(l.height, 768); assert.deepEqual(o.pivot, { x: 0, y: 0 });
  assert.equal(l.layers.find(layer => layer.id === o.layerId).kind, 'ground'); assert.deepEqual([o.x, o.y], [0, 0]);
  assert.equal(JSON.stringify(l.regions), untouchedRegions);
  await editorClick(page,'#undo'); assert.deepEqual([level(await diag()).width, level(await diag()).height], [original.width, original.height]);
  assert.equal(level(await diag()).objects.length, 0); await editorClick(page,'#redo');
  await editorClick(page,'#asset-background'); assert.equal(level(await diag()).objects.length, 1);
  d = await diag(); const groundLayer = level(d).layers.find(layer => layer.kind === 'ground');
  await page.locator(`[data-layer-flag="locked"][data-id="${groundLayer.id}"]`).check();
  const lockedSnapshot = JSON.stringify((await diag()).project);
  await editorClick(page,'#asset-background'); assert.equal(JSON.stringify((await diag()).project), lockedSnapshot);
  assert.match(await page.locator('#status').innerText(), /Mở khóa/);
  await page.locator(`[data-layer-flag="locked"][data-id="${groundLayer.id}"]`).uncheck();
  checks.push('background_action_native_dimensions_instance_pivot_ground_layer_single_step_undo_and_no_duplicate');

  const prop = await fixture(64, 96, '#587565');
  await page.locator('#import-asset').setInputFiles({ name: 'test-prop.png', mimeType: 'image/png', buffer: prop });
  await page.waitForFunction(() => window.__mapEditorDiagnostics().project.assets.length === 2);
  d = await diag(); await page.locator(`[data-layer-select="${level(d).layers.find(l => l.kind === 'depth').id}"]`).click();
  await editorSelect(page,'#snap', '1'); await page.locator(`[data-asset="${d.project.assets[1].id}"]`).click();
  await mouseClick(400, 400); await mouseClick(600, 400);
  await editorClick(page,'[data-tool="select"]'); const a = await point(600, 360), b = await point(465, 362);
  await page.mouse.move(a.x, a.y); await page.mouse.down(); await page.mouse.move(b.x, b.y, { steps: 5 });
  d = await diag(); assert.ok(d.alignmentGuides.length >= 2);
  await page.mouse.up(); d = await diag(); o = level(d).objects[2]; assert.deepEqual([o.x, o.y], [464, 400]);
  assert.equal(d.alignmentGuides.length, 0); await editorClick(page,'#undo');
  const start = await point(600, 360), end = await point(465, 362);
  await page.mouse.move(start.x, start.y); await page.mouse.down(); await page.keyboard.down('Alt'); await page.mouse.move(end.x, end.y, { steps: 5 });
  assert.equal((await diag()).alignmentGuides.length, 0); await page.mouse.up(); await page.keyboard.up('Alt');
  d = await diag(); assert.deepEqual([level(d).objects[2].x, level(d).objects[2].y], [465, 402]);
  checks.push('magnetic_edges_and_centers_screen_tolerance_live_guides_alt_override_and_undo');

  await editorClick(page,'#save'); await page.waitForFunction(() => document.getElementById('save-state').dataset.state === 'saved');
  const stored = await (await fetch(base + '/api/map-editor/projects/' + d.project.id)).json(); assert.equal(stored.levels[0].objects.length, 3);
  await page.locator('#project-name').fill('Map Studio smoke'); await page.locator('#project-name').press('Tab');
  assert.equal(await page.locator('#save-state').getAttribute('data-state'), 'dirty');
  await editorClick(page,'#undo'); assert.equal(await page.locator('#save-state').getAttribute('data-state'), 'saved');
  await editorClick(page,'#play'); assert.equal((await diag()).view.zoom, 1);
  assert.equal(await page.locator('#test-controls').isVisible(), true); assert.equal(await page.locator('[data-tool="select"]').isDisabled(), true);
  const before = (await diag()).player.x; await page.locator('#viewport').focus(); await page.keyboard.down('d'); await page.waitForTimeout(200); await page.keyboard.up('d');
  assert.ok((await diag()).player.x > before + 5); await page.keyboard.press('Escape'); assert.equal((await diag()).playing, false);
  checks.push('workspace_save_status_dirty_vs_saved_undo_and_native_runtime_test');

  await page.locator('[data-dock="review"]').click(); assert.equal(await page.locator('[data-dock="review"]').getAttribute('aria-selected'), 'true');
  await page.screenshot({ path: 'artifacts/map-studio-desktop.png' });
  for (const width of [1440, 1024, 768, 390]) {
    await page.setViewportSize({ width, height: 900 });
    const dimensions = await page.evaluate(() => ({ width: innerWidth, scroll: document.documentElement.scrollWidth }));
    assert.ok(dimensions.scroll <= dimensions.width, `Overflow at ${width}: ${JSON.stringify(dimensions)}`);
  }
  await page.screenshot({ path: 'artifacts/map-studio-mobile.png', fullPage: true });
  await page.setViewportSize({ width: 1440, height: 960 }); await editorClick(page,'#help-toggle');
  assert.equal(await page.locator('#help-dialog').isVisible(), true); await page.locator('#help-dialog [data-close-dialog]').click();
  await page.locator('#project-menu > summary').click(); const download = page.waitForEvent('download'); await editorClick(page,'#export');
  const exported = JSON.parse(await readFile(await (await download).path(), 'utf8')); assert.equal(exported.schema, 'game-solo-map-editor-1'); assert.equal(exported.levels[0].objects.length, 3);
  checks.push('tabbed_review_help_responsive_layout_and_existing_authoring_export_contract');
  // Regression: a broad walk region must never steal object picking in Scene.
  await editorCheck(page,'#magnet',false);await page.selectOption('#snap','1');await editorClick(page,'#fit');
  const rectangle=async(tool,x,y,w,h)=>{await editorClick(page,`[data-tool="${tool}"]`);const a=await point(x,y),b=await point(x+w,y+h);await page.mouse.move(a.x,a.y);await page.mouse.down();await page.mouse.move(b.x,b.y,{steps:4});await page.mouse.up();};
  await rectangle('block-rect',350,320,100,130);const smallBlock=level(await diag()).regions.at(-1).id;
  await rectangle('walk-rect',80,80,1120,620);const broadWalk=level(await diag()).regions.at(-1).id;
  await editorClick(page,'[data-tool="select"]');await mouseClick(400,360);
  assert.equal((await diag()).selected.id,smallBlock,'small blocker beats later broad walk');
  const authored=JSON.stringify((await diag()).project),history=(await diag()).undoCount;
  await page.locator('[data-domain="scene"]').click();await mouseClick(400,360);
  assert.equal((await diag()).selected.kind,'object');assert.equal((await diag()).selected.id,level(await diag()).objects[1].id);
  await page.locator('[data-domain="navigation"]').click();await mouseClick(1000,600);
  assert.equal((await diag()).selected.id,broadWalk);assert.equal(JSON.stringify((await diag()).project),authored);assert.equal((await diag()).undoCount,history);
  checks.push('scene_navigation_independent_picking_small_region_priority_and_no_map_mutation_on_mode_switch');

  await editorClick(page,'[data-tool="block-poly"]');await mouseClick(800,200);await mouseClick(1000,200);await mouseClick(1000,350);
  await page.locator('#viewport').press('Backspace');assert.equal((await diag()).draftVertices,2);
  await mouseClick(950,350);await mouseClick(800,350);const beforeClose=level(await diag()).regions.length;
  await mouseClick(800,200);d=await diag();assert.equal(level(d).regions.length,beforeClose+1);assert.equal(d.tool,'select');assert.equal(d.draftVertices,0);assert.equal(level(d).regions.at(-1).points.length,4);
  await editorClick(page,'#undo');assert.equal(level(await diag()).regions.length,beforeClose);
  checks.push('polygon_click_first_vertex_to_close_backspace_remove_last_vertex_and_one_step_undo');

  await page.locator('[data-dock="assets"]').click();d=await diag();await page.locator(`[data-asset="${d.project.assets[1].id}"]`).click();
  assert.equal((await diag()).inspectorContext,'asset');assert.equal(await page.locator('#inspector-section').isVisible(),false);assert.equal(await page.locator('#asset-section').isVisible(),true);
  const depth=level(await diag()).layers.find(l=>l.kind==='depth');await page.locator(`[data-layer-select="${depth.id}"]`).click();
  assert.equal((await diag()).inspectorContext,'layer');assert.equal(await page.locator('[data-field="layerName"]').count(),1);assert.equal(await page.locator('[data-field="levelName"]').count(),0);
  await page.locator('#level-settings').click();assert.equal((await diag()).inspectorContext,'level');assert.equal(await page.locator('[data-field="layerName"]').count(),0);
  checks.push('single_context_inspector_asset_instance_layer_and_level');

  const dockBefore=await page.locator('#project-dock').boundingBox(),splitter=await page.locator('#dock-resize').boundingBox();
  await page.mouse.move(splitter.x+splitter.width/2,splitter.y+2);await page.mouse.down();await page.mouse.move(splitter.x+splitter.width/2,splitter.y-55,{steps:4});await page.mouse.up();
  assert.ok((await page.locator('#project-dock').boundingBox()).height>dockBefore.height+30);
  const unchanged=JSON.stringify((await diag()).project);await page.locator('#viewport').press('Tab');assert.equal(await page.locator('#project-dock').isVisible(),false);await page.locator('#viewport').press('Tab');assert.equal(await page.locator('#project-dock').isVisible(),true);assert.equal(JSON.stringify((await diag()).project),unchanged);
  const widthField=page.locator('[data-field="width"]');await widthField.fill('3072');await widthField.press('Tab');const heightField=page.locator('[data-field="height"]');await heightField.fill('2048');await heightField.press('Tab');await editorClick(page,'#fit');
  d=await diag();const visible=await page.locator('#viewport').boundingBox();assert.ok(d.view.zoom<.25);assert.ok(3072*d.view.zoom<=visible.width&&2048*d.view.zoom<=visible.height);
  checks.push('resizable_asset_dock_focus_canvas_preserves_data_and_full_fit_large_baked_maps');

  // Read-only visual QA of the existing handoff map, in this isolated browser profile.
  const handoff=JSON.parse(await readFile('docs/design/world/hang-nhac-map-v1/editor-project.json','utf8'));
  await page.locator('#import-project').setInputFiles({name:'existing-handoff.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(handoff))});
  await page.waitForFunction(()=>document.getElementById('status').textContent==='Đã mở dự án.');
  await page.locator('[data-domain="navigation"]').click();await editorClick(page,'#fit');
  assert.equal(level(await diag()).regions.length,0);assert.equal(JSON.stringify((await diag()).project),JSON.stringify(handoff));
  await page.screenshot({path:'artifacts/map-studio-level-workspace.png'});
  checks.push('existing_baked_map_handoff_opens_native_with_locks_and_zero_generated_navigation');
  assert.deepEqual(errors, []);
  const result = { passed: true, checks, browserErrors: errors, isolatedStorage: true, syntheticEditingFixturesOnly: true, existingHandoffUsedReadOnly: true };
  await writeFile('artifacts/map-studio-verification.json', JSON.stringify(result, null, 2) + '\n'); process.stdout.write(JSON.stringify(result) + '\n');
} catch (error) { await page?.screenshot({ path: 'artifacts/map-studio-failure.png', fullPage: true }).catch(() => {}); throw error; }
finally { await browser?.close(); service?.stop(); }
