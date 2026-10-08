// Initial R03 merge only. Source PNGs are reused byte-for-byte; timing belongs to new metadata.
import {readFile,writeFile,mkdir,copyFile,cp} from 'node:fs/promises';
import {join,resolve} from 'node:path';
const root=resolve('docs/design/vfx'),map={
 sword:['r02-sword-v1',['wanglin-cast-east','sword-charge','sword-guide','qi-impact']],
 thunder:['r02-thunder-v1',['wanglin-thunder-east','thunder-seal','thunder-bolt']],
 wind:['r02-wind-v1',['wanglin-wind-east','wind-return-curl']]
};
for(const [family,[source,ids]]of Object.entries(map)){
 const target=join(root,`r03-${family}-v1`),data=JSON.parse(await readFile(join(target,'clips.json'),'utf8')),base=JSON.parse(await readFile(join(root,source,'clips.json'),'utf8'));
 for(const id of ids){const clip=structuredClone(base.clips[id]);clip.reusedFrom={realm:'R02',path:`../${source}`,clip:id,mode:'byte_identical_source_PNGs'};
  await mkdir(join(target,'frames',id),{recursive:true});for(const f of clip.frames)await copyFile(join(root,source,f.file),join(target,f.file));await copyFile(join(root,source,clip.source),join(target,clip.source));data.clips[id]=clip;
 }
 await cp(join(root,source,'prompts'),join(target,'prompts','reused-r02'),{recursive:true});
 const skill=JSON.parse(await readFile(join(target,'skill.json'),'utf8'));data.clips[skill.character.clip].durations=skill.character.holds;
 if(family==='sword')data.clips['sword-charge'].durations=[1,1,2,2,3,3];
 if(family==='thunder')data.clips['thunder-seal'].durations=[1,1,2,2,3,3];
 if(family==='thunder')data.clips['thunder-impact'].opacities=[1,1,1,1,.85,.6,.3,.08];
 if(family==='wind')data.clips['wind-wheel'].opacities=[.35,.55,.8,1,1,.85,.5,.15];
 data.version='1.0.0';data.realm='R03';await writeFile(join(target,'clips.json'),JSON.stringify(data,null,2)+'\n');
 console.log(family,Object.values(data.clips).reduce((n,c)=>n+c.frames.length,0),'PNG /',Object.keys(data.clips).length,'clips');
}
