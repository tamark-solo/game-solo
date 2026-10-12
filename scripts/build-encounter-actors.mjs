import {readFile,writeFile,copyFile,mkdir} from 'node:fs/promises';import {createHash} from 'node:crypto';import assert from 'node:assert/strict';import {basename} from 'node:path';import {sharp} from './actor-sprite-tools.mjs';
const root='docs/design/characters/sect-encounter-actors-v2',raw=JSON.parse(await readFile(root+'/reference-subset/catalog.json')),provenance=JSON.parse(await readFile(root+'/archive-provenance.json'));
const sha=b=>createHash('sha256').update(b).digest('hex');for(const f of provenance.records)assert.equal(sha(await readFile(root+'/'+f.file)),f.sha256);
const clips={};await mkdir(root+'/atlases',{recursive:true});
for(const [id,c]of Object.entries(raw.clips).filter(([,c])=>c.actor==='wolf'||c.actor==='boss')){
 const file='atlases/'+basename(c.atlas),bytes=await readFile(root+'/reference-subset/'+file),{data,info}=await sharp(bytes).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 assert.deepEqual([info.width,info.height],c.atlasSize);
 for(const f of c.frames){const canonical=await readFile(root+'/reference-subset/'+f.file);assert.equal(sha(canonical),f.sha256);const pixels=await sharp(bytes).extract({left:f.rect.x,top:f.rect.y,width:f.rect.w,height:f.rect.h}).ensureAlpha().raw().toBuffer();assert.ok(pixels.equals(await sharp(canonical).ensureAlpha().raw().toBuffer()),id+' atlas parity');assert.ok(f.bounds.left>=0&&f.bounds.top>=0&&f.bounds.left+f.bounds.width<=c.frameSize[0]&&f.bounds.top+f.bounds.height<=c.frameSize[1]);}
 await copyFile(root+'/reference-subset/'+file,root+'/'+file);
 clips[id]={...c,atlas:file,atlasSha256:sha(bytes),frames:c.frames.map(f=>({...f,file:'reference-subset/'+f.file})),sourceRoot:'reference-subset',originalSourceRoot:c.sourceRoot,artApproved:false};
}
assert.equal(Object.keys(clips).length,104);
const actors=raw.actors.filter(a=>a.id==='wolf'||a.id==='boss'),required=actors.flatMap(a=>a.actions.flatMap(action=>raw.directions.map(d=>`${a.id}-${action}-${d}`)));
assert.deepEqual(required.filter(id=>!clips[id]),[]);
await writeFile(root+'/catalog.json',JSON.stringify({version:2,id:'sect-encounter-actors-v2',artApproved:false,ownerApproved:false,status:'runtime-playtest-repacked-from-owned-sources',actors,directions:raw.directions,clips,coverage:{required,missing:[]},archiveProvenance:'archive-provenance.json',registration:'reference-subset/source-registration.json',pixelsResampled:false},null,2)+'\n');
const layers=[];for(const[i,d]of raw.directions.entries())for(const[j,actor]of ['wolf','boss'].entries()){const c=clips[actor+'-idle-'+d];layers.push({input:await readFile(root+'/'+c.frames[0].file),left:120+i*184-c.pivot[0],top:130+j*188-c.pivot[1]});}
await sharp({create:{width:1504,height:350,channels:4,background:'#182b25'}}).composite(layers).png().toFile(root+'/native-identity-matrix.png');
console.log({clips:104,poses:624,artApproval:false,sourceHashesVerified:provenance.records.length});
