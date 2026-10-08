// One-time initial merge. Older V1/V2 assets and helpers remain untouched.
import {readFile,writeFile,mkdir,copyFile,cp} from 'node:fs/promises';
import {resolve,join} from 'node:path';
const root=resolve('docs/design/vfx');
for(const family of ['sword','thunder','wind']){
 const folder=join(root,`r05-${family}-v3`),base=join(root,`r05-${family}-v2`),data=JSON.parse(await readFile(join(folder,'clips.json'),'utf8')),old=JSON.parse(await readFile(join(base,'clips.json'),'utf8')),skill=JSON.parse(await readFile(join(folder,'skill.json'),'utf8')),reuse=JSON.parse(await readFile(join(folder,'reuse-spec.json'),'utf8'));
 for(const id of reuse){const clip=structuredClone(old.clips[id]);clip.reusedFrom={realm:'R05-V2',path:`../r05-${family}-v2`,clip:id,mode:'byte_identical_PNGs'};await mkdir(join(folder,'frames',id),{recursive:true});for(const f of clip.frames)await copyFile(join(base,f.file),join(folder,f.file));await copyFile(join(base,clip.source),join(folder,clip.source));data.clips[id]=clip;}
 await cp(join(base,'prompts'),join(folder,'prompts','reused-v2'),{recursive:true});
 data.clips[skill.character.clip].durations=skill.character.holds;
 for(const [id,curve]of Object.entries(skill.presentation.clipOpacities??{}))data.clips[id].opacities=curve;
 data.realm='R05';data.version='3.0.0';await writeFile(join(folder,'clips.json'),JSON.stringify(data,null,2)+'\n');
 console.log(family,Object.values(data.clips).reduce((n,c)=>n+c.frames.length,0),'PNG',Object.keys(data.clips).length,'clips');
}
