import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';
import {resolve,dirname,basename} from 'node:path';

const source=resolve('docs/design/characters/wang-lin-pixel-combat-v1/current-pack.json');
const catalog=JSON.parse(await readFile(source,'utf8'));
const target=resolve('client/public/assets/hang-nhac-pixel-player');
assert.equal(Object.keys(catalog.clips).length,80);
for(const record of catalog.catalogSources){
 const data=await readFile(resolve(dirname(source),record.file));
 assert.equal(createHash('sha256').update(data).digest('hex'),record.sha256);
}
const files=[];
for(const [key,clip] of Object.entries(catalog.clips)){
 const input=resolve(dirname(source),clip.atlas),filename=key+'.png',data=await readFile(input);
 assert.equal(basename(clip.atlas),filename);
 assert.equal(createHash('sha256').update(data).digest('hex'),clip.atlasSha256);
 assert.equal(clip.pivot[1],88);assert.equal(clip.frameSize[1],96);
 await mkdir(resolve(target,'atlases'),{recursive:true});await copyFile(input,resolve(target,'atlases',filename));
 files.push({source:input.replaceAll('\\','/'),sha256:clip.atlasSha256,bytes:data.length});
 clip.atlas='/assets/hang-nhac-pixel-player/atlases/'+filename;
}
await writeFile(resolve(target,'catalog.json'),JSON.stringify({...catalog,usage:'owner-requested-gameplay-playtest',liveIntegrated:true,artApproved:false,sourceFiles:files},null,2)+'\n');
console.log('Prepared Wang Lin pixel player: 40 accepted / 40 candidate clips; native pivots retained. ART approvals unchanged.');
