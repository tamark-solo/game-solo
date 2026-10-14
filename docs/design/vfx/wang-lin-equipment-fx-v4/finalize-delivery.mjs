import {readFile,writeFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve,relative} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('./',import.meta.url)),sha=b=>createHash('sha256').update(b).digest('hex');
const json=async p=>JSON.parse(await readFile(resolve(root,p),'utf8'));
const m=await json('manifest.json'),shortlist=await json('owner-shortlist.json'),basis=await json('review/basis-verification.json'),assets=await json('review/asset-verification.json'),browser=await json('review/browser-verification.json'),gpu=await json('review/three-verification.json');
if(m.pending.length||m.coverage.canonicalFrames!==72||!basis.passed||assets.status!=='passed'||browser.status!=='passed'||!gpu.passed)throw Error('Incomplete final checks');
if(gpu.manifestSha256!==sha(await readFile(resolve(root,'manifest.json'))))throw Error('GPU evidence bound to a different manifest');
const files=[];
async function walk(dir){for(const d of await readdir(dir,{withFileTypes:true})){const p=resolve(dir,d.name),file=relative(root,p).replaceAll('\\','/');if(d.isDirectory())await walk(p);else if(file!=='review/delivery.json')files.push({file,sha256:sha(await readFile(p))});}}
await walk(root);files.sort((a,b)=>a.file.localeCompare(b.file));
const report={schema:'wang-lin-equipment-fx-delivery-4',date:'2026-10-13',scope:'animated FX review for exactly seven owner-pinned static combinations; three artifact families',selectedKeys:shortlist.entries.map(e=>e.key),ownerBrowser:{v3PinsReadAgainAfterWork:true,v3PinnedKeysUnchanged:true,newReviewTabOpened:true,animationStarted:true},coverage:m.coverage,review:{file:'index.html',screenshots:'review/screenshots/three-kits-2x.png',nativeScale:true,oldAndNewSameBodyGear:true,quietAndAwakened:true,actualSliderKeyboardAndPointerChecked:true},checks:{v3UnchangedFiles:basis.v3FilesChecked,rawGeneratedSourceCopies:basis.newSourcesChecked,canonicalAtlasFrames:72,browserComparisons:browser.comparisons.length,browserControls:browser.controls.length,gpuNativeRenders:gpu.coverage.nativeRenders,passed:true,reports:['review/asset-verification.json','review/basis-verification.json','review/browser-verification.json','review/three-verification.json']},sources:{method:'built-in image_gen',promptSet:'generation.json',directionStudy:'reference-direction.md',rawFilesImmutable:true},limits:['One southeast neutral body/gear view; no new body action animation','One distinct FX palette per artifact family shared by pinned colours','Preview timing and appearance are candidates for owner review','No runtime/gameplay/balance/map/database/save integration'],ownerApproved:false,artApproved:false,runtimeIntegrated:false,files};
await writeFile(resolve(root,'review/delivery.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({passed:true,files:files.length,selected:shortlist.entries.length,frames:72}));
