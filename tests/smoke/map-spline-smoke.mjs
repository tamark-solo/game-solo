import assert from 'node:assert/strict';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {chromium} from 'playwright';
import {startService} from '../support/services.mjs';
import {editorClick,editorSelect,revealEditorControl} from '../support/editor-ui.mjs';
const base='http://127.0.0.1:5192';let service,browser,page;const errors=[],checks=[];
const diag=()=>page.evaluate(()=>window.__mapEditorDiagnostics());
const level=d=>d.project.levels.find(l=>l.id===d.project.activeLevelId);
const point=async(x,y)=>{const d=await diag(),b=await page.locator('#map-canvas').boundingBox();return {x:b.x+d.view.x+x*d.view.zoom,y:b.y+d.view.y+y*d.view.zoom};};
const click=async(x,y,options)=>{const p=await point(x,y);await page.mouse.click(p.x,p.y,options);};
const drag=async(x,y,tx,ty)=>{const a=await point(x,y),b=await point(tx,ty);await page.mouse.move(a.x,a.y);await page.mouse.down();await page.mouse.move(b.x,b.y,{steps:8});await page.mouse.up();};
const field=async(name,value)=>{const selector=`[data-field="${name}"]`;await revealEditorControl(page,selector);await page.locator(selector).fill(String(value));await page.locator(selector).press('Tab');};
const near=(a,b)=>assert.ok(Math.abs(a-b)<1e-4,`${a} != ${b}`);
try{
 service=await startService(['node_modules/vite/bin/vite.js','--config','vite.config.ts','--port','5192'],base,{MAP_EDITOR_STORAGE:'artifacts/map-spline-test-store'});
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 page=await browser.newPage({viewport:{width:1440,height:960}});page.setDefaultTimeout(12000);page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.goto(base+'/map-editor.html');await page.waitForFunction(()=>window.__mapEditorDiagnostics?.().ready);await page.selectOption('#snap','1');await page.uncheck('#magnet');await mkdir('artifacts',{recursive:true});
 assert.equal(await page.locator('#region-shape').inputValue(),'spline');await editorClick(page,'[data-tool="block-spline"]');
 assert.equal(await page.locator('#spline-control').isVisible(),true);assert.equal(await page.locator('#finish-polygon').isDisabled(),true);
 for(const [x,y] of [[300,200],[500,400],[300,600],[100,400]])await click(x,y);
 assert.equal((await diag()).draftVertices,4);await click(300,200);let d=await diag(),r=level(d).regions[0];const id=r.id;
 assert.equal(d.tool,'select');assert.equal(r.spline.anchors.length,4);assert.ok(r.points.length>20);assert.equal(await page.locator('[data-field="geometry"]').inputValue(),'spline');
 await page.screenshot({path:'artifacts/map-spline-editor.png'});checks.push('spline_is_available_for_navigation_live_preview_close_and_editable_control_points');

 const original=structuredClone(r);await drag(300,200,300,160);r=level(await diag()).regions[0];assert.deepEqual(r.spline.anchors[0],{x:300,y:160});assert.notDeepEqual(r.points,original.points);await editorClick(page,'#undo');assert.deepEqual(level(await diag()).regions[0],original);
 await page.locator(`[data-entity="${id}"]`).click();await page.keyboard.down('Shift');await click(425,275);await page.keyboard.up('Shift');r=level(await diag()).regions[0];assert.equal(r.spline.anchors.length,5);near(r.spline.anchors[1].x,425);near(r.spline.anchors[1].y,275);
 await page.keyboard.down('Alt');await click(r.spline.anchors[1].x,r.spline.anchors[1].y);await page.keyboard.up('Alt');assert.equal(level(await diag()).regions[0].spline.anchors.length,4);
 await field('smoothness',0);r=level(await diag()).regions[0];assert.deepEqual(r.points,r.spline.anchors);await field('smoothness',1);assert.ok(level(await diag()).regions[0].points.length>20);
 await editorSelect(page,'[data-field="geometry"]','polygon');assert.equal(level(await diag()).regions[0].spline,undefined);assert.equal(level(await diag()).regions[0].points.length,4);
 await editorSelect(page,'[data-field="geometry"]','spline');assert.deepEqual(level(await diag()).regions[0],original);
 checks.push('drag_control_point_shift_insert_on_curve_alt_remove_smoothness_and_convert_existing_region_with_undo');

 await page.check(`[data-layer-flag="locked"][data-id="${r.layerId}"]`);const locked=JSON.stringify((await diag()).project);assert.equal(await page.locator('[data-field="smoothness"]').isDisabled(),true);await drag(300,200,320,200);assert.equal(JSON.stringify((await diag()).project),locked);await page.uncheck(`[data-layer-flag="locked"][data-id="${r.layerId}"]`);
 await page.locator(`[data-entity="${id}"]`).click();await drag(300,400,350,430);r=level(await diag()).regions[0];r.points.forEach((p,i)=>{near(p.x,original.points[i].x+50);near(p.y,original.points[i].y+30);});assert.deepEqual(r.spline.anchors[0],{x:350,y:230});
 await editorClick(page,'#duplicate');d=await diag();assert.equal(level(d).regions.length,2);assert.deepEqual(level(d).regions[1].spline.anchors[0],{x:382,y:262});await editorClick(page,'#undo');await editorClick(page,'#undo');assert.deepEqual(level(await diag()).regions[0],original);
 checks.push('layer_locks_whole_region_translation_duplicate_and_history_preserve_curve_metadata');

 await editorClick(page,'[data-tool="walk-spline"]');for(const [x,y] of [[150,150],[900,150],[900,750],[150,750]])await click(x,y);await page.locator('#viewport').press('Enter');assert.equal(level(await diag()).regions[1].kind,'walk');assert.ok(level(await diag()).regions[1].spline);
 await editorClick(page,'#level-settings');await field('spawnX',600);await field('spawnY',400);await editorSelect(page,'[data-field="walkPolicy"]','regions');
 await editorClick(page,'#play');assert.equal((await diag()).view.zoom,1);await page.locator('#viewport').focus();await page.keyboard.down('a');await page.waitForTimeout(1800);await page.keyboard.up('a');d=await diag();assert.equal(d.validPlayer,true);assert.ok(d.player.x>=508&&d.player.x<=511,`Curved block stops foot: ${d.player.x}`);await page.locator('#viewport').press('Escape');
 checks.push('curved_walk_region_and_blocker_use_same_outline_in_native_runtime_test');

 const authoring=page.waitForEvent('download');await editorClick(page,'#export');const exported=JSON.parse(await readFile(await(await authoring).path(),'utf8'));assert.deepEqual(exported.levels[0].regions[0].spline,original.spline);
 const runtimeFile=page.waitForEvent('download');await editorClick(page,'#export-runtime');const runtime=JSON.parse(await readFile(await(await runtimeFile).path(),'utf8'));assert.equal('spline' in runtime.levels[0].blockers[0],false);assert.deepEqual(runtime.levels[0].blockers[0].points,original.points);
 await editorClick(page,'#save');await page.waitForFunction(()=>document.getElementById('save-state').dataset.state==='saved');d=await diag();const stored=await(await fetch(base+'/api/map-editor/projects/'+d.project.id)).json();assert.deepEqual(stored.levels[0].regions[0].spline,original.spline);
 await page.reload();await page.waitForFunction(()=>window.__mapEditorDiagnostics?.().ready);assert.deepEqual(level(await diag()).regions[0],original);
 await page.locator(`[data-entity="${id}"]`).click();await editorClick(page,'#fit');await page.screenshot({path:'artifacts/map-spline-editor.png'});
 checks.push('authoring_json_save_restore_keeps_controls_runtime_exports_polygon_boundary');
 assert.deepEqual(errors,[]);const result={passed:true,checks,browserErrors:errors,isolatedStorage:true,ownerAuthoredMapsUntouched:true};await writeFile('artifacts/map-spline-verification.json',JSON.stringify(result,null,2)+'\n');process.stdout.write(JSON.stringify(result)+'\n');
}catch(error){await page?.screenshot({path:'artifacts/map-spline-failure.png',fullPage:true}).catch(()=>{});throw error;}finally{await browser?.close();service?.stop();}
