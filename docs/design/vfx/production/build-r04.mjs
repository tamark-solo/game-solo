// Initial R04 merge only. Older source PNGs remain byte-identical.
import {readFile,writeFile,mkdir,copyFile,cp} from 'node:fs/promises';
import {join,resolve} from 'node:path';
const root=resolve('docs/design/vfx'),map={
 sword:['r03-sword-v1',['wanglin-cast-east','sword-charge','sword-guide','sword-wheel','qi-impact']],
 thunder:['r03-thunder-v1',['wanglin-thunder-east','thunder-seal','thunder-core','thunder-bolt','thunder-impact']],
 wind:['r03-wind-v1',['wanglin-wind-east','wind-wheel','wind-return-curl']]
};
for(const [family,[source,ids]]of Object.entries(map)){
 const target=join(root,`r04-${family}-v1`),data=JSON.parse(await readFile(join(target,'clips.json'),'utf8')),base=JSON.parse(await readFile(join(root,source,'clips.json'),'utf8'));
 for(const id of ids){const clip=structuredClone(base.clips[id]);clip.reusedFrom={realm:'R03',path:`../${source}`,clip:id,mode:'byte_identical_source_PNGs'};
  await mkdir(join(target,'frames',id),{recursive:true});for(const f of clip.frames)await copyFile(join(root,source,f.file),join(target,f.file));await copyFile(join(root,source,clip.source),join(target,clip.source));data.clips[id]=clip;
 }
 await cp(join(root,source,'prompts'),join(target,'prompts','reused-r03'),{recursive:true});
 const skill=JSON.parse(await readFile(join(target,'skill.json'),'utf8'));data.clips[skill.character.clip].durations=skill.character.holds;
 const spirit=data.clips[skill.spirit.clip];spirit.sampling='linear';spirit.opacities=skill.spirit.opacities;
 if(family==='thunder')data.clips['thunder-weave'].opacities=[.5,.7,.9,1,.8,.5,.25,.08];
 data.version='1.0.0';data.realm='R04';await writeFile(join(target,'clips.json'),JSON.stringify(data,null,2)+'\n');
 console.log(family,Object.values(data.clips).reduce((n,c)=>n+c.frames.length,0),'PNG /',Object.keys(data.clips).length,'clips');
}
