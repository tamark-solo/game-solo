import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';import {createHash} from 'node:crypto';import {basename} from 'node:path';import assert from 'node:assert/strict';
const sha=b=>createHash('sha256').update(b).digest('hex'),publicRoot='client/public/assets';
for(const [source,target]of [['docs/design/characters/wang-lin-pixel-life-v1','wang-lin-pixel-life-v1'],['docs/design/characters/sect-encounter-actors-v2','sect-encounter-actors-v2'],['docs/design/vfx/basic-attack-jade-v1','basic-attack-jade-v1']]){
 const c=JSON.parse(await readFile(source+'/catalog.json'));await mkdir(publicRoot+'/'+target+'/atlases',{recursive:true});
 for(const clip of Object.values(c.clips)){const field=clip.atlas?'atlas':'atlasUrl',file=clip[field],data=await readFile(source+'/'+file);
  if(clip.atlasSha256)assert.equal(sha(data),clip.atlasSha256);await copyFile(source+'/'+file,publicRoot+'/'+target+'/atlases/'+basename(file));clip[field]='/assets/'+target+'/atlases/'+basename(file);
 }
 await writeFile(publicRoot+'/'+target+'/catalog.json',JSON.stringify({...c,usage:'owner-requested-runtime-playtest',artApproved:false},null,2)+'\n');
 if(target==='basic-attack-jade-v1')await copyFile(source+'/hand-sockets.json',publicRoot+'/'+target+'/hand-sockets.json');
}
console.log('Synced life16 / encounters104 / basic FX5; player80 and owner map untouched.');
// Compose the live R01 catalog: one real eight-direction Wang body, existing native avatars.
const classic=JSON.parse(await readFile(publicRoot+'/r01/clips.json')),pixel=JSON.parse(await readFile('docs/design/characters/wang-lin-pixel-wind-v1/presentation.json')),body=JSON.parse(await readFile(publicRoot+'/hang-nhac-pixel-player/catalog.json'));
for(const skill of ['sword','thunder','wind']){
 const definition=classic.skills[skill],originalWang=Object.values(definition.bindings['CHR-WANG-LIN-CHIBI']);
 definition.bodyDirectionCountByAvatar={'CHR-WANG-LIN-CHIBI':8};definition.bindings['CHR-WANG-LIN-CHIBI']={};
 for(const [direction,pixelId]of Object.entries(pixel.skills[skill].bindings['CHR-WANG-LIN-CHIBI'])){
  const action={sword:'cast_forward',thunder:'cast_point',wind:'dash'}[skill],production=body.clips[action+'-'+direction];
  classic.clips[production.id]={...pixel.clips[pixelId],atlasUrl:production.atlas};definition.bindings['CHR-WANG-LIN-CHIBI'][direction]=production.id;
 }
 const referenced=new Set(Object.values(classic.skills).flatMap(s=>Object.values(s.bindings).flatMap(b=>Object.values(b))));for(const id of originalWang)if(!referenced.has(id))delete classic.clips[id];
}
await writeFile(publicRoot+'/hang-nhac-pixel-player/skill-presentation.json',JSON.stringify(classic,null,2)+'\n');
