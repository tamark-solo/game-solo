import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
const base=resolve('docs/design/gameplay/van-ngoc-gameplay-assets-v1');
const sha=b=>createHash('sha256').update(b).digest('hex');
const manifest=JSON.parse(await readFile(resolve(base,'assets.json')));
const measurements=JSON.parse(await readFile(resolve(base,'pivot-measurements.json')));
for(const asset of manifest.assets.filter(a=>a.assetType==='prop')){
 const measure=measurements.measurements.find(m=>m.id===asset.id);assert.ok(measure);
 assert.equal(measure.nativeSha256,asset.files[0].sha256);assert.equal(sha(await readFile(resolve(base,asset.files[0].path))),measure.nativeSha256);
 asset.pivot=measure.pivot;asset.pivotStatus='measured-base-reference-awaiting-owner-footprint';asset.pivotMeasurement=measure;
}
manifest.review={...manifest.review,alpha:'assistant-inspected-light-dark-native-and-source',native:'assistant-inspected-32-48-64-icons-and-native-props',ownerArtApproval:'pending',worldPlacement:'not-produced',collision:'not-produced'};
manifest.existingItems=manifest.existingItems.map(item=>({...item,url:`/assets/character-ui-v2/${item.id==='recovery'?'lotus-pill':item.id}.webp`}));
const assets=[];
for(const asset of manifest.assets.filter(a=>a.assetType==='prop')){
 const f=asset.files[0],data=await readFile(resolve(base,f.path));
 assets.push({id:`vn-gameplay-${asset.id}-v1`,name:asset.label,width:f.width,height:f.height,pivot:asset.pivot,category:asset.id==='clean-herb-clump'?'nature':'prop',defaultLayer:'depth',parts:[{id:'body',file:'data:image/png;base64,'+data.toString('base64'),cover:false}]});
}
await writeFile(resolve(base,'editor-library.json'),JSON.stringify({schema:'game-solo-asset-library-1',assets,prefabs:[],status:'art-review-pending-owner',ownerApproved:false,artApproved:false,placementProduced:false,collisionProduced:false},null,2)+'\n');
await writeFile(resolve(base,'assets.json'),JSON.stringify(manifest,null,2)+'\n');
console.log('Recorded three measured base references and a separate Editor library; owner map unchanged.');
