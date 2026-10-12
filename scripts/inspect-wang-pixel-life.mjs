import {readFile,writeFile} from 'node:fs/promises';import {sharp,components} from './actor-sprite-tools.mjs';
const root='docs/design/characters/wang-lin-pixel-life-v1',p=JSON.parse(await readFile(root+'/production-plan.json'));
const summaries=[];
for(const r of p.requests){const{data,info}=await sharp(root+'/'+r.source).ensureAlpha().raw().toBuffer({resolveWithObject:true});const parts=components(data,info.width,info.height);summaries.push({direction:r.direction,size:[info.width,info.height],corner:[...data.subarray(0,4)],alphaZero:Array.from({length:info.width*info.height},(_,i)=>data[i*4+3]===0?1:0).reduce((n,v)=>n+v,0),parts:parts.length});}
await writeFile(root+'/source-inspection.json',JSON.stringify(summaries,null,2)+'\n');console.log(summaries);
