// Reuse approved R01 PNGs byte-for-byte in a new version; do not repaint or rewrite the baseline.
import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';
import {join,resolve} from 'node:path';
const root=resolve('docs/design/vfx'),map={
 sword:['frame-by-frame-r01',['wanglin-cast-east','sword-charge','qi-impact']],
 thunder:['r01-thunder-v1',['wanglin-thunder-east','thunder-seal','thunder-bolt','thunder-impact']],
 wind:['r01-wind-v1',['wanglin-wind-east','wind-trail']]
};
for(const [family,[source,ids]]of Object.entries(map)){
 const target=join(root,`r02-${family}-v1`),data=JSON.parse(await readFile(join(target,'clips.json'),'utf8')),base=JSON.parse(await readFile(join(root,source,'clips.json'),'utf8'));
 for(const id of ids){const clip=structuredClone(base.clips[id]);clip.reusedFrom={realm:'R01',path:`../${source}`,clip:id,mode:'byte_identical_source_PNGs'};
  await mkdir(join(target,'frames',id),{recursive:true});for(const f of clip.frames)await copyFile(join(root,source,f.file),join(target,f.file));await copyFile(join(root,source,clip.source),join(target,clip.source));data.clips[id]=clip;
 }
 const skill=JSON.parse(await readFile(join(target,'skill.json'),'utf8'));data.clips[skill.character.clip].durations=skill.character.holds;
 if(family==='sword')data.clips['sword-charge'].durations=[1,1,2,2,2,2];
 if(family==='thunder')data.clips['thunder-seal'].durations=[1,1,1,2,2,2];
 data.version='1.0.0';data.realm='R02';await writeFile(join(target,'clips.json'),JSON.stringify(data,null,2)+'\n');
 console.log(family,Object.values(data.clips).reduce((n,c)=>n+c.frames.length,0),'PNG /',Object.keys(data.clips).length,'clips');
}
