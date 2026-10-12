import {actorArchive,archivedFile} from './verify-retired-actor-archive.mjs';
import assert from 'node:assert/strict';import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';import {createHash} from 'node:crypto';import {sharp,components} from './actor-sprite-tools.mjs';
const root='docs/design/characters/wang-lin-pixel-production-v2',hash=b=>createHash('sha256').update(b).digest('hex'),json=async f=>JSON.parse(await readFile(f));
const c=await json(root+'/catalog.json'),plan=await json(root+'/production-plan.json'),style=await json(root+'/style-basis.json');
for(const f of style.targets)assert.equal(hash(await readFile(f.file)),f.sha256,'Pinned basis changed');
assert.equal(c.artApproved,false);assert.equal(c.ownerApproved,false);assert.equal(c.directions.length,8);assert.equal(Object.keys(c.clips).length,32);assert.deepEqual(c.coverage.missing,[]);
for(const f of [...c.sources,...c.inputs])assert.equal(hash(await readFile(root+'/'+f.file)),f.sha256);
for(const s of c.sources)assert.equal(hash(await readFile(root+'/'+s.prompt)),s.promptSha256);
const archived=await actorArchive();
for(const r of [...plan.requests,...plan.repairs]){assert.equal(r.status,'generated');if(r.archived){archivedFile(archived,root+'/'+r.sourceFile,r.sourceSha256);archivedFile(archived,root+'/'+r.promptFile,r.promptSha256);continue;}assert.equal(hash(await readFile(root+'/'+r.sourceFile)),r.sourceSha256);assert.equal(hash(await readFile(root+'/'+r.promptFile)),r.promptSha256);for(const f of r.inputHashes)assert.equal(hash(await readFile(root+'/'+f.file)),f.sha256);}
for(const f of c.reference.files)assert.equal(hash(await readFile(f.file)),f.sha256,'Reference changed');
for(const r of c.registration){assert.equal(new Set(r.frames.map(f=>f.scale)).size,1,'Per-frame scaling');for(const action of c.actions)assert.ok(new Set(r.frames.filter(f=>f.action===action).map(f=>f.translationNativeX)).size<=1,'Per-pose horizontal fitting');}
const previous=await json(style.catalogFile);let retained=0;for(const old of Object.values(previous.clips)){const next=c.clips[old.action+'-'+old.direction];assert.ok(next);for(let i=0;i<old.frames.length;i++){assert.equal(next.frames[i].sha256,old.frames[i].sha256,'Reviewed sample canonical changed');retained++;}}
const checks=[],masters=[];await mkdir(root+'/masters',{recursive:true});
for(const clip of Object.values(c.clips)){
 assert.deepEqual(clip.pivot,[clip.frameSize[0]/2,88]);assert.equal(clip.frames.length,clip.durations.length);assert.equal(clip.atlasPadding,2);assert.equal(hash(await readFile(root+'/'+clip.atlas)),clip.atlasSha256);
 for(const [index,f]of clip.frames.entries()){
  const b=await readFile(root+'/'+f.file);assert.equal(hash(b),f.sha256);const {data,info}=await sharp(b).ensureAlpha().raw().toBuffer({resolveWithObject:true});assert.deepEqual([info.width,info.height],clip.frameSize);
  const packed=await sharp(root+'/'+clip.atlas).extract({left:f.rect.x,top:f.rect.y,width:f.rect.w,height:f.rect.h}).ensureAlpha().raw().toBuffer();let left=info.width,top=info.height,right=-1,bottom=-1,opaque=0;
  for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++){const p=(y*info.width+x)*4;assert.equal(data[p+3],packed[p+3]);if(!data[p+3])continue;assert.equal(data[p+3],255);for(let k=0;k<3;k++)assert.equal(data[p+k],packed[p+k]);left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x);bottom=Math.max(bottom,y);opaque++;}
  assert.ok(opaque>500);assert.ok(left>=0&&right<info.width&&top>0&&bottom<info.height);assert.equal(bottom,87,'Ground boundary');assert.equal(components(data,info.width,info.height,128).length,1,'Foreign body fragment');
  const padded=await sharp(root+'/'+clip.atlas).extract({left:f.rect.x-2,top:f.rect.y-2,width:f.rect.w+4,height:f.rect.h+4}).ensureAlpha().raw().toBuffer();for(let y=0;y<info.height+4;y++)for(let x=0;x<info.width+4;x++)if(x<2||x>=info.width+2||y<2||y>=info.height+2)assert.equal(padded[(y*(info.width+4)+x)*4+3],0,'Atlas gutter');
  checks.push({clip:clip.id,index,opaque,bounds:[left,top,right-left+1,bottom-top+1],groundDelta:bottom-88});
 }
 if(clip.action==='idle'){const file='masters/'+clip.direction+'.png';await copyFile(root+'/'+clip.frames[0].file,root+'/'+file);masters.push({direction:clip.direction,file,sha256:clip.frames[0].sha256,frameSize:clip.frameSize,pivot:clip.pivot});}
}
assert.equal(checks.length,plan.expectedFrames);assert.equal(retained,48);
const rows=[['Đứng','idle',0],['Chạy','run',2],['Mở đầu Kiếm','cast_forward',0],['Phát Kiếm','cast_forward',3],['Hồi thế Kiếm','cast_forward',5],['Phát Lôi','cast_point',3]],inputs=[],width=1056,height=780;
for(const [row,[label,action,index]]of rows.entries())for(const [col,d]of c.directions.entries()){const clip=c.clips[action+'-'+d];inputs.push({input:await readFile(root+'/'+clip.frames[index].file),left:180+col*112-clip.pivot[0],top:116+row*128-clip.pivot[1]});}
const labels=Buffer.from(`<svg width="${width}" height="${height}">${c.directions.map((d,i)=>`<text x="${180+i*112}" y="20" text-anchor="middle" fill="#c8d7cb" font-size="12" font-family="Segoe UI">${d}</text>`).join('')}${rows.map(([label],i)=>`<text x="10" y="${78+i*128}" fill="#e4d3a5" font-family="Segoe UI" font-size="13">${label}</text><path d="M0 ${116+i*128}.5 H${width}" stroke="#496352"/>`).join('')}</svg>`);
await sharp({create:{width,height,channels:4,background:'#182923'}}).composite([{input:labels,left:0,top:0},...inputs]).png().toFile(root+'/native-eight-directions.png');await sharp(root+'/native-eight-directions.png').resize(width*2,height*2,{kernel:'nearest'}).png().toFile(root+'/native-eight-directions-2x.png');
await writeFile(root+'/masters.json',JSON.stringify({status:'eight neutral views for cross-action comparison, pending new-direction visual review',artApproved:false,masters},null,2)+'\n');
const report={passed:true,date:'2026-10-12',clips:32,frames:checks.length,sources:c.sources.length,retainedReviewedSampleFrames:retained,masterViews:masters.length,scope:'Exact source and frozen-basis hashes, one source scale and fixed clip registration, canvas/ground, whole body component, exact atlas pixels and transparent padding. Anatomy/motion is a separate visual review.',artApproved:false,checks};await writeFile('docs/data/wang-pixel-production-v2-verification.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({...report,checks:undefined}));
