import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {sharp} from '../../../../scripts/actor-sprite-tools.mjs';
const root=dirname(fileURLToPath(import.meta.url));assert.equal(root.split(/[\\/]/).at(-1),'van-hai-npc-wave-a-concepts-v1');
const args=process.argv.slice(2);const slug=args[0];
const p=JSON.parse(await readFile(resolve(root,'production-plan.json'),'utf8'));const hash=b=>createHash('sha256').update(b).digest('hex');
let measurements={sources:[]};try{measurements=JSON.parse(await readFile(resolve(root,'review/source-measurements.json'),'utf8'));}catch(e){if(e.code!=='ENOENT')throw e;}
await mkdir(resolve(root,'review'),{recursive:true});const rows=[];
for(const a of p.actors.filter(a=>!slug||a.slug===slug)){
 const q=p.requests.find(r=>r.slug===a.slug);const path=resolve(root,q.source);let bytes;
 try{bytes=await readFile(path);}catch(e){if(e.code==='ENOENT'){rows.push({slug:a.slug,status:'missing'});continue;}throw e;}
 const {data,info}=await sharp(bytes).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 let left=info.width,top=info.height,right=-1,bottom=-1;
 for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++){const i=(y*info.width+x)*4;if(data[i+3]>=128){left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x);bottom=Math.max(bottom,y);}data[i+3]=data[i+3]>=128?255:0;}
 assert.ok(right>=left&&bottom>=top,'Foreground required');const bounds=[left,top,right+1,bottom+1];
 let bandLeft=info.width,bandRight=-1;const bandHeight=Math.max(3,Math.round((bottom+1-top)*.035));
 for(let y=bottom+1-bandHeight;y<=bottom;y++)for(let x=left;x<=right;x++)if(data[(y*info.width+x)*4+3]){bandLeft=Math.min(bandLeft,x);bandRight=Math.max(bandRight,x);}
 const autoRoot=[(bandLeft+bandRight+1)/2,bottom+1],measure=measurements.sources.find(m=>m.slug===a.slug&&m.sourceSha256===hash(bytes));
 const rootCandidate=measure?.sourcePivot??autoRoot,bodyTop=measure?.bodyTopY??top;
 const scale=80/(rootCandidate[1]-bodyTop),nativeWidth=Math.round((right+1-left)*scale),nativeHeight=Math.round((bottom+1-top)*scale);
 const nativeCut=await sharp(data,{raw:{width:info.width,height:info.height,channels:4}}).extract({left,top,width:right+1-left,height:bottom+1-top}).resize(nativeWidth,nativeHeight,{kernel:'nearest'}).png().toBuffer();
 const dx=48-Math.round((rootCandidate[0]-left)*scale),dy=88-Math.round((rootCandidate[1]-top)*scale);
 if(dx>=0&&dy>=0&&dx+nativeWidth<=96&&dy+nativeHeight<=96){
  const marker=Buffer.from('<svg width="96" height="96" xmlns="http://www.w3.org/2000/svg"><path d="M0 88H96" stroke="#718474" stroke-width="0.5"/><path d="M43 88H53M48 83V93" stroke="#c93c57" stroke-width="0.5"/></svg>');
  const native=await sharp({create:{width:96,height:96,channels:4,background:{r:231,g:226,b:211,alpha:1}}}).composite([{input:nativeCut,left:dx,top:dy},{input:marker}]).png().toBuffer();
  await sharp(native).resize(576,576,{kernel:'nearest'}).png().toFile(resolve(root,'review/'+a.slug+'-root-proposal-6x.png'));
 }
 const lines=[];
 for(let x=0;x<info.width;x+=100)lines.push('<path d="M'+x+' 0V'+info.height+'" stroke="#34657d" stroke-width="1"/><text x="'+(x+3)+'" y="25">'+x+'</text>');
 for(let y=100;y<info.height;y+=100)lines.push('<path d="M0 '+y+'H'+info.width+'" stroke="#34657d" stroke-width="1"/><text x="4" y="'+(y+25)+'">'+y+'</text>');
 const svg='<svg width="'+info.width+'" height="'+info.height+'" xmlns="http://www.w3.org/2000/svg"><g font-family="sans-serif" font-size="23" fill="#133942">'+lines.join('')+'</g><rect x="'+left+'" y="'+top+'" width="'+(right+1-left)+'" height="'+(bottom+1-top)+'" fill="none" stroke="#e38a20" stroke-width="3"/><path d="M'+(rootCandidate[0]-25)+' '+rootCandidate[1]+'h50M'+rootCandidate[0]+' '+(rootCandidate[1]-25)+'v50" stroke="#d33355" stroke-width="3"/></svg>';
 await sharp({create:{width:info.width,height:info.height,channels:4,background:'#e7e2d3'}}).composite([{input:bytes},{input:Buffer.from(svg)}]).png().toFile(resolve(root,'review/'+a.slug+'-source-guide.png'));
 const row={slug:a.slug,source:q.source,sourceSha256:hash(bytes),dimensions:[info.width,info.height],alphaThreshold:128,bounds,autoRootCandidate:autoRoot,rootCandidate,manualMeasurementApplied:!!measure,bootBandCandidate:[bandLeft,bottom+1-bandHeight,bandRight+1,bottom+1],bodyTopCandidate:top,proposalOnly:true};
 await writeFile(resolve(root,'review/'+a.slug+'-inspection.json'),JSON.stringify(row,null,2)+'\n');rows.push(row);
}
console.log(JSON.stringify({sources:rows,manualMeasurementsRequired:true}));
