// Read-only source completeness check. Transparent padding cannot restore clipped art.
import {readFile,writeFile} from 'node:fs/promises';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {sharp} from '../../../../scripts/actor-sprite-tools.mjs';
const root=dirname(fileURLToPath(import.meta.url));assert.equal(root.split(/[\\/]/).at(-1),'van-hai-npc-wave-a-motion-v2');
const statusOnly=process.argv.includes('--status');assert.ok(process.argv.slice(2).every(a=>a==='--status'));
const p=JSON.parse(await readFile(resolve(root,'production-plan.json'),'utf8')),records=[],missing=[];
for(const q of p.requests){
 let bytes;try{bytes=await readFile(resolve(root,q.source));}catch(e){if(e.code!=='ENOENT')throw e;missing.push(q.id);continue;}
 const {data,info}=await sharp(bytes).ensureAlpha().raw().toBuffer({resolveWithObject:true}),edge={top:0,bottom:0,left:0,right:0};
 for(let x=0;x<info.width;x++){edge.top+=Number(data[x*4+3]>=128);edge.bottom+=Number(data[((info.height-1)*info.width+x)*4+3]>=128);}
 for(let y=0;y<info.height;y++){edge.left+=Number(data[(y*info.width)*4+3]>=128);edge.right+=Number(data[(y*info.width+info.width-1)*4+3]>=128);}
 records.push({id:q.id,source:q.source,sourceSha256:createHash('sha256').update(bytes).digest('hex'),dimensions:[info.width,info.height],bodyAlphaThreshold:128,opaqueEdgePixels:edge,passed:Object.values(edge).every(n=>n===0)});
}
const failed=records.filter(r=>!r.passed),passed=missing.length===0&&failed.length===0&&records.length===42;
if(!statusOnly){assert.equal(passed,true,JSON.stringify({missing,failed}));await writeFile(resolve(root,'review/source-edge-verification.json'),JSON.stringify({date:'2026-10-13',passed,sources:records,sourceUnmodified:true,rule:'All selected body/prop source edges must have no alpha128 opaque pixels; completeness of near-edge tips remains a visual check.'},null,2)+'\n');}
console.log(JSON.stringify({passed,sources:records.length,missing,failed,recorded:!statusOnly}));
