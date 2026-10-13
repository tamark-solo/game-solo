import {readFile,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const root='docs/design/characters/van-hai-npc-motion-v1';
try{await readFile(root+'/approval.json');throw Error('Owner-approved baseline: register a new version instead.');}catch(e){if(e.code!=='ENOENT')throw e;}
const report=JSON.parse(await readFile(root+'/review/source-components.json','utf8'));
// Reviewed boot-ground anchors in the actual source images. These are explicit
// per-pose coordinates; neither alpha-box centers nor head/robe extrema supply x.
const measured={
 'tran-duy':{
  hash:'fd0edc1b68fe098844263c0dba4cb5e379701593adf2b1876a154b0e9a1c84a7',
  roots:[[177,333],[415,333],[652,333],[887,333],[1126,333],[1357,333],[178,666],[415,666],[651,666],[887,666],[1126,666],[1357,666],[178,999],[416,999],[652,999],[887,999],[1126,999],[1357,999]],height:309},
 'diep-tinh':{
  hash:'b04d81f55c0b930aa3b58ab03b48701b6247a63cf102ca006c853b0b4ecf06ad',
  roots:[[107,478],[317,478],[529,478],[733,478],[943,478],[1152,478],[107,868],[315,868],[521,868],[731,868],[944,868],[1152,868],[107,1245],[316,1245],[522,1243],[733,1245],[943,1245],[1153,1245]],height:368,prompt:'prompts/diep-tinh-southeast-r3.txt'},
 'ta-kiem-son':{
  hash:'8d307910ae0c896dfad79c0269cd315aad19a9615c68ed14fa9e67ce7bfe1e84',
  roots:[[157,339],[410,339],[662,339],[912,339],[1160,339],[1404,339],[156,672],[404,672],[649,672],[904,672],[1161,672],[1404,672],[157,998],[407,998],[660,998],[907,998],[1167,998],[1405,998]],height:313},
 'to-nhuoc':{
  hash:'40862edd2db299bef2bee16fb57bf703dbbf1002d0cf4311781881afe2ce9c35',
  roots:[[168,342],[417,342],[658,342],[906,342],[1153,342],[1398,342],[170,683],[423,683],[662,683],[908,683],[1158,683],[1398,683],[169,1016],[416,1015],[659,1016],[906,1014],[1152,1014],[1398,1015]],height:325}
};
const actors=report.actors.map(actor=>{
 const m=measured[actor.slug];assert.ok(m);assert.equal(actor.sourceSha256,m.hash);assert.equal(actor.connectedComponents.length,18);
 const frames=actor.detectedFrames.map(({index,action,frame,left,top,width,height})=>({
  index,action,frame,left,top,width,height,rootX:m.roots[index][0],rootY:m.roots[index][1],
  rootBasis:'Ground directly below the visually checked pair of planted boot soles; explicit source coordinates. x ignores hands/props and torso bounds.'
 }));
 return{slug:actor.slug,direction:'southeast',source:actor.source,sourceSha256:m.hash,alphaThreshold:128,neutralIndex:0,neutralHeight:m.height,neutralTopY:frames[0].top,scale:80/m.height,frames,prompt:m.prompt,visuallyReviewed:true};
});
await writeFile(root+'/registration-input.json',JSON.stringify({schema:'npc-motion-manual-registration-input-1',date:'2026-10-13',reviewScope:'Source pose separation and planted-foot measurement only; ART/motion approval remains pending.',actors,artApproved:false,ownerApproved:false},null,2)+'\n');
console.log('Pinned four source hashes and72 explicit boot-ground anchors; one neutral scale per source.');
