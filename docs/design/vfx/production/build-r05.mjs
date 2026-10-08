// Initial merge only. Frames reused from the approved R04 edition are copied byte-for-byte.
import {readFile,writeFile,mkdir,copyFile,cp} from 'node:fs/promises';
import {resolve,join} from 'node:path';
const root=resolve('docs/design/vfx'),reuse={sword:['wanglin-cast-east','sword-charge','qi-impact'],thunder:['wanglin-thunder-east','thunder-seal','thunder-impact'],wind:['wanglin-wind-east','wind-wheel']};
for(const [family,ids]of Object.entries(reuse)){
 const folder=join(root,`r05-${family}-v1`),source=join(root,`r04-${family}-v2`),data=JSON.parse(await readFile(join(folder,'clips.json'),'utf8')),base=JSON.parse(await readFile(join(source,'clips.json'),'utf8')),skill=JSON.parse(await readFile(join(folder,'skill.json'),'utf8'));
 for(const id of ids){const clip=structuredClone(base.clips[id]);clip.reusedFrom={realm:'R04',path:`../r04-${family}-v2`,clip:id,mode:'byte_identical_source_PNGs'};
  await mkdir(join(folder,'frames',id),{recursive:true});for(const f of clip.frames)await copyFile(join(source,f.file),join(folder,f.file));await copyFile(join(source,clip.source),join(folder,clip.source));data.clips[id]=clip;
 }
 await cp(join(source,'prompts'),join(folder,'prompts','reused-r04'),{recursive:true});
 data.clips[skill.character.clip].durations=skill.character.holds;
 if(family==='wind')data.clips['wind-wheel'].opacities=[.12,.18,.22,.22,.18,.12,.06,0];
 for(const [id,opacities]of Object.entries(skill.presentation.clipOpacities??{}))data.clips[id].opacities=opacities;
 data.realm='R05';data.version=skill.version;await writeFile(join(folder,'clips.json'),JSON.stringify(data,null,2)+'\n');
 console.log(family,Object.values(data.clips).reduce((n,c)=>n+c.frames.length,0),'PNG /',Object.keys(data.clips).length,'clips');
}
